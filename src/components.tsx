/**
 * KINTSUGI MIND - Shared Components
 */

import type { Language } from './i18n'

// Language Switcher Component
export const LanguageSwitcher = ({ currentLang }: { currentLang: Language }) => {
  return (
    <div class="flex items-center bg-ecru-200 rounded-full p-1">
      <a 
        href="?lang=en"
        class={`px-3 py-1 text-sm rounded-full transition-all ${
          currentLang === 'en' 
            ? 'bg-indigo-800 text-ecru' 
            : 'text-ink-600 hover:text-indigo-800'
        }`}
      >
        EN
      </a>
      <a 
        href="?lang=ja"
        class={`px-3 py-1 text-sm rounded-full transition-all ${
          currentLang === 'ja' 
            ? 'bg-indigo-800 text-ecru' 
            : 'text-ink-600 hover:text-indigo-800'
        }`}
      >
        日本語
      </a>
    </div>
  )
}

// Header Component
export const Header = ({ 
  currentLang, 
  variant = 'default',
  roomName,
  roomIcon
}: { 
  currentLang: Language
  variant?: 'default' | 'fixed' | 'transparent'
  roomName?: string
  roomIcon?: string
}) => {
  const baseClass = variant === 'fixed' 
    ? 'fixed top-0 left-0 right-0 z-50 bg-ecru/80 backdrop-blur-sm border-b border-wabi'
    : variant === 'transparent'
    ? 'absolute top-0 left-0 right-0 z-10'
    : 'bg-ecru/80 backdrop-blur-sm border-b border-wabi'

  const textClass = variant === 'transparent' 
    ? 'text-ecru/80' 
    : 'text-indigo-800'

  return (
    <header class={baseClass}>
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href={`/?lang=${currentLang}`} class="flex items-center gap-3">
          <div class={`w-8 h-8 rounded-full gradient-gold ${variant === 'transparent' ? 'opacity-80' : ''}`}></div>
          <span class={`text-xl font-medium ${textClass}`}>KINTSUGI MIND</span>
        </a>
        
        <div class="flex items-center gap-4">
          {roomName && roomIcon && (
            <div class={`flex items-center gap-2 ${variant === 'transparent' ? 'text-ecru/60' : 'text-ink-600'}`}>
              <span class="text-2xl">{roomIcon}</span>
              <span class="font-jp hidden sm:inline">{roomName}</span>
            </div>
          )}
          
          {variant !== 'transparent' && (
            <nav class="hidden md:flex items-center gap-6 text-ink-600">
              <a href={`/?lang=${currentLang}#about`} class="hover:text-gold transition-colors">
                {currentLang === 'en' ? 'About' : '概要'}
              </a>
              <a href={`/?lang=${currentLang}#philosophy`} class="hover:text-gold transition-colors">
                {currentLang === 'en' ? 'Philosophy' : '哲学'}
              </a>
              <a href={`/profile?lang=${currentLang}`} class="hover:text-gold transition-colors flex items-center gap-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{currentLang === 'en' ? 'My Vessel' : '器'}</span>
              </a>
            </nav>
          )}
          
          <LanguageSwitcher currentLang={currentLang} />
          
          {variant === 'fixed' && (
            <a 
              href={`/check-in?lang=${currentLang}`} 
              class="hidden md:block px-5 py-2 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors"
            >
              {currentLang === 'en' ? 'Begin' : '始める'}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}

// Footer Component
export const Footer = ({ currentLang }: { currentLang: Language }) => {
  return (
    <footer class="py-8 px-6 bg-ink-900 text-ecru-400">
      <div class="max-w-6xl mx-auto text-center">
        <p class="text-sm">© 2024 KINTSUGI MIND — The Japanese Art of Resilience</p>
      </div>
    </footer>
  )
}

// Weather Icon Component
export const WeatherIcon = ({ 
  type, 
  selected = false,
  currentLang,
  size = 'md'
}: { 
  type: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
  selected?: boolean
  currentLang: Language
  size?: 'sm' | 'md' | 'lg'
}) => {
  const icons = {
    sunny: '☀️',
    cloudy: '⛅',
    rainy: '🌧️',
    stormy: '⛈️'
  }
  
  const titles = {
    sunny: { en: 'Clear & Calm', ja: '晴れ' },
    cloudy: { en: 'Slightly Cloudy', ja: '曇り' },
    rainy: { en: 'Feeling Down', ja: '雨' },
    stormy: { en: 'Overwhelmed', ja: '嵐' }
  }
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  }
  
  const bgClass = type === 'sunny' ? 'weather-sun' 
    : type === 'cloudy' ? 'weather-cloudy'
    : type === 'stormy' ? 'weather-storm'
    : 'bg-gray-200'

  return (
    <a 
      href={`/check-in?weather=${type}&lang=${currentLang}`}
      class={`weather-icon ${sizeClasses[size]} ${bgClass} flex items-center justify-center rounded-full transition-all hover:scale-110 ${
        selected ? 'selected ring-2 ring-gold ring-offset-2' : ''
      }`}
      title={titles[type][currentLang]}
    >
      {icons[type]}
    </a>
  )
}

// Room Card Component
export const RoomCard = ({
  room,
  currentLang
}: {
  room: 'garden' | 'study' | 'tatami'
  currentLang: Language
}) => {
  const config = {
    garden: {
      icon: '🌱',
      gradient: 'from-green-200 to-green-400',
      title: 'GARDEN',
      subtitle: { en: 'The Garden — Morita Therapy', ja: '庭 ― 森田療法' },
      description: {
        en: "Don't eliminate anxiety — act alongside it. Separate emotions from actions and live purpose-driven.",
        ja: '不安を消すのではなく、不安とともに行動する。感情と行動を分離し、「目的本位」の生き方へ。'
      },
      tags: ['Arugamama', 'Action']
    },
    study: {
      icon: '📚',
      gradient: 'from-amber-200 to-amber-400',
      title: 'STUDY',
      subtitle: { en: 'The Study — Naikan', ja: '書斎 ― 内観法' },
      description: {
        en: 'Rediscover your connection to the world through three questions. Visualize that you are not alone.',
        ja: '3つの問いで自分と世界の繋がりを再発見。孤独ではないことを、縁の図として可視化します。'
      },
      tags: ['Kansha', 'Connection']
    },
    tatami: {
      icon: '🧘',
      gradient: 'from-indigo-200 to-indigo-400',
      title: 'TATAMI',
      subtitle: { en: 'The Tatami Room — Zen', ja: '座敷 ― 禅' },
      description: {
        en: 'Stop thinking and return to bodily sensations. Breathe with haptic feedback and contemplate koans.',
        ja: '思考を止め、身体感覚に戻る。デバイスの振動に合わせた呼吸と、答えのない公案が気づきを促します。'
      },
      tags: ['Mu', 'Stillness']
    }
  }

  const c = config[room]

  return (
    <a href={`/${room}?lang=${currentLang}`} class="room-card bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi cursor-pointer block">
      <div class={`w-16 h-16 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-3xl mb-6`}>
        {c.icon}
      </div>
      <h3 class="text-2xl text-indigo-800 mb-2">{c.title}</h3>
      <p class="text-gold text-sm mb-4 font-jp">{c.subtitle[currentLang]}</p>
      <p class="text-ink-600 text-sm mb-4">{c.description[currentLang]}</p>
      <div class="flex flex-wrap gap-2">
        {c.tags.map(tag => (
          <span class="px-3 py-1 bg-ecru-200 rounded-full text-xs text-ink-600">{tag}</span>
        ))}
      </div>
    </a>
  )
}

// Kintsugi Vessel SVG
export const KintsugiVessel = () => {
  return (
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
  )
}
