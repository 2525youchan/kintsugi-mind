import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { translations, getLanguage, type Language } from './i18n'
import { Header, Footer, RoomCard, WeatherIcon, KintsugiVessel, LanguageSwitcher } from './components'

// Types
type Bindings = {
  GEMINI_API_KEY: string
}
type Variables = {}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

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

// Home / Entrance - The Tea House
app.get('/', (c) => {
  const lang = getLanguage(c)
  
  return c.render(
    <div class="min-h-screen bg-ecru">
      <Header currentLang={lang} variant="fixed" />

      {/* Hero Section */}
      <section class="pt-32 pb-20 px-6">
        <div class="max-w-4xl mx-auto text-center">
          <p class="text-gold font-medium mb-4 animate-fade-in">
            {tx('common', 'tagline', lang)}
          </p>
          <h1 class="text-5xl md:text-7xl font-light text-indigo-800 mb-8 leading-tight animate-slide-up">
            {tx('home', 'heroTitle', lang)}<br />
            <span class="text-gradient-gold font-medium">{tx('home', 'heroTitleAccent', lang)}</span>
          </h1>
          <p class="text-xl text-ink-600 max-w-2xl mx-auto mb-12 animate-slide-up" style="animation-delay: 0.2s">
            {tx('home', 'heroDescription', lang)}
          </p>
          
          {/* Weather Check-in Preview */}
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-wabi max-w-md mx-auto animate-slide-up" style="animation-delay: 0.4s">
            <p class="text-indigo-700 mb-2 font-jp text-lg">{tx('home', 'weatherQuestion', lang)}</p>
            <p class="text-ink-500 text-sm mb-8">{tx('home', 'weatherSubtext', lang)}</p>
            <div class="flex justify-center gap-6">
              <WeatherIcon type="sunny" currentLang={lang} />
              <WeatherIcon type="cloudy" currentLang={lang} />
              <WeatherIcon type="rainy" currentLang={lang} />
              <WeatherIcon type="stormy" currentLang={lang} />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" class="py-20 px-6 bg-gradient-to-b from-ecru to-ecru-300">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl md:text-4xl text-indigo-800 text-center mb-4">
            {tx('home', 'teaHouseTitle', lang)}
          </h2>
          <p class="text-ink-500 text-center mb-16 max-w-2xl mx-auto">
            {tx('home', 'teaHouseDescription', lang)}
          </p>
          
          <div class="grid md:grid-cols-3 gap-8">
            <RoomCard room="garden" currentLang={lang} />
            <RoomCard room="study" currentLang={lang} />
            <RoomCard room="tatami" currentLang={lang} />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" class="py-20 px-6">
        <div class="max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl text-indigo-800 mb-6">{tx('home', 'aboutTitle', lang)}</h2>
              <p class="text-ink-600 mb-4">{tx('home', 'aboutP1', lang)}</p>
              <p class="text-ink-600 mb-4">{tx('home', 'aboutP2', lang)}</p>
              <p class="text-ink-600">{tx('home', 'aboutP3', lang)}</p>
            </div>
            <div class="flex justify-center">
              <KintsugiVessel />
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
    { title: 'KINTSUGI MIND — The Japanese Art of Resilience' }
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
    <div class="min-h-screen bg-ecru flex flex-col">
      <Header currentLang={lang} />

      {/* Check-in Content */}
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="max-w-lg w-full">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi-lg text-center">
            <p class="text-gold font-medium mb-2">{tx('checkin', 'welcome', lang)}</p>
            <h1 class="text-2xl text-indigo-800 mb-8">
              {lang === 'en' ? 'Welcome to the Tea House' : '心の茶室へようこそ'}
            </h1>
            
            <p class="text-ink-600 mb-2 font-jp text-lg">{tx('checkin', 'question', lang)}</p>
            <p class="text-ink-400 text-sm mb-8">
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
                  <p class="text-ink-600">{weatherMessages[weather][lang]}</p>
                </div>
              )}
            </div>
            
            <div id="room-suggestion" class="space-y-3">
              {weather && (
                <div class="animate-slide-up">
                  <p class="text-sm text-ink-500 mb-4">{tx('checkin', 'suggestedRoom', lang)}</p>
                  {(weather === 'stormy' || weather === 'rainy') && (
                    <a href={`/garden?lang=${lang}`} class="block p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">🌱</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800">GARDEN — {lang === 'en' ? 'The Garden' : '庭'}</p>
                          <p class="text-sm text-ink-500">{tx('checkin', 'gardenSuggestion', lang)}</p>
                        </div>
                      </div>
                    </a>
                  )}
                  {weather === 'cloudy' && (
                    <a href={`/study?lang=${lang}`} class="block p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">📚</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800">STUDY — {lang === 'en' ? 'The Study' : '書斎'}</p>
                          <p class="text-sm text-ink-500">{tx('checkin', 'studySuggestion', lang)}</p>
                        </div>
                      </div>
                    </a>
                  )}
                  {weather === 'sunny' && (
                    <a href={`/tatami?lang=${lang}`} class="block p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">🧘</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800">TATAMI — {lang === 'en' ? 'The Tatami Room' : '座敷'}</p>
                          <p class="text-sm text-ink-500">{tx('checkin', 'tatamiSuggestion', lang)}</p>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {!weather && (
              <p class="text-ink-400 text-sm">{tx('checkin', 'selectPrompt', lang)}</p>
            )}
          </div>
          
          {/* All Rooms Link */}
          <div class="text-center mt-6">
            <a href={`/?lang=${lang}#philosophy`} class="text-indigo-600 hover:text-gold transition-colors text-sm">
              {tx('checkin', 'viewAllRooms', lang)}
            </a>
          </div>
        </div>
      </main>
    </div>,
    { title: 'Check-in — KINTSUGI MIND' }
  )
})

// GARDEN Mode - Morita Therapy (Split Screen)
app.get('/garden', (c) => {
  const lang = getLanguage(c)
  
  return c.render(
    <div class="min-h-screen bg-ecru flex flex-col" data-lang={lang}>
      <Header currentLang={lang} roomName={lang === 'en' ? 'GARDEN' : '庭 GARDEN'} roomIcon="🌱" />

      {/* Split Screen */}
      <main class="flex-1 flex flex-col md:flex-row">
        {/* SKY Section - Emotions */}
        <section class="flex-1 sky-section p-6 md:p-8 relative flex flex-col">
          <div class="text-center mb-6">
            <h2 class="text-xl text-indigo-700 mb-2">{tx('garden', 'skyTitle', lang)} — Sky</h2>
            <p class="text-ink-500 text-sm">{tx('garden', 'skyDescription', lang)}</p>
          </div>
          
          {/* Cloud Input Area */}
          <div class="flex-1 relative" id="cloud-container">
            <div class="absolute inset-0 flex items-center justify-center opacity-50">
              <p class="text-ink-400 text-center" dangerouslySetInnerHTML={{ __html: tx('garden', 'cloudPlaceholder', lang) }}></p>
            </div>
          </div>
          
          {/* Emotion Input */}
          <div class="mt-auto">
            <div class="flex gap-3">
              <input 
                type="text" 
                id="emotion-input"
                placeholder={tx('garden', 'inputPlaceholder', lang)}
                class="flex-1 px-4 py-3 bg-white/80 border border-ecru-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              <button 
                id="add-cloud-btn"
                class="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors"
              >
                {tx('garden', 'floatButton', lang)}
              </button>
            </div>
            <p class="text-xs text-ink-400 mt-2 text-center">
              {tx('garden', 'cloudNote', lang)}
            </p>
          </div>
          
          <div class="horizon-line"></div>
        </section>

        {/* GROUND Section - Actions */}
        <section class="flex-1 ground-section p-6 md:p-8 flex flex-col">
          <div class="text-center mb-6">
            <h2 class="text-xl text-green-800 mb-2">{tx('garden', 'groundTitle', lang)} — Ground</h2>
            <p class="text-ink-500 text-sm">{tx('garden', 'groundDescription', lang)}</p>
          </div>
          
          {/* AI Guidance */}
          <div id="morita-guidance" class="bg-white/60 rounded-xl p-4 mb-6">
            <p class="text-ink-600 text-sm" dangerouslySetInnerHTML={{ __html: `<span class="text-gold">●</span> ${tx('garden', 'guidanceDefault', lang)}` }}></p>
          </div>
          
          {/* Micro Actions */}
          <div class="flex-1">
            <p class="text-sm text-ink-500 mb-3">{tx('garden', 'microActionTitle', lang)}</p>
            <div id="action-list" class="space-y-3">
              <label class="flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                <input type="checkbox" class="w-5 h-5 accent-gold" data-action="cup" />
                <span class="text-ink-700">{tx('garden', 'actionCup', lang)}</span>
                <span class="text-ink-400 text-xs ml-auto">30s</span>
              </label>
              <label class="flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                <input type="checkbox" class="w-5 h-5 accent-gold" data-action="stand" />
                <span class="text-ink-700">{tx('garden', 'actionStand', lang)}</span>
                <span class="text-ink-400 text-xs ml-auto">1min</span>
              </label>
              <label class="flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                <input type="checkbox" class="w-5 h-5 accent-gold" data-action="water" />
                <span class="text-ink-700">{tx('garden', 'actionWater', lang)}</span>
                <span class="text-ink-400 text-xs ml-auto">15s</span>
              </label>
              <label class="flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                <input type="checkbox" class="w-5 h-5 accent-gold" data-action="window" />
                <span class="text-ink-700">{tx('garden', 'actionWindow', lang)}</span>
                <span class="text-ink-400 text-xs ml-auto">30s</span>
              </label>
            </div>
          </div>
          
          {/* Garden Growth Visualization */}
          <div class="mt-6">
            <div class="flex items-end justify-center gap-2 h-20" id="garden-plants">
              <div class="text-center text-ink-400 text-sm">
                {tx('garden', 'plantGrowth', lang)}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>,
    { title: 'GARDEN — KINTSUGI MIND' }
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
    <div class="min-h-screen bg-ecru flex flex-col" data-lang={lang}>
      <Header currentLang={lang} roomName={lang === 'en' ? 'STUDY' : '書斎 STUDY'} roomIcon="📚" />

      {/* Content */}
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="max-w-2xl w-full">
          {/* Chat Section (hidden when mandala shows) */}
          <div id="study-chat-section">
            <div class="text-center mb-8">
              <h1 class="text-3xl text-indigo-800 mb-2">{tx('study', 'title', lang)} — Deep Reflection</h1>
              <p class="text-ink-500">{tx('study', 'subtitle', lang)}</p>
            </div>
            
            {/* Chat Interface */}
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-wabi-lg overflow-hidden">
              <div id="naikan-chat" class="h-96 overflow-y-auto p-6 space-y-4">
                {/* Initial message with person input */}
                <div class="chat-bubble bg-ecru-200 p-4 max-w-[85%]">
                  <p class="text-ink-700 text-sm mb-1">
                    <span class="text-gold">{tx('study', 'guideName', lang)}</span>
                  </p>
                  <p class="text-ink-600 mb-3">
                    {tx('study', 'q1', lang)}
                  </p>
                  <p class="text-xs text-ink-400">{tx('study', 'q1Hint', lang)}</p>
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
            
            {/* Progress */}
            <div class="mt-6 text-center">
              <p id="progress-text" class="text-ink-400 text-sm">{tx('study', 'question', lang)} 1 / 3</p>
              <div class="flex justify-center gap-2 mt-2">
                <div id="dot-1" class="w-3 h-3 rounded-full bg-gold"></div>
                <div id="dot-2" class="w-3 h-3 rounded-full bg-ecru-300"></div>
                <div id="dot-3" class="w-3 h-3 rounded-full bg-ecru-300"></div>
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
    </div>,
    { title: 'STUDY — KINTSUGI MIND' }
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
    </div>,
    { title: 'TATAMI — KINTSUGI MIND' }
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
    <div class="min-h-screen bg-ecru flex flex-col" data-lang={lang}>
      <Header currentLang={lang} />

      <main class="flex-1 py-12 px-6">
        <div class="max-w-4xl mx-auto">
          {/* Title */}
          <div class="text-center mb-12">
            <h1 class="text-4xl text-indigo-800 mb-2">{t.title[lang]}</h1>
            <p class="text-ink-500">{t.subtitle[lang]}</p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8">
            {/* Vessel Visualization */}
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi text-center">
              <div id="vessel-container" class="mb-6">
                {/* Dynamic vessel will be rendered here by JS */}
                <svg id="kintsugi-vessel" width="200" height="240" viewBox="0 0 200 240" class="mx-auto drop-shadow-lg">
                  {/* Base vessel */}
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
                    d="M40 60 Q40 20 100 20 Q160 20 160 60 L150 200 Q150 220 100 220 Q50 220 50 200 Z" 
                    fill="url(#vesselGrad)"
                    stroke="#8f7d5e"
                    stroke-width="1"
                  />
                  {/* Cracks will be added dynamically */}
                  <g id="cracks-group"></g>
                </svg>
              </div>
              
              {/* Depth & Gold meters */}
              <div class="space-y-4 mt-8">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-ink-500">{t.depth[lang]}</span>
                    <span id="depth-value" class="text-indigo-700">0%</span>
                  </div>
                  <div class="h-2 bg-ecru-300 rounded-full overflow-hidden">
                    <div id="depth-bar" class="h-full bg-indigo-600 rounded-full transition-all duration-1000" style="width: 0%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-ink-500">{t.gold[lang]}</span>
                    <span id="gold-value" class="text-gold">0%</span>
                  </div>
                  <div class="h-2 bg-ecru-300 rounded-full overflow-hidden">
                    <div id="gold-bar" class="h-full bg-gold rounded-full transition-all duration-1000" style="width: 0%"></div>
                  </div>
                </div>
              </div>
              
              {/* Message */}
              <p id="vessel-message" class="text-ink-500 text-sm mt-6 italic">
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
            </div>
            
            {/* Statistics */}
            <div class="space-y-6">
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <h2 class="text-xl text-indigo-800 mb-4">{t.stats[lang]}</h2>
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-4 bg-ecru-100 rounded-xl">
                    <p id="stat-visits" class="text-3xl text-indigo-700 font-light">0</p>
                    <p class="text-xs text-ink-500">{t.totalVisits[lang]}</p>
                  </div>
                  <div class="text-center p-4 bg-ecru-100 rounded-xl">
                    <p id="stat-streak" class="text-3xl text-gold font-light">0</p>
                    <p class="text-xs text-ink-500">{t.currentStreak[lang]}</p>
                  </div>
                  <div class="text-center p-4 bg-ecru-100 rounded-xl">
                    <p id="stat-longest" class="text-3xl text-indigo-700 font-light">0</p>
                    <p class="text-xs text-ink-500">{t.longestStreak[lang]}</p>
                  </div>
                  <div class="text-center p-4 bg-ecru-100 rounded-xl">
                    <p id="stat-repairs" class="text-3xl text-gold font-light">0</p>
                    <p class="text-xs text-ink-500">{t.totalRepairs[lang]}</p>
                  </div>
                </div>
              </div>
              
              {/* Activity breakdown */}
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <h3 class="text-lg text-indigo-800 mb-4">
                  {lang === 'en' ? 'Activities' : '活動'}
                </h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">🌱</span>
                      <span class="text-ink-600">{t.gardenActions[lang]}</span>
                    </div>
                    <span id="stat-garden" class="text-indigo-700 font-medium">0</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">📚</span>
                      <span class="text-ink-600">{t.studySessions[lang]}</span>
                    </div>
                    <span id="stat-study" class="text-indigo-700 font-medium">0</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">🧘</span>
                      <span class="text-ink-600">{t.tatamiSessions[lang]}</span>
                    </div>
                    <span id="stat-tatami" class="text-indigo-700 font-medium">0</span>
                  </div>
                </div>
              </div>
              
              {/* Cracks summary */}
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-wabi">
                <h3 class="text-lg text-indigo-800 mb-4">{t.cracks[lang]}</h3>
                <div class="flex items-center gap-6">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-gold gold-glow"></div>
                    <span class="text-ink-600">{t.repaired[lang]}:</span>
                    <span id="stat-repaired" class="text-gold font-medium">0</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-ink-400"></div>
                    <span class="text-ink-600">{t.unrepaired[lang]}:</span>
                    <span id="stat-unrepaired" class="text-ink-600 font-medium">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div class="text-center mt-12">
            <a href={`/check-in?lang=${lang}`} class="inline-block px-8 py-4 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors">
              {t.continue[lang]}
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
                <KintsugiVessel />
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
                {t.ios.steps[lang].map((item) => (
                  <li class="flex items-start gap-4">
                    <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-700 font-medium">
                      {item.step}
                    </div>
                    <div class="flex-1 pt-1">
                      <p class="text-ink-700">{item.text}</p>
                      {item.detail && <p class="text-xs text-ink-400 mt-1">{item.detail}</p>}
                    </div>
                    <div class="w-10 h-10 bg-ecru-200 rounded-lg flex items-center justify-center text-indigo-600 font-medium">
                      {item.icon}
                    </div>
                  </li>
                ))}
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
// API Routes
// ========================================

// API: Get Morita guidance (Gemini AI)
app.post('/api/morita/guidance', async (c) => {
  const { emotion, lang = 'en' } = await c.req.json()
  const apiKey = c.env.GEMINI_API_KEY
  
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
      ? `You are a Morita therapy guide. Morita therapy is a Japanese approach that teaches accepting anxiety and acting anyway.
Key principles:
- Accept emotions as they are (Arugamama/あるがまま)
- Separate feelings from actions
- Focus on purpose-driven action, not eliminating anxiety
- Emotions are like weather - you can't control them, but you can act despite them

Respond warmly and briefly (2-3 sentences). Acknowledge the emotion, then gently guide toward small action.
Do NOT try to fix or eliminate the emotion. Never say "don't worry" or "calm down".`
      : `あなたは森田療法のガイドです。森田療法は、不安を受け入れながら行動することを教える日本のアプローチです。
核心原則：
- 感情をあるがままに受け入れる
- 感情と行動を分離する
- 不安の除去ではなく、目的本位の行動に集中
- 感情は天気のようなもの - コントロールできないが、それでも行動できる

温かく簡潔に（2〜3文で）応答してください。感情を認め、小さな行動へ優しく導いてください。
感情を修正したり除去しようとしないでください。「心配しないで」「落ち着いて」などは言わないでください。`

    const prompt = lang === 'en'
      ? `The user shared this feeling: "${emotion}". Respond as a Morita therapy guide.`
      : `ユーザーがこの感情を共有しました：「${emotion}」。森田療法のガイドとして応答してください。`

    const guidance = await callGemini(apiKey, prompt, systemPrompt)
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
  const lang = (c.req.query('lang') || 'en') as Language
  const apiKey = c.env.GEMINI_API_KEY
  
  // Classic koans as fallback
  const classicKoans = [
    { en: "Two hands clap and there is a sound. What is the sound of one hand?", ja: "両手を打てば音がする。では、片手の音は？" },
    { en: "Does the wind move the flag, or does the flag move the wind?", ja: "風が旗を動かすのか、旗が風を動かすのか。" },
    { en: "Before you were born, who were you?", ja: "あなたが生まれる前、あなたは何者だったか。" },
    { en: "Show me your face before your parents were born.", ja: "父母未生以前、本来の面目を見せよ。" },
    { en: "What is the color of wind?", ja: "風に色はあるか。" }
  ]
  
  if (!apiKey) {
    const koan = classicKoans[Math.floor(Math.random() * classicKoans.length)]
    return c.json({ text: koan[lang] })
  }
  
  try {
    const systemPrompt = lang === 'en'
      ? `You are a Zen master. Create ONE original koan (Zen riddle) that:
- Is brief (1-2 sentences)
- Has no logical answer
- Points to the nature of mind or reality
- Uses simple, natural imagery
- Is thought-provoking but not confusing
Just respond with the koan itself, nothing else.`
      : `あなたは禅師です。以下の条件でオリジナルの公案を一つ作ってください：
- 短く（1〜2文）
- 論理的な答えがない
- 心や現実の本質を指し示す
- シンプルで自然なイメージを使う
- 考えさせられるが、混乱させない
公案だけを返してください。説明は不要です。`

    const prompt = lang === 'en' ? 'Create a Zen koan.' : '公案を作ってください。'
    const koan = await callGemini(apiKey, prompt, systemPrompt)
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
  
  if (!apiKey) {
    const langFallbacks = fallbacks[lang as keyof typeof fallbacks] || fallbacks.en
    return c.json({ reflection: langFallbacks[Math.floor(Math.random() * langFallbacks.length)] })
  }
  
  try {
    const qType = questionTypes[step as keyof typeof questionTypes] || questionTypes[1]
    
    const systemPrompt = lang === 'en'
      ? `You are a Naikan therapy guide. Naikan is a Japanese self-reflection method focusing on three questions about relationships.
Respond warmly and briefly (1-2 sentences). 
- Acknowledge what they shared
- Gently highlight the connection/relationship they described
- Do NOT give advice or try to fix anything
- Be gentle, accepting, non-judgmental`
      : `あなたは内観法のガイドです。内観は、人間関係についての3つの問いに焦点を当てた日本の自己内省法です。
温かく簡潔に（1〜2文で）応答してください。
- 共有されたことを認める
- 描かれた繋がり・関係性を優しく強調する
- アドバイスや修正をしない
- 優しく、受容的で、判断しない態度で`

    const prompt = lang === 'en'
      ? `The user reflected on what they ${qType.en} ${person}: "${userResponse}". Respond briefly as a Naikan guide.`
      : `ユーザーは${person}${qType.ja}について振り返りました：「${userResponse}」。内観ガイドとして簡潔に応答してください。`

    const reflection = await callGemini(apiKey, prompt, systemPrompt)
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

export default app
