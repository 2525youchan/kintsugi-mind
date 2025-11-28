import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'

// Types
type Bindings = {
  // Future D1 Database binding
  // DB: D1Database;
}

type Variables = {
  // Session data etc.
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Middleware
app.use('*', cors())
app.use(renderer)

// ========================================
// Pages
// ========================================

// Home / Entrance - The Tea House
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-ecru">
      {/* Header */}
      <header class="fixed top-0 left-0 right-0 z-50 bg-ecru/80 backdrop-blur-sm border-b border-wabi">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full gradient-gold"></div>
            <span class="text-xl font-medium text-indigo-800">KINTSUGI MIND</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-ink-600">
            <a href="#about" class="hover:text-gold transition-colors">About</a>
            <a href="#philosophy" class="hover:text-gold transition-colors">Philosophy</a>
            <a href="/check-in" class="px-5 py-2 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors">
              Begin
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section class="pt-32 pb-20 px-6">
        <div class="max-w-4xl mx-auto text-center">
          <p class="text-gold font-medium mb-4 animate-fade-in">日本発：回復と調和のメンタルヘルス</p>
          <h1 class="text-5xl md:text-7xl font-light text-indigo-800 mb-8 leading-tight animate-slide-up">
            Your Scars<br />
            <span class="text-gradient-gold font-medium">Make You Beautiful</span>
          </h1>
          <p class="text-xl text-ink-600 max-w-2xl mx-auto mb-12 animate-slide-up" style="animation-delay: 0.2s">
            古来より伝わる日本の知恵 ― 森田療法・内観法・禅 ― をAIが現代に届ける、新しいウェルビーイングの形。
          </p>
          
          {/* Weather Check-in Preview */}
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-wabi max-w-md mx-auto animate-slide-up" style="animation-delay: 0.4s">
            <p class="text-indigo-700 mb-6 font-jp">今の心の天気は？</p>
            <p class="text-ink-500 text-sm mb-8">How is your inner weather today?</p>
            <div class="flex justify-center gap-6">
              <a href="/check-in?weather=sunny" class="weather-icon w-14 h-14 weather-sun flex items-center justify-center text-2xl hover:scale-110 transition-transform" title="Clear">
                ☀️
              </a>
              <a href="/check-in?weather=cloudy" class="weather-icon w-14 h-14 weather-cloudy flex items-center justify-center text-2xl hover:scale-110 transition-transform" title="Cloudy">
                ⛅
              </a>
              <a href="/check-in?weather=rainy" class="weather-icon w-14 h-14 flex items-center justify-center text-2xl hover:scale-110 transition-transform" title="Rainy">
                🌧️
              </a>
              <a href="/check-in?weather=stormy" class="weather-icon w-14 h-14 weather-storm flex items-center justify-center text-2xl hover:scale-110 transition-transform" title="Stormy">
                ⛈️
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" class="py-20 px-6 bg-gradient-to-b from-ecru to-ecru-300">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl md:text-4xl text-indigo-800 text-center mb-4">The Tea House Architecture</h2>
          <p class="text-ink-500 text-center mb-16 max-w-2xl mx-auto">
            心の茶室 ― あなたの状態に合わせて、最適な「部屋」へご案内します。
          </p>
          
          <div class="grid md:grid-cols-3 gap-8">
            {/* GARDEN Room */}
            <a href="/garden" class="room-card bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi cursor-pointer block">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center text-3xl mb-6">
                🌱
              </div>
              <h3 class="text-2xl text-indigo-800 mb-2">GARDEN</h3>
              <p class="text-gold text-sm mb-4 font-jp">庭 ― 森田療法</p>
              <p class="text-ink-600 text-sm mb-4">
                不安を消すのではなく、不安とともに行動する。感情と行動を分離し、「目的本位」の生き方へ。
              </p>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-ecru-200 rounded-full text-xs text-ink-600">Arugamama</span>
                <span class="px-3 py-1 bg-ecru-200 rounded-full text-xs text-ink-600">Action</span>
              </div>
            </a>

            {/* STUDY Room */}
            <a href="/study" class="room-card bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi cursor-pointer block">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-3xl mb-6">
                📚
              </div>
              <h3 class="text-2xl text-indigo-800 mb-2">STUDY</h3>
              <p class="text-gold text-sm mb-4 font-jp">書斎 ― 内観法</p>
              <p class="text-ink-600 text-sm mb-4">
                3つの問いで自分と世界の繋がりを再発見。孤独ではないことを、縁の図として可視化します。
              </p>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-ecru-200 rounded-full text-xs text-ink-600">Kansha</span>
                <span class="px-3 py-1 bg-ecru-200 rounded-full text-xs text-ink-600">Connection</span>
              </div>
            </a>

            {/* TATAMI Room */}
            <a href="/tatami" class="room-card bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi cursor-pointer block">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center text-3xl mb-6">
                🧘
              </div>
              <h3 class="text-2xl text-indigo-800 mb-2">TATAMI</h3>
              <p class="text-gold text-sm mb-4 font-jp">座敷 ― 禅</p>
              <p class="text-ink-600 text-sm mb-4">
                思考を止め、身体感覚に戻る。デバイスの振動に合わせた呼吸と、答えのない公案が気づきを促します。
              </p>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-ecru-200 rounded-full text-xs text-ink-600">Mu</span>
                <span class="px-3 py-1 bg-ecru-200 rounded-full text-xs text-ink-600">Stillness</span>
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
              <h2 class="text-3xl text-indigo-800 mb-6">No Fixing Needed</h2>
              <p class="text-ink-600 mb-4">
                西洋的な「修正・コントロール」のアプローチに疲れていませんか？
              </p>
              <p class="text-ink-600 mb-4">
                KINTSUGI MINDは、心を「直す」のではなく、あるがまま「使う」ことを提案します。
              </p>
              <p class="text-ink-600">
                金継ぎの器のように、傷を否定せず、それを美として昇華する ― それが私たちのウェルビーイングです。
              </p>
            </div>
            <div class="flex justify-center">
              {/* Kintsugi Vessel Visualization */}
              <div class="relative">
                <svg width="200" height="240" viewBox="0 0 200 240" class="drop-shadow-lg">
                  {/* Vessel body */}
                  <path 
                    d="M40 60 Q40 20 100 20 Q160 20 160 60 L150 200 Q150 220 100 220 Q50 220 50 200 Z" 
                    fill="url(#vesselGradient)"
                    stroke="#8f7d5e"
                    stroke-width="1"
                  />
                  {/* Golden cracks */}
                  <path d="M80 40 L75 80 L85 120 L70 160" stroke="#c9a227" stroke-width="3" fill="none" class="gold-glow"/>
                  <path d="M120 50 L130 90 L115 130" stroke="#c9a227" stroke-width="3" fill="none" class="gold-glow"/>
                  <path d="M90 140 L110 180 L95 210" stroke="#c9a227" stroke-width="2" fill="none" class="gold-glow"/>
                  
                  <defs>
                    <linearGradient id="vesselGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#d4c4b0"/>
                      <stop offset="50%" style="stop-color:#c9b99c"/>
                      <stop offset="100%" style="stop-color:#a89880"/>
                    </linearGradient>
                  </defs>
                </svg>
                <p class="text-center text-sm text-ink-500 mt-4 italic">
                  "Your scars make you beautiful"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-20 px-6 bg-indigo-800 text-ecru">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl mb-6">Begin Your Journey</h2>
          <p class="text-ecru-300 mb-8">
            不安があっても、美しく強く生きられる。<br />
            今日から、あなたの金継ぎを始めましょう。
          </p>
          <a href="/check-in" class="inline-block px-8 py-4 bg-gold text-ink rounded-full hover:bg-gold-400 transition-colors font-medium">
            Enter the Tea House
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer class="py-8 px-6 bg-ink-900 text-ecru-400">
        <div class="max-w-6xl mx-auto text-center">
          <p class="text-sm">© 2024 KINTSUGI MIND — The Japanese Art of Resilience</p>
        </div>
      </footer>
    </div>,
    { title: 'KINTSUGI MIND — The Japanese Art of Resilience' }
  )
})

// Check-in Page
app.get('/check-in', (c) => {
  const weather = c.req.query('weather') || ''
  
  return c.render(
    <div class="min-h-screen bg-ecru flex flex-col">
      {/* Header */}
      <header class="bg-ecru/80 backdrop-blur-sm border-b border-wabi">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full gradient-gold"></div>
            <span class="text-xl font-medium text-indigo-800">KINTSUGI MIND</span>
          </a>
        </div>
      </header>

      {/* Check-in Content */}
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="max-w-lg w-full">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi-lg text-center">
            <p class="text-gold font-medium mb-2">心の茶室へようこそ</p>
            <h1 class="text-2xl text-indigo-800 mb-8">Welcome to the Tea House</h1>
            
            <p class="text-ink-600 mb-2 font-jp text-lg">今の心の天気はどうですか？</p>
            <p class="text-ink-400 text-sm mb-8">How is your inner weather?</p>
            
            <div id="weather-selection" class="flex justify-center gap-4 mb-8">
              <button 
                data-weather="sunny"
                class={`weather-icon w-16 h-16 weather-sun flex items-center justify-center text-3xl rounded-full transition-all ${weather === 'sunny' ? 'selected ring-2 ring-gold ring-offset-2' : ''}`}
                title="Clear & Calm"
              >
                ☀️
              </button>
              <button 
                data-weather="cloudy"
                class={`weather-icon w-16 h-16 weather-cloudy flex items-center justify-center text-3xl rounded-full transition-all ${weather === 'cloudy' ? 'selected ring-2 ring-gold ring-offset-2' : ''}`}
                title="Slightly Cloudy"
              >
                ⛅
              </button>
              <button 
                data-weather="rainy"
                class={`weather-icon w-16 h-16 bg-gray-200 flex items-center justify-center text-3xl rounded-full transition-all ${weather === 'rainy' ? 'selected ring-2 ring-gold ring-offset-2' : ''}`}
                title="Feeling Down"
              >
                🌧️
              </button>
              <button 
                data-weather="stormy"
                class={`weather-icon w-16 h-16 weather-storm flex items-center justify-center text-3xl rounded-full transition-all ${weather === 'stormy' ? 'selected ring-2 ring-gold ring-offset-2' : ''}`}
                title="Overwhelmed"
              >
                ⛈️
              </button>
            </div>
            
            <div id="weather-message" class="min-h-[80px] mb-6">
              {weather && (
                <div class="animate-fade-in">
                  {weather === 'sunny' && (
                    <p class="text-ink-600">穏やかな日ですね。この調和を大切にしましょう。<br/>
                    <span class="text-sm text-ink-400">A calm day. Let's cherish this harmony.</span></p>
                  )}
                  {weather === 'cloudy' && (
                    <p class="text-ink-600">少し曇り空。それも自然なことです。<br/>
                    <span class="text-sm text-ink-400">A bit cloudy. That's natural too.</span></p>
                  )}
                  {weather === 'rainy' && (
                    <p class="text-ink-600">雨の日は、雨の中を歩きましょう。<br/>
                    <span class="text-sm text-ink-400">On rainy days, let's walk in the rain.</span></p>
                  )}
                  {weather === 'stormy' && (
                    <p class="text-ink-600">嵐の中でも、あなたはここにいます。<br/>
                    <span class="text-sm text-ink-400">Even in the storm, you are here.</span></p>
                  )}
                </div>
              )}
            </div>
            
            <div id="room-suggestion" class="space-y-3">
              {weather && (
                <div class="animate-slide-up">
                  <p class="text-sm text-ink-500 mb-4">おすすめの部屋 / Suggested Room</p>
                  {(weather === 'stormy' || weather === 'rainy') && (
                    <a href="/garden" class="block p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">🌱</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800">GARDEN — 庭</p>
                          <p class="text-sm text-ink-500">不安とともに、小さな行動から</p>
                        </div>
                      </div>
                    </a>
                  )}
                  {weather === 'cloudy' && (
                    <a href="/study" class="block p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">📚</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800">STUDY — 書斎</p>
                          <p class="text-sm text-ink-500">繋がりを見つめ直す時間</p>
                        </div>
                      </div>
                    </a>
                  )}
                  {weather === 'sunny' && (
                    <a href="/tatami" class="block p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                        <span class="text-3xl">🧘</span>
                        <div class="text-left">
                          <p class="font-medium text-indigo-800">TATAMI — 座敷</p>
                          <p class="text-sm text-ink-500">静寂の中で、今に還る</p>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {!weather && (
              <p class="text-ink-400 text-sm">天気を選んで、今日の心の状態を教えてください</p>
            )}
          </div>
          
          {/* All Rooms Link */}
          <div class="text-center mt-6">
            <a href="/#philosophy" class="text-indigo-600 hover:text-gold transition-colors text-sm">
              すべての部屋を見る →
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
  return c.render(
    <div class="min-h-screen bg-ecru flex flex-col">
      {/* Header */}
      <header class="bg-ecru/80 backdrop-blur-sm border-b border-wabi z-10">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full gradient-gold"></div>
            <span class="text-xl font-medium text-indigo-800">KINTSUGI MIND</span>
          </a>
          <div class="flex items-center gap-2 text-green-700">
            <span class="text-2xl">🌱</span>
            <span class="font-jp">庭 GARDEN</span>
          </div>
        </div>
      </header>

      {/* Split Screen */}
      <main class="flex-1 flex flex-col md:flex-row">
        {/* SKY Section - Emotions */}
        <section class="flex-1 sky-section p-6 md:p-8 relative flex flex-col">
          <div class="text-center mb-6">
            <h2 class="text-xl text-indigo-700 mb-2">空 — Sky</h2>
            <p class="text-ink-500 text-sm">感情を雲として浮かべる / Let your emotions float as clouds</p>
          </div>
          
          {/* Cloud Input Area */}
          <div class="flex-1 relative" id="cloud-container">
            {/* Clouds will be added here dynamically */}
            <div class="absolute inset-0 flex items-center justify-center opacity-50">
              <p class="text-ink-400 text-center">
                下に不安や感情を入力すると<br/>雲として浮かびます
              </p>
            </div>
          </div>
          
          {/* Emotion Input */}
          <div class="mt-auto">
            <div class="flex gap-3">
              <input 
                type="text" 
                id="emotion-input"
                placeholder="今感じている不安や感情を書いてください..."
                class="flex-1 px-4 py-3 bg-white/80 border border-ecru-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              <button 
                id="add-cloud-btn"
                class="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors"
              >
                浮かべる
              </button>
            </div>
            <p class="text-xs text-ink-400 mt-2 text-center">
              これらの雲は消えません。それで大丈夫です。
            </p>
          </div>
          
          <div class="horizon-line"></div>
        </section>

        {/* GROUND Section - Actions */}
        <section class="flex-1 ground-section p-6 md:p-8 flex flex-col">
          <div class="text-center mb-6">
            <h2 class="text-xl text-green-800 mb-2">地 — Ground</h2>
            <p class="text-ink-500 text-sm">小さな行動を選ぶ / Choose a micro-action</p>
          </div>
          
          {/* AI Guidance */}
          <div id="morita-guidance" class="bg-white/60 rounded-xl p-4 mb-6">
            <p class="text-ink-600 text-sm">
              <span class="text-gold">●</span> 不安ですか。それは人間として自然です。<br/>
              <span class="text-ink-400 text-xs">では、手は何をしますか？</span>
            </p>
          </div>
          
          {/* Micro Actions */}
          <div class="flex-1">
            <p class="text-sm text-ink-500 mb-3">おすすめのMicro-Action:</p>
            <div id="action-list" class="space-y-3">
              <label class="flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                <input type="checkbox" class="w-5 h-5 accent-gold" data-action="cup" />
                <span class="text-ink-700">コップを一つ洗う</span>
                <span class="text-ink-400 text-xs ml-auto">30秒</span>
              </label>
              <label class="flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                <input type="checkbox" class="w-5 h-5 accent-gold" data-action="stand" />
                <span class="text-ink-700">1分だけ立ち上がる</span>
                <span class="text-ink-400 text-xs ml-auto">1分</span>
              </label>
              <label class="flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                <input type="checkbox" class="w-5 h-5 accent-gold" data-action="water" />
                <span class="text-ink-700">水を一杯飲む</span>
                <span class="text-ink-400 text-xs ml-auto">15秒</span>
              </label>
              <label class="flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                <input type="checkbox" class="w-5 h-5 accent-gold" data-action="window" />
                <span class="text-ink-700">窓を開けて外を見る</span>
                <span class="text-ink-400 text-xs ml-auto">30秒</span>
              </label>
            </div>
          </div>
          
          {/* Garden Growth Visualization */}
          <div class="mt-6">
            <div class="flex items-end justify-center gap-2 h-20" id="garden-plants">
              {/* Plants grow here when actions are completed */}
              <div class="text-center text-ink-400 text-sm">
                行動を完了すると、植物が育ちます
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
  return c.render(
    <div class="min-h-screen bg-ecru flex flex-col">
      {/* Header */}
      <header class="bg-ecru/80 backdrop-blur-sm border-b border-wabi">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full gradient-gold"></div>
            <span class="text-xl font-medium text-indigo-800">KINTSUGI MIND</span>
          </a>
          <div class="flex items-center gap-2 text-amber-700">
            <span class="text-2xl">📚</span>
            <span class="font-jp">書斎 STUDY</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main class="flex-1 flex items-center justify-center p-6">
        <div class="max-w-2xl w-full">
          <div class="text-center mb-8">
            <h1 class="text-3xl text-indigo-800 mb-2">内観 — Deep Reflection</h1>
            <p class="text-ink-500">3つの問いで、自分と世界のつながりを見つめ直す</p>
          </div>
          
          {/* Chat Interface */}
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-wabi-lg overflow-hidden">
            <div id="naikan-chat" class="h-96 overflow-y-auto p-6 space-y-4">
              {/* Initial message */}
              <div class="chat-bubble bg-ecru-200 p-4 max-w-[80%]">
                <p class="text-ink-700 text-sm mb-1">
                  <span class="text-gold">内観ガイド</span>
                </p>
                <p class="text-ink-600">
                  今日、誰かの仕事や優しさに助けられた瞬間はありましたか？<br/>
                  <span class="text-xs text-ink-400">どんな小さなことでも構いません。</span>
                </p>
              </div>
            </div>
            
            {/* Input */}
            <div class="border-t border-ecru-300 p-4">
              <div class="flex gap-3">
                <input 
                  type="text" 
                  id="naikan-input"
                  placeholder="思い浮かんだことを書いてください..."
                  class="flex-1 px-4 py-3 bg-ecru-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                <button 
                  id="naikan-send-btn"
                  class="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div class="mt-6 text-center">
            <p class="text-ink-400 text-sm">問い 1 / 3</p>
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
  return c.render(
    <div class="min-h-screen bg-indigo-900 flex flex-col">
      {/* Minimal Header */}
      <header class="absolute top-0 left-0 right-0 z-10">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full gradient-gold opacity-80"></div>
            <span class="text-xl font-medium text-ecru/80">KINTSUGI MIND</span>
          </a>
          <div class="flex items-center gap-2 text-ecru/60">
            <span class="text-2xl">🧘</span>
            <span class="font-jp">座敷 TATAMI</span>
          </div>
        </div>
      </header>

      {/* Zen Space */}
      <main class="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background circles */}
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="mandala-ring w-96 h-96 opacity-10"></div>
          <div class="mandala-ring w-64 h-64 absolute opacity-20" style="animation-direction: reverse; animation-duration: 20s;"></div>
        </div>
        
        <div class="text-center relative z-10">
          <p class="text-ecru/60 mb-8 font-jp">無 — Mu</p>
          
          {/* Breathing Circle */}
          <div id="breathing-circle" class="breathing-circle w-48 h-48 mx-auto flex items-center justify-center mb-8">
            <div class="text-center">
              <p id="breath-instruction" class="text-ecru text-2xl font-light">
                息を吸う
              </p>
              <p class="text-ecru/50 text-sm mt-2">Breathe in</p>
            </div>
          </div>
          
          {/* Start Button */}
          <button 
            id="start-zen-btn"
            class="px-8 py-4 bg-gold/20 border border-gold/40 text-gold rounded-full hover:bg-gold/30 transition-colors mb-8"
          >
            座禅を始める
          </button>
          
          {/* Koan (Hidden until session ends) */}
          <div id="koan-container" class="hidden mt-12 max-w-md mx-auto">
            <p class="text-ecru/40 text-sm mb-4">公案 — Zen Puzzle</p>
            <p id="koan-text" class="text-ecru text-xl italic">
              "両手を打てば音がする。では、片手の音は？"
            </p>
            <p class="text-ecru/40 text-sm mt-4">
              答えを探さないでください。問いと共に歩んでください。
            </p>
          </div>
          
          {/* Haptic Instruction */}
          <p class="text-ecru/40 text-xs mt-12">
            ※ デバイスの振動に合わせて呼吸してください<br/>
            (振動機能をオンにしてください)
          </p>
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
  const { emotion } = await c.req.json()
  
  // Mock responses based on Morita therapy principles
  const responses = [
    "不安ですね。それは人間として自然です。では、手は何をしますか？",
    "その感情を消す必要はありません。感情は空の雲のようなもの。行動は地上で続きます。",
    "あるがまま (Arugamama) — 感じることと、することは別です。",
    "不安を抱えたまま、一つだけ手を動かしてみませんか？",
    "感情は天気。変えられません。でも、傘をさすことはできます。"
  ]
  
  const response = responses[Math.floor(Math.random() * responses.length)]
  
  return c.json({
    guidance: response,
    emotion: emotion
  })
})

// API: Get Naikan questions
app.get('/api/naikan/question', (c) => {
  const step = parseInt(c.req.query('step') || '1')
  
  const questions = {
    1: {
      japanese: "今日、誰かの仕事や優しさに助けられた瞬間はありましたか？",
      english: "Was there a moment today when someone's work or kindness helped you?",
      hint: "コンビニの店員、家族、電車の運転手...どんな小さなことでも。"
    },
    2: {
      japanese: "今日、あなたは世界に何を提供しましたか？",
      english: "What did you offer to the world today?",
      hint: "仕事、笑顔、誰かへの言葉...何でも構いません。"
    },
    3: {
      japanese: "誰かの寛容さに甘えた場面はありましたか？",
      english: "Was there a moment when you relied on someone's tolerance?",
      hint: "これは反省ではなく、繋がりへの気づきです。"
    }
  }
  
  return c.json(questions[step as keyof typeof questions] || questions[1])
})

// API: Get Zen Koan
app.get('/api/zen/koan', (c) => {
  const koans = [
    {
      japanese: "両手を打てば音がする。では、片手の音は？",
      english: "Two hands clap and there is a sound. What is the sound of one hand?"
    },
    {
      japanese: "風が旗を動かすのか、旗が風を動かすのか。",
      english: "Does the wind move the flag, or does the flag move the wind?"
    },
    {
      japanese: "あなたが生まれる前、あなたは何者だったか。",
      english: "Before you were born, who were you?"
    },
    {
      japanese: "鏡を見ずに、自分の顔を見なさい。",
      english: "Show me your face before your parents were born."
    },
    {
      japanese: "竹林の中で竹が倒れる。聞く者がいなければ、音はあるか。",
      english: "If bamboo falls in a grove with no one to hear, is there sound?"
    }
  ]
  
  const koan = koans[Math.floor(Math.random() * koans.length)]
  return c.json(koan)
})

// API: Record action (for garden growth)
app.post('/api/garden/action', async (c) => {
  const { action, completed } = await c.req.json()
  
  // In future: save to D1 database
  // For now, just acknowledge
  
  return c.json({
    success: true,
    action,
    completed,
    message: completed ? "植物が少し育ちました。" : "取り消しました。"
  })
})

export default app
