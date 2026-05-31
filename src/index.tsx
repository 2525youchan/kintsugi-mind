import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { renderer } from './renderer'
import { translations, getLanguage, type Language } from './i18n'
import { Header, Footer, RoomCard, WeatherIcon, KintsugiVessel, LanguageSwitcher } from './components'

// Types
type Bindings = {
  GEMINI_API_KEY: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  SESSION_SECRET: string
  DB: D1Database
  KV?: KVNamespace  // Optional for rate limiting
}
type Variables = {
  user?: {
    id: string
    email: string
    name: string
    picture: string
  }
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ========================================
// dev-bible 3-3: JST Timezone Helper
// ========================================
function getTodayJST(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ========================================
// dev-bible 5-1/5-3: Unified API Error Response Helper
// ========================================
function apiError(c: any, status: number, error: string, opts: { code?: string, retryable?: boolean, details?: string, extra?: Record<string, any> } = {}) {
  return c.json({
    success: false,
    error,
    ...(opts.code && { code: opts.code }),
    ...(opts.details && { details: opts.details }),
    retryable: opts.retryable ?? (status >= 500),
    ...opts.extra
  }, status)
}

// ========================================
// Security Middleware
// ========================================

// Security headers middleware
app.use('*', async (c, next) => {
  await next()
  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff')
  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY')
  // XSS protection
  c.header('X-XSS-Protection', '1; mode=block')
  // Referrer policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  // HTTPS enforcement (HSTS)
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
})

// CORS configuration
app.use('/api/*', cors({
  origin: (origin) => {
    // Allow same-origin and Cloudflare Pages domains
    const allowedOrigins = [
      'https://kintsugi-mind.pages.dev',
      /^https:\/\/[a-z0-9]+\.kintsugi-mind\.pages\.dev$/,
    ]
    if (!origin) return origin // Same-origin requests
    for (const allowed of allowedOrigins) {
      if (typeof allowed === 'string' && origin === allowed) return origin
      if (allowed instanceof RegExp && allowed.test(origin)) return origin
    }
    // Development: allow localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return origin
    if (origin.includes('sandbox.novita.ai')) return origin
    return null
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ========================================
// Rate Limiting
// ========================================

// Rate limit helper using KV (or in-memory fallback)
const rateLimitCache = new Map<string, { count: number; resetAt: number }>()

async function rateLimit(
  c: any,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Math.floor(Date.now() / 1000)
  const windowKey = `rate:${key}:${Math.floor(now / windowSeconds)}`
  const resetAt = (Math.floor(now / windowSeconds) + 1) * windowSeconds
  
  const kv = c.env.KV
  
  if (kv) {
    // Use KV for persistent rate limiting
    try {
      const current = parseInt(await kv.get(windowKey) || '0')
      if (current >= limit) {
        return { allowed: false, remaining: 0, resetAt }
      }
      await kv.put(windowKey, String(current + 1), { expirationTtl: windowSeconds * 2 })
      return { allowed: true, remaining: limit - current - 1, resetAt }
    } catch (e) {
      console.error('KV rate limit error:', e)
      // Fall through to in-memory
    }
  }
  
  // In-memory fallback (for local development)
  const cached = rateLimitCache.get(windowKey)
  if (cached && cached.resetAt > now) {
    if (cached.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: cached.resetAt }
    }
    cached.count++
    return { allowed: true, remaining: limit - cached.count, resetAt: cached.resetAt }
  }
  
  rateLimitCache.set(windowKey, { count: 1, resetAt })
  // Clean up old entries
  for (const [k, v] of rateLimitCache.entries()) {
    if (v.resetAt < now) rateLimitCache.delete(k)
  }
  return { allowed: true, remaining: limit - 1, resetAt }
}

// Get client IP for rate limiting
function getClientIP(c: any): string {
  return c.req.header('CF-Connecting-IP') || 
         c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() || 
         'unknown'
}

// ========================================
// Auth Helpers
// ========================================

function generateId(): string {
  return crypto.randomUUID()
}

async function hashSessionId(sessionId: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(sessionId + secret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Get current user from session
async function getCurrentUser(c: any): Promise<Variables['user'] | null> {
  const sessionId = getCookie(c, 'kintsugi_session')
  if (!sessionId) return null
  
  try {
    const db = c.env.DB
    if (!db) return null
    
    const session = await db.prepare(
      'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first()
    
    if (!session) return null
    
    const user = await db.prepare(
      'SELECT id, email, name, picture FROM users WHERE id = ?'
    ).bind(session.user_id).first()
    
    return user as Variables['user'] | null
  } catch (e) {
    console.error('Get user error:', e)
    return null
  }
}

// ========================================
// Subscription & Usage Helpers
// ========================================

// Plan limits configuration
const PLAN_LIMITS = {
  free: {
    ai_chat: 3,        // 3 AI chats per day
    checkin: 1,        // 1 check-in per day
    history_days: 7,   // 7 days of history
    vessels: ['chawan', 'tsubo', 'sara', 'tokkuri', 'hachi'], // 5 basic vessels
  },
  premium: {
    ai_chat: -1,       // Unlimited (-1)
    checkin: -1,       // Unlimited
    history_days: -1,  // Unlimited
    vessels: 'all',    // All vessels including premium
  }
}

// Get user's subscription status
async function getUserSubscription(db: D1Database, userId: string): Promise<{
  plan: 'free' | 'premium'
  status: string
  expiresAt: string | null
}> {
  try {
    const sub = await db.prepare(`
      SELECT plan, status, current_period_end 
      FROM subscriptions 
      WHERE user_id = ? AND status IN ('active', 'past_due')
      ORDER BY created_at DESC LIMIT 1
    `).bind(userId).first() as { plan: string; status: string; current_period_end: string } | null
    
    if (!sub || sub.plan === 'free') {
      return { plan: 'free', status: 'active', expiresAt: null }
    }
    
    // Check if subscription is still valid
    const now = new Date()
    const expiresAt = sub.current_period_end ? new Date(sub.current_period_end) : null
    
    if (expiresAt && now > expiresAt) {
      return { plan: 'free', status: 'expired', expiresAt: sub.current_period_end }
    }
    
    return { 
      plan: 'premium', 
      status: sub.status, 
      expiresAt: sub.current_period_end 
    }
  } catch (e) {
    console.error('Get subscription error:', e)
    return { plan: 'free', status: 'active', expiresAt: null }
  }
}

// Check and update usage count
async function checkUsageLimit(
  db: D1Database, 
  userId: string, 
  feature: string, 
  plan: 'free' | 'premium'
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = PLAN_LIMITS[plan][feature as keyof typeof PLAN_LIMITS.free]
  
  // Unlimited for premium or non-limited features
  if (limit === -1 || limit === undefined) {
    return { allowed: true, remaining: -1, limit: -1 }
  }
  
  const today = getTodayJST()
  
  try {
    // Get or create usage record
    let usage = await db.prepare(`
      SELECT id, count FROM usage 
      WHERE user_id = ? AND feature = ? AND reset_date = ?
    `).bind(userId, feature, today).first() as { id: string; count: number } | null
    
    if (!usage) {
      // Create new usage record for today
      const usageId = crypto.randomUUID()
      await db.prepare(`
        INSERT INTO usage (id, user_id, feature, count, reset_date)
        VALUES (?, ?, ?, 0, ?)
      `).bind(usageId, userId, feature, today).run()
      usage = { id: usageId, count: 0 }
    }
    
    const remaining = Math.max(0, limit - usage.count)
    return { 
      allowed: usage.count < limit, 
      remaining, 
      limit 
    }
  } catch (e) {
    console.error('Check usage error:', e)
    // Allow on error to not block users
    return { allowed: true, remaining: limit, limit }
  }
}

// Increment usage count
async function incrementUsage(db: D1Database, userId: string, feature: string): Promise<void> {
  const today = getTodayJST()
  
  try {
    await db.prepare(`
      UPDATE usage SET count = count + 1, updated_at = datetime('now')
      WHERE user_id = ? AND feature = ? AND reset_date = ?
    `).bind(userId, feature, today).run()
  } catch (e) {
    console.error('Increment usage error:', e)
  }
}

// Check if vessel is available for user's plan
function isVesselAvailable(vesselType: string, plan: 'free' | 'premium'): boolean {
  if (plan === 'premium') return true
  return PLAN_LIMITS.free.vessels.includes(vesselType)
}

// Gemini API helper
async function callGemini(apiKey: string, prompt: string, systemPrompt?: string): Promise<string> {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
  
  const contents = []
  if (systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    })
    contents.push({
      role: 'model', 
      parts: [{ text: 'I understand. I will follow these guidelines.' }]
    })
  }
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  })
  
  const response = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 300
      }
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('Gemini API error:', error)
    throw new Error('Gemini API call failed')
  }
  
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Middleware
app.use('*', cors())
app.use(renderer)

// Helper to get text
const tx = (section: keyof typeof translations, key: string, lang: Language): string => {
  const s = translations[section] as any
  if (s && s[key] && s[key][lang]) {
    return s[key][lang]
  }
  return key
}

// ========================================
// Pages
// ========================================

// Onboarding - First Time Experience
app.get('/welcome', (c) => {
  const lang = getLanguage(c)
  
  // Vessel options for selection
  const vessels = [
    { id: 'chawan', name: lang === 'en' ? 'Tea Bowl' : '茶碗', emoji: '🍵', description: lang === 'en' ? 'Everyday warmth' : '日常の温もり' },
    { id: 'tsubo', name: lang === 'en' ? 'Jar' : '壺', emoji: '🏺', description: lang === 'en' ? 'Deep capacity' : '深い包容力' },
    { id: 'sara', name: lang === 'en' ? 'Plate' : '皿', emoji: '🍽️', description: lang === 'en' ? 'Open acceptance' : '開かれた受容' },
    { id: 'tokkuri', name: lang === 'en' ? 'Sake Bottle' : '徳利', emoji: '🍶', description: lang === 'en' ? 'Quiet strength' : '静かな強さ' },
    { id: 'hachi', name: lang === 'en' ? 'Bowl' : '鉢', emoji: '🥣', description: lang === 'en' ? 'Nurturing spirit' : '育む心' },
  ]
  
  return c.render(
    <div class="min-h-screen bg-ecru dark:bg-[#121212] transition-colors duration-300 overflow-hidden">
      {/* Onboarding Container */}
      <div id="onboarding-container" class="relative w-full min-h-screen">
        
        {/* Step 1: Welcome */}
        <div id="onboarding-step-1" class="onboarding-step absolute inset-0 flex items-center justify-center p-6 opacity-100 transition-all duration-700">
          <div class="max-w-lg text-center">
            <div class="text-6xl mb-8 animate-float">🏺</div>
            <h1 class="text-4xl md:text-5xl font-light text-indigo-800 dark:text-[#e8e4dc] mb-6">
              {lang === 'en' ? 'Welcome to' : 'ようこそ'}
              <br />
              <span class="text-gradient-gold font-medium">KINTSUGI MIND</span>
            </h1>
            <p class="text-lg text-ink-600 dark:text-[#a8a29e] mb-8 leading-relaxed">
              {lang === 'en' 
                ? 'A space where your imperfections become your greatest beauty.'
                : 'あなたの不完全さが、最大の美しさになる場所。'}
            </p>
            <button 
              onclick="goToStep(2)"
              class="px-8 py-4 bg-indigo-800 dark:bg-[#c9a227] text-ecru rounded-full hover:bg-indigo-700 dark:hover:bg-[#d4af37] transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {lang === 'en' ? 'Begin Your Journey' : '旅を始める'}
            </button>
          </div>
        </div>

        {/* Step 2: Kintsugi Philosophy */}
        <div id="onboarding-step-2" class="onboarding-step absolute inset-0 flex items-center justify-center p-6 opacity-0 pointer-events-none transition-all duration-700">
          <div class="max-w-lg text-center">
            <div class="relative w-32 h-32 mx-auto mb-8">
              {/* Animated crack and gold repair */}
              <svg viewBox="0 0 100 100" class="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-300 dark:text-[#4a4a4a]" />
                <path id="crack-line" d="M30,30 L50,50 L70,35 L50,70 L35,60" fill="none" stroke="#c9a227" stroke-width="3" stroke-dasharray="200" stroke-dashoffset="200" class="animate-draw-crack" />
              </svg>
            </div>
            <h2 class="text-3xl font-light text-indigo-800 dark:text-[#e8e4dc] mb-4">
              {lang === 'en' ? 'The Art of Golden Repair' : '金継ぎの哲学'}
            </h2>
            <p class="text-ink-600 dark:text-[#a8a29e] mb-4 leading-relaxed">
              {lang === 'en'
                ? 'In Japan, broken pottery is repaired with gold, making it more beautiful than before.'
                : '日本では、壊れた陶器を金で修復し、以前よりも美しくします。'}
            </p>
            <p class="text-ink-500 dark:text-[#78716c] text-sm mb-8 italic">
              {lang === 'en'
                ? '"Your cracks are not flaws — they are where the light enters."'
                : '「ヒビは欠点ではありません。光が入る場所なのです。」'}
            </p>
            <div class="flex justify-center gap-4">
              <button 
                onclick="goToStep(1)"
                class="px-6 py-3 border border-indigo-300 dark:border-[#4a4a4a] text-indigo-800 dark:text-[#a8a29e] rounded-full hover:bg-indigo-50 dark:hover:bg-[#1e1e1e] transition-colors"
              >
                {lang === 'en' ? 'Back' : '戻る'}
              </button>
              <button 
                onclick="goToStep(3)"
                class="px-8 py-3 bg-indigo-800 dark:bg-[#c9a227] text-ecru rounded-full hover:bg-indigo-700 dark:hover:bg-[#d4af37] transition-colors font-medium"
              >
                {lang === 'en' ? 'Continue' : '続ける'}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Three Rooms */}
        <div id="onboarding-step-3" class="onboarding-step absolute inset-0 flex items-center justify-center p-6 opacity-0 pointer-events-none transition-all duration-700">
          <div class="max-w-2xl text-center">
            <h2 class="text-3xl font-light text-indigo-800 dark:text-[#e8e4dc] mb-4">
              {lang === 'en' ? 'Your Tea House' : 'あなたの茶室'}
            </h2>
            <p class="text-ink-600 dark:text-[#a8a29e] mb-8">
              {lang === 'en'
                ? 'Three rooms await, each offering a different path to harmony.'
                : '3つの部屋があなたを待っています。それぞれが調和への異なる道を提供します。'}
            </p>
            <div class="grid grid-cols-3 gap-4 mb-8">
              <div class="bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-xl p-4 shadow-wabi">
                <div class="text-3xl mb-2">🌱</div>
                <h3 class="text-sm font-medium text-indigo-800 dark:text-[#e8e4dc]">{lang === 'en' ? 'GARDEN' : '庭'}</h3>
                <p class="text-xs text-ink-500 dark:text-[#78716c]">{lang === 'en' ? 'Action' : '行動'}</p>
              </div>
              <div class="bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-xl p-4 shadow-wabi">
                <div class="text-3xl mb-2">📚</div>
                <h3 class="text-sm font-medium text-indigo-800 dark:text-[#e8e4dc]">{lang === 'en' ? 'STUDY' : '書斎'}</h3>
                <p class="text-xs text-ink-500 dark:text-[#78716c]">{lang === 'en' ? 'Reflection' : '内省'}</p>
              </div>
              <div class="bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-xl p-4 shadow-wabi">
                <div class="text-3xl mb-2">🧘</div>
                <h3 class="text-sm font-medium text-indigo-800 dark:text-[#e8e4dc]">{lang === 'en' ? 'TATAMI' : '座敷'}</h3>
                <p class="text-xs text-ink-500 dark:text-[#78716c]">{lang === 'en' ? 'Stillness' : '静寂'}</p>
              </div>
            </div>
            <div class="flex justify-center gap-4">
              <button 
                onclick="goToStep(2)"
                class="px-6 py-3 border border-indigo-300 dark:border-[#4a4a4a] text-indigo-800 dark:text-[#a8a29e] rounded-full hover:bg-indigo-50 dark:hover:bg-[#1e1e1e] transition-colors"
              >
                {lang === 'en' ? 'Back' : '戻る'}
              </button>
              <button 
                onclick="goToStep(4)"
                class="px-8 py-3 bg-indigo-800 dark:bg-[#c9a227] text-ecru rounded-full hover:bg-indigo-700 dark:hover:bg-[#d4af37] transition-colors font-medium"
              >
                {lang === 'en' ? 'Continue' : '続ける'}
              </button>
            </div>
          </div>
        </div>

        {/* Step 4: Vessel Diagnosis Quiz */}
        <div id="onboarding-step-4" class="onboarding-step absolute inset-0 flex items-center justify-center p-6 opacity-0 pointer-events-none transition-all duration-700 overflow-y-auto">
          <div class="max-w-2xl text-center py-8">
            {/* Quiz View */}
            <div id="vessel-quiz-view">
              <h2 class="text-3xl font-light text-indigo-800 dark:text-[#e8e4dc] mb-2">
                {lang === 'en' ? 'Discover Your Vessel' : 'あなたの器を診断'}
              </h2>
              <p class="text-ink-600 dark:text-[#a8a29e] mb-6">
                {lang === 'en'
                  ? 'Answer 5 questions to find the vessel that resonates with your spirit.'
                  : '5つの質問に答えて、あなたの心に響く器を見つけましょう。'}
              </p>
              
              {/* Progress Bar */}
              <div class="mb-6">
                <div class="flex justify-between text-xs text-ink-400 dark:text-[#78716c] mb-1">
                  <span id="quiz-progress-text">{lang === 'en' ? 'Question 1 of 5' : '質問 1/5'}</span>
                  <span id="quiz-progress-percent">0%</span>
                </div>
                <div class="w-full bg-ecru-200 dark:bg-[#2d2d2d] rounded-full h-2 overflow-hidden">
                  <div id="quiz-progress-bar" class="h-full bg-gold rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
              </div>
              
              {/* Question Container */}
              <div id="quiz-question-container" class="min-h-[300px]">
                <p id="quiz-question" class="text-xl text-indigo-800 dark:text-[#e8e4dc] mb-6 leading-relaxed">
                  {/* Question will be populated by JS */}
                </p>
                <div id="quiz-answers" class="space-y-3">
                  {/* Answers will be populated by JS */}
                </div>
              </div>
              
              {/* Back button for quiz */}
              <div class="mt-6 flex justify-center gap-4">
                <button 
                  onclick="goToStep(3)"
                  class="px-6 py-3 border border-indigo-300 dark:border-[#4a4a4a] text-indigo-800 dark:text-[#a8a29e] rounded-full hover:bg-indigo-50 dark:hover:bg-[#1e1e1e] transition-colors"
                >
                  {lang === 'en' ? 'Back' : '戻る'}
                </button>
              </div>
            </div>
            
            {/* Result View (hidden initially) */}
            <div id="vessel-result-view" class="hidden">
              <div class="mb-6">
                <p class="text-gold text-sm mb-2">{lang === 'en' ? 'Your Vessel Is...' : 'あなたの器は...'}</p>
                <div id="result-vessel-emoji" class="text-8xl mb-4 animate-float">🍵</div>
                <h2 id="result-vessel-name" class="text-4xl font-light text-indigo-800 dark:text-[#e8e4dc] mb-2">茶碗</h2>
                <p id="result-vessel-tagline" class="text-gold text-lg">{lang === 'en' ? 'Everyday Warmth' : '日常の温もり'}</p>
              </div>
              
              {/* Result Card (shareable) */}
              <div id="result-card" class="bg-gradient-to-br from-indigo-800/10 to-gold/20 dark:from-[#1e3a5f]/50 dark:to-gold/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gold/30 mb-6">
                <p id="result-description" class="text-ink-600 dark:text-[#a8a29e] text-sm leading-relaxed mb-4">
                  {/* Description will be populated by JS */}
                </p>
                
                {/* Personality Traits */}
                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div class="text-center p-2 bg-white/50 dark:bg-[#1e1e1e]/50 rounded-lg">
                    <span id="trait-1-icon" class="text-xl">🌿</span>
                    <p id="trait-1-text" class="text-xs text-ink-500 dark:text-[#78716c] mt-1">{lang === 'en' ? 'Grounded' : '落ち着き'}</p>
                  </div>
                  <div class="text-center p-2 bg-white/50 dark:bg-[#1e1e1e]/50 rounded-lg">
                    <span id="trait-2-icon" class="text-xl">💫</span>
                    <p id="trait-2-text" class="text-xs text-ink-500 dark:text-[#78716c] mt-1">{lang === 'en' ? 'Warm' : '温かさ'}</p>
                  </div>
                  <div class="text-center p-2 bg-white/50 dark:bg-[#1e1e1e]/50 rounded-lg">
                    <span id="trait-3-icon" class="text-xl">🍃</span>
                    <p id="trait-3-text" class="text-xs text-ink-500 dark:text-[#78716c] mt-1">{lang === 'en' ? 'Mindful' : '気づき'}</p>
                  </div>
                </div>
                
                <p class="text-xs text-ink-400 dark:text-[#78716c] text-center">
                  {lang === 'en' ? 'KINTSUGI MIND — Vessel Diagnosis' : 'KINTSUGI MIND — 器診断'}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div class="flex flex-col sm:flex-row justify-center gap-3">
                <button 
                  id="share-result-btn"
                  class="px-6 py-3 border border-gold text-gold rounded-full hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                  </svg>
                  {lang === 'en' ? 'Share Result' : '結果をシェア'}
                </button>
                <button 
                  onclick="completeOnboarding()"
                  class="px-8 py-3 bg-gold text-ink rounded-full hover:bg-gold-400 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {lang === 'en' ? 'Enter the Tea House' : '茶室へ入る'}
                </button>
              </div>
              
              {/* Retake Quiz */}
              <button 
                id="retake-quiz-btn"
                class="mt-4 text-sm text-ink-400 dark:text-[#78716c] hover:text-indigo-600 dark:hover:text-gold transition-colors"
              >
                {lang === 'en' ? '↻ Take quiz again' : '↻ もう一度診断する'}
              </button>
            </div>
            
            {/* Direct Selection Option (hidden initially) */}
            <div id="vessel-direct-select" class="hidden">
              <p class="text-ink-500 dark:text-[#78716c] text-sm mb-4">
                {lang === 'en' ? 'Or choose directly:' : 'または直接選ぶ:'}
              </p>
              <div class="grid grid-cols-5 gap-2 mb-6">
                {vessels.map(v => (
                  <button 
                    data-vessel={v.id}
                    onclick={`selectVesselDirect('${v.id}')`}
                    class="vessel-option-mini bg-white/60 dark:bg-[#1e1e1e]/80 rounded-xl p-3 hover:border-gold border-2 border-transparent transition-all"
                    title={v.name}
                  >
                    <div class="text-2xl">{v.emoji}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
          <div id="dot-1" class="w-2 h-2 rounded-full bg-gold transition-all duration-300"></div>
          <div id="dot-2" class="w-2 h-2 rounded-full bg-indigo-300 dark:bg-[#4a4a4a] transition-all duration-300"></div>
          <div id="dot-3" class="w-2 h-2 rounded-full bg-indigo-300 dark:bg-[#4a4a4a] transition-all duration-300"></div>
          <div id="dot-4" class="w-2 h-2 rounded-full bg-indigo-300 dark:bg-[#4a4a4a] transition-all duration-300"></div>
        </div>

        {/* Skip Button */}
        <button 
          onclick="skipOnboarding()"
          class="fixed top-6 right-6 text-ink-400 dark:text-[#78716c] hover:text-ink-600 dark:hover:text-[#a8a29e] text-sm transition-colors z-50"
        >
          {lang === 'en' ? 'Skip' : 'スキップ'}
        </button>
      </div>
    </div>,
    { title: lang === 'en' ? 'Welcome — KINTSUGI MIND' : 'ようこそ — KINTSUGI MIND' }
  )
})

// Home / Entrance - The Tea House
app.get('/', (c) => {
  const lang = getLanguage(c)
  
  return c.render(
    <div class="min-h-screen bg-ecru dark:bg-[#121212] transition-colors duration-300">
      <Header currentLang={lang} variant="fixed" />

      {/* Hero Section */}
      <section class="pt-32 pb-20 px-6">
        <div class="max-w-4xl mx-auto text-center">
          {/* Seasonal Greeting */}
          <p data-seasonal="greeting" class="text-2xl mb-2 animate-fade-in">
            {/* Will be populated by JS */}
          </p>
          <p data-seasonal="message" class="text-ink-500 dark:text-[#78716c] text-sm mb-6 italic animate-fade-in" style="animation-delay: 0.1s">
            {/* Will be populated by JS */}
          </p>
          <p class="text-gold font-medium mb-4 animate-fade-in" style="animation-delay: 0.2s">
            {tx('common', 'tagline', lang)}
          </p>
          <h1 class="text-5xl md:text-7xl font-light text-indigo-800 dark:text-[#e8e4dc] mb-8 leading-tight animate-slide-up">
            {tx('home', 'heroTitle', lang)}<br />
            <span class="text-gradient-gold font-medium">{tx('home', 'heroTitleAccent', lang)}</span>
          </h1>
          <p class="text-xl text-ink-600 dark:text-[#a8a29e] max-w-2xl mx-auto mb-12 animate-slide-up" style="animation-delay: 0.2s">
            {tx('home', 'heroDescription', lang)}
          </p>
          
          {/* Weather Check-in Preview */}
          <div class="bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi max-w-md mx-auto animate-slide-up" style="animation-delay: 0.4s">
            <p class="text-indigo-700 dark:text-[#d4af37] mb-2 font-jp text-lg">{tx('home', 'weatherQuestion', lang)}</p>
            <p class="text-ink-500 dark:text-[#78716c] text-sm mb-8">{tx('home', 'weatherSubtext', lang)}</p>
            <div class="flex justify-center gap-6">
              <WeatherIcon type="sunny" currentLang={lang} />
              <WeatherIcon type="cloudy" currentLang={lang} />
              <WeatherIcon type="rainy" currentLang={lang} />
              <WeatherIcon type="stormy" currentLang={lang} />
            </div>
          </div>
          
          {/* Daily Zen Quote Section */}
          <div class="mt-12 max-w-lg mx-auto animate-slide-up" style="animation-delay: 0.6s">
            <div class="bg-gradient-to-br from-indigo-800/10 to-gold/10 dark:from-[#1e3a5f]/30 dark:to-gold/20 backdrop-blur-sm rounded-2xl p-6 shadow-wabi border border-indigo-800/10 dark:border-gold/20">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <svg class="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.5 4 15 6.5 15 9c0 1.5-.5 3-1.5 4 1.5.5 3 1.5 4 3 .5 1 .5 2 0 3-.5 1-1.5 2-3 2.5 0 0-1-.5-2.5-.5s-2.5.5-2.5.5c-1.5-.5-2.5-1.5-3-2.5-.5-1-.5-2 0-3 1-1.5 2.5-2.5 4-3-1-1-1.5-2.5-1.5-4 0-2.5 1.5-5 3-7z"/>
                    <circle cx="12" cy="9" r="2"/>
                  </svg>
                  <span class="text-sm font-medium text-indigo-700 dark:text-[#d4af37]">
                    {lang === 'en' ? "Today's Zen" : '今日の禅語'}
                  </span>
                </div>
                <button 
                  id="share-zen-btn"
                  class="p-2 rounded-full hover:bg-indigo-800/10 dark:hover:bg-gold/10 transition-colors group"
                  title={lang === 'en' ? 'Share' : 'シェア'}
                >
                  <svg class="w-5 h-5 text-indigo-700 dark:text-[#d4af37] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                  </svg>
                </button>
              </div>
              <blockquote id="daily-zen-quote" class="text-lg md:text-xl text-indigo-800 dark:text-[#e8e4dc] italic leading-relaxed mb-3 min-h-[3rem]">
                {/* Will be populated by JS */}
              </blockquote>
              <p id="daily-zen-source" class="text-xs text-ink-400 dark:text-[#78716c] text-right">
                {/* Source will be populated by JS */}
              </p>
              <p id="daily-zen-explanation" class="text-xs leading-relaxed text-ink-400 dark:text-[#a8a29e] mt-3 pl-3 border-l-2 border-gold/30 dark:border-gold/40">
                {/* Explanation will be populated by JS */}
              </p>
              <a 
                href={`/zen-archive?lang=${lang}`}
                class="inline-flex items-center gap-1 mt-4 text-sm text-indigo-600 dark:text-[#d4af37] hover:underline"
              >
                {lang === 'en' ? 'View all quotes' : '過去の禅語を見る'}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" class="py-20 px-6 bg-gradient-to-b from-ecru to-ecru-300 dark:from-[#121212] dark:to-[#1a1a1a]">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl md:text-4xl text-indigo-800 dark:text-[#e8e4dc] text-center mb-4">
            {tx('home', 'teaHouseTitle', lang)}
          </h2>
          <p class="text-ink-500 dark:text-[#78716c] text-center mb-16 max-w-2xl mx-auto">
            {tx('home', 'teaHouseDescription', lang)}
          </p>
          
          <div class="grid md:grid-cols-3 gap-8">
            <RoomCard room="garden" currentLang={lang} />
            <RoomCard room="study" currentLang={lang} />
            <RoomCard room="tatami" currentLang={lang} />
          </div>
          
          {/* 7-Day Challenge Banner */}
          <div class="mt-16 max-w-2xl mx-auto">
            <a 
              href={`/challenge?lang=${lang}`}
              class="block bg-gradient-to-r from-gold/20 via-gold/30 to-gold/20 dark:from-gold/30 dark:via-gold/40 dark:to-gold/30 border-2 border-gold/50 rounded-2xl p-6 hover:border-gold hover:shadow-lg transition-all duration-300 group"
            >
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span class="text-3xl">🏆</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-medium text-indigo-800 dark:text-[#e8e4dc] mb-1">
                    {lang === 'en' ? '7-Day Kintsugi Challenge' : '7日間金継ぎチャレンジ'}
                  </h3>
                  <p class="text-sm text-ink-500 dark:text-[#a8a29e]">
                    {lang === 'en' 
                      ? 'Complete daily tasks to unlock your Golden Vessel' 
                      : '毎日のタスクを完了して「黄金の器」を手に入れよう'}
                  </p>
                </div>
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-gold group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
              <div id="challenge-progress-mini" class="mt-4">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Progress' : '進捗'}</span>
                  <span id="challenge-days-mini" class="text-xs text-gold font-medium">0/7</span>
                </div>
                <div class="w-full bg-ink-200 dark:bg-[#2d2d2d] rounded-full h-1.5 overflow-hidden">
                  <div id="challenge-bar-mini" class="bg-gradient-to-r from-gold to-gold-400 h-1.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
              </div>
            </a>
          </div>
          
          {/* Vessel Diagnosis Banner */}
          <div class="mt-6 max-w-2xl mx-auto">
            <a 
              href={`/diagnosis?lang=${lang}`}
              class="block bg-gradient-to-r from-indigo-800/10 via-indigo-700/15 to-indigo-800/10 dark:from-indigo-600/20 dark:via-indigo-500/25 dark:to-indigo-600/20 border-2 border-indigo-600/30 dark:border-indigo-400/30 rounded-2xl p-6 hover:border-indigo-600 dark:hover:border-indigo-400 hover:shadow-lg transition-all duration-300 group"
            >
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-700 to-indigo-900 dark:from-indigo-500 dark:to-indigo-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span class="text-3xl">🏺</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-medium text-indigo-800 dark:text-[#e8e4dc] mb-1">
                    {lang === 'en' ? 'Discover Your Vessel' : 'あなたの器を診断'}
                  </h3>
                  <p class="text-sm text-ink-500 dark:text-[#a8a29e]">
                    {lang === 'en' 
                      ? '5 questions to reveal your inner vessel type' 
                      : '5つの質問であなたの器タイプを発見'}
                  </p>
                </div>
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" class="py-20 px-6">
        <div class="max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl text-indigo-800 dark:text-[#e8e4dc] mb-6">{tx('home', 'aboutTitle', lang)}</h2>
              <p class="text-ink-600 dark:text-[#a8a29e] mb-4">{tx('home', 'aboutP1', lang)}</p>
              <p class="text-ink-600 dark:text-[#a8a29e] mb-4">{tx('home', 'aboutP2', lang)}</p>
              <p class="text-ink-600 dark:text-[#a8a29e]">{tx('home', 'aboutP3', lang)}</p>
            </div>
            <div class="flex justify-center">
              <KintsugiVessel currentLang={lang} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-20 px-6 bg-indigo-800 text-ecru">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl mb-6">{tx('home', 'ctaTitle', lang)}</h2>
          <p class="text-ecru-300 mb-8" dangerouslySetInnerHTML={{ __html: tx('home', 'ctaDescription', lang) }}></p>
          <a href={`/check-in?lang=${lang}`} class="inline-block px-8 py-4 bg-gold text-ink rounded-full hover:bg-gold-400 transition-colors font-medium">
            {tx('home', 'ctaButton', lang)}
          </a>
        </div>
      </section>

      <Footer currentLang={lang} />
    </div>,
    { title: lang === 'en' ? 'KINTSUGI MIND — The Japanese Art of Resilience' : 'KINTSUGI MIND — 日本発：回復と調和のメンタルヘルス' }
  )
})

// Check-in Page
app.get('/check-in', (c) => {
  const lang = getLanguage(c)
  const weather = c.req.query('weather') || ''
  
  const weatherMessages: Record<string, { en: string; ja: string }> = {
    sunny: { en: tx('checkin', 'sunny', 'en'), ja: tx('checkin', 'sunny', 'ja') },
    cloudy: { en: tx('checkin', 'cloudy', 'en'), ja: tx('checkin', 'cloudy', 'ja') },
    rainy: { en: tx('checkin', 'rainy', 'en'), ja: tx('checkin', 'rainy', 'ja') },
    stormy: { en: tx('checkin', 'stormy', 'en'), ja: tx('checkin', 'stormy', 'ja') }
  }
  
  return c.render(
    <div class="min-h-screen bg-ecru dark:bg-[#121212] flex flex-col transition-colors duration-300" data-lang={lang}>
      <Header currentLang={lang} />

      {/* Check-in Content */}
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="max-w-lg w-full">
          <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi-lg text-center">
            <p class="text-gold font-medium mb-2">{tx('checkin', 'welcome', lang)}</p>
            <h1 class="text-2xl text-indigo-800 dark:text-[#e8e4dc] mb-8">
              {lang === 'en' ? 'Welcome to the Tea House' : '心の茶室へようこそ'}
            </h1>
            
            <p class="text-ink-600 dark:text-[#cfc9c0] mb-2 font-jp text-lg">{tx('checkin', 'question', lang)}</p>
            <p class="text-ink-400 dark:text-[#a8a29e] text-sm mb-8">
              {lang === 'en' ? 'Select how you\'re feeling' : '今日の気分を選んでください'}
            </p>
            
            <div id="weather-selection" class="flex justify-center gap-4 mb-8">
              <WeatherIcon type="sunny" currentLang={lang} size="lg" selected={weather === 'sunny'} />
              <WeatherIcon type="cloudy" currentLang={lang} size="lg" selected={weather === 'cloudy'} />
              <WeatherIcon type="rainy" currentLang={lang} size="lg" selected={weather === 'rainy'} />
              <WeatherIcon type="stormy" currentLang={lang} size="lg" selected={weather === 'stormy'} />
            </div>
            
            <div id="weather-message" class="min-h-[80px] mb-6">
              {weather && weatherMessages[weather] && (
                <div class="animate-fade-in">
                  <p class="text-ink-600 dark:text-[#cfc9c0]">{weatherMessages[weather][lang]}</p>
                </div>
              )}
            </div>
            
            <div id="room-suggestion" class="space-y-3">
              {weather && (
                <div class="animate-slide-up">
                  <p class="text-sm text-ink-500 dark:text-[#a8a29e] mb-4">{tx('checkin', 'suggestedRoom', lang)}</p>
                  {(weather === 'stormy' || weather === 'rainy') && (
                    <a href={`/garden?lang=${lang}`} class="block p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">🌱</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800 dark:text-[#e8e4dc]">GARDEN — {lang === 'en' ? 'The Garden' : '庭'}</p>
                          <p class="text-sm text-ink-500 dark:text-[#78716c]">{tx('checkin', 'gardenSuggestion', lang)}</p>
                        </div>
                      </div>
                    </a>
                  )}
                  {weather === 'cloudy' && (
                    <a href={`/study?lang=${lang}`} class="block p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">📚</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800 dark:text-[#e8e4dc]">STUDY — {lang === 'en' ? 'The Study' : '書斎'}</p>
                          <p class="text-sm text-ink-500 dark:text-[#78716c]">{tx('checkin', 'studySuggestion', lang)}</p>
                        </div>
                      </div>
                    </a>
                  )}
                  {weather === 'sunny' && (
                    <a href={`/tatami?lang=${lang}`} class="block p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">🧘</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800 dark:text-[#e8e4dc]">TATAMI — {lang === 'en' ? 'The Tatami Room' : '座敷'}</p>
                          <p class="text-sm text-ink-500 dark:text-[#78716c]">{tx('checkin', 'tatamiSuggestion', lang)}</p>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {!weather && (
              <p class="text-ink-400 dark:text-[#78716c] text-sm">{tx('checkin', 'selectPrompt', lang)}</p>
            )}
          </div>
          
          {/* All Rooms Link */}
          <div class="text-center mt-6">
            <a href={`/?lang=${lang}#philosophy`} class="text-indigo-600 dark:text-[#a8a29e] hover:text-gold transition-colors text-sm">
              {tx('checkin', 'viewAllRooms', lang)}
            </a>
          </div>
        </div>
      </main>
    </div>,
    { title: lang === 'en' ? 'Check-in — KINTSUGI MIND' : 'チェックイン — KINTSUGI MIND' }
  )
})

// GARDEN Mode - Morita Therapy (Split Screen)
app.get('/garden', (c) => {
  const lang = getLanguage(c)
  
  return c.render(
    <div class="min-h-screen bg-ecru dark:bg-[#121212] flex flex-col transition-colors duration-300" data-lang={lang}>
      <Header currentLang={lang} roomName={lang === 'en' ? 'GARDEN' : '庭 GARDEN'} roomIcon="🌱" />

      {/* Sound Control - Floating */}
      <div id="garden-sound-control" class="fixed bottom-4 right-4 z-50">
        <div class="flex flex-col items-end gap-2">
          {/* Presets (hidden by default) */}
          <div id="garden-sound-presets" class="hidden flex flex-col gap-1 bg-white/90 dark:bg-[#1e1e1e]/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-ecru-300 dark:border-[#4a4a4a]">
            <button class="sound-preset flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-ecru-200 dark:hover:bg-[#2d2d2d] text-ink-600 dark:text-[#a8a29e] text-left" data-preset="garden">
              <span>🌅</span>
              <span>{lang === 'en' ? 'Morning Garden' : '朝の庭'}</span>
            </button>
            <button class="sound-preset flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-ecru-200 dark:hover:bg-[#2d2d2d] text-ink-600 dark:text-[#a8a29e] text-left" data-preset="gardenForest">
              <span>🌲</span>
              <span>{lang === 'en' ? 'Forest Bathing' : '森林浴'}</span>
            </button>
            <button class="sound-preset flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-ecru-200 dark:hover:bg-[#2d2d2d] text-ink-600 dark:text-[#a8a29e] text-left" data-preset="gardenWater">
              <span>💧</span>
              <span>{lang === 'en' ? 'Water Garden' : '水の庭'}</span>
            </button>
            <div class="border-t border-ecru-300 dark:border-[#4a4a4a] mt-1 pt-2">
              <div class="flex items-center gap-2 px-2 mb-2">
                <svg class="w-3 h-3 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                </svg>
                <input 
                  type="range" 
                  id="garden-volume-slider" 
                  min="0" 
                  max="100" 
                  value="50"
                  class="w-20 h-1 bg-ecru-300 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
              </div>
              <button 
                id="garden-sound-stop"
                class="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                </svg>
                <span>{lang === 'en' ? 'Stop' : '停止'}</span>
              </button>
            </div>
          </div>
          
          {/* Toggle Button */}
          <button 
            id="garden-sound-toggle"
            class="flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm border border-ecru-300 dark:border-[#4a4a4a] text-ink-600 dark:text-[#a8a29e] rounded-full hover:bg-ecru-100 dark:hover:bg-[#2d2d2d] transition-colors shadow-lg text-sm min-h-[44px]"
            data-mode="garden"
          >
            <svg id="garden-sound-icon-off" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
            </svg>
            <svg id="garden-sound-icon-on" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
            </svg>
            <span>{lang === 'en' ? 'Sound' : '環境音'}</span>
          </button>
        </div>
      </div>

      {/* Split Screen */}
      <main class="flex-1 flex flex-col md:flex-row">
        {/* SKY Section - Emotions */}
        <section class="flex-1 sky-section p-6 md:p-8 relative flex flex-col">
          <div class="text-center mb-6">
            <h2 class="text-xl text-indigo-700 dark:text-[#d4af37] mb-2">{tx('garden', 'skyTitle', lang)} — Sky</h2>
            <p class="text-ink-500 dark:text-[#78716c] text-sm">{tx('garden', 'skyDescription', lang)}</p>
          </div>
          
          {/* Cloud Input Area */}
          <div class="flex-1 relative" id="cloud-container">
            <div class="absolute inset-0 flex items-center justify-center opacity-50">
              <p class="text-ink-400 dark:text-[#78716c] text-center" dangerouslySetInnerHTML={{ __html: tx('garden', 'cloudPlaceholder', lang) }}></p>
            </div>
          </div>
          
          {/* Emotion Input */}
          <div class="mt-auto">
            <div class="flex gap-3">
              <input 
                type="text" 
                id="emotion-input"
                placeholder={tx('garden', 'inputPlaceholder', lang)}
                class="flex-1 px-4 py-3 bg-white/80 dark:bg-[#1e1e1e]/80 border border-ecru-400 dark:border-[#4a4a4a] rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 dark:text-[#e8e4dc]"
              />
              <button 
                id="add-cloud-btn"
                class="px-6 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
              >
                {tx('garden', 'floatButton', lang)}
              </button>
            </div>
            <p class="text-xs text-ink-400 dark:text-[#78716c] mt-2 text-center">
              {tx('garden', 'cloudNote', lang)}
            </p>
          </div>
          
          <div class="horizon-line"></div>
        </section>

        {/* GROUND Section - Actions */}
        <section class="flex-1 ground-section p-6 md:p-8 flex flex-col">
          <div class="text-center mb-6">
            <h2 class="text-xl text-green-800 dark:text-green-400 mb-2">{tx('garden', 'groundTitle', lang)} — Ground</h2>
            <p class="text-ink-500 dark:text-[#78716c] text-sm">{tx('garden', 'groundDescription', lang)}</p>
          </div>
          
          {/* AI Guidance */}
          <div id="morita-guidance" class="bg-white/60 dark:bg-[#1e1e1e]/60 rounded-xl p-4 mb-6">
            <p class="text-ink-600 dark:text-[#a8a29e] text-sm" dangerouslySetInnerHTML={{ __html: `<span class="text-gold">●</span> ${tx('garden', 'guidanceDefault', lang)}` }}></p>
          </div>
          
          {/* Micro Actions - Generated dynamically by JS */}
          <div class="flex-1">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm text-ink-500 dark:text-[#78716c]">{tx('garden', 'microActionTitle', lang)}</p>
              <button 
                id="refresh-actions-btn"
                class="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors px-2 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                title={lang === 'en' ? 'Show different actions' : '別のアクションを表示'}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>{lang === 'en' ? 'More' : '別の提案'}</span>
              </button>
            </div>
            <div id="action-list" class="space-y-3">
              {/* Actions will be populated by JavaScript */}
              <div class="text-center text-ink-400 dark:text-[#78716c] text-sm py-4">
                {lang === 'en' ? 'Loading actions...' : '読み込み中...'}
              </div>
            </div>
          </div>
          
          {/* Garden Growth Visualization */}
          <div class="mt-6">
            <div class="flex flex-wrap items-end justify-center gap-1 sm:gap-2 min-h-[3rem] max-h-24 overflow-hidden" id="garden-plants">
              <div class="text-left text-ink-400 dark:text-[#78716c] text-sm w-full px-2">
                {tx('garden', 'plantGrowth', lang)}
              </div>
            </div>
          </div>
        </section>
        
        {/* Navigation after completing garden work */}
        <section class="py-8 px-4">
          <div class="max-w-md mx-auto">
            <p class="text-center text-ink-400 dark:text-[#78716c] text-sm mb-4">
              {lang === 'en' ? 'Continue your journey' : '旅を続ける'}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <a href={`/study?lang=${lang}`} class="flex items-center gap-2 px-4 py-3 bg-white/60 dark:bg-[#1e1e1e]/80 rounded-xl border border-wabi dark:border-[#4a4a4a] hover:border-gold dark:hover:border-gold transition-colors">
                <span class="text-xl">📖</span>
                <div>
                  <p class="text-sm font-medium text-indigo-800 dark:text-[#e8e4dc]">{lang === 'en' ? 'STUDY' : '書斎'}</p>
                  <p class="text-xs text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Naikan reflection' : '内観の振り返り'}</p>
                </div>
              </a>
              <a href={`/tatami?lang=${lang}`} class="flex items-center gap-2 px-4 py-3 bg-white/60 dark:bg-[#1e1e1e]/80 rounded-xl border border-wabi dark:border-[#4a4a4a] hover:border-gold dark:hover:border-gold transition-colors">
                <span class="text-xl">🧘</span>
                <div>
                  <p class="text-sm font-medium text-indigo-800 dark:text-[#e8e4dc]">{lang === 'en' ? 'TATAMI' : '座敷'}</p>
                  <p class="text-xs text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Zen meditation' : '禅の瞑想'}</p>
                </div>
              </a>
            </div>
            <div class="mt-3 flex gap-3">
              <a href={`/?lang=${lang}`} class="flex-1 text-center px-4 py-2.5 text-sm text-ink-500 dark:text-[#a8a29e] hover:text-gold dark:hover:text-gold transition-colors rounded-xl border border-wabi dark:border-[#4a4a4a]">
                {lang === 'en' ? 'Home' : 'ホーム'}
              </a>
              <a href={`/profile?lang=${lang}`} class="flex-1 text-center px-4 py-2.5 text-sm text-ink-500 dark:text-[#a8a29e] hover:text-gold dark:hover:text-gold transition-colors rounded-xl border border-wabi dark:border-[#4a4a4a]">
                {lang === 'en' ? 'My Vessel' : '器を見る'}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>,
    { title: lang === 'en' ? 'GARDEN — KINTSUGI MIND' : '庭 GARDEN — KINTSUGI MIND' }
  )
})

// STUDY Mode - Naikan Therapy
app.get('/study', (c) => {
  const lang = getLanguage(c)
  
  const mandalaTexts = {
    title: { en: 'Your Connection Mandala', ja: '縁の曼荼羅' },
    subtitle: { en: 'You are held by many connections', ja: 'あなたは多くの縁に支えられています' },
    received: { en: 'Received', ja: '受けた恩' },
    given: { en: 'Given', ja: '与えた恩' },
    forgiven: { en: 'Forgiven', ja: '許された恩' },
    center: { en: 'You', ja: 'あなた' },
    save: { en: 'Save to Profile', ja: 'プロフィールに保存' },
    continue: { en: 'Continue Journey', ja: '歩みを続ける' }
  }
  
  return c.render(
    <div class="min-h-screen bg-ecru dark:bg-[#121212] flex flex-col transition-colors duration-300" data-lang={lang}>
      <Header currentLang={lang} roomName={lang === 'en' ? 'STUDY' : '書斎 STUDY'} roomIcon="📚" />

      {/* Content */}
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="max-w-2xl w-full">
          {/* Chat Section (hidden when mandala shows) */}
          <div id="study-chat-section">
            <div class="text-center mb-8">
              <h1 class="text-3xl text-indigo-800 dark:text-[#e8e4dc] mb-2">{tx('study', 'title', lang)} — Deep Reflection</h1>
              <p class="text-ink-500 dark:text-[#78716c]">{tx('study', 'subtitle', lang)}</p>
            </div>
            
            {/* Chat Interface */}
            <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl shadow-wabi-lg overflow-hidden">
              <div id="naikan-chat" class="h-96 overflow-y-auto p-6 space-y-4">
                {/* Initial message with person input */}
                <div class="chat-bubble bg-ecru-200 dark:bg-[#2d2d2d] p-4 max-w-[85%]">
                  <p class="text-ink-700 dark:text-[#e8e4dc] text-sm mb-1">
                    <span class="text-gold">{tx('study', 'guideName', lang)}</span>
                  </p>
                  <p class="text-ink-600 dark:text-[#a8a29e] mb-3">
                    {tx('study', 'q1', lang)}
                  </p>
                  <p class="text-xs text-ink-400 dark:text-[#78716c]">{tx('study', 'q1Hint', lang)}</p>
                </div>
              </div>
              
              {/* Input with person name field */}
              <div class="border-t border-ecru-300 p-4">
                {/* Person name input (optional) */}
                <div class="mb-3">
                  <label class="text-xs text-ink-500 mb-1 block">
                    {lang === 'en' ? 'Who? (optional)' : '誰？（任意）'}
                  </label>
                  <input 
                    type="text" 
                    id="naikan-person"
                    placeholder={lang === 'en' ? 'e.g., Mom, a coworker, the barista...' : '例：母、同僚、カフェの店員...'}
                    class="w-full px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                  />
                </div>
                {/* Description input (required) */}
                <div class="mb-2">
                  <label class="text-xs text-ink-500 mb-1 block">
                    {lang === 'en' ? 'What happened? ' : 'どんなこと？ '}
                    <span class="text-amber-600">*</span>
                    <span class="text-ink-400">{lang === 'en' ? ' (required)' : '（必須）'}</span>
                  </label>
                </div>
                <div class="flex gap-3">
                  <input 
                    type="text" 
                    id="naikan-input"
                    placeholder={lang === 'en' ? 'e.g., Made breakfast for me, Listened to my concerns...' : '例：朝ご飯を作ってくれた、話を聞いてくれた...'}
                    class="flex-1 px-4 py-3 bg-ecru-100 border border-ecru-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                  <button 
                    id="naikan-send-btn"
                    class="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                  >
                    {tx('study', 'sendButton', lang)}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Progress - dev-bible 7-1: prefixed IDs to avoid duplication with onboarding */}
            <div class="mt-6 text-center">
              <p id="study-progress-text" class="text-ink-400 text-sm">{tx('study', 'question', lang)} 1 / 3</p>
              <div class="flex justify-center gap-2 mt-2">
                <div id="study-dot-1" class="w-3 h-3 rounded-full bg-gold"></div>
                <div id="study-dot-2" class="w-3 h-3 rounded-full bg-ecru-300"></div>
                <div id="study-dot-3" class="w-3 h-3 rounded-full bg-ecru-300"></div>
              </div>
            </div>
          </div>
          
          {/* Connection Mandala Section (hidden initially) */}
          <div id="mandala-section" class="hidden">
            <div class="text-center mb-8">
              <h2 class="text-3xl text-indigo-800 mb-2">{mandalaTexts.title[lang]}</h2>
              <p class="text-ink-500">{mandalaTexts.subtitle[lang]}</p>
            </div>
            
            {/* Mandala Canvas */}
            <div class="bg-gradient-to-b from-indigo-900 to-indigo-800 rounded-2xl p-8 shadow-wabi-lg">
              <div id="mandala-container" class="relative w-full aspect-square max-w-md mx-auto">
                {/* SVG will be rendered here by JavaScript */}
              </div>
              
              {/* Legend */}
              <div class="flex justify-center gap-6 mt-6 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                  <span class="text-ecru-300">{mandalaTexts.received[lang]}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-green-400"></div>
                  <span class="text-ecru-300">{mandalaTexts.given[lang]}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span class="text-ecru-300">{mandalaTexts.forgiven[lang]}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div class="flex justify-center gap-4 mt-8">
              <a href={`/profile?lang=${lang}`} class="px-6 py-3 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors">
                {mandalaTexts.continue[lang]}
              </a>
            </div>
          </div>
        </div>
        
      </main>

        {/* Navigation after completing study work */}
        <section class="py-8 px-4">
          <div class="max-w-md mx-auto">
            <p class="text-center text-ink-400 dark:text-[#78716c] text-sm mb-4">
              {lang === 'en' ? 'Continue your journey' : '旅を続ける'}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <a href={`/garden?lang=${lang}`} class="flex items-center gap-2 px-4 py-3 bg-white/60 dark:bg-[#1e1e1e]/80 rounded-xl border border-wabi dark:border-[#4a4a4a] hover:border-gold dark:hover:border-gold transition-colors">
                <span class="text-xl">🌱</span>
                <div>
                  <p class="text-sm font-medium text-indigo-800 dark:text-[#e8e4dc]">{lang === 'en' ? 'GARDEN' : '庭'}</p>
                  <p class="text-xs text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Morita therapy' : '森田療法'}</p>
                </div>
              </a>
              <a href={`/tatami?lang=${lang}`} class="flex items-center gap-2 px-4 py-3 bg-white/60 dark:bg-[#1e1e1e]/80 rounded-xl border border-wabi dark:border-[#4a4a4a] hover:border-gold dark:hover:border-gold transition-colors">
                <span class="text-xl">🧘</span>
                <div>
                  <p class="text-sm font-medium text-indigo-800 dark:text-[#e8e4dc]">{lang === 'en' ? 'TATAMI' : '座敷'}</p>
                  <p class="text-xs text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Zen meditation' : '禅の瞑想'}</p>
                </div>
              </a>
            </div>
            <div class="mt-3 flex gap-3">
              <a href={`/?lang=${lang}`} class="flex-1 text-center px-4 py-2.5 text-sm text-ink-500 dark:text-[#a8a29e] hover:text-gold dark:hover:text-gold transition-colors rounded-xl border border-wabi dark:border-[#4a4a4a]">
                {lang === 'en' ? 'Home' : 'ホーム'}
              </a>
              <a href={`/profile?lang=${lang}`} class="flex-1 text-center px-4 py-2.5 text-sm text-ink-500 dark:text-[#a8a29e] hover:text-gold dark:hover:text-gold transition-colors rounded-xl border border-wabi dark:border-[#4a4a4a]">
                {lang === 'en' ? 'My Vessel' : '器を見る'}
              </a>
            </div>
          </div>
        </section>
    </div>,
    { title: lang === 'en' ? 'STUDY — KINTSUGI MIND' : '書斎 STUDY — KINTSUGI MIND' }
  )
})

// TATAMI Mode - Zen
app.get('/tatami', (c) => {
  const lang = getLanguage(c)
  
  return c.render(
    <div class="min-h-screen bg-indigo-900 flex flex-col" data-lang={lang}>
      <Header currentLang={lang} variant="transparent" roomName={lang === 'en' ? 'TATAMI' : '座敷 TATAMI'} roomIcon="🧘" />

      {/* Zen Space */}
      <main class="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background circles */}
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="mandala-ring w-96 h-96 opacity-10"></div>
          <div class="mandala-ring w-64 h-64 absolute opacity-20" style="animation-direction: reverse; animation-duration: 20s;"></div>
        </div>
        
        <div class="text-center relative z-10">
          <p class="text-ecru/60 mb-8 font-jp">{tx('tatami', 'mu', lang)}</p>
          
          {/* Breathing Circle */}
          <div id="breathing-circle" class="breathing-circle w-48 h-48 mx-auto flex items-center justify-center mb-8">
            <div class="text-center">
              <p id="breath-instruction" class="text-ecru text-2xl font-light">
                {tx('tatami', 'breatheIn', lang)}
              </p>
              <p id="breath-instruction-sub" class="text-ecru/50 text-sm mt-2">
                {lang === 'en' ? '' : 'Breathe in'}
              </p>
            </div>
          </div>
          
          {/* Start Button */}
          <button 
            id="start-zen-btn"
            class="px-8 py-4 bg-gold/20 border border-gold/40 text-gold rounded-full hover:bg-gold/30 transition-colors mb-8"
            data-start-text={tx('tatami', 'startButton', lang)}
            data-stop-text={tx('tatami', 'stopButton', lang)}
          >
            {tx('tatami', 'startButton', lang)}
          </button>
          
          {/* Sound Control */}
          <div id="sound-control" class="flex flex-col items-center gap-3 mb-8">
            <div class="flex items-center gap-3">
              <button 
                id="sound-toggle-btn"
                class="flex items-center gap-2 px-4 py-3 bg-ecru/10 border border-ecru/20 text-ecru/70 rounded-full hover:bg-ecru/20 transition-colors text-sm min-h-[44px]"
                data-mode="tatami"
              >
                <svg id="sound-icon-off" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>
                <svg id="sound-icon-on" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                </svg>
                <span id="sound-label">{lang === 'en' ? 'Ambient Sound' : '環境音'}</span>
              </button>
            </div>
            
            {/* Sound Preset Selector */}
            <div id="sound-presets" class="hidden flex-wrap justify-center gap-2 max-w-sm">
              <button class="sound-preset px-3 py-1 text-xs rounded-full bg-ecru/10 text-ecru/60 hover:bg-ecru/20 border border-ecru/20" data-preset="tatami">
                {lang === 'en' ? '🔔 Zen Space' : '🔔 禅の空間'}
              </button>
              <button class="sound-preset px-3 py-1 text-xs rounded-full bg-ecru/10 text-ecru/60 hover:bg-ecru/20 border border-ecru/20" data-preset="tatamiRain">
                {lang === 'en' ? '🌧️ Rain' : '🌧️ 雨音'}
              </button>
              <button class="sound-preset px-3 py-1 text-xs rounded-full bg-ecru/10 text-ecru/60 hover:bg-ecru/20 border border-ecru/20" data-preset="tatamiNight">
                {lang === 'en' ? '🌙 Night' : '🌙 夜'}
              </button>
            </div>
            
            {/* Volume Slider */}
            <div id="volume-control" class="hidden flex items-center gap-2">
              <svg class="w-4 h-4 text-ecru/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
              </svg>
              <input 
                type="range" 
                id="volume-slider" 
                min="0" 
                max="100" 
                value="50"
                class="w-24 h-1 bg-ecru/20 rounded-lg appearance-none cursor-pointer accent-gold"
              />
              <svg class="w-4 h-4 text-ecru/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
              </svg>
            </div>
          </div>
          
          {/* Koan (Hidden until session ends) */}
          <div id="koan-container" class="hidden mt-12 max-w-md mx-auto">
            <p class="text-ecru/40 text-sm mb-4">{tx('tatami', 'koanTitle', lang)}</p>
            <p id="koan-text" class="text-ecru text-xl italic"></p>
            <p class="text-ecru/40 text-sm mt-4">
              {tx('tatami', 'koanNote', lang)}
            </p>
          </div>
          
          {/* Haptic Instruction */}
          <p class="text-ecru/40 text-xs mt-12" dangerouslySetInnerHTML={{ __html: tx('tatami', 'hapticNote', lang) }}></p>
        </div>
        
      </main>

        {/* Navigation after completing tatami work */}
        <section class="py-8 px-4">
          <div class="max-w-md mx-auto">
            <p class="text-center text-ecru/40 text-sm mb-4">
              {lang === 'en' ? 'Continue your journey' : '旅を続ける'}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <a href={`/garden?lang=${lang}`} class="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl border border-ecru/10 hover:border-gold/50 transition-colors">
                <span class="text-xl">🌱</span>
                <div>
                  <p class="text-sm font-medium text-ecru/80">{lang === 'en' ? 'GARDEN' : '庭'}</p>
                  <p class="text-xs text-ecru/40">{lang === 'en' ? 'Morita therapy' : '森田療法'}</p>
                </div>
              </a>
              <a href={`/study?lang=${lang}`} class="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl border border-ecru/10 hover:border-gold/50 transition-colors">
                <span class="text-xl">📖</span>
                <div>
                  <p class="text-sm font-medium text-ecru/80">{lang === 'en' ? 'STUDY' : '書斎'}</p>
                  <p class="text-xs text-ecru/40">{lang === 'en' ? 'Naikan reflection' : '内観の振り返り'}</p>
                </div>
              </a>
            </div>
            <div class="mt-3 flex gap-3">
              <a href={`/?lang=${lang}`} class="flex-1 text-center px-4 py-2.5 text-sm text-ecru/40 hover:text-gold transition-colors rounded-xl border border-ecru/10">
                {lang === 'en' ? 'Home' : 'ホーム'}
              </a>
              <a href={`/profile?lang=${lang}`} class="flex-1 text-center px-4 py-2.5 text-sm text-ecru/40 hover:text-gold transition-colors rounded-xl border border-ecru/10">
                {lang === 'en' ? 'My Vessel' : '器を見る'}
              </a>
            </div>
          </div>
        </section>
    </div>,
    { title: lang === 'en' ? 'TATAMI — KINTSUGI MIND' : '座敷 TATAMI — KINTSUGI MIND' }
  )
})

// Profile Page - Kintsugi Progression
app.get('/profile', (c) => {
  const lang = getLanguage(c)
  
  const t = {
    title: { en: 'Your Vessel', ja: 'あなたの器' },
    subtitle: { en: 'Your journey of golden repair', ja: '金継ぎの歩み' },
    stats: { en: 'Your Journey', ja: 'あなたの歩み' },
    totalVisits: { en: 'Total Visits', ja: '総訪問日数' },
    currentStreak: { en: 'Current Streak', ja: '連続日数' },
    longestStreak: { en: 'Longest Streak', ja: '最長連続' },
    totalRepairs: { en: 'Golden Repairs', ja: '金継ぎ回数' },
    gardenActions: { en: 'Garden Actions', ja: '庭での行動' },
    studySessions: { en: 'Study Sessions', ja: '内観セッション' },
    tatamiSessions: { en: 'Tatami Sessions', ja: '座禅セッション' },
    depth: { en: 'Depth of Experience', ja: '経験の深み' },
    gold: { en: 'Golden Radiance', ja: '金の輝き' },
    emptyMessage: { 
      en: 'Your vessel is new and unblemished. Through your journey, it will gain character.', 
      ja: 'あなたの器はまだ新しく、傷ひとつありません。歩みの中で、個性が刻まれていきます。' 
    },
    continue: { en: 'Continue Your Journey', ja: '歩みを続ける' },
    cracks: { en: 'Cracks', ja: 'ヒビ' },
    repaired: { en: 'Repaired', ja: '修復済み' },
    unrepaired: { en: 'Unrepaired', ja: '未修復' },
    days: { en: 'days', ja: '日' },
    whatIsKintsugi: { en: 'What is Kintsugi?', ja: '金継ぎとは？' },
    kintsugiDescription: { 
      en: 'Learn about the Japanese art of golden repair and its connection to mental wellness', 
      ja: '壊れたものを金で繋ぐ日本の伝統技法と、心のウェルネスとの関係を学ぶ' 
    }
  }
  
  return c.render(
    <div class="min-h-screen bg-ecru dark:bg-[#121212] flex flex-col transition-colors duration-300" data-lang={lang}>
      <Header currentLang={lang} />

      <main class="flex-1 py-12 px-6">
        <div class="max-w-4xl mx-auto">
          {/* Account Status Banner */}
          <div id="account-banner" class="mb-8">
            {/* Logged out state */}
            <div id="account-logged-out" class="bg-gradient-to-r from-indigo-800 to-indigo-700 dark:from-[#1e3a5f] dark:to-[#0d1f33] rounded-2xl p-6 text-ecru shadow-lg">
              <div class="flex flex-col sm:flex-row items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 rounded-full bg-ecru/20 flex items-center justify-center">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 text-center sm:text-left">
                  <h3 class="text-lg font-medium mb-1">
                    {lang === 'en' ? 'Sync your journey across devices' : 'デバイス間でデータを同期'}
                  </h3>
                  <p class="text-ecru/70 text-sm">
                    {lang === 'en' 
                      ? 'Sign in with Google to save your progress and access it anywhere' 
                      : 'Googleでログインして、どこからでもアクセス'}
                  </p>
                </div>
                <a 
                  href="/api/auth/login/google"
                  class="flex items-center gap-2 px-6 py-3 bg-white text-indigo-800 rounded-full hover:bg-ecru transition-colors font-medium shadow-md"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{lang === 'en' ? 'Sign in with Google' : 'Googleでログイン'}</span>
                </a>
              </div>
            </div>
            
            {/* Logged in state (hidden by default) */}
            <div id="account-logged-in" class="hidden bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-4 shadow-wabi">
              <div class="flex items-center gap-4">
                <img id="user-avatar" src="" alt="" class="w-12 h-12 rounded-full border-2 border-gold" />
                <div class="flex-1">
                  <p id="user-name" class="text-indigo-800 dark:text-[#e8e4dc] font-medium"></p>
                  <p id="user-email" class="text-ink-500 dark:text-[#78716c] text-sm"></p>
                </div>
                <button 
                  id="logout-btn"
                  class="px-4 py-2 text-sm text-ink-500 dark:text-[#78716c] hover:text-red-500 transition-colors"
                >
                  {lang === 'en' ? 'Sign out' : 'ログアウト'}
                </button>
              </div>
              {/* Cloud sync status */}
              <div id="sync-status" class="mt-3 pt-3 border-t border-wabi dark:border-[#4a4a4a] flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span id="sync-status-text" class="text-ink-500 dark:text-[#78716c]">
                  {lang === 'en' ? 'Synced to cloud' : 'クラウドに同期済み'}
                </span>
                <button 
                  id="sync-now-btn"
                  class="ml-auto text-xs text-indigo-600 dark:text-gold hover:underline"
                  onclick="manualSync()"
                >
                  {lang === 'en' ? 'Sync now' : '今すぐ同期'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <div class="text-center mb-12">
            <h1 class="text-4xl text-indigo-800 dark:text-[#e8e4dc] mb-2">{t.title[lang]}</h1>
            <p class="text-ink-500 dark:text-[#78716c]">{t.subtitle[lang]}</p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8">
            {/* Vessel Visualization */}
            <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi text-center">
              {/* Vessel type indicator - will be read by JS */}
              <div id="vessel-type-display" class="text-xs text-ink-400 dark:text-[#a8a29e] mb-2"></div>
              <div id="vessel-container" class="mb-6">
                {/* Stage-based vessel photo - image changes based on repair progress */}
                <img 
                  id="vessel-photo"
                  src="/static/images/chawan/stage-0.png" 
                  alt="Your Kintsugi Vessel"
                  class="w-56 h-56 md:w-64 md:h-64 object-contain mx-auto drop-shadow-xl transition-all duration-700"
                />
                
                {/* Legacy SVG vessel (hidden, for fallback when no photos available) */}
                <svg id="kintsugi-vessel-legacy" width="200" height="240" viewBox="0 0 200 240" class="hidden mx-auto drop-shadow-lg">
                  <defs>
                    <linearGradient id="vesselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#d4c4b0"/>
                      <stop offset="50%" style="stop-color:#c9b99c"/>
                      <stop offset="100%" style="stop-color:#a89880"/>
                    </linearGradient>
                    <filter id="goldGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path 
                    id="vessel-shape"
                    d="M40 60 Q40 20 100 20 Q160 20 160 60 L150 200 Q150 220 100 220 Q50 220 50 200 Z" 
                    fill="url(#vesselGrad)"
                    stroke="#8f7d5e"
                    stroke-width="1"
                  />
                  <g id="cracks-group"></g>
                </svg>
              </div>
              
              {/* Depth & Gold meters */}
              <div class="space-y-4 mt-8">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-ink-500 dark:text-[#c4bdb6]">{t.depth[lang]}</span>
                    <span id="depth-value" class="text-indigo-700 dark:text-indigo-300">0%</span>
                  </div>
                  <div class="h-2 bg-ecru-300 dark:bg-[#2d2d2d] rounded-full overflow-hidden">
                    <div id="depth-bar" class="h-full bg-indigo-600 rounded-full transition-all duration-1000" style="width: 0%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-ink-500 dark:text-[#c4bdb6]">{t.gold[lang]}</span>
                    <span id="gold-value" class="text-gold dark:text-[#e8c84a]">0%</span>
                  </div>
                  <div class="h-2 bg-ecru-300 dark:bg-[#2d2d2d] rounded-full overflow-hidden">
                    <div id="gold-bar" class="h-full bg-gold rounded-full transition-all duration-1000" style="width: 0%"></div>
                  </div>
                </div>
              </div>
              
              {/* Message */}
              <p id="vessel-message" class="text-ink-500 dark:text-[#c4bdb6] text-sm mt-6 italic">
                {t.emptyMessage[lang]}
              </p>
              
              {/* What is Kintsugi link */}
              <a 
                href={`/about/kintsugi?lang=${lang}`}
                class="inline-flex items-center gap-2 mt-6 text-gold hover:text-gold-600 transition-colors group"
              >
                <span class="text-lg">✦</span>
                <span class="border-b border-gold/30 group-hover:border-gold transition-colors">
                  {t.whatIsKintsugi[lang]}
                </span>
              </a>
              
              {/* Vessel Diagnosis Link */}
              <div class="mt-4">
                <a 
                  href={`/diagnosis?lang=${lang}`}
                  class="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
                >
                  <span class="text-lg">🏺</span>
                  <span class="border-b border-indigo-400/30 group-hover:border-indigo-600 dark:group-hover:border-indigo-300 transition-colors">
                    {lang === 'en' ? 'Retake Vessel Diagnosis' : '器診断をやり直す'}
                  </span>
                </a>
              </div>
            </div>
            
            {/* Statistics */}
            <div class="space-y-6">
              <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <h2 class="text-xl text-indigo-800 dark:text-[#e8e4dc] mb-4">{t.stats[lang]}</h2>
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-4 bg-ecru-100 dark:bg-[#2d2d2d] rounded-xl">
                    <p id="stat-visits" class="text-3xl text-indigo-700 dark:text-indigo-400 font-light">0</p>
                    <p class="text-xs text-ink-500 dark:text-[#78716c]">{t.totalVisits[lang]}</p>
                  </div>
                  <div class="text-center p-4 bg-ecru-100 dark:bg-[#2d2d2d] rounded-xl">
                    <p id="stat-streak" class="text-3xl text-gold font-light">0</p>
                    <p class="text-xs text-ink-500 dark:text-[#78716c]">{t.currentStreak[lang]}</p>
                  </div>
                  <div class="text-center p-4 bg-ecru-100 dark:bg-[#2d2d2d] rounded-xl">
                    <p id="stat-longest" class="text-3xl text-indigo-700 dark:text-indigo-400 font-light">0</p>
                    <p class="text-xs text-ink-500 dark:text-[#78716c]">{t.longestStreak[lang]}</p>
                  </div>
                  <div class="text-center p-4 bg-ecru-100 dark:bg-[#2d2d2d] rounded-xl">
                    <p id="stat-repairs" class="text-3xl text-gold font-light">0</p>
                    <p class="text-xs text-ink-500 dark:text-[#78716c]">{t.totalRepairs[lang]}</p>
                  </div>
                </div>
              </div>
              
              {/* Activity breakdown */}
              <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <h3 class="text-lg text-indigo-800 dark:text-[#e8e4dc] mb-4">
                  {lang === 'en' ? 'Activities' : '活動'}
                </h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">🌱</span>
                      <span class="text-ink-600 dark:text-[#a8a29e]">{t.gardenActions[lang]}</span>
                    </div>
                    <span id="stat-garden" class="text-indigo-700 dark:text-indigo-400 font-medium">0</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">📚</span>
                      <span class="text-ink-600 dark:text-[#a8a29e]">{t.studySessions[lang]}</span>
                    </div>
                    <span id="stat-study" class="text-indigo-700 dark:text-indigo-400 font-medium">0</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">🧘</span>
                      <span class="text-ink-600 dark:text-[#a8a29e]">{t.tatamiSessions[lang]}</span>
                    </div>
                    <span id="stat-tatami" class="text-indigo-700 dark:text-indigo-400 font-medium">0</span>
                  </div>
                </div>
              </div>
              
              {/* Emotion Trend Summary */}
              <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg text-indigo-800 dark:text-[#e8e4dc]">
                    {lang === 'en' ? '📊 Emotion Trend' : '📊 感情のトレンド'}
                  </h3>
                  <span id="trend-period" class="text-xs text-ink-500 dark:text-[#78716c]">
                    {lang === 'en' ? 'Last 30 days' : '過去30日'}
                  </span>
                </div>
                
                {/* Emotion Distribution Bar */}
                <div class="mb-4">
                  <div id="emotion-distribution" class="h-6 rounded-full overflow-hidden flex bg-ecru-200 dark:bg-[#2d2d2d]">
                    {/* Will be populated by JS */}
                  </div>
                </div>
                
                {/* Emotion Stats */}
                <div class="grid grid-cols-4 gap-2 mb-4">
                  <div class="text-center">
                    <span class="text-2xl">☀️</span>
                    <p id="emotion-sunny-count" class="text-lg font-medium text-amber-500">0</p>
                    <p class="text-[10px] text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Sunny' : '晴れ'}</p>
                  </div>
                  <div class="text-center">
                    <span class="text-2xl">⛅</span>
                    <p id="emotion-cloudy-count" class="text-lg font-medium text-sky-500">0</p>
                    <p class="text-[10px] text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Cloudy' : '曇り'}</p>
                  </div>
                  <div class="text-center">
                    <span class="text-2xl">🌧️</span>
                    <p id="emotion-rainy-count" class="text-lg font-medium text-blue-500">0</p>
                    <p class="text-[10px] text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Rainy' : '雨'}</p>
                  </div>
                  <div class="text-center">
                    <span class="text-2xl">⛈️</span>
                    <p id="emotion-stormy-count" class="text-lg font-medium text-purple-500">0</p>
                    <p class="text-[10px] text-ink-400 dark:text-[#78716c]">{lang === 'en' ? 'Stormy' : '嵐'}</p>
                  </div>
                </div>
                
                {/* Insight Message */}
                <div id="emotion-insight" class="p-3 bg-gradient-to-r from-gold/10 to-indigo-800/10 dark:from-gold/20 dark:to-[#1e3a5f]/30 rounded-xl">
                  <p class="text-sm text-indigo-800 dark:text-[#e8e4dc] italic">
                    {lang === 'en' 
                      ? 'Start tracking your emotions to see insights here.' 
                      : '感情を記録して、ここで気づきを得ましょう。'}
                  </p>
                </div>
                
                {/* Share Button */}
                <button 
                  id="share-emotion-trend-btn"
                  class="mt-4 w-full py-2 text-sm text-center text-indigo-600 dark:text-gold border border-indigo-600/30 dark:border-gold/30 rounded-xl hover:bg-indigo-600/5 dark:hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                  </svg>
                  {lang === 'en' ? 'Share My Emotion Journey' : '感情の旅をシェア'}
                </button>
              </div>
              
              {/* Check-in Calendar Heatmap */}
              <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg text-indigo-800 dark:text-[#e8e4dc]">
                    {lang === 'en' ? '📅 Emotion Heatmap' : '📅 感情ヒートマップ'}
                  </h3>
                  <div class="flex items-center gap-2">
                    <button id="calendar-prev" class="p-2 hover:bg-ecru-200 dark:hover:bg-[#2d2d2d] rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <svg class="w-5 h-5 text-ink-500 dark:text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    <span id="calendar-month" class="text-sm text-ink-600 dark:text-[#a8a29e] min-w-[100px] text-center font-medium"></span>
                    <button id="calendar-next" class="p-2 hover:bg-ecru-200 dark:hover:bg-[#2d2d2d] rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <svg class="w-5 h-5 text-ink-500 dark:text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Calendar Grid */}
                <div class="mb-4">
                  <div class="grid grid-cols-7 gap-1 text-center text-xs text-ink-400 dark:text-[#78716c] mb-2">
                    <span>{lang === 'en' ? 'Sun' : '日'}</span>
                    <span>{lang === 'en' ? 'Mon' : '月'}</span>
                    <span>{lang === 'en' ? 'Tue' : '火'}</span>
                    <span>{lang === 'en' ? 'Wed' : '水'}</span>
                    <span>{lang === 'en' ? 'Thu' : '木'}</span>
                    <span>{lang === 'en' ? 'Fri' : '金'}</span>
                    <span>{lang === 'en' ? 'Sat' : '土'}</span>
                  </div>
                  <div id="calendar-grid" class="grid grid-cols-7 gap-1.5">
                    {/* Calendar days will be generated by JS with heatmap colors */}
                  </div>
                </div>
                
                {/* Heatmap Legend */}
                <div class="flex items-center justify-center gap-4 pt-3 border-t border-ecru-200 dark:border-[#3d3d3d]">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-amber-300 dark:bg-amber-500"></div>
                    <span class="text-xs text-ink-500 dark:text-[#78716c]">☀️ {lang === 'en' ? 'Sunny' : '晴れ'}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-sky-300 dark:bg-sky-500"></div>
                    <span class="text-xs text-ink-500 dark:text-[#78716c]">⛅ {lang === 'en' ? 'Cloudy' : '曇り'}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-blue-400 dark:bg-blue-500"></div>
                    <span class="text-xs text-ink-500 dark:text-[#78716c]">🌧️ {lang === 'en' ? 'Rainy' : '雨'}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-purple-400 dark:bg-purple-500"></div>
                    <span class="text-xs text-ink-500 dark:text-[#78716c]">⛈️ {lang === 'en' ? 'Stormy' : '嵐'}</span>
                  </div>
                </div>
              </div>
              
              {/* Cracks summary */}
              <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <h3 class="text-lg text-indigo-800 dark:text-[#e8e4dc] mb-4">{t.cracks[lang]}</h3>
                <div class="flex items-center gap-6">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-gold gold-glow"></div>
                    <span class="text-ink-600 dark:text-[#a8a29e]">{t.repaired[lang]}:</span>
                    <span id="stat-repaired" class="text-gold font-medium">0</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-ink-400"></div>
                    <span class="text-ink-600 dark:text-[#a8a29e]">{t.unrepaired[lang]}:</span>
                    <span id="stat-unrepaired" class="text-ink-600 font-medium">0</span>
                  </div>
                </div>
              </div>
              
              {/* Daily Reminders */}
              <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg text-indigo-800 dark:text-[#e8e4dc]">
                    {lang === 'en' ? '🔔 Daily Reminders' : '🔔 毎日のリマインダー'}
                  </h3>
                  <div id="notification-status" class="text-xs px-2 py-1 rounded-full bg-ink-100 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#78716c]">
                    {lang === 'en' ? 'Off' : 'オフ'}
                  </div>
                </div>
                
                <p class="text-ink-500 dark:text-[#78716c] text-sm mb-4">
                  {lang === 'en' 
                    ? 'Get gentle reminders to practice mindfulness each day.' 
                    : '毎日のマインドフルネスを優しくリマインドします。'}
                </p>
                
                {/* Enable/Disable Toggle */}
                <div id="reminder-toggle-container" class="mb-4">
                  <button 
                    id="enable-reminders-btn"
                    class="w-full px-4 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <span>{lang === 'en' ? 'Enable Reminders' : 'リマインダーを有効にする'}</span>
                  </button>
                </div>
                
                {/* Reminder Settings (hidden until enabled) */}
                <div id="reminder-settings" class="hidden space-y-4">
                  {/* Morning Reminder */}
                  <div class="flex items-center justify-between p-3 bg-ecru-100 dark:bg-[#2d2d2d] rounded-xl">
                    <div class="flex items-center gap-3">
                      <span class="text-xl">🌅</span>
                      <div>
                        <p class="text-ink-700 dark:text-[#e8e4dc] text-sm font-medium">
                          {lang === 'en' ? 'Morning Check-in' : '朝のチェックイン'}
                        </p>
                        <p class="text-ink-500 dark:text-[#a8a29e] text-xs">
                          {lang === 'en' ? 'Start your day mindfully' : '一日をマインドフルに始める'}
                        </p>
                      </div>
                    </div>
                    <input 
                      type="time" 
                      id="morning-time" 
                      value="08:00"
                      class="px-2 py-1 bg-white dark:bg-[#1e1e1e] border border-ecru-300 dark:border-[#4a4a4a] rounded-lg text-sm text-ink-700 dark:text-[#e8e4dc]"
                    />
                  </div>
                  
                  {/* Evening Reminder */}
                  <div class="flex items-center justify-between p-3 bg-ecru-100 dark:bg-[#2d2d2d] rounded-xl">
                    <div class="flex items-center gap-3">
                      <span class="text-xl">🌙</span>
                      <div>
                        <p class="text-ink-700 dark:text-[#e8e4dc] text-sm font-medium">
                          {lang === 'en' ? 'Evening Reflection' : '夜の振り返り'}
                        </p>
                        <p class="text-ink-500 dark:text-[#a8a29e] text-xs">
                          {lang === 'en' ? 'Wind down before sleep' : '眠る前のひととき'}
                        </p>
                      </div>
                    </div>
                    <input 
                      type="time" 
                      id="evening-time" 
                      value="21:00"
                      class="px-2 py-1 bg-white dark:bg-[#1e1e1e] border border-ecru-300 dark:border-[#4a4a4a] rounded-lg text-sm text-ink-700 dark:text-[#e8e4dc]"
                    />
                  </div>
                  
                  {/* Test & Disable buttons */}
                  <div class="flex gap-2 pt-2">
                    <button 
                      id="test-notification-btn"
                      class="flex-1 px-3 py-2 bg-ecru-200 dark:bg-[#3a3a3a] text-ink-600 dark:text-[#e8e4dc] rounded-lg text-sm hover:bg-ecru-300 dark:hover:bg-[#4a4a4a] transition-colors"
                    >
                      {lang === 'en' ? 'Test Notification' : 'テスト通知'}
                    </button>
                    <button 
                      id="disable-reminders-btn"
                      class="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                    >
                      {lang === 'en' ? 'Disable' : '無効にする'}
                    </button>
                  </div>
                </div>
                
                {/* Permission denied message */}
                <p id="notification-denied" class="hidden text-red-500 text-sm mt-2">
                  {lang === 'en' 
                    ? '⚠️ Notifications are blocked. Please enable them in your browser settings.' 
                    : '⚠️ 通知がブロックされています。ブラウザの設定で有効にしてください。'}
                </p>
              </div>
              
              {/* Display Settings */}
              <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <h3 class="text-lg text-indigo-800 dark:text-[#e8e4dc] mb-4">
                  {lang === 'en' ? '🎨 Display' : '🎨 表示設定'}
                </h3>
                
                {/* Dark Mode Toggle */}
                <div class="flex items-center justify-between p-3 bg-ecru-100 dark:bg-[#2d2d2d] rounded-xl">
                  <div class="flex items-center gap-3">
                    <span class="text-xl" id="theme-icon">🌙</span>
                    <div>
                      <p class="text-ink-700 dark:text-[#e8e4dc] text-sm font-medium">
                        {lang === 'en' ? 'Dark Mode' : 'ダークモード'}
                      </p>
                      <p class="text-ink-500 dark:text-[#78716c] text-xs">
                        {lang === 'en' ? 'Easier on the eyes at night' : '夜間に目に優しい表示'}
                      </p>
                    </div>
                  </div>
                  <button 
                    id="dark-mode-toggle-profile"
                    class="relative w-12 h-6 bg-ecru-300 dark:bg-gold rounded-full transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    <span class="absolute top-0.5 left-0.5 dark:left-6 w-5 h-5 bg-white dark:bg-ink-900 rounded-full transition-all shadow-sm"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div class="text-center mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <a href={`/check-in?lang=${lang}`} class="inline-block px-8 py-4 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors">
              {t.continue[lang]}
            </a>
            <a href={`/report?lang=${lang}`} class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-ecru-200 text-indigo-800 rounded-full hover:bg-ecru-300 transition-colors border border-indigo-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              {lang === 'en' ? 'Weekly Report' : '週間レポート'}
            </a>
          </div>
        </div>
      </main>
      
      <Footer currentLang={lang} />
    </div>,
    { title: lang === 'en' ? 'Your Vessel — KINTSUGI MIND' : 'あなたの器 — KINTSUGI MIND' }
  )
})

// About Kintsugi Page - Philosophy explanation
app.get('/about/kintsugi', (c) => {
  const lang = getLanguage(c)
  
  const t = {
    title: { 
      en: 'What is Kintsugi?', 
      ja: '金継ぎとは？' 
    },
    subtitle: {
      en: 'The Japanese Art of Golden Repair',
      ja: '壊れたものを金で繋ぐ日本の伝統技法'
    },
    section1Title: {
      en: 'The Ancient Craft',
      ja: '伝統の技'
    },
    section1Text: {
      en: `Kintsugi (金継ぎ) is a centuries-old Japanese art of repairing broken pottery with lacquer mixed with powdered gold, silver, or platinum. Rather than disguising the breakage, kintsugi illuminates it — treating the repair as part of the object's history, not something to hide.

The practice is believed to have originated in the 15th century when a Japanese shogun sent a damaged tea bowl to China for repairs. When it returned with ugly metal staples, Japanese craftsmen sought a more aesthetic solution, leading to the birth of kintsugi.`,
      ja: `金継ぎは、割れた陶器を金・銀・プラチナの粉を混ぜた漆で修復する、数百年の歴史を持つ日本の伝統技法です。破損を隠すのではなく、むしろ際立たせる。修復の跡を隠すべきものではなく、その器の歴史の一部として扱います。

この技法は15世紀、ある将軍が傷ついた茶碗を中国に修理に出したことから始まったと言われています。金属の鉤で見苦しく修理されて戻ってきたため、日本の職人たちがより美しい解決法を求め、金継ぎが生まれました。`
    },
    section2Title: {
      en: 'The Philosophy',
      ja: '金継ぎの哲学'
    },
    section2Text: {
      en: `Kintsugi is deeply connected to the Japanese philosophy of wabi-sabi (侘寂) — finding beauty in imperfection and impermanence. It also embodies the concept of mushin (無心), the acceptance of change.

Instead of throwing away broken things, kintsugi teaches us that:
• Scars and repairs are part of the story
• Imperfections can become beautiful
• What was broken can become stronger and more valuable
• There is no need to hide our damage`,
      ja: `金継ぎは、不完全さや無常に美を見出す「侘び寂び」の精神と深く結びついています。また、変化を受け入れる「無心」の概念も体現しています。

壊れたものを捨てるのではなく、金継ぎは私たちに教えてくれます：
• 傷や修復は物語の一部である
• 不完全さは美しくなりうる
• 壊れたものは、より強く、より価値あるものになれる
• 自分のダメージを隠す必要はない`
    },
    section3Title: {
      en: 'Kintsugi & Your Mind',
      ja: '金継ぎと心'
    },
    section3Text: {
      en: `KINTSUGI MIND applies this philosophy to mental wellness. In a world obsessed with "fixing" ourselves, eliminating anxiety, and appearing perfect, we offer a different path.

Your emotional struggles are not flaws to be erased. They are cracks that, when acknowledged and tended to with care, can become sources of strength and beauty.

This is what the three rooms of our Tea House help you do:`,
      ja: `KINTSUGI MINDはこの哲学をメンタルウェルネスに適用します。自分を「直す」こと、不安を消すこと、完璧に見せることに取り憑かれた世界で、私たちは別の道を提案します。

あなたの感情的な苦しみは、消すべき欠点ではありません。それらは、認め、丁寧に向き合うことで、強さと美しさの源となりうる「ヒビ」なのです。

これが、心の茶室の3つの部屋があなたを助けることです：`
    },
    gardenTitle: { en: '🌱 GARDEN — Morita Therapy', ja: '🌱 GARDEN — 森田療法' },
    gardenText: {
      en: 'Accept anxiety as natural. Act alongside it, not against it. Your cracks don\'t stop you from growing.',
      ja: '不安を自然なものとして受け入れる。それに逆らわず、共に行動する。ヒビがあっても成長できます。'
    },
    studyTitle: { en: '📚 STUDY — Naikan', ja: '📚 STUDY — 内観法' },
    studyText: {
      en: 'Rediscover connections with others. See the golden threads that bind you to the world. You are not alone.',
      ja: '他者との繋がりを再発見する。あなたを世界に結びつける金色の糸を見る。あなたは一人じゃない。'
    },
    tatamiTitle: { en: '🧘 TATAMI — Zen', ja: '🧘 TATAMI — 禅' },
    tatamiText: {
      en: 'Stop trying to fix. Just breathe. Just be. In stillness, the cracks heal themselves with gold.',
      ja: '直そうとするのをやめる。ただ呼吸する。ただ在る。静けさの中で、ヒビは金で自ら癒える。'
    },
    section4Title: {
      en: 'Your Vessel',
      ja: 'あなたの器'
    },
    section4Text: {
      en: `In this app, your profile shows a "vessel" — your personal kintsugi bowl. As you engage with the therapy modes:

• Cracks appear when you face difficulties or miss days
• Golden repairs form when you complete sessions and take action
• Over time, your vessel becomes uniquely beautiful — a map of your journey

The goal is not a perfect, crack-free vessel. The goal is a vessel that tells YOUR story, with golden seams that prove you've lived, struggled, and grown.`,
      ja: `このアプリでは、あなたのプロフィールに「器」が表示されます — あなた自身の金継ぎの器です。セラピーモードに取り組むにつれて：

• 困難に直面したり、日を空けるとヒビが入る
• セッションを完了し、行動を起こすと金の修復が形成される
• 時間とともに、あなたの器は独自の美しさを持つようになる — あなたの歩みの地図

目標は、ヒビのない完璧な器ではありません。目標は、あなたが生き、苦しみ、成長したことを証明する金の継ぎ目を持つ、あなたの物語を語る器です。`
    },
    closing: {
      en: '"Your scars make you beautiful."',
      ja: '「傷は、あなたを美しくする。」'
    },
    backToProfile: {
      en: '← Back to Your Vessel',
      ja: '← 器に戻る'
    }
  }
  
  return c.render(
    <div class="min-h-screen bg-ecru flex flex-col" data-lang={lang}>
      <Header currentLang={lang} />
      
      <main class="flex-1 py-12 px-6">
        <div class="max-w-3xl mx-auto">
          {/* Hero */}
          <div class="text-center mb-16">
            <div class="w-20 h-24 mx-auto mb-8 flex items-center justify-center">
              <div class="transform scale-50 origin-center">
                <KintsugiVessel currentLang={lang} />
              </div>
            </div>
            <h1 class="text-4xl md:text-5xl text-indigo-800 mb-4">{t.title[lang]}</h1>
            <p class="text-xl text-gold">{t.subtitle[lang]}</p>
          </div>
          
          {/* Section 1: The Craft */}
          <section class="mb-12">
            <h2 class="text-2xl text-indigo-800 mb-4 flex items-center gap-2">
              <span class="text-gold">◆</span> {t.section1Title[lang]}
            </h2>
            <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
              <p class="text-ink-600 whitespace-pre-line leading-relaxed">{t.section1Text[lang]}</p>
            </div>
          </section>
          
          {/* Section 2: Philosophy */}
          <section class="mb-12">
            <h2 class="text-2xl text-indigo-800 mb-4 flex items-center gap-2">
              <span class="text-gold">◆</span> {t.section2Title[lang]}
            </h2>
            <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
              <p class="text-ink-600 whitespace-pre-line leading-relaxed">{t.section2Text[lang]}</p>
            </div>
          </section>
          
          {/* Section 3: Kintsugi & Mind */}
          <section class="mb-12">
            <h2 class="text-2xl text-indigo-800 mb-4 flex items-center gap-2">
              <span class="text-gold">◆</span> {t.section3Title[lang]}
            </h2>
            <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-wabi mb-6">
              <p class="text-ink-600 whitespace-pre-line leading-relaxed">{t.section3Text[lang]}</p>
            </div>
            
            {/* Three Rooms */}
            <div class="grid gap-4">
              <div class="bg-green-50 rounded-xl p-5 border-l-4 border-green-400">
                <h3 class="font-medium text-indigo-800 mb-2">{t.gardenTitle[lang]}</h3>
                <p class="text-ink-600 text-sm">{t.gardenText[lang]}</p>
              </div>
              <div class="bg-amber-50 rounded-xl p-5 border-l-4 border-amber-400">
                <h3 class="font-medium text-indigo-800 mb-2">{t.studyTitle[lang]}</h3>
                <p class="text-ink-600 text-sm">{t.studyText[lang]}</p>
              </div>
              <div class="bg-indigo-50 rounded-xl p-5 border-l-4 border-indigo-400">
                <h3 class="font-medium text-indigo-800 mb-2">{t.tatamiTitle[lang]}</h3>
                <p class="text-ink-600 text-sm">{t.tatamiText[lang]}</p>
              </div>
            </div>
          </section>
          
          {/* Section 4: Your Vessel */}
          <section class="mb-12">
            <h2 class="text-2xl text-indigo-800 mb-4 flex items-center gap-2">
              <span class="text-gold">◆</span> {t.section4Title[lang]}
            </h2>
            <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
              <p class="text-ink-600 whitespace-pre-line leading-relaxed">{t.section4Text[lang]}</p>
            </div>
          </section>
          
          {/* Closing */}
          <div class="text-center py-12">
            <p class="text-2xl text-gold italic mb-8">{t.closing[lang]}</p>
            <a 
              href={`/profile?lang=${lang}`} 
              class="inline-block px-6 py-3 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors"
            >
              {t.backToProfile[lang]}
            </a>
          </div>
        </div>
      </main>
      
      <Footer currentLang={lang} />
    </div>,
    { title: lang === 'en' ? 'What is Kintsugi? — KINTSUGI MIND' : '金継ぎとは？ — KINTSUGI MIND' }
  )
})

// Install Page - PWA Installation Guide
app.get('/install', (c) => {
  const lang = getLanguage(c)
  
  const t = {
    title: { 
      en: 'Add to Home Screen', 
      ja: 'ホーム画面に追加' 
    },
    subtitle: {
      en: 'Use KINTSUGI MIND like an app',
      ja: 'アプリのように快適に使う'
    },
    benefits: {
      title: { en: 'Benefits', ja: 'メリット' },
      items: {
        en: [
          { icon: '⚡', text: 'Quick access with one tap' },
          { icon: '📱', text: 'Full screen experience without browser UI' },
          { icon: '🔌', text: 'Works offline for breathing exercises' },
          { icon: '🔔', text: 'Future: Push notifications for reminders' }
        ],
        ja: [
          { icon: '⚡', text: 'ワンタップで素早く起動' },
          { icon: '📱', text: 'ブラウザUIなしのフルスクリーン体験' },
          { icon: '🔌', text: 'オフラインでも呼吸ガイドが使える' },
          { icon: '🔔', text: '今後：リマインダー通知機能' }
        ]
      }
    },
    ios: {
      title: { en: 'iPhone / iPad (Safari)', ja: 'iPhone / iPad の場合' },
      note: { en: '※ Safari browser required', ja: '※ Safariブラウザでのみ可能' },
      steps: {
        en: [
          { step: '1', text: 'Tap the Share button', icon: '□↑', detail: 'at the bottom of the screen' },
          { step: '2', text: 'Scroll down and tap "Add to Home Screen"', icon: '＋', detail: '' },
          { step: '3', text: 'Tap "Add" in the top right', icon: '✓', detail: '' }
        ],
        ja: [
          { step: '1', text: '共有ボタンをタップ', icon: '□↑', detail: '画面下部にあります' },
          { step: '2', text: '「ホーム画面に追加」をタップ', icon: '＋', detail: '下にスクロールして探してください' },
          { step: '3', text: '右上の「追加」をタップ', icon: '✓', detail: '' }
        ]
      }
    },
    android: {
      title: { en: 'Android (Chrome)', ja: 'Android の場合' },
      note: { en: '※ Chrome browser recommended', ja: '※ Chromeブラウザ推奨' },
      steps: {
        en: [
          { step: '1', text: 'Tap the menu button', icon: '⋮', detail: 'three dots in the top right' },
          { step: '2', text: 'Tap "Install app" or "Add to Home screen"', icon: '📲', detail: '' },
          { step: '3', text: 'Tap "Install" to confirm', icon: '✓', detail: '' }
        ],
        ja: [
          { step: '1', text: 'メニューボタンをタップ', icon: '⋮', detail: '右上の3点アイコン' },
          { step: '2', text: '「アプリをインストール」または「ホーム画面に追加」', icon: '📲', detail: '' },
          { step: '3', text: '「インストール」をタップ', icon: '✓', detail: '' }
        ]
      }
    },
    desktop: {
      title: { en: 'Desktop (Chrome / Edge)', ja: 'パソコンの場合' },
      steps: {
        en: [
          { step: '1', text: 'Look for the install icon in the address bar', icon: '⊕', detail: 'or use browser menu' },
          { step: '2', text: 'Click "Install"', icon: '✓', detail: '' }
        ],
        ja: [
          { step: '1', text: 'アドレスバーのインストールアイコンを探す', icon: '⊕', detail: 'またはブラウザメニューから' },
          { step: '2', text: '「インストール」をクリック', icon: '✓', detail: '' }
        ]
      }
    },
    backHome: { en: '← Back to Home', ja: '← ホームに戻る' }
  }
  
  return c.render(
    <div class="min-h-screen bg-ecru flex flex-col" data-lang={lang}>
      <Header currentLang={lang} />
      
      <main class="flex-1 py-12 px-4 sm:px-6">
        <div class="max-w-2xl mx-auto">
          {/* Hero */}
          <div class="text-center mb-12">
            <div class="w-20 h-20 mx-auto mb-6 bg-indigo-800 rounded-2xl flex items-center justify-center shadow-wabi">
              <svg class="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 class="text-3xl md:text-4xl text-indigo-800 mb-3">{t.title[lang]}</h1>
            <p class="text-ink-500">{t.subtitle[lang]}</p>
          </div>
          
          {/* Benefits */}
          <section class="mb-10">
            <div class="bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-6 border border-gold/20">
              <h2 class="text-lg text-indigo-800 mb-4 flex items-center gap-2">
                <span class="text-gold">✦</span> {t.benefits.title[lang]}
              </h2>
              <ul class="space-y-3">
                {t.benefits.items[lang].map((item) => (
                  <li class="flex items-center gap-3 text-ink-600">
                    <span class="text-xl">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          
          {/* iOS Instructions */}
          <section class="mb-8">
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-ink-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-ink-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg text-indigo-800 font-medium">{t.ios.title[lang]}</h2>
                  <p class="text-xs text-ink-400">{t.ios.note[lang]}</p>
                </div>
              </div>
              <ol class="space-y-4">
                {/* Step 1: Share button with accurate iOS icon */}
                <li class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-700 font-medium">
                    1
                  </div>
                  <div class="flex-1 pt-1">
                    <p class="text-ink-700">{t.ios.steps[lang][0].text}</p>
                    {t.ios.steps[lang][0].detail && <p class="text-xs text-ink-400 mt-1">{t.ios.steps[lang][0].detail}</p>}
                  </div>
                  <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-indigo-200 shadow-sm">
                    {/* Accurate iOS Share icon */}
                    <svg class="w-7 h-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="5" y="9" width="14" height="12" rx="2" stroke="currentColor" fill="none"/>
                      <path d="M12 3v12" stroke="currentColor" stroke-linecap="round"/>
                      <path d="M8 7l4-4 4 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </li>
                {/* Step 2: Add to Home Screen */}
                <li class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-700 font-medium">
                    2
                  </div>
                  <div class="flex-1 pt-1">
                    <p class="text-ink-700">{t.ios.steps[lang][1].text}</p>
                    {t.ios.steps[lang][1].detail && <p class="text-xs text-ink-400 mt-1">{t.ios.steps[lang][1].detail}</p>}
                  </div>
                  <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-indigo-200 shadow-sm">
                    {/* Plus icon in square */}
                    <svg class="w-7 h-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" fill="none"/>
                      <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-linecap="round"/>
                    </svg>
                  </div>
                </li>
                {/* Step 3: Tap Add */}
                <li class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-700 font-medium">
                    3
                  </div>
                  <div class="flex-1 pt-1">
                    <p class="text-ink-700">{t.ios.steps[lang][2].text}</p>
                    {t.ios.steps[lang][2].detail && <p class="text-xs text-ink-400 mt-1">{t.ios.steps[lang][2].detail}</p>}
                  </div>
                  <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span class="text-white text-sm font-medium">{lang === 'en' ? 'Add' : '追加'}</span>
                  </div>
                </li>
              </ol>
            </div>
          </section>
          
          {/* Android Instructions */}
          <section class="mb-8">
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-1.4-.59-2.94-.92-4.47-.92s-3.07.33-4.47.92L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg text-indigo-800 font-medium">{t.android.title[lang]}</h2>
                  <p class="text-xs text-ink-400">{t.android.note[lang]}</p>
                </div>
              </div>
              <ol class="space-y-4">
                {t.android.steps[lang].map((item) => (
                  <li class="flex items-start gap-4">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-700 font-medium">
                      {item.step}
                    </div>
                    <div class="flex-1 pt-1">
                      <p class="text-ink-700">{item.text}</p>
                      {item.detail && <p class="text-xs text-ink-400 mt-1">{item.detail}</p>}
                    </div>
                    <div class="w-10 h-10 bg-ecru-200 rounded-lg flex items-center justify-center text-green-600 font-medium">
                      {item.icon}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
          
          {/* Desktop Instructions */}
          <section class="mb-10">
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 class="text-lg text-indigo-800 font-medium">{t.desktop.title[lang]}</h2>
              </div>
              <ol class="space-y-4">
                {t.desktop.steps[lang].map((item) => (
                  <li class="flex items-start gap-4">
                    <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-700 font-medium">
                      {item.step}
                    </div>
                    <div class="flex-1 pt-1">
                      <p class="text-ink-700">{item.text}</p>
                      {item.detail && <p class="text-xs text-ink-400 mt-1">{item.detail}</p>}
                    </div>
                    <div class="w-10 h-10 bg-ecru-200 rounded-lg flex items-center justify-center text-indigo-600 font-medium text-xl">
                      {item.icon}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
          
          {/* Back Link */}
          <div class="text-center">
            <a 
              href={`/?lang=${lang}`} 
              class="inline-block px-6 py-3 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors"
            >
              {t.backHome[lang]}
            </a>
          </div>
        </div>
      </main>
      
      <Footer currentLang={lang} />
    </div>,
    { title: lang === 'en' ? 'Add to Home Screen — KINTSUGI MIND' : 'ホーム画面に追加 — KINTSUGI MIND' }
  )
})

// ========================================
// Vessel Diagnosis Page (独立ページ)
// ========================================

app.get('/diagnosis', (c) => {
  const lang = getLanguage(c)
  
  const t = {
    title: { en: 'Discover Your Vessel', ja: 'あなたの器を診断' },
    subtitle: { 
      en: 'Answer 5 questions to find the vessel that resonates with your spirit', 
      ja: '5つの質問に答えて、あなたの心に響く器を見つけましょう' 
    },
    description: {
      en: 'In kintsugi philosophy, each person is like a vessel — unique, beautiful, and capable of becoming even more beautiful through the golden repair of life\'s experiences.',
      ja: '金継ぎの哲学では、人はそれぞれ器のような存在です。唯一無二で、美しく、人生経験という金継ぎを通じてさらに美しくなれる可能性を秘めています。'
    },
    startQuiz: { en: 'Start Diagnosis', ja: '診断を始める' },
    retake: { en: 'Take again', ja: 'もう一度診断' },
    backToHome: { en: 'Back to Home', ja: 'ホームに戻る' },
    question: { en: 'Question', ja: '質問' },
    of: { en: 'of', ja: '/' },
    yourVessel: { en: 'Your Vessel Is...', ja: 'あなたの器は...' },
    share: { en: 'Share Result', ja: '結果をシェア' },
    viewProfile: { en: 'View Your Profile', ja: 'プロフィールを見る' }
  }
  
  return c.render(
    <html lang={lang}>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{t.title[lang]} — KINTSUGI MIND</title>
      <meta name="description" content={t.subtitle[lang]} />
      <meta property="og:title" content={`${t.title[lang]} — KINTSUGI MIND`} />
      <meta property="og:description" content={t.subtitle[lang]} />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#1a365d" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                gold: { DEFAULT: '#d4af37', 600: '#b8960c' },
                ecru: { DEFAULT: '#FAF9F6', 300: '#F5F2EB' },
                ink: { DEFAULT: '#1a365d', 200: '#e2e8f0', 400: '#718096', 500: '#4a5568' },
                indigo: { 600: '#4f46e5', 700: '#4338ca', 800: '#1a365d' }
              }
            }
          }
        }
      `}} />
      <link href="/static/styles.css" rel="stylesheet" />
    </head>
    <body class="min-h-screen bg-ecru dark:bg-[#0d0d0d] transition-colors">
      <Header currentLang={lang} />
      
      <main class="pt-24 pb-12 px-4">
        <div class="max-w-2xl mx-auto">
          {/* Intro View */}
          <div id="diagnosis-intro" class="text-center">
            <div class="text-6xl mb-6 animate-float">🏺</div>
            <h1 class="text-3xl md:text-4xl text-indigo-800 dark:text-[#e8e4dc] mb-3">
              {t.title[lang]}
            </h1>
            <p class="text-ink-500 dark:text-[#78716c] mb-6">
              {t.subtitle[lang]}
            </p>
            <p class="text-sm text-ink-400 dark:text-[#78716c] mb-8 max-w-md mx-auto leading-relaxed">
              {t.description[lang]}
            </p>
            <button 
              id="start-diagnosis-btn"
              class="px-8 py-4 bg-indigo-800 dark:bg-gold text-ecru dark:text-ink rounded-full hover:bg-indigo-700 dark:hover:bg-gold-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {t.startQuiz[lang]}
            </button>
          </div>
          
          {/* Quiz View */}
          <div id="diagnosis-quiz" class="hidden">
            {/* Progress Bar */}
            <div class="mb-8">
              <div class="flex justify-between text-xs text-ink-400 dark:text-[#78716c] mb-2">
                <span id="quiz-progress-text">{t.question[lang]} 1 {t.of[lang]} 5</span>
                <span id="quiz-progress-percent">0%</span>
              </div>
              <div class="w-full bg-ecru-300 dark:bg-[#2d2d2d] rounded-full h-2 overflow-hidden">
                <div id="quiz-progress-bar" class="h-full bg-gold rounded-full transition-all duration-500" style="width: 0%"></div>
              </div>
            </div>
            
            {/* Question */}
            <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi mb-6">
              <p id="quiz-question" class="text-xl text-indigo-800 dark:text-[#e8e4dc] text-center leading-relaxed mb-8">
                {/* Question will be populated by JS */}
              </p>
              <div id="quiz-answers" class="space-y-3">
                {/* Answers will be populated by JS */}
              </div>
            </div>
          </div>
          
          {/* Result View */}
          <div id="diagnosis-result" class="hidden text-center">
            <p class="text-gold text-sm mb-2">{t.yourVessel[lang]}</p>
            <div id="result-vessel-emoji" class="text-8xl mb-4 animate-float">🍵</div>
            <h2 id="result-vessel-name" class="text-4xl font-light text-indigo-800 dark:text-[#e8e4dc] mb-2">茶碗</h2>
            <p id="result-vessel-tagline" class="text-gold text-lg mb-6">日常の温もり</p>
            
            {/* Result Card */}
            <div class="bg-gradient-to-br from-indigo-800/10 to-gold/20 dark:from-[#1e3a5f]/50 dark:to-gold/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gold/30 mb-6 text-left">
              <p id="result-description" class="text-ink-600 dark:text-[#a8a29e] text-sm leading-relaxed mb-4">
                {/* Description will be populated by JS */}
              </p>
              
              {/* Personality Traits */}
              <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="text-center p-3 bg-white/50 dark:bg-[#1e1e1e]/50 rounded-xl">
                  <span id="trait-1-icon" class="text-2xl">🌿</span>
                  <p id="trait-1-text" class="text-xs text-ink-500 dark:text-[#78716c] mt-1">落ち着き</p>
                </div>
                <div class="text-center p-3 bg-white/50 dark:bg-[#1e1e1e]/50 rounded-xl">
                  <span id="trait-2-icon" class="text-2xl">💫</span>
                  <p id="trait-2-text" class="text-xs text-ink-500 dark:text-[#78716c] mt-1">温かさ</p>
                </div>
                <div class="text-center p-3 bg-white/50 dark:bg-[#1e1e1e]/50 rounded-xl">
                  <span id="trait-3-icon" class="text-2xl">🍃</span>
                  <p id="trait-3-text" class="text-xs text-ink-500 dark:text-[#78716c] mt-1">気づき</p>
                </div>
              </div>
              
              <p class="text-xs text-ink-400 dark:text-[#78716c] text-center">
                KINTSUGI MIND — {lang === 'en' ? 'Vessel Diagnosis' : '器診断'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div class="flex flex-col sm:flex-row justify-center gap-3 mb-4">
              <button 
                id="share-result-btn"
                class="px-6 py-3 border border-gold text-gold rounded-full hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                {t.share[lang]}
              </button>
              <a 
                href={`/profile?lang=${lang}`}
                class="px-6 py-3 bg-indigo-800 dark:bg-gold text-ecru dark:text-ink rounded-full hover:bg-indigo-700 dark:hover:bg-gold-600 transition-colors"
              >
                {t.viewProfile[lang]}
              </a>
            </div>
            
            {/* Retake */}
            <button 
              id="retake-diagnosis-btn"
              class="text-sm text-ink-400 dark:text-[#78716c] hover:text-indigo-600 dark:hover:text-gold transition-colors"
            >
              ↻ {t.retake[lang]}
            </button>
          </div>
          
          {/* Back to Home */}
          <div class="mt-8 text-center">
            <a 
              href={`/?lang=${lang}`}
              class="inline-flex items-center gap-2 text-ink-500 dark:text-[#78716c] hover:text-indigo-600 dark:hover:text-gold transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              {t.backToHome[lang]}
            </a>
          </div>
        </div>
      </main>
      
      <Footer currentLang={lang} />
      
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const lang = '${lang}';
          initDiagnosisPage(lang);
        });
      `}} />
    </body>
    </html>
  )
})

// ========================================
// Zen Quote Archive Page
// ========================================

app.get('/zen-archive', (c) => {
  const lang = getLanguage(c)
  
  const t = {
    title: { en: 'Zen Quote Archive', ja: '禅語アーカイブ' },
    subtitle: { 
      en: 'Wisdom from Zen, Morita Therapy, Naikan, and Kintsugi', 
      ja: '禅・森田療法・内観・金継ぎの知恵' 
    },
    categories: {
      all: { en: 'All', ja: 'すべて' },
      zen: { en: 'Zen Koans', ja: '禅・公案' },
      morita: { en: 'Morita Therapy', ja: '森田療法' },
      naikan: { en: 'Naikan', ja: '内観' },
      kintsugi: { en: 'Kintsugi & Wabi-sabi', ja: '金継ぎ・侘び寂び' },
      proverbs: { en: 'Japanese Proverbs', ja: '日本のことわざ' },
      buddhism: { en: 'Buddhist Wisdom', ja: '仏教の知恵' },
      mindfulness: { en: 'Mindfulness', ja: 'マインドフルネス' }
    },
    todayQuote: { en: "Today's Quote", ja: '今日の禅語' },
    share: { en: 'Share', ja: 'シェア' },
    backToHome: { en: 'Back to Home', ja: 'ホームに戻る' }
  }
  
  return c.render(
    <html lang={lang}>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{t.title[lang]} — KINTSUGI MIND</title>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#1a365d" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                gold: { DEFAULT: '#d4af37', 600: '#b8960c' },
                ecru: { DEFAULT: '#FAF9F6', 300: '#F5F2EB' },
                ink: { DEFAULT: '#1a365d', 200: '#e2e8f0', 400: '#718096', 500: '#4a5568' },
                indigo: { 600: '#4f46e5', 700: '#4338ca', 800: '#1a365d' }
              }
            }
          }
        }
      `}} />
      <link href="/static/styles.css" rel="stylesheet" />
    </head>
    <body class="min-h-screen bg-ecru dark:bg-[#0d0d0d] transition-colors">
      <Header currentLang={lang} />
      
      <main class="pt-20 pb-12 px-4">
        <div class="max-w-4xl mx-auto">
          {/* Page Header */}
          <div class="text-center mb-12">
            <h1 class="text-3xl md:text-4xl text-indigo-800 dark:text-[#e8e4dc] mb-3">
              {t.title[lang]}
            </h1>
            <p class="text-ink-500 dark:text-[#78716c]">
              {t.subtitle[lang]}
            </p>
          </div>
          
          {/* Today's Quote Highlight */}
          <div class="mb-12 p-8 bg-gradient-to-br from-gold/10 to-indigo-800/10 dark:from-gold/20 dark:to-[#1e3a5f]/30 rounded-2xl border border-gold/30">
            <div class="flex items-center gap-2 mb-4">
              <svg class="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.5 4 15 6.5 15 9c0 1.5-.5 3-1.5 4 1.5.5 3 1.5 4 3 .5 1 .5 2 0 3-.5 1-1.5 2-3 2.5 0 0-1-.5-2.5-.5s-2.5.5-2.5.5c-1.5-.5-2.5-1.5-3-2.5-.5-1-.5-2 0-3 1-1.5 2.5-2.5 4-3-1-1-1.5-2.5-1.5-4 0-2.5 1.5-5 3-7z"/>
                <circle cx="12" cy="9" r="2"/>
              </svg>
              <span class="text-sm font-medium text-gold">{t.todayQuote[lang]}</span>
            </div>
            <blockquote id="today-quote-text" class="text-xl md:text-2xl text-indigo-800 dark:text-[#e8e4dc] italic leading-relaxed mb-4">
              {/* JS will populate */}
            </blockquote>
            <div class="flex items-center justify-between">
              <p id="today-quote-source" class="text-sm text-ink-400 dark:text-[#78716c]">
                {/* JS will populate */}
              </p>
              <button 
                id="share-today-quote-btn"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gold/20 hover:bg-gold/30 text-gold rounded-full transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                {t.share[lang]}
              </button>
            </div>
            <p id="today-quote-explanation" class="text-xs leading-relaxed text-ink-400 dark:text-[#a8a29e] mt-3 pl-3 border-l-2 border-gold/30 dark:border-gold/40">
              {/* JS will populate */}
            </p>
          </div>
          
          {/* Category Filter */}
          <div class="flex flex-wrap justify-center gap-2 mb-8">
            <button class="category-btn active px-4 py-2 text-sm rounded-full transition-colors bg-indigo-800 text-white dark:bg-gold dark:text-black" data-category="all">
              {t.categories.all[lang]}
            </button>
            <button class="category-btn px-4 py-2 text-sm rounded-full transition-colors bg-ink-200/50 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#a8a29e] hover:bg-ink-200 dark:hover:bg-[#3d3d3d]" data-category="zen">
              {t.categories.zen[lang]}
            </button>
            <button class="category-btn px-4 py-2 text-sm rounded-full transition-colors bg-ink-200/50 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#a8a29e] hover:bg-ink-200 dark:hover:bg-[#3d3d3d]" data-category="morita">
              {t.categories.morita[lang]}
            </button>
            <button class="category-btn px-4 py-2 text-sm rounded-full transition-colors bg-ink-200/50 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#a8a29e] hover:bg-ink-200 dark:hover:bg-[#3d3d3d]" data-category="naikan">
              {t.categories.naikan[lang]}
            </button>
            <button class="category-btn px-4 py-2 text-sm rounded-full transition-colors bg-ink-200/50 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#a8a29e] hover:bg-ink-200 dark:hover:bg-[#3d3d3d]" data-category="kintsugi">
              {t.categories.kintsugi[lang]}
            </button>
            <button class="category-btn px-4 py-2 text-sm rounded-full transition-colors bg-ink-200/50 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#a8a29e] hover:bg-ink-200 dark:hover:bg-[#3d3d3d]" data-category="proverbs">
              {t.categories.proverbs[lang]}
            </button>
            <button class="category-btn px-4 py-2 text-sm rounded-full transition-colors bg-ink-200/50 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#a8a29e] hover:bg-ink-200 dark:hover:bg-[#3d3d3d]" data-category="buddhism">
              {t.categories.buddhism[lang]}
            </button>
            <button class="category-btn px-4 py-2 text-sm rounded-full transition-colors bg-ink-200/50 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#a8a29e] hover:bg-ink-200 dark:hover:bg-[#3d3d3d]" data-category="mindfulness">
              {t.categories.mindfulness[lang]}
            </button>
          </div>
          
          {/* Quotes Grid */}
          <div id="quotes-grid" class="grid gap-4">
            {/* JS will populate */}
          </div>
          
          {/* Back to Home */}
          <div class="mt-12 text-center">
            <a 
              href={`/?lang=${lang}`}
              class="inline-flex items-center gap-2 text-indigo-700 dark:text-[#d4af37] hover:underline"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              {t.backToHome[lang]}
            </a>
          </div>
        </div>
      </main>
      
      <Footer currentLang={lang} />
      
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const lang = '${lang}';
          initZenArchive(lang);
        });
      `}} />
    </body>
    </html>
  )
})

// ========================================
// 7-Day Kintsugi Challenge
// ========================================

// Challenge page
app.get('/challenge', (c) => {
  const lang = getLanguage(c)
  
  const t = {
    title: { en: '7-Day Kintsugi Challenge', ja: '7日間金継ぎチャレンジ' },
    subtitle: { 
      en: 'Transform your vessel through daily practice', 
      ja: '毎日の実践で、あなたの器を輝かせる' 
    },
    intro: {
      en: 'Just like the ancient art of Kintsugi repairs broken pottery with gold, this 7-day challenge helps you repair and beautify your inner vessel through daily micro-practices.',
      ja: '金継ぎが壊れた器を金で美しく修復するように、この7日間チャレンジは毎日の小さな実践であなたの心の器を修復し、輝かせます。'
    },
    howItWorks: { en: 'How It Works', ja: 'チャレンジの流れ' },
    step1: { 
      en: 'Complete one small task each day', 
      ja: '毎日1つの小さなタスクを完了する' 
    },
    step2: { 
      en: 'Watch your vessel gain golden repairs', 
      ja: '器に金の修復が刻まれていく' 
    },
    step3: { 
      en: 'Complete all 7 days to unlock your Golden Vessel', 
      ja: '7日間完走で「黄金の器」を解放' 
    },
    day: { en: 'Day', ja: '日目' },
    startChallenge: { en: 'Start Challenge', ja: 'チャレンジを始める' },
    continueChallenge: { en: 'Continue Challenge', ja: 'チャレンジを続ける' },
    completed: { en: 'Completed', ja: '完了' },
    locked: { en: 'Locked', ja: '未解放' },
    today: { en: "Today's Task", ja: '今日のタスク' },
    complete: { en: 'Mark Complete', ja: '完了にする' },
    share: { en: 'Share Progress', ja: '進捗をシェア' },
    congratulations: { en: 'Congratulations!', ja: 'おめでとうございます！' },
    challengeComplete: { 
      en: 'You have completed the 7-Day Kintsugi Challenge!', 
      ja: '7日間金継ぎチャレンジを完走しました！' 
    },
    goldenVessel: { 
      en: 'Your Golden Vessel has been unlocked', 
      ja: '「黄金の器」が解放されました' 
    },
    progress: { en: 'Progress', ja: '進捗' },
    daysCompleted: { en: 'days completed', ja: '日完了' }
  }
  
  // Daily tasks for the challenge
  const dailyTasks = [
    { 
      en: { title: 'Gratitude Awakening', task: 'Write down 3 things you are grateful for today, no matter how small.' },
      ja: { title: '感謝の目覚め', task: '今日感謝していることを3つ、どんな小さなことでも書き出してください。' }
    },
    { 
      en: { title: 'Mindful Breathing', task: 'Complete a 5-minute breathing session in the Tatami room.' },
      ja: { title: '意識的な呼吸', task: '和室で5分間の呼吸セッションを完了してください。' }
    },
    { 
      en: { title: 'Action Despite Feeling', task: 'Do one small action you\'ve been avoiding, regardless of how you feel.' },
      ja: { title: '感情に関わらず行動', task: '気持ちに関係なく、先延ばしにしていた小さな行動を1つ実行してください。' }
    },
    { 
      en: { title: 'Reflection on Receiving', task: 'In the Study, reflect on what you have received from one person in your life.' },
      ja: { title: '受けたものへの内省', task: '書斎で、人生の中の一人から受け取ったものについて振り返ってください。' }
    },
    { 
      en: { title: 'Garden of Actions', task: 'Complete 3 micro-actions in the Garden room.' },
      ja: { title: '行動の庭', task: '庭の部屋で3つのマイクロアクションを完了してください。' }
    },
    { 
      en: { title: 'Sitting with Discomfort', task: 'Notice an uncomfortable feeling today. Sit with it for 2 minutes without trying to change it.' },
      ja: { title: '不快感と共に座る', task: '今日、不快な感情に気づいてください。それを変えようとせず、2分間その感情と共にいてください。' }
    },
    { 
      en: { title: 'Golden Integration', task: 'Write a brief letter to yourself about what you\'ve learned this week.' },
      ja: { title: '金継ぎの統合', task: '今週学んだことについて、自分への短い手紙を書いてください。' }
    }
  ]
  
  return c.render(
    <div class="min-h-screen bg-ecru dark:bg-[#121212] transition-colors duration-300" data-lang={lang}>
      <Header currentLang={lang} />
      
      <main class="py-12 px-6">
        <div class="max-w-2xl mx-auto">
          {/* Header */}
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-600 mb-6 shadow-lg">
              <span class="text-4xl">🏆</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-light text-indigo-800 dark:text-[#e8e4dc] mb-3">
              {t.title[lang]}
            </h1>
            <p class="text-lg text-ink-500 dark:text-[#a8a29e]">
              {t.subtitle[lang]}
            </p>
          </div>
          
          {/* Introduction */}
          <div class="bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-wabi">
            <p class="text-ink-600 dark:text-[#a8a29e] leading-relaxed">
              {t.intro[lang]}
            </p>
          </div>
          
          {/* Progress Bar */}
          <div id="challenge-progress" class="bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-wabi">
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm font-medium text-indigo-700 dark:text-[#d4af37]">{t.progress[lang]}</span>
              <span id="progress-text" class="text-sm text-ink-500 dark:text-[#78716c]">0/7 {t.daysCompleted[lang]}</span>
            </div>
            <div class="w-full bg-ink-200 dark:bg-[#2d2d2d] rounded-full h-3 overflow-hidden">
              <div id="progress-bar" class="bg-gradient-to-r from-gold to-gold-400 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
          </div>
          
          {/* Challenge Completion Banner (hidden by default) */}
          <div id="completion-banner" class="hidden bg-gradient-to-r from-gold/20 to-gold-400/20 dark:from-gold/30 dark:to-gold-400/30 border-2 border-gold rounded-2xl p-8 mb-8 text-center">
            <div class="text-5xl mb-4">🎉</div>
            <h2 class="text-2xl font-medium text-indigo-800 dark:text-[#e8e4dc] mb-2">{t.congratulations[lang]}</h2>
            <p class="text-ink-600 dark:text-[#a8a29e] mb-2">{t.challengeComplete[lang]}</p>
            <p class="text-gold font-medium">{t.goldenVessel[lang]}</p>
          </div>
          
          {/* Daily Tasks */}
          <div class="space-y-4 mb-8">
            {dailyTasks.map((task, index) => (
              <div 
                id={`day-${index + 1}`}
                class="challenge-day bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-xl p-5 shadow-wabi border-2 border-transparent transition-all duration-300"
                data-day={index + 1}
              >
                <div class="flex items-start gap-4">
                  {/* Day Number */}
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-ink-100 dark:bg-[#2d2d2d] flex items-center justify-center">
                    <span class="day-number text-lg font-medium text-ink-500 dark:text-[#78716c]">{index + 1}</span>
                  </div>
                  
                  {/* Task Content */}
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-medium text-indigo-800 dark:text-[#e8e4dc]">
                        {t.day[lang]} {index + 1}: {task[lang].title}
                      </h3>
                      <span class="day-status text-xs px-2 py-0.5 rounded-full bg-ink-200 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#78716c]">
                        {t.locked[lang]}
                      </span>
                    </div>
                    <p class="text-sm text-ink-500 dark:text-[#a8a29e] mb-3">
                      {task[lang].task}
                    </p>
                    
                    {/* Complete Button (hidden for locked/completed days) */}
                    <button 
                      class="complete-btn hidden px-4 py-2 bg-gold hover:bg-gold-400 text-ink rounded-lg text-sm font-medium transition-colors"
                      data-day={index + 1}
                    >
                      ✓ {t.complete[lang]}
                    </button>
                  </div>
                  
                  {/* Completion Check */}
                  <div class="completion-check hidden flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Share Button */}
          <div class="text-center">
            <button 
              id="share-btn"
              class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-800 hover:bg-indigo-700 dark:bg-[#d4af37] dark:hover:bg-[#c9a433] text-ecru dark:text-[#1e1e1e] rounded-full font-medium transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              {t.share[lang]}
            </button>
          </div>
          
          {/* How It Works */}
          <div class="mt-12 bg-gradient-to-br from-indigo-800/10 to-gold/10 dark:from-[#1e3a5f]/30 dark:to-gold/20 rounded-2xl p-6">
            <h2 class="text-xl font-medium text-indigo-800 dark:text-[#e8e4dc] mb-4 text-center">
              {t.howItWorks[lang]}
            </h2>
            <div class="grid md:grid-cols-3 gap-4">
              <div class="text-center p-4">
                <div class="text-3xl mb-2">📝</div>
                <p class="text-sm text-ink-600 dark:text-[#a8a29e]">{t.step1[lang]}</p>
              </div>
              <div class="text-center p-4">
                <div class="text-3xl mb-2">✨</div>
                <p class="text-sm text-ink-600 dark:text-[#a8a29e]">{t.step2[lang]}</p>
              </div>
              <div class="text-center p-4">
                <div class="text-3xl mb-2">🏆</div>
                <p class="text-sm text-ink-600 dark:text-[#a8a29e]">{t.step3[lang]}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer currentLang={lang} />
      
      {/* Challenge JavaScript */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const CHALLENGE_KEY = 'kintsugi-challenge';
          const lang = '${lang}';
          
          // Load challenge state
          function loadChallenge() {
            const saved = localStorage.getItem(CHALLENGE_KEY);
            if (saved) {
              try {
                return JSON.parse(saved);
              } catch (e) {
                return createNewChallenge();
              }
            }
            return null;
          }
          
          // Create new challenge
          function createNewChallenge() {
            return {
              startDate: getTodayJST(),
              completedDays: [],
              currentDay: 1
            };
          }
          
          // Save challenge state
          function saveChallenge(challenge) {
            localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenge));
          }
          
          // Update UI based on challenge state
          function updateUI(challenge) {
            if (!challenge) {
              // Show start state - day 1 available
              const day1 = document.getElementById('day-1');
              if (day1) {
                day1.classList.add('border-gold');
                day1.querySelector('.day-status').textContent = lang === 'en' ? "Today's Task" : '今日のタスク';
                day1.querySelector('.day-status').classList.remove('bg-ink-200', 'dark:bg-[#2d2d2d]', 'text-ink-500');
                day1.querySelector('.day-status').classList.add('bg-gold/20', 'text-gold');
                day1.querySelector('.complete-btn').classList.remove('hidden');
              }
              return;
            }
            
            const { completedDays, currentDay } = challenge;
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            const completionBanner = document.getElementById('completion-banner');
            
            // Update progress
            const progress = (completedDays.length / 7) * 100;
            progressBar.style.width = progress + '%';
            progressText.textContent = completedDays.length + '/7 ' + (lang === 'en' ? 'days completed' : '日完了');
            
            // Show completion banner if all days done
            if (completedDays.length >= 7) {
              completionBanner.classList.remove('hidden');
            }
            
            // Update each day
            for (let i = 1; i <= 7; i++) {
              const dayEl = document.getElementById('day-' + i);
              if (!dayEl) continue;
              
              const status = dayEl.querySelector('.day-status');
              const completeBtn = dayEl.querySelector('.complete-btn');
              const completionCheck = dayEl.querySelector('.completion-check');
              const dayNumber = dayEl.querySelector('.day-number');
              
              if (completedDays.includes(i)) {
                // Completed
                dayEl.classList.add('border-green-500/50');
                status.textContent = lang === 'en' ? 'Completed' : '完了';
                status.classList.remove('bg-ink-200', 'dark:bg-[#2d2d2d]', 'text-ink-500', 'bg-gold/20', 'text-gold');
                status.classList.add('bg-green-500/20', 'text-green-600');
                completeBtn.classList.add('hidden');
                completionCheck.classList.remove('hidden');
                completionCheck.classList.add('flex');
                dayNumber.classList.add('text-green-600');
              } else if (i === currentDay && completedDays.length < 7) {
                // Current day (available)
                dayEl.classList.add('border-gold');
                status.textContent = lang === 'en' ? "Today's Task" : '今日のタスク';
                status.classList.remove('bg-ink-200', 'dark:bg-[#2d2d2d]', 'text-ink-500');
                status.classList.add('bg-gold/20', 'text-gold');
                completeBtn.classList.remove('hidden');
              }
              // Locked days stay as default
            }
          }
          
          // Handle day completion
          function completeDay(day) {
            let challenge = loadChallenge();
            if (!challenge) {
              challenge = createNewChallenge();
            }
            
            if (!challenge.completedDays.includes(day)) {
              challenge.completedDays.push(day);
              challenge.currentDay = Math.min(day + 1, 7);
              saveChallenge(challenge);
              
              // Sync to server if logged in
              syncChallengeToServer(challenge);
              
              // Add celebration animation
              celebrateCompletion(day);
            }
            
            updateUI(challenge);
          }
          
          // Celebration animation
          function celebrateCompletion(day) {
            const dayEl = document.getElementById('day-' + day);
            if (dayEl) {
              dayEl.classList.add('animate-pulse');
              setTimeout(() => dayEl.classList.remove('animate-pulse'), 1000);
            }
            
            // Confetti effect (simple)
            const confetti = ['🎉', '✨', '⭐', '💫'];
            for (let i = 0; i < 10; i++) {
              setTimeout(() => {
                const span = document.createElement('span');
                span.textContent = confetti[Math.floor(Math.random() * confetti.length)];
                span.style.cssText = 'position:fixed;font-size:2rem;z-index:9999;pointer-events:none;animation:fall 2s ease-out forwards;left:' + (Math.random() * 100) + 'vw;top:-50px;';
                document.body.appendChild(span);
                setTimeout(() => span.remove(), 2000);
              }, i * 100);
            }
          }
          
          // Sync to server
          async function syncChallengeToServer(challenge) {
            try {
              await fetch('/api/challenge/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge })
              });
            } catch (e) {
              console.log('Challenge sync failed (offline mode)');
            }
          }
          
          // Share progress
          function shareProgress() {
            const challenge = loadChallenge();
            const completed = challenge ? challenge.completedDays.length : 0;
            const text = lang === 'en'
              ? 'I\\'ve completed ' + completed + '/7 days of the Kintsugi Challenge! 🏆✨ #KintsugiMind #MentalWellness'
              : '金継ぎチャレンジ ' + completed + '/7日完了！🏆✨ #KintsugiMind #メンタルヘルス';
            
            if (navigator.share) {
              navigator.share({
                title: 'Kintsugi Challenge',
                text: text,
                url: window.location.origin + '/challenge'
              }).catch(() => {});
            } else {
              // Fallback: copy to clipboard
              navigator.clipboard.writeText(text + ' ' + window.location.origin + '/challenge');
              alert(lang === 'en' ? 'Copied to clipboard!' : 'クリップボードにコピーしました！');
            }
          }
          
          // Initialize
          document.addEventListener('DOMContentLoaded', () => {
            const challenge = loadChallenge();
            updateUI(challenge);
            
            // Add click handlers
            document.querySelectorAll('.complete-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                const day = parseInt(btn.dataset.day);
                completeDay(day);
              });
            });
            
            document.getElementById('share-btn').addEventListener('click', shareProgress);
          });
          
          // Add falling animation style
          const style = document.createElement('style');
          style.textContent = '@keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }';
          document.head.appendChild(style);
        })();
      `}} />
    </div>,
    { title: lang === 'en' ? '7-Day Kintsugi Challenge — KINTSUGI MIND' : '7日間金継ぎチャレンジ — KINTSUGI MIND' }
  )
})

// ========================================
// API Routes
// ========================================

// API: Get Morita guidance (Gemini AI)
app.post('/api/morita/guidance', async (c) => {
  // Rate limit: 20 AI requests per minute per IP
  const ip = getClientIP(c)
  const { allowed } = await rateLimit(c, `ai:${ip}`, 20, 60)
  
  if (!allowed) {
    return apiError(c, 429, 'リクエストが多すぎます。少し待ってから再度お試しください。', { code: 'RATE_LIMITED', retryable: true })
  }
  
  const { emotion, lang = 'en' } = await c.req.json()
  const apiKey = c.env.GEMINI_API_KEY
  const db = c.env.DB
  const user = await getCurrentUser(c)
  
  // Check usage limit for AI chat
  if (user && db) {
    const subscription = await getUserSubscription(db, user.id)
    const usage = await checkUsageLimit(db, user.id, 'ai_chat', subscription.plan)
    
    if (!usage.allowed) {
      return c.json({ 
        error: 'limit_reached',
        message: lang === 'en' 
          ? `You've used all ${usage.limit} AI conversations for today. Upgrade to Premium for unlimited access.`
          : `本日のAI会話${usage.limit}回を使い切りました。プレミアムにアップグレードすると無制限で利用できます。`,
        remaining: 0,
        limit: usage.limit,
        upgradeUrl: '/pricing'
      }, 429)
    }
  }
  
  // Fallback responses if API fails
  const fallbacks = {
    en: [
      "Feeling anxious? That's natural for a human being. So, what will your hands do?",
      "You don't need to erase that emotion. Emotions are like clouds in the sky. Action continues on the ground.",
      "Arugamama — Feeling and doing are separate things."
    ],
    ja: [
      "不安ですね。それは人間として自然です。では、手は何をしますか？",
      "その感情を消す必要はありません。感情は空の雲のようなもの。行動は地上で続きます。",
      "あるがまま — 感じることと、することは別です。"
    ]
  }
  
  if (!apiKey) {
    const langFallbacks = fallbacks[lang as keyof typeof fallbacks] || fallbacks.en
    return c.json({ guidance: langFallbacks[Math.floor(Math.random() * langFallbacks.length)], emotion })
  }
  
  try {
    const systemPrompt = lang === 'en' 
      ? `You are a wise Morita therapy guide, speaking with the calm warmth of a Japanese garden at dawn. 

Morita therapy (森田療法), founded by Dr. Shoma Morita, teaches us:
- "Arugamama" (あるがまま) - Accept feelings as they are, like clouds passing through the sky
- Feelings and actions exist on separate planes - anxiety can coexist with productive action
- The goal is not to eliminate suffering, but to live meaningfully despite it
- Nature accepts rain and sun equally; so too can we accept all our emotions

Your voice: Gentle, wise, grounded. Like a gardener who understands storms will pass.
Respond in 2-3 sentences. First acknowledge their feeling with genuine warmth. Then offer ONE small, concrete action they could take with their hands - something physical and immediate.

Never say: "don't worry", "calm down", "it will be okay", "try to relax"
Instead embody: acceptance, gentle redirection toward action, trust in their capacity`
      : `あなたは森田療法の知恵ある導き手です。夜明けの日本庭園のような、静かな温かさで語りかけます。

森田正馬博士が創始した森田療法が教えてくれること：
- 「あるがまま」— 空を流れる雲のように、感情をそのまま受け入れる
- 感情と行動は別の次元にある — 不安を抱えながらも行動できる
- 目標は苦しみを消すことではなく、苦しみと共に意味ある生を送ること
- 自然は雨も陽も等しく受け入れる。私たちも全ての感情を受け入れられる

あなたの声：穏やかで、賢く、地に足がついている。嵐は過ぎ去ると知る庭師のように。
2〜3文で応答してください。まず、心からの温かさで感情を認めてください。次に、手を使ってできる小さく具体的な行動を一つ提案してください。

禁句：「心配しないで」「落ち着いて」「大丈夫」「リラックスして」
代わりに体現する：受容、行動への優しい導き、その人の力への信頼`

    const prompt = lang === 'en'
      ? `The user shared this feeling: "${emotion}". Respond as a Morita therapy guide.`
      : `ユーザーがこの感情を共有しました：「${emotion}」。森田療法のガイドとして応答してください。`

    const guidance = await callGemini(apiKey, prompt, systemPrompt)
    
    // Record usage after successful AI call
    if (user && db) {
      await incrementUsage(db, user.id, 'ai_chat')
    }
    
    return c.json({ guidance, emotion, ai: true })
  } catch (error) {
    console.error('Gemini API error:', error)
    const langFallbacks = fallbacks[lang as keyof typeof fallbacks] || fallbacks.en
    return c.json({ guidance: langFallbacks[Math.floor(Math.random() * langFallbacks.length)], emotion })
  }
})

// API: Get Naikan questions
app.get('/api/naikan/question', (c) => {
  const step = parseInt(c.req.query('step') || '1')
  const lang = (c.req.query('lang') || 'en') as Language
  
  const questions = {
    1: {
      text: tx('study', 'q1', lang),
      hint: tx('study', 'q1Hint', lang)
    },
    2: {
      text: tx('study', 'q2', lang),
      hint: tx('study', 'q2Hint', lang)
    },
    3: {
      text: tx('study', 'q3', lang),
      hint: tx('study', 'q3Hint', lang)
    }
  }
  
  return c.json(questions[step as keyof typeof questions] || questions[1])
})

// API: Get Zen Koan (Gemini AI)
app.get('/api/zen/koan', async (c) => {
  // Rate limit: 20 AI requests per minute per IP
  const ip = getClientIP(c)
  const { allowed } = await rateLimit(c, `ai:${ip}`, 20, 60)
  
  if (!allowed) {
    return apiError(c, 429, 'リクエストが多すぎます。少し待ってから再度お試しください。', { code: 'RATE_LIMITED', retryable: true })
  }
  
  const lang = (c.req.query('lang') || 'en') as Language
  const apiKey = c.env.GEMINI_API_KEY
  const db = c.env.DB
  const user = await getCurrentUser(c)
  
  // Classic koans as fallback
  const classicKoans = [
    { en: "Two hands clap and there is a sound. What is the sound of one hand?", ja: "両手を打てば音がする。では、片手の音は？" },
    { en: "Does the wind move the flag, or does the flag move the wind?", ja: "風が旗を動かすのか、旗が風を動かすのか。" },
    { en: "Before you were born, who were you?", ja: "あなたが生まれる前、あなたは何者だったか。" },
    { en: "Show me your face before your parents were born.", ja: "父母未生以前、本来の面目を見せよ。" },
    { en: "What is the color of wind?", ja: "風に色はあるか。" }
  ]
  
  // Check usage limit for AI chat
  if (user && db) {
    const subscription = await getUserSubscription(db, user.id)
    const usage = await checkUsageLimit(db, user.id, 'ai_chat', subscription.plan)
    
    if (!usage.allowed) {
      // Return a classic koan instead when limit reached
      const koan = classicKoans[Math.floor(Math.random() * classicKoans.length)]
      return c.json({ 
        text: koan[lang],
        limitReached: true,
        message: lang === 'en' 
          ? 'AI limit reached for today. Here is a classic koan.'
          : '本日のAI制限に達しました。古典的な公案をお届けします。'
      })
    }
  }
  
  if (!apiKey) {
    const koan = classicKoans[Math.floor(Math.random() * classicKoans.length)]
    return c.json({ text: koan[lang] })
  }
  
  try {
    const systemPrompt = lang === 'en'
      ? `You are an ancient Zen master (禅師), your words carrying the weight of mountain silence.

A koan is not a riddle to solve, but a finger pointing at the moon of awakening.
Great koans use: water, moon, wind, mountains, flowers, bells, silence, mirrors, shadows

Create ONE original koan that:
- Is brief (1-2 sentences maximum)  
- Stops the thinking mind completely
- Uses simple, natural imagery from everyday life
- Points beyond words to direct experience
- Has the quality of a struck bell - resonating, then silence

Examples of depth: "What was your face before your parents were born?", "The cypress tree in the garden", "Does a dog have Buddha-nature?"

Just respond with the koan itself. No explanations, no context.`
      : `あなたは古の禅師。あなたの言葉は山の静寂の重みを持っています。

公案は解くべき謎ではなく、悟りという月を指し示す指です。
優れた公案は使う：水、月、風、山、花、鐘、沈黙、鏡、影

以下の条件でオリジナルの公案を一つ作ってください：
- 極めて短く（1〜2文）
- 思考を完全に止める
- 日常の自然なイメージを使う
- 言葉を超えて直接体験を指し示す
- 打たれた鐘のような質 — 響き、そして静寂

深さの例：「父母未生以前の本来の面目」「庭前の柏樹子」「狗子に仏性ありや」

公案だけを返してください。説明も文脈も不要です。`

    const prompt = lang === 'en' ? 'Create a Zen koan for meditation.' : '瞑想のための公案を作ってください。'
    const koan = await callGemini(apiKey, prompt, systemPrompt)
    
    // Record usage after successful AI call
    if (user && db) {
      await incrementUsage(db, user.id, 'ai_chat')
    }
    
    return c.json({ text: koan.trim(), ai: true })
  } catch (error) {
    console.error('Gemini API error:', error)
    const koan = classicKoans[Math.floor(Math.random() * classicKoans.length)]
    return c.json({ text: koan[lang] })
  }
})

// API: Naikan reflection response (Gemini AI)
app.post('/api/naikan/reflect', async (c) => {
  const { step, person, response: userResponse, lang = 'en' } = await c.req.json()
  const apiKey = c.env.GEMINI_API_KEY
  const db = c.env.DB
  const user = await getCurrentUser(c)
  
  const questionTypes = {
    1: { en: 'received kindness from', ja: 'から受けた恩' },
    2: { en: 'gave to', ja: 'に与えたもの' },
    3: { en: 'caused trouble to', ja: 'に迷惑をかけたこと' }
  }
  
  // Fallback responses
  const fallbacks = {
    en: [
      "Thank you for sharing. That connection is precious.",
      "What a beautiful reflection. These moments of awareness matter.",
      "You see the web of connections around you. That is wisdom."
    ],
    ja: [
      "共有してくださり、ありがとうございます。その繋がりは尊いものです。",
      "美しい振り返りですね。こうした気づきの瞬間は大切です。",
      "あなたの周りの縁の網を見ていますね。それは知恵です。"
    ]
  }
  
  // Check usage limit for AI chat
  if (user && db) {
    const subscription = await getUserSubscription(db, user.id)
    const usage = await checkUsageLimit(db, user.id, 'ai_chat', subscription.plan)
    
    if (!usage.allowed) {
      // Return fallback when limit reached
      const langFallbacks = fallbacks[lang as keyof typeof fallbacks] || fallbacks.en
      return c.json({ 
        reflection: langFallbacks[Math.floor(Math.random() * langFallbacks.length)],
        limitReached: true,
        message: lang === 'en' 
          ? 'AI limit reached for today.'
          : '本日のAI制限に達しました。'
      })
    }
  }
  
  if (!apiKey) {
    const langFallbacks = fallbacks[lang as keyof typeof fallbacks] || fallbacks.en
    return c.json({ reflection: langFallbacks[Math.floor(Math.random() * langFallbacks.length)] })
  }
  
  try {
    const qType = questionTypes[step as keyof typeof questionTypes] || questionTypes[1]
    
    const systemPrompt = lang === 'en'
      ? `You are a Naikan (内観) therapy guide, embodying the quiet wisdom of a temple at dusk.

Naikan, meaning "looking inside," was developed by Yoshimoto Ishin. It transforms how we see our relationships through three profound questions:
1. What have I received from this person?
2. What have I given to this person?
3. What troubles/difficulties have I caused this person?

Your role is to witness, not to counsel. Like still water reflecting the moon.
Respond in 1-2 sentences:
- Reflect back what they shared with gentle acknowledgment
- Illuminate the invisible threads of connection (縁/en) they've described
- Let them feel truly seen and heard

Never: give advice, analyze, interpret meaning, or suggest improvements
Embody: deep listening, gratitude, the beauty of human connection`
      : `あなたは内観法の導き手。夕暮れの寺院のような静かな知恵を体現しています。

「内を観る」という意味の内観は、吉本伊信によって開発されました。三つの深い問いを通じて、私たちの人間関係の見方を変容させます：
1. この人から何を受けたか
2. この人に何を返したか  
3. この人にどんな迷惑をかけたか

あなたの役割は証人であること。助言者ではありません。月を映す静かな水のように。
1〜2文で応答してください：
- 共有されたことを優しく認めて映し返す
- 描かれた見えない縁（えん）の糸を照らし出す
- 本当に見てもらえた、聴いてもらえたと感じさせる

禁止：アドバイス、分析、意味の解釈、改善の提案
体現する：深い傾聴、感謝、人の繋がりの美しさ`

    const prompt = lang === 'en'
      ? `The user reflected on what they ${qType.en} ${person}: "${userResponse}". Respond briefly as a Naikan guide.`
      : `ユーザーは${person}${qType.ja}について振り返りました：「${userResponse}」。内観ガイドとして簡潔に応答してください。`

    const reflection = await callGemini(apiKey, prompt, systemPrompt)
    
    // Record usage after successful AI call
    if (user && db) {
      await incrementUsage(db, user.id, 'ai_chat')
    }
    
    return c.json({ reflection, ai: true })
  } catch (error) {
    console.error('Gemini API error:', error)
    const langFallbacks = fallbacks[lang as keyof typeof fallbacks] || fallbacks.en
    return c.json({ reflection: langFallbacks[Math.floor(Math.random() * langFallbacks.length)] })
  }
})

// API: Record action (for garden growth)
app.post('/api/garden/action', async (c) => {
  const { action, completed, lang = 'en' } = await c.req.json()
  
  const messages = {
    en: { success: "Your garden grew a little.", undo: "Undone." },
    ja: { success: "植物が少し育ちました。", undo: "取り消しました。" }
  }
  
  const msg = messages[lang as keyof typeof messages] || messages.en
  
  return c.json({
    success: true,
    action,
    completed,
    message: completed ? msg.success : msg.undo
  })
})

// ========================================
// Pricing Page
// ========================================

app.get('/pricing', async (c) => {
  const lang = getLanguage(c)
  const user = await getCurrentUser(c)
  const db = c.env.DB
  
  let currentPlan: 'free' | 'premium' = 'free'
  if (user && db) {
    const subscription = await getUserSubscription(db, user.id)
    currentPlan = subscription.plan
  }
  
  const t = {
    title: { en: 'Choose Your Path', ja: 'あなたの道を選ぶ' },
    subtitle: { 
      en: 'Deepen your mindfulness journey with Premium', 
      ja: 'プレミアムでマインドフルネスの旅を深める' 
    },
    freePlan: { en: 'Free', ja: '無料' },
    premiumPlan: { en: 'Premium', ja: 'プレミアム' },
    monthly: { en: '/month', ja: '/月' },
    yearly: { en: '/year', ja: '/年' },
    currentPlan: { en: 'Current Plan', ja: '現在のプラン' },
    upgrade: { en: 'Upgrade to Premium', ja: 'プレミアムにアップグレード' },
    bestValue: { en: 'Best Value', ja: 'お得' },
    save: { en: 'Save 33%', ja: '33%お得' },
    features: {
      free: {
        en: [
          '✓ Access to all 3 rooms (Garden, Study, Tatami)',
          '✓ 3 AI conversations per day',
          '✓ 1 daily check-in',
          '✓ 7 days of history',
          '✓ 5 basic vessel designs',
          '✓ Weekly report (basic)',
        ],
        ja: [
          '✓ 全3部屋へのアクセス（庭・書斎・座敷）',
          '✓ 1日3回のAI対話',
          '✓ 1日1回のチェックイン',
          '✓ 7日間の履歴',
          '✓ 基本の器デザイン5種',
          '✓ 週間レポート（基本版）',
        ]
      },
      premium: {
        en: [
          '✓ Everything in Free',
          '✓ Unlimited AI conversations',
          '✓ Unlimited daily check-ins',
          '✓ Full history access',
          '✓ 15 premium vessel designs',
          '✓ Detailed analytics & insights',
          '✓ Guided audio meditations',
          '✓ Data export',
          '✓ Priority support',
        ],
        ja: [
          '✓ 無料プランの全機能',
          '✓ 無制限のAI対話',
          '✓ 無制限のチェックイン',
          '✓ 全履歴へのアクセス',
          '✓ プレミアム器デザイン15種',
          '✓ 詳細な分析とインサイト',
          '✓ 音声ガイド付き瞑想',
          '✓ データエクスポート',
          '✓ 優先サポート',
        ]
      }
    },
    faq: { en: 'Frequently Asked Questions', ja: 'よくある質問' },
    faqs: [
      {
        q: { en: 'Can I cancel anytime?', ja: 'いつでも解約できますか？' },
        a: { 
          en: 'Yes, you can cancel your subscription at any time. You will continue to have access until the end of your billing period.', 
          ja: 'はい、いつでも解約できます。課金期間の終わりまでアクセスは継続します。' 
        }
      },
      {
        q: { en: 'What payment methods do you accept?', ja: 'どんな支払い方法に対応していますか？' },
        a: { 
          en: 'We accept all major credit cards through Stripe secure payment.', 
          ja: 'Stripeの安全な決済を通じて、主要なクレジットカードに対応しています。' 
        }
      },
      {
        q: { en: 'Is my data safe?', ja: 'データは安全ですか？' },
        a: { 
          en: 'Absolutely. Your mindfulness data is encrypted and never shared with third parties.', 
          ja: 'もちろんです。あなたのデータは暗号化され、第三者と共有されることはありません。' 
        }
      }
    ],
    notReady: { 
      en: 'Not ready to upgrade? No problem. Enjoy the free plan for as long as you like.', 
      ja: 'まだアップグレードの準備ができていませんか？問題ありません。無料プランを好きなだけお楽しみください。' 
    }
  }
  
  return c.render(
    <div class="min-h-screen bg-ecru dark:bg-[#121212] flex flex-col transition-colors duration-300" data-lang={lang}>
      <Header currentLang={lang} />

      <main class="flex-1 py-12 px-6">
        <div class="max-w-5xl mx-auto">
          {/* Title */}
          <div class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl text-indigo-800 dark:text-[#e8e4dc] mb-4">{t.title[lang]}</h1>
            <p class="text-ink-500 dark:text-[#78716c] text-lg">{t.subtitle[lang]}</p>
          </div>

          {/* Pricing Cards */}
          <div class="grid md:grid-cols-2 gap-8 mb-16">
            {/* Free Plan */}
            <div class={`bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi ${currentPlan === 'free' ? 'ring-2 ring-indigo-500' : ''}`}>
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl text-indigo-800 dark:text-[#e8e4dc]">{t.freePlan[lang]}</h2>
                {currentPlan === 'free' && (
                  <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm rounded-full">
                    {t.currentPlan[lang]}
                  </span>
                )}
              </div>
              <div class="mb-6">
                <span class="text-4xl text-indigo-800 dark:text-[#e8e4dc] font-light">{lang === 'en' ? '$0' : '¥0'}</span>
                <span class="text-ink-500 dark:text-[#78716c]">{t.monthly[lang]}</span>
              </div>
              <ul class="space-y-3 mb-8">
                {t.features.free[lang].map((feature) => (
                  <li class="text-ink-600 dark:text-[#a8a29e] text-sm">{feature}</li>
                ))}
              </ul>
              {currentPlan === 'free' ? (
                <button disabled class="w-full px-6 py-3 bg-ecru-200 dark:bg-[#2d2d2d] text-ink-500 dark:text-[#78716c] rounded-full cursor-not-allowed">
                  {t.currentPlan[lang]}
                </button>
              ) : (
                <a href={`/profile?lang=${lang}`} class="block w-full px-6 py-3 bg-ecru-200 dark:bg-[#2d2d2d] text-ink-600 dark:text-[#a8a29e] rounded-full text-center hover:bg-ecru-300 dark:hover:bg-[#3d3d3d] transition-colors">
                  {lang === 'en' ? 'Downgrade' : 'ダウングレード'}
                </a>
              )}
            </div>

            {/* Premium Plan */}
            <div class={`bg-gradient-to-br from-indigo-800 to-indigo-900 dark:from-[#1e3a5f] dark:to-[#0d1f33] rounded-2xl p-8 shadow-wabi-lg text-ecru relative overflow-hidden ${currentPlan === 'premium' ? 'ring-2 ring-gold' : ''}`}>
              {/* Best Value Badge */}
              <div class="absolute top-4 right-4">
                <span class="px-3 py-1 bg-gold text-ink text-xs font-medium rounded-full">
                  {t.bestValue[lang]}
                </span>
              </div>
              
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl">{t.premiumPlan[lang]}</h2>
                {currentPlan === 'premium' && (
                  <span class="px-3 py-1 bg-gold/20 text-gold text-sm rounded-full">
                    {t.currentPlan[lang]}
                  </span>
                )}
              </div>
              
              {/* Pricing Options */}
              <div class="mb-6 space-y-3">
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-light">{lang === 'en' ? '$10' : '¥980'}</span>
                  <span class="text-ecru-300">{t.monthly[lang]}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg text-ecru-300">or</span>
                  <span class="text-2xl font-light">{lang === 'en' ? '$80' : '¥7,800'}</span>
                  <span class="text-ecru-300">{t.yearly[lang]}</span>
                  <span class="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">{t.save[lang]}</span>
                </div>
              </div>
              
              <ul class="space-y-3 mb-8">
                {t.features.premium[lang].map((feature) => (
                  <li class="text-ecru-200 text-sm">{feature}</li>
                ))}
              </ul>
              
              {currentPlan === 'premium' ? (
                <button disabled class="w-full px-6 py-3 bg-gold/50 text-ecru rounded-full cursor-not-allowed">
                  {t.currentPlan[lang]}
                </button>
              ) : user ? (
                <button 
                  id="upgrade-btn"
                  class="w-full px-6 py-3 bg-gold text-ink font-medium rounded-full hover:bg-gold-400 transition-colors"
                >
                  {t.upgrade[lang]}
                </button>
              ) : (
                <a 
                  href="/api/auth/login/google"
                  class="block w-full px-6 py-3 bg-gold text-ink font-medium rounded-full text-center hover:bg-gold-400 transition-colors"
                >
                  {lang === 'en' ? 'Sign in to Upgrade' : 'ログインしてアップグレード'}
                </a>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi mb-8">
            <h2 class="text-2xl text-indigo-800 dark:text-[#e8e4dc] mb-6 text-center">{t.faq[lang]}</h2>
            <div class="space-y-6 max-w-2xl mx-auto">
              {t.faqs.map((faq) => (
                <div class="border-b border-ecru-200 dark:border-[#3d3d3d] pb-4 last:border-0">
                  <h3 class="text-indigo-800 dark:text-[#e8e4dc] font-medium mb-2">{faq.q[lang]}</h3>
                  <p class="text-ink-500 dark:text-[#78716c] text-sm">{faq.a[lang]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Not Ready */}
          <p class="text-center text-ink-500 dark:text-[#78716c] text-sm">
            {t.notReady[lang]}
          </p>
        </div>
      </main>

      <Footer currentLang={lang} />
    </div>,
    { title: lang === 'en' ? 'Pricing — KINTSUGI MIND' : '料金プラン — KINTSUGI MIND' }
  )
})

// Weekly Report Page
app.get('/report', (c) => {
  const lang = getLanguage(c)
  
  const t = {
    title: { en: 'Weekly Report', ja: '週間レポート' },
    subtitle: { en: 'Your mindfulness journey this week', ja: '今週のマインドフルネスの歩み' },
    noData: { 
      en: 'Start your journey to see your weekly progress here.', 
      ja: 'この画面で週間の進捗を見るには、まず旅を始めましょう。' 
    },
    thisWeek: { en: 'This Week', ja: '今週' },
    streak: { en: 'Current Streak', ja: '連続日数' },
    activities: { en: 'Activities', ja: '活動' },
    garden: { en: 'Garden', ja: '庭' },
    study: { en: 'Study', ja: '書斎' },
    tatami: { en: 'Tatami', ja: '座敷' },
    repairs: { en: 'Golden Repairs', ja: '金継ぎ' },
    dailyActivity: { en: 'Daily Activity', ja: '日々の活動' },
    encouragement: { en: 'Weekly Encouragement', ja: '今週の励まし' },
    backToProfile: { en: '← Back to Profile', ja: '← プロフィールに戻る' },
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysJa: ['日', '月', '火', '水', '木', '金', '土'],
    totalSessions: { en: 'Total Sessions', ja: 'セッション数' },
    avgPerDay: { en: 'Avg per Day', ja: '1日平均' },
    mostActive: { en: 'Most Active', ja: '最も活発' }
  }
  
  return c.render(
    <div class="min-h-screen bg-ecru flex flex-col" data-lang={lang}>
      <Header currentLang={lang} />
      
      <main class="flex-1 py-8 px-4 sm:px-6">
        <div class="max-w-4xl mx-auto">
          {/* Header */}
          <div class="text-center mb-8">
            <h1 class="text-3xl sm:text-4xl text-indigo-800 mb-2">{t.title[lang]}</h1>
            <p class="text-ink-500">{t.subtitle[lang]}</p>
            <p id="report-date-range" class="text-sm text-ink-400 mt-2"></p>
          </div>
          
          {/* Summary Cards */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Streak */}
            <div class="bg-gradient-to-br from-gold/20 to-gold/10 rounded-2xl p-4 text-center shadow-wabi">
              <p class="text-3xl sm:text-4xl text-gold font-light" id="report-streak">0</p>
              <p class="text-xs sm:text-sm text-ink-500">{t.streak[lang]}</p>
              <p class="text-gold text-lg mt-1">🔥</p>
            </div>
            
            {/* Total Sessions */}
            <div class="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl p-4 text-center shadow-wabi">
              <p class="text-3xl sm:text-4xl text-indigo-700 font-light" id="report-total-sessions">0</p>
              <p class="text-xs sm:text-sm text-ink-500">{t.totalSessions[lang]}</p>
            </div>
            
            {/* Golden Repairs */}
            <div class="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl p-4 text-center shadow-wabi">
              <p class="text-3xl sm:text-4xl text-amber-600 font-light" id="report-repairs">0</p>
              <p class="text-xs sm:text-sm text-ink-500">{t.repairs[lang]}</p>
              <p class="text-amber-500 text-lg mt-1">✦</p>
            </div>
            
            {/* Most Active Mode */}
            <div class="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-4 text-center shadow-wabi">
              <p class="text-2xl sm:text-3xl" id="report-most-active-icon">🌱</p>
              <p class="text-xs sm:text-sm text-ink-500">{t.mostActive[lang]}</p>
              <p class="text-green-700 text-sm font-medium mt-1" id="report-most-active-name">{t.garden[lang]}</p>
            </div>
          </div>
          
          {/* Weekly Calendar */}
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi mb-8">
            <h2 class="text-lg text-indigo-800 mb-4">{t.dailyActivity[lang]}</h2>
            <div class="grid grid-cols-7 gap-2" id="weekly-calendar">
              {/* Days will be rendered by JS */}
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <div class="text-center">
                  <p class="text-xs text-ink-400 mb-2">
                    {lang === 'en' ? t.days[dayIndex] : t.daysJa[dayIndex]}
                  </p>
                  <div 
                    id={`day-${dayIndex}`}
                    class="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-ecru-200 flex items-center justify-center transition-all"
                  >
                    <span class="text-xs text-ink-400" id={`day-${dayIndex}-content`}>-</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div class="flex flex-wrap justify-center gap-4 mt-6 text-xs text-ink-500">
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded bg-ecru-200"></div>
                <span>{lang === 'en' ? 'No activity' : '活動なし'}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded bg-green-200"></div>
                <span>{lang === 'en' ? '1-2 sessions' : '1-2セッション'}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded bg-green-400"></div>
                <span>{lang === 'en' ? '3+ sessions' : '3+セッション'}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded bg-gold"></div>
                <span>{lang === 'en' ? 'Golden repair' : '金継ぎあり'}</span>
              </div>
            </div>
          </div>
          
          {/* Activity Breakdown */}
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi mb-8">
            <h2 class="text-lg text-indigo-800 mb-4">{t.activities[lang]}</h2>
            <div class="space-y-4">
              {/* Garden */}
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">🌱</div>
                <div class="flex-1">
                  <div class="flex justify-between mb-1">
                    <span class="text-ink-700">{t.garden[lang]}</span>
                    <span class="text-green-700 font-medium" id="report-garden-count">0</span>
                  </div>
                  <div class="h-2 bg-ecru-200 rounded-full overflow-hidden">
                    <div id="report-garden-bar" class="h-full bg-green-500 rounded-full transition-all duration-500" style="width: 0%"></div>
                  </div>
                </div>
              </div>
              
              {/* Study */}
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">📚</div>
                <div class="flex-1">
                  <div class="flex justify-between mb-1">
                    <span class="text-ink-700">{t.study[lang]}</span>
                    <span class="text-amber-700 font-medium" id="report-study-count">0</span>
                  </div>
                  <div class="h-2 bg-ecru-200 rounded-full overflow-hidden">
                    <div id="report-study-bar" class="h-full bg-amber-500 rounded-full transition-all duration-500" style="width: 0%"></div>
                  </div>
                </div>
              </div>
              
              {/* Tatami */}
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">🧘</div>
                <div class="flex-1">
                  <div class="flex justify-between mb-1">
                    <span class="text-ink-700">{t.tatami[lang]}</span>
                    <span class="text-indigo-700 font-medium" id="report-tatami-count">0</span>
                  </div>
                  <div class="h-2 bg-ecru-200 rounded-full overflow-hidden">
                    <div id="report-tatami-bar" class="h-full bg-indigo-500 rounded-full transition-all duration-500" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weekly Encouragement */}
          <div class="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 rounded-2xl p-6 shadow-wabi mb-8 text-center">
            <h2 class="text-lg text-indigo-800 mb-3">{t.encouragement[lang]}</h2>
            <p id="weekly-encouragement" class="text-ink-600 italic">
              {lang === 'en' 
                ? '"Every step forward, no matter how small, is progress."'
                : '「どんなに小さくても、前への一歩は進歩です。」'}
            </p>
          </div>
          
          {/* Share Card */}
          <div class="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi mb-8">
            <h3 class="text-xl text-indigo-800 dark:text-[#e8e4dc] mb-4 flex items-center gap-2">
              <span>📤</span>
              {lang === 'en' ? 'Share Your Journey' : '歩みを共有する'}
            </h3>
            <p class="text-ink-500 dark:text-[#78716c] text-sm mb-4">
              {lang === 'en' 
                ? 'Create a shareable card to inspire others with your mindfulness journey.'
                : 'あなたの歩みを、他の人への励みとしてシェアカードで共有しましょう。'}
            </p>
            
            {/* Share Preview Card */}
            <div id="share-card" class="bg-gradient-to-br from-indigo-800 to-indigo-900 rounded-xl p-6 text-ecru mb-4 max-w-sm mx-auto">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-full gradient-gold"></div>
                <span class="text-sm font-medium">KINTSUGI MIND</span>
              </div>
              <div class="text-center mb-4">
                <p class="text-4xl mb-1" id="share-streak-value">0</p>
                <p class="text-ecru-300 text-sm">{lang === 'en' ? 'Day Streak' : '日連続'}</p>
              </div>
              <p class="text-center text-ecru-300 text-xs italic mb-2" id="share-message">
                {lang === 'en' 
                  ? '"Every step forward is progress."'
                  : '「前への一歩は全て進歩。」'}
              </p>
              <div class="flex justify-center gap-3 text-lg">
                <span id="share-emoji-1">🌱</span>
                <span id="share-emoji-2">📚</span>
                <span id="share-emoji-3">🧘</span>
              </div>
            </div>
            
            {/* Share Buttons */}
            <div class="flex flex-wrap justify-center gap-3">
              <button 
                id="share-copy-btn"
                class="flex items-center gap-2 px-4 py-2 bg-ecru-100 dark:bg-[#2d2d2d] text-ink-600 dark:text-[#a8a29e] rounded-lg hover:bg-ecru-200 dark:hover:bg-[#3d3d3d] transition-colors text-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                {lang === 'en' ? 'Copy Text' : 'テキストをコピー'}
              </button>
              <button 
                id="share-twitter-btn"
                class="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors text-sm"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                {lang === 'en' ? 'Tweet' : 'ツイート'}
              </button>
              <button 
                id="share-native-btn"
                class="flex items-center gap-2 px-4 py-2 bg-gold text-ink rounded-lg hover:bg-gold-400 transition-colors text-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                {lang === 'en' ? 'Share' : '共有'}
              </button>
            </div>
          </div>
          
          {/* Back to Profile */}
          <div class="text-center">
            <a 
              href={`/profile?lang=${lang}`}
              class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors"
            >
              {t.backToProfile[lang]}
            </a>
          </div>
        </div>
      </main>
      
      <Footer currentLang={lang} />
    </div>,
    { title: lang === 'en' ? 'Weekly Report — KINTSUGI MIND' : '週間レポート — KINTSUGI MIND' }
  )
})

// ========================================
// Authentication Routes
// ========================================

// Get current auth status
app.get('/api/auth/status', async (c) => {
  const user = await getCurrentUser(c)
  return c.json({ 
    authenticated: !!user,
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture
    } : null
  })
})

// Start Google OAuth flow
app.get('/api/auth/login/google', async (c) => {
  // Rate limit: 10 login attempts per minute per IP
  const ip = getClientIP(c)
  const { allowed, remaining } = await rateLimit(c, `login:${ip}`, 10, 60)
  
  if (!allowed) {
    return apiError(c, 429, 'ログイン試行回数が上限に達しました。しばらくしてから再度お試しください。', { code: 'LOGIN_RATE_LIMITED', retryable: true })
  }
  
  const clientId = c.env.GOOGLE_CLIENT_ID
  
  if (!clientId) {
    return apiError(c, 500, 'Googleログインが設定されていません。管理者にお問い合わせください。', { code: 'OAUTH_NOT_CONFIGURED', retryable: false })
  }
  
  // Get the base URL for redirect
  const url = new URL(c.req.url)
  const redirectUri = `${url.protocol}//${url.host}/api/auth/callback/google`
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  })
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return c.redirect(authUrl)
})

// Google OAuth callback
app.get('/api/auth/callback/google', async (c) => {
  const code = c.req.query('code')
  const error = c.req.query('error')
  const lang = getCookie(c, 'kintsugi-lang') || 'en'
  
  if (error || !code) {
    return c.redirect(`/?lang=${lang}&auth_error=1`)
  }
  
  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET
  const sessionSecret = c.env.SESSION_SECRET
  const db = c.env.DB
  
  if (!clientId || !clientSecret || !db) {
    return c.redirect(`/?lang=${lang}&auth_error=config`)
  }
  
  try {
    // Get the base URL for redirect
    const url = new URL(c.req.url)
    const redirectUri = `${url.protocol}//${url.host}/api/auth/callback/google`
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return c.redirect(`/?lang=${lang}&auth_error=token`)
    }
    
    const tokens = await tokenResponse.json() as { access_token: string }
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    
    if (!userInfoResponse.ok) {
      return c.redirect(`/?lang=${lang}&auth_error=userinfo`)
    }
    
    const googleUser = await userInfoResponse.json() as {
      id: string
      email: string
      name: string
      picture: string
    }
    
    // Find or create user
    let user = await db.prepare(
      'SELECT id FROM users WHERE google_id = ?'
    ).bind(googleUser.id).first() as { id: string } | null
    
    if (!user) {
      // Create new user
      const userId = generateId()
      await db.prepare(
        'INSERT INTO users (id, google_id, email, name, picture) VALUES (?, ?, ?, ?, ?)'
      ).bind(userId, googleUser.id, googleUser.email, googleUser.name, googleUser.picture).run()
      
      // Create profile for the user
      const profileId = generateId()
      await db.prepare(
        'INSERT INTO profiles (id, user_id) VALUES (?, ?)'
      ).bind(profileId, userId).run()
      
      user = { id: userId }
    } else {
      // Update user info
      await db.prepare(
        'UPDATE users SET email = ?, name = ?, picture = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(googleUser.email, googleUser.name, googleUser.picture, user.id).run()
    }
    
    // Create session
    const sessionId = generateId()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    await db.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt.toISOString()).run()
    
    // Set session cookie
    setCookie(c, 'kintsugi_session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      expires: expiresAt
    })
    
    return c.redirect(`/profile?lang=${lang}&auth_success=1`)
    
  } catch (e) {
    console.error('OAuth callback error:', e)
    return c.redirect(`/?lang=${lang}&auth_error=unknown`)
  }
})

// Logout
app.post('/api/auth/logout', async (c) => {
  const sessionId = getCookie(c, 'kintsugi_session')
  
  if (sessionId) {
    const db = c.env.DB
    if (db) {
      await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
    }
    deleteCookie(c, 'kintsugi_session', { path: '/' })
  }
  
  return c.json({ success: true })
})

// Sync local data to server (after login)
app.post('/api/auth/sync', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return apiError(c, 401, 'ログインが必要です。再度ログインしてください。', { code: 'AUTH_REQUIRED', retryable: false })
  }
  
  const { profile: localProfile } = await c.req.json()
  const db = c.env.DB
  
  if (!db || !localProfile) {
    return apiError(c, 400, 'プロフィールデータが見つかりません。ページを再読み込みしてください。', { code: 'INVALID_SYNC_DATA', retryable: false })
  }
  
  try {
    // Get user's profile (explicit columns for security)
    const profile = await db.prepare(
      `SELECT id, user_id, total_repairs, last_visit, 
              stats_total_visits, stats_current_streak, stats_longest_streak,
              stats_garden_actions, stats_study_sessions, stats_tatami_sessions,
              created_at, updated_at 
       FROM profiles WHERE user_id = ?`
    ).bind(user.id).first()
    
    if (!profile) {
      return apiError(c, 404, 'プロフィールが見つかりません。初回ログインの場合は自動作成されます。', { code: 'PROFILE_NOT_FOUND', retryable: false })
    }
    
    // Merge local data with server data (local takes priority for higher values)
    const mergedStats = {
      total_repairs: Math.max(profile.total_repairs || 0, localProfile.totalRepairs || 0),
      stats_total_visits: Math.max(profile.stats_total_visits || 0, localProfile.stats?.totalVisits || 0),
      stats_current_streak: localProfile.stats?.currentStreak || profile.stats_current_streak || 0,
      stats_longest_streak: Math.max(profile.stats_longest_streak || 0, localProfile.stats?.longestStreak || 0),
      stats_garden_actions: Math.max(profile.stats_garden_actions || 0, localProfile.stats?.gardenActions || 0),
      stats_study_sessions: Math.max(profile.stats_study_sessions || 0, localProfile.stats?.studySessions || 0),
      stats_tatami_sessions: Math.max(profile.stats_tatami_sessions || 0, localProfile.stats?.tatamiSessions || 0)
    }
    
    // Update profile
    await db.prepare(`
      UPDATE profiles SET
        total_repairs = ?,
        stats_total_visits = ?,
        stats_current_streak = ?,
        stats_longest_streak = ?,
        stats_garden_actions = ?,
        stats_study_sessions = ?,
        stats_tatami_sessions = ?,
        updated_at = datetime("now")
      WHERE user_id = ?
    `).bind(
      mergedStats.total_repairs,
      mergedStats.stats_total_visits,
      mergedStats.stats_current_streak,
      mergedStats.stats_longest_streak,
      mergedStats.stats_garden_actions,
      mergedStats.stats_study_sessions,
      mergedStats.stats_tatami_sessions,
      user.id
    ).run()
    
    // Update vessel type if provided
    if (localProfile.vesselType) {
      await db.prepare(
        'UPDATE users SET vessel_type = ? WHERE id = ?'
      ).bind(localProfile.vesselType, user.id).run()
    }
    
    return c.json({ success: true, merged: mergedStats })
  } catch (e) {
    console.error('Sync error:', e)
    return apiError(c, 500, 'データの同期に失敗しました。しばらくしてから再度お試しください。', { code: 'SYNC_FAILED' })
  }
})

// Get server profile data
app.get('/api/auth/profile', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return apiError(c, 401, 'ログインが必要です。', { code: 'AUTH_REQUIRED', retryable: false })
  }
  
  const db = c.env.DB
  if (!db) {
    return apiError(c, 500, 'データベースに接続できません。しばらくしてから再度お試しください。', { code: 'DB_UNAVAILABLE' })
  }
  
  try {
    const profile = await db.prepare(
      `SELECT id, user_id, total_repairs, last_visit,
              stats_total_visits, stats_current_streak, stats_longest_streak,
              stats_garden_actions, stats_study_sessions, stats_tatami_sessions,
              created_at, updated_at
       FROM profiles WHERE user_id = ?`
    ).bind(user.id).first()
    
    const userData = await db.prepare(
      'SELECT vessel_type FROM users WHERE id = ?'
    ).bind(user.id).first() as { vessel_type: string } | null
    
    const checkins = await db.prepare(
      'SELECT weather, created_at FROM checkins WHERE profile_id = ? ORDER BY created_at DESC LIMIT 30'
    ).bind(profile?.id).all()
    
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        vesselType: userData?.vessel_type || 'chawan'
      },
      profile: profile ? {
        totalRepairs: profile.total_repairs,
        stats: {
          totalVisits: profile.stats_total_visits,
          currentStreak: profile.stats_current_streak,
          longestStreak: profile.stats_longest_streak,
          gardenActions: profile.stats_garden_actions,
          studySessions: profile.stats_study_sessions,
          tatamiSessions: profile.stats_tatami_sessions
        }
      } : null,
      checkins: checkins.results || []
    })
  } catch (e) {
    console.error('Get profile error:', e)
    return apiError(c, 500, 'プロフィールの取得に失敗しました。再読み込みしてください。', { code: 'PROFILE_FETCH_FAILED' })
  }
})

// Record check-in
app.post('/api/checkin', async (c) => {
  const user = await getCurrentUser(c)
  const { weather, note } = await c.req.json()
  
  // If not logged in, just return success (data stays in localStorage)
  if (!user) {
    return c.json({ success: true, stored: 'local' })
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ success: true, stored: 'local' })
  }
  
  try {
    const profile = await db.prepare(
      'SELECT id FROM profiles WHERE user_id = ?'
    ).bind(user.id).first() as { id: string } | null
    
    if (profile) {
      const checkinId = generateId()
      await db.prepare(
        'INSERT INTO checkins (id, profile_id, weather, note) VALUES (?, ?, ?, ?)'
      ).bind(checkinId, profile.id, weather, note || null).run()
    }
    
    return c.json({ success: true, stored: 'server' })
  } catch (e) {
    console.error('Check-in error:', e)
    return c.json({ success: true, stored: 'local' })
  }
})

// Get check-in history for calendar
app.get('/api/checkins', async (c) => {
  const user = await getCurrentUser(c)
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const year = parseInt(c.req.query('year') || jstNow.getUTCFullYear().toString())
  const month = parseInt(c.req.query('month') || (jstNow.getUTCMonth() + 1).toString())
  
  // If not logged in, return empty (frontend will use localStorage)
  if (!user) {
    return c.json({ checkins: [], source: 'local' })
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ checkins: [], source: 'local' })
  }
  
  try {
    const profile = await db.prepare(
      'SELECT id FROM profiles WHERE user_id = ?'
    ).bind(user.id).first() as { id: string } | null
    
    if (!profile) {
      return c.json({ checkins: [], source: 'local' })
    }
    
    // Get checkins for the specified month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${String(month + 1).padStart(2, '0')}-01`
    
    const checkins = await db.prepare(`
      SELECT weather, note, created_at 
      FROM checkins 
      WHERE profile_id = ? 
        AND created_at >= ? 
        AND created_at < ?
      ORDER BY created_at DESC
    `).bind(profile.id, startDate, endDate).all()
    
    return c.json({ 
      checkins: checkins.results || [], 
      source: 'server' 
    })
  } catch (e) {
    console.error('Get checkins error:', e)
    return c.json({ checkins: [], source: 'local' })
  }
})

// ========================================
// Subscription API Routes
// ========================================

// Get subscription status
app.get('/api/subscription', async (c) => {
  const user = await getCurrentUser(c)
  
  if (!user) {
    // Return free plan for non-logged in users
    return c.json({
      plan: 'free',
      status: 'active',
      limits: PLAN_LIMITS.free,
      expiresAt: null,
      usage: {}
    })
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ plan: 'free', status: 'active', limits: PLAN_LIMITS.free })
  }
  
  try {
    const subscription = await getUserSubscription(db, user.id)
    const limits = subscription.plan === 'premium' ? PLAN_LIMITS.premium : PLAN_LIMITS.free
    
    // Get today's usage
    const today = getTodayJST()
    const usageRows = await db.prepare(`
      SELECT feature, count FROM usage 
      WHERE user_id = ? AND reset_date = ?
    `).bind(user.id, today).all()
    
    const usage: Record<string, number> = {}
    for (const row of (usageRows.results || []) as { feature: string; count: number }[]) {
      usage[row.feature] = row.count
    }
    
    return c.json({
      plan: subscription.plan,
      status: subscription.status,
      limits,
      expiresAt: subscription.expiresAt,
      usage
    })
  } catch (e) {
    console.error('Get subscription error:', e)
    return c.json({ plan: 'free', status: 'active', limits: PLAN_LIMITS.free })
  }
})

// Check feature usage (for frontend to check before action)
app.get('/api/subscription/check/:feature', async (c) => {
  const feature = c.req.param('feature')
  const user = await getCurrentUser(c)
  
  if (!user) {
    // Allow limited usage for non-logged in users (stored in localStorage)
    return c.json({ 
      allowed: true, 
      remaining: PLAN_LIMITS.free[feature as keyof typeof PLAN_LIMITS.free] || -1,
      limit: PLAN_LIMITS.free[feature as keyof typeof PLAN_LIMITS.free] || -1,
      requiresLogin: true
    })
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ allowed: true, remaining: -1, limit: -1 })
  }
  
  try {
    const subscription = await getUserSubscription(db, user.id)
    const usage = await checkUsageLimit(db, user.id, feature, subscription.plan)
    
    return c.json({
      ...usage,
      plan: subscription.plan,
      requiresLogin: false
    })
  } catch (e) {
    console.error('Check feature error:', e)
    return c.json({ allowed: true, remaining: -1, limit: -1 })
  }
})

// Record feature usage
app.post('/api/subscription/use/:feature', async (c) => {
  const feature = c.req.param('feature')
  const user = await getCurrentUser(c)
  
  if (!user) {
    return apiError(c, 401, 'ログインが必要です。', { code: 'AUTH_REQUIRED', retryable: false })
  }
  
  const db = c.env.DB
  if (!db) {
    return apiError(c, 500, 'データベースに接続できません。', { code: 'DB_UNAVAILABLE' })
  }
  
  try {
    const subscription = await getUserSubscription(db, user.id)
    const usage = await checkUsageLimit(db, user.id, feature, subscription.plan)
    
    if (!usage.allowed) {
      return c.json({ 
        success: false, 
        error: 'Usage limit reached',
        remaining: 0,
        limit: usage.limit,
        upgradeUrl: '/pricing'
      }, 429)
    }
    
    await incrementUsage(db, user.id, feature)
    
    return c.json({ 
      success: true, 
      remaining: usage.remaining - 1,
      limit: usage.limit
    })
  } catch (e) {
    console.error('Record usage error:', e)
    return apiError(c, 500, '使用状況の記録に失敗しました。', { code: 'USAGE_RECORD_FAILED' })
  }
})

// Get premium vessels
app.get('/api/vessels', async (c) => {
  const user = await getCurrentUser(c)
  const db = c.env.DB
  
  // Basic vessels always available
  const basicVessels = [
    { id: 'chawan', name: 'Tea Bowl', name_ja: '茶碗', emoji: '🍵', is_premium: 0 },
    { id: 'tsubo', name: 'Jar', name_ja: '壺', emoji: '🏺', is_premium: 0 },
    { id: 'sara', name: 'Plate', name_ja: '皿', emoji: '🍽️', is_premium: 0 },
    { id: 'tokkuri', name: 'Sake Bottle', name_ja: '徳利', emoji: '🍶', is_premium: 0 },
    { id: 'hachi', name: 'Bowl', name_ja: '鉢', emoji: '🥣', is_premium: 0 },
  ]
  
  if (!db) {
    return c.json({ vessels: basicVessels, plan: 'free' })
  }
  
  try {
    let plan: 'free' | 'premium' = 'free'
    
    if (user) {
      const subscription = await getUserSubscription(db, user.id)
      plan = subscription.plan
    }
    
    // Get premium vessels from database
    const premiumVessels = await db.prepare(`
      SELECT id, name, name_ja, emoji, description, description_ja, is_premium
      FROM premium_vessels
      ORDER BY sort_order
    `).all()
    
    const allVessels = [
      ...basicVessels,
      ...((premiumVessels.results || []) as any[]).map(v => ({
        ...v,
        locked: plan === 'free' && v.is_premium === 1
      }))
    ]
    
    return c.json({ vessels: allVessels, plan })
  } catch (e) {
    console.error('Get vessels error:', e)
    return c.json({ vessels: basicVessels, plan: 'free' })
  }
})

// ========================================
// Challenge API
// ========================================

// Sync challenge progress
app.post('/api/challenge/sync', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return c.json({ success: true, message: 'Offline mode - saved locally' })
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ success: true, message: 'No database - saved locally' })
  }
  
  try {
    const { challenge } = await c.req.json()
    
    if (!challenge) {
    return apiError(c, 400, 'チャレンジデータが見つかりません。', { code: 'NO_CHALLENGE_DATA', retryable: false })
    }
    
    // Store challenge in user metadata or a challenges table
    // For now, we'll update a JSON field in the users table
    await db.prepare(`
      UPDATE users SET 
        challenge_data = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(JSON.stringify(challenge), user.id).run()
    
    // If all 7 days completed, unlock golden vessel
    if (challenge.completedDays && challenge.completedDays.length >= 7) {
      // Add golden vessel to user's unlocked vessels
      await db.prepare(`
        INSERT OR IGNORE INTO user_unlocks (user_id, unlock_type, unlock_id, unlocked_at)
        VALUES (?, 'vessel', 'kintsugiBowl', datetime('now'))
      `).bind(user.id).run()
    }
    
    return c.json({ success: true, synced: true })
  } catch (e) {
    console.error('Challenge sync error:', e)
    return c.json({ success: true, message: 'Sync failed but saved locally' })
  }
})

// Get challenge status
app.get('/api/challenge/status', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return c.json({ 
      active: false, 
      completedDays: [], 
      source: 'local' 
    })
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ 
      active: false, 
      completedDays: [], 
      source: 'local' 
    })
  }
  
  try {
    const userData = await db.prepare(`
      SELECT challenge_data FROM users WHERE id = ?
    `).bind(user.id).first() as { challenge_data: string } | null
    
    if (userData?.challenge_data) {
      const challenge = JSON.parse(userData.challenge_data)
      return c.json({
        active: true,
        ...challenge,
        source: 'server'
      })
    }
    
    return c.json({ 
      active: false, 
      completedDays: [], 
      source: 'server' 
    })
  } catch (e) {
    console.error('Get challenge error:', e)
    return c.json({ 
      active: false, 
      completedDays: [], 
      source: 'local' 
    })
  }
})

// ========================================
// Data Sync API - LocalStorage ↔ Server
// ========================================

// Get full profile data from server
app.get('/api/sync/profile', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return apiError(c, 401, 'ログインが必要です。', { code: 'AUTH_REQUIRED', retryable: false, extra: { source: 'local' } })
  }
  
  const db = c.env?.DB
  if (!db) {
    return apiError(c, 500, 'データベースに接続できません。', { code: 'DB_UNAVAILABLE', extra: { source: 'local' } })
  }
  
  try {
    // Get profile (explicit columns for security)
    const profile = await db.prepare(`
      SELECT id, user_id, total_repairs, last_visit,
             stats_total_visits, stats_current_streak, stats_longest_streak,
             stats_garden_actions, stats_study_sessions, stats_tatami_sessions,
             created_at, updated_at
      FROM profiles WHERE user_id = ?
    `).bind(user.id).first()
    
    if (!profile) {
      return c.json({ 
        profile: null, 
        checkins: [], 
        activities: [],
        cracks: [],
        source: 'server' 
      })
    }
    
    // Get checkins (last 365 days)
    const checkins = await db.prepare(`
      SELECT id, weather, note, created_at FROM checkins 
      WHERE profile_id = ? 
      AND created_at > datetime('now', '-365 days')
      ORDER BY created_at DESC
    `).bind(profile.id).all()
    
    // Get activities (last 30 days)
    const activities = await db.prepare(`
      SELECT id, type, data, created_at FROM activities 
      WHERE profile_id = ? 
      AND created_at > datetime('now', '-30 days')
      ORDER BY created_at DESC
    `).bind(profile.id).all()
    
    // Get cracks
    const cracks = await db.prepare(`
      SELECT id, type, repaired, created_at, repaired_at FROM cracks 
      WHERE profile_id = ?
      ORDER BY created_at DESC
    `).bind(profile.id).all()
    
    return c.json({
      profile: {
        id: profile.id,
        totalRepairs: profile.total_repairs,
        lastVisit: profile.last_visit,
        stats: {
          totalVisits: profile.stats_total_visits,
          currentStreak: profile.stats_current_streak,
          longestStreak: profile.stats_longest_streak,
          gardenActions: profile.stats_garden_actions,
          studySessions: profile.stats_study_sessions,
          tatamiSessions: profile.stats_tatami_sessions
        }
      },
      checkins: checkins.results || [],
      activities: activities.results || [],
      cracks: cracks.results || [],
      source: 'server'
    })
  } catch (e) {
    console.error('Get profile error:', e)
    return apiError(c, 500, 'プロフィールの取得に失敗しました。', { code: 'PROFILE_FETCH_FAILED', extra: { source: 'local' } })
  }
})

// Sync profile data from client to server (merge strategy)
app.post('/api/sync/profile', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return apiError(c, 401, 'ログインが必要です。', { code: 'AUTH_REQUIRED', retryable: false, extra: { synced: false } })
  }
  
  const db = c.env?.DB
  if (!db) {
    return apiError(c, 500, 'データベースに接続できません。', { code: 'DB_UNAVAILABLE', extra: { synced: false } })
  }
  
  try {
    const body = await c.req.json()
    const { profile: clientProfile, checkins: clientCheckins, vessel } = body
    
    // Get or create profile (explicit columns for security)
    let profile = await db.prepare(`
      SELECT id, user_id, total_repairs, last_visit,
             stats_total_visits, stats_current_streak, stats_longest_streak,
             stats_garden_actions, stats_study_sessions, stats_tatami_sessions,
             created_at, updated_at
      FROM profiles WHERE user_id = ?
    `).bind(user.id).first()
    
    const profileId = profile?.id || `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    if (!profile) {
      // Create new profile
      await db.prepare(`
        INSERT INTO profiles (id, user_id, total_repairs, last_visit, 
          stats_total_visits, stats_current_streak, stats_longest_streak,
          stats_garden_actions, stats_study_sessions, stats_tatami_sessions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        profileId,
        user.id,
        clientProfile?.totalRepairs || 0,
        clientProfile?.lastVisit || new Date().toISOString(),
        clientProfile?.stats?.totalVisits || 1,
        clientProfile?.stats?.currentStreak || 1,
        clientProfile?.stats?.longestStreak || 1,
        clientProfile?.stats?.gardenActions || 0,
        clientProfile?.stats?.studySessions || 0,
        clientProfile?.stats?.tatamiSessions || 0
      ).run()
    } else {
      // Merge: Take maximum values for stats (server wins for conflicts)
      const mergedStats = {
        totalVisits: Math.max(profile.stats_total_visits || 0, clientProfile?.stats?.totalVisits || 0),
        currentStreak: Math.max(profile.stats_current_streak || 0, clientProfile?.stats?.currentStreak || 0),
        longestStreak: Math.max(profile.stats_longest_streak || 0, clientProfile?.stats?.longestStreak || 0),
        gardenActions: Math.max(profile.stats_garden_actions || 0, clientProfile?.stats?.gardenActions || 0),
        studySessions: Math.max(profile.stats_study_sessions || 0, clientProfile?.stats?.studySessions || 0),
        tatamiSessions: Math.max(profile.stats_tatami_sessions || 0, clientProfile?.stats?.tatamiSessions || 0)
      }
      
      await db.prepare(`
        UPDATE profiles SET 
          total_repairs = ?,
          last_visit = ?,
          stats_total_visits = ?,
          stats_current_streak = ?,
          stats_longest_streak = ?,
          stats_garden_actions = ?,
          stats_study_sessions = ?,
          stats_tatami_sessions = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        Math.max(profile.total_repairs || 0, clientProfile?.totalRepairs || 0),
        new Date().toISOString(),
        mergedStats.totalVisits,
        mergedStats.currentStreak,
        mergedStats.longestStreak,
        mergedStats.gardenActions,
        mergedStats.studySessions,
        mergedStats.tatamiSessions,
        profile.id
      ).run()
    }
    
    // Update vessel type if provided
    if (vessel) {
      await db.prepare(`
        UPDATE users SET vessel_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(vessel, user.id).run()
    }
    
    // Sync checkins (avoid duplicates by date)
    if (clientCheckins && clientCheckins.length > 0) {
      for (const checkin of clientCheckins) {
        const dateStr = checkin.date || checkin.created_at?.split('T')[0]
        if (!dateStr) continue
        
        // Check if checkin for this date already exists
        const existing = await db.prepare(`
          SELECT id FROM checkins 
          WHERE profile_id = ? AND date(created_at) = date(?)
        `).bind(profileId, dateStr).first()
        
        if (!existing) {
          const checkinId = `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          await db.prepare(`
            INSERT INTO checkins (id, profile_id, weather, note, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).bind(
            checkinId,
            profileId,
            checkin.weather,
            checkin.note || null,
            dateStr + 'T12:00:00Z'
          ).run()
        }
      }
    }
    
    return c.json({ 
      synced: true, 
      profileId,
      message: 'Data synced successfully'
    })
  } catch (e) {
    console.error('Sync profile error:', e)
    return apiError(c, 500, 'プロフィールの同期に失敗しました。', { code: 'PROFILE_SYNC_FAILED', extra: { synced: false } })
  }
})

// Record activity (for logged-in users)
app.post('/api/sync/activity', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return c.json({ saved: false, source: 'local' })
  }
  
  const db = c.env?.DB
  if (!db) {
    return c.json({ saved: false, source: 'local' })
  }
  
  try {
    const { type, data } = await c.req.json()
    
    // Get profile
    const profile = await db.prepare(`
      SELECT id FROM profiles WHERE user_id = ?
    `).bind(user.id).first()
    
    if (!profile) {
      return c.json({ saved: false, source: 'local' })
    }
    
    // Insert activity
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.prepare(`
      INSERT INTO activities (id, profile_id, type, data)
      VALUES (?, ?, ?, ?)
    `).bind(activityId, profile.id, type, JSON.stringify(data || {})).run()
    
    // Update profile stats based on activity type
    const statField = type === 'garden' ? 'stats_garden_actions'
      : type === 'study' ? 'stats_study_sessions'
      : type === 'tatami' ? 'stats_tatami_sessions'
      : null
    
    if (statField) {
      await db.prepare(`
        UPDATE profiles SET ${statField} = ${statField} + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(profile.id).run()
    }
    
    return c.json({ saved: true, source: 'server', activityId })
  } catch (e) {
    console.error('Save activity error:', e)
    return c.json({ saved: false, source: 'local' })
  }
})

// Get sync status
app.get('/api/sync/status', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return c.json({ 
      authenticated: false, 
      synced: false,
      message: 'Login to sync your data across devices'
    })
  }
  
  const db = c.env?.DB
  if (!db) {
    return c.json({ 
      authenticated: true, 
      synced: false,
      message: 'Database not available'
    })
  }
  
  try {
    const profile = await db.prepare(`
      SELECT id, updated_at FROM profiles WHERE user_id = ?
    `).bind(user.id).first()
    
    return c.json({
      authenticated: true,
      synced: !!profile,
      lastSync: profile?.updated_at || null,
      message: profile ? 'Data synced to cloud' : 'Ready to sync'
    })
  } catch (e) {
    return c.json({ 
      authenticated: true, 
      synced: false,
      message: 'Sync status unknown'
    })
  }
})

// ========================================
// Maintenance APIs
// ========================================

// Clean up expired sessions (can be called by Cloudflare Cron or manually)
app.post('/api/maintenance/cleanup-sessions', async (c) => {
  // This endpoint can be protected by a secret token for automated cleanup
  const authHeader = c.req.header('Authorization')
  const expectedToken = c.env.SESSION_SECRET // Reuse session secret as maintenance token
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return apiError(c, 401, '権限がありません。', { code: 'UNAUTHORIZED', retryable: false })
  }
  
  const db = c.env.DB
  if (!db) {
    return apiError(c, 500, 'データベースに接続できません。しばらくしてから再度お試しください。', { code: 'DB_UNAVAILABLE' })
  }
  
  try {
    const result = await db.prepare(`
      DELETE FROM sessions WHERE expires_at < datetime('now')
    `).run()
    
    return c.json({ 
      success: true, 
      deleted: result.meta.changes,
      message: `Cleaned up ${result.meta.changes} expired sessions`
    })
  } catch (e) {
    console.error('Session cleanup error:', e)
    return apiError(c, 500, 'クリーンアップに失敗しました。', { code: 'CLEANUP_FAILED' })
  }
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

export default app
