import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { translations, getLanguage, type Language } from './i18n'
import { Header, Footer, RoomCard, WeatherIcon, KintsugiVessel, LanguageSwitcher } from './components'

// Types
type Bindings = {}
type Variables = {}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

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
  
  return c.render(
    <div class="min-h-screen bg-ecru flex flex-col" data-lang={lang}>
      <Header currentLang={lang} roomName={lang === 'en' ? 'STUDY' : '書斎 STUDY'} roomIcon="📚" />

      {/* Content */}
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="max-w-2xl w-full">
          <div class="text-center mb-8">
            <h1 class="text-3xl text-indigo-800 mb-2">{tx('study', 'title', lang)} — Deep Reflection</h1>
            <p class="text-ink-500">{tx('study', 'subtitle', lang)}</p>
          </div>
          
          {/* Chat Interface */}
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-wabi-lg overflow-hidden">
            <div id="naikan-chat" class="h-96 overflow-y-auto p-6 space-y-4">
              {/* Initial message */}
              <div class="chat-bubble bg-ecru-200 p-4 max-w-[80%]">
                <p class="text-ink-700 text-sm mb-1">
                  <span class="text-gold">{tx('study', 'guideName', lang)}</span>
                </p>
                <p class="text-ink-600">
                  {tx('study', 'q1', lang)}<br/>
                  <span class="text-xs text-ink-400">{tx('study', 'q1Hint', lang)}</span>
                </p>
              </div>
            </div>
            
            {/* Input */}
            <div class="border-t border-ecru-300 p-4">
              <div class="flex gap-3">
                <input 
                  type="text" 
                  id="naikan-input"
                  placeholder={tx('study', 'inputPlaceholder', lang)}
                  class="flex-1 px-4 py-3 bg-ecru-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
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
            <p class="text-ink-400 text-sm">{tx('study', 'question', lang)} 1 / 3</p>
            <div class="flex justify-center gap-2 mt-2">
              <div class="w-3 h-3 rounded-full bg-gold"></div>
              <div class="w-3 h-3 rounded-full bg-ecru-300"></div>
              <div class="w-3 h-3 rounded-full bg-ecru-300"></div>
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

// ========================================
// API Routes
// ========================================

// API: Get Morita guidance
app.post('/api/morita/guidance', async (c) => {
  const { emotion, lang = 'en' } = await c.req.json()
  
  const responses = {
    en: [
      "Feeling anxious? That's natural for a human being. So, what will your hands do?",
      "You don't need to erase that emotion. Emotions are like clouds in the sky. Action continues on the ground.",
      "Arugamama — Feeling and doing are separate things.",
      "Can you move your hands just once, while carrying that anxiety?",
      "Emotions are like weather. You can't change them. But you can carry an umbrella."
    ],
    ja: [
      "不安ですね。それは人間として自然です。では、手は何をしますか？",
      "その感情を消す必要はありません。感情は空の雲のようなもの。行動は地上で続きます。",
      "あるがまま (Arugamama) — 感じることと、することは別です。",
      "不安を抱えたまま、一つだけ手を動かしてみませんか？",
      "感情は天気。変えられません。でも、傘をさすことはできます。"
    ]
  }
  
  const langResponses = responses[lang as keyof typeof responses] || responses.en
  const response = langResponses[Math.floor(Math.random() * langResponses.length)]
  
  return c.json({ guidance: response, emotion })
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

// API: Get Zen Koan
app.get('/api/zen/koan', (c) => {
  const lang = (c.req.query('lang') || 'en') as Language
  
  const koans = [
    {
      en: "Two hands clap and there is a sound. What is the sound of one hand?",
      ja: "両手を打てば音がする。では、片手の音は？"
    },
    {
      en: "Does the wind move the flag, or does the flag move the wind?",
      ja: "風が旗を動かすのか、旗が風を動かすのか。"
    },
    {
      en: "Before you were born, who were you?",
      ja: "あなたが生まれる前、あなたは何者だったか。"
    },
    {
      en: "Show me your face before your parents were born.",
      ja: "鏡を見ずに、自分の顔を見なさい。"
    },
    {
      en: "If bamboo falls in a grove with no one to hear, is there sound?",
      ja: "竹林の中で竹が倒れる。聞く者がいなければ、音はあるか。"
    }
  ]
  
  const koan = koans[Math.floor(Math.random() * koans.length)]
  return c.json({ text: koan[lang] })
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
