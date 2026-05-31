/**
 * KINTSUGI MIND - Shared Components
 */

import type { Language } from './i18n'

// Dark Mode Toggle Component
export const DarkModeToggle = () => {
  return (
    <button 
      id="dark-mode-toggle"
      class="dark-mode-toggle flex items-center justify-center"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <span class="icon-sun">☀️</span>
      <span class="icon-moon">🌙</span>
    </button>
  )
}

// Language Switcher Component
export const LanguageSwitcher = ({ currentLang }: { currentLang: Language }) => {
  return (
    <div class="flex items-center bg-ecru-200 dark:bg-[#2d2d2d] rounded-full p-1">
      <a 
        href="?lang=en"
        class={`px-3 py-1 text-sm rounded-full transition-all ${
          currentLang === 'en' 
            ? 'bg-indigo-800 text-ecru' 
            : 'text-ink-600 dark:text-[#a8a29e] hover:text-indigo-800 dark:hover:text-gold'
        }`}
      >
        EN
      </a>
      <a 
        href="?lang=ja"
        class={`px-3 py-1 text-sm rounded-full transition-all ${
          currentLang === 'ja' 
            ? 'bg-indigo-800 text-ecru' 
            : 'text-ink-600 dark:text-[#a8a29e] hover:text-indigo-800 dark:hover:text-gold'
        }`}
      >
        JP
      </a>
    </div>
  )
}

// Mobile Menu Button
const MobileMenuButton = () => {
  return (
    <button 
      id="mobile-menu-btn"
      class="md:hidden shrink-0 p-1.5 text-ink-600 hover:text-gold transition-colors"
      aria-label="Menu"
      onclick="toggleMobileMenu()"
    >
      {/* Hamburger icon */}
      <svg id="menu-icon-open" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      {/* Close icon (hidden by default) */}
      <svg id="menu-icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
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
    ? 'fixed top-0 left-0 right-0 z-50 bg-ecru/80 dark:bg-[#121212]/80 backdrop-blur-sm border-b border-wabi dark:border-[#4a4a4a]'
    : variant === 'transparent'
    ? 'absolute top-0 left-0 right-0 z-10'
    : 'bg-ecru/80 dark:bg-[#121212]/80 backdrop-blur-sm border-b border-wabi dark:border-[#4a4a4a]'

  const textClass = variant === 'transparent' 
    ? 'text-ecru/80' 
    : 'text-indigo-800 dark:text-ecru'

  return (
    <header class={baseClass}>
      <div class="max-w-6xl mx-auto px-3 sm:px-6 py-4 flex items-center justify-between gap-2">
        <a href={`/?lang=${currentLang}`} class="flex items-center gap-2 sm:gap-3 min-w-0">
          <div class={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 aspect-square rounded-full gradient-gold ${variant === 'transparent' ? 'opacity-80' : ''}`}></div>
          <span class={`text-lg sm:text-xl font-medium truncate ${textClass}`}>KINTSUGI MIND</span>
        </a>
        
        <div class="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {roomName && roomIcon && (
            <div class={`hidden sm:flex items-center gap-2 ${variant === 'transparent' ? 'text-ecru/60' : 'text-ink-600'}`}>
              <span class="text-xl sm:text-2xl">{roomIcon}</span>
              <span class="font-jp">{roomName}</span>
            </div>
          )}
          
          {/* Desktop Navigation */}
          {variant !== 'transparent' && (
            <nav class="hidden md:flex items-center gap-6 text-ink-600 dark:text-[#a8a29e]">
              <a href={`/?lang=${currentLang}#about`} class="hover:text-gold transition-colors">
                {currentLang === 'en' ? 'About' : '概要'}
              </a>
              <a href={`/?lang=${currentLang}#philosophy`} class="hover:text-gold transition-colors">
                {currentLang === 'en' ? 'Philosophy' : '哲学'}
              </a>
              <a href={`/pricing?lang=${currentLang}`} class="hover:text-gold transition-colors flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>{currentLang === 'en' ? 'Premium' : 'プレミアム'}</span>
              </a>
              <a href={`/profile?lang=${currentLang}`} class="hover:text-gold transition-colors flex items-center gap-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{currentLang === 'en' ? 'My Vessel' : '器'}</span>
              </a>
            </nav>
          )}
          
          {/* User Avatar / Login Button (rendered by JS based on auth status) */}
          {variant !== 'transparent' && (
            <div id="auth-header-container" class="flex items-center">
              {/* Default: Login button (will be replaced by JS if logged in) */}
              <a 
                href="/api/auth/login/google"
                id="header-login-btn"
                class="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-ink-600 dark:text-[#a8a29e] hover:text-gold transition-colors rounded-full bg-ecru-100 dark:bg-[#2d2d2d] border border-wabi dark:border-[#4a4a4a]"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{currentLang === 'en' ? 'Sign in' : 'ログイン'}</span>
              </a>
              {/* User avatar (hidden by default, shown by JS when logged in) */}
              <a 
                href={`/profile?lang=${currentLang}`}
                id="header-user-avatar"
                class="hidden items-center gap-2"
              >
                <img id="header-user-picture" src="" alt="" class="w-8 h-8 rounded-full border-2 border-gold" />
              </a>
            </div>
          )}
          
          {/* Mobile: Vessel icon link (icon only to save header width on small screens) */}
          {variant !== 'transparent' && (
            <a 
              href={`/profile?lang=${currentLang}`} 
              class="md:hidden flex items-center justify-center w-8 h-8 shrink-0 text-ink-600 dark:text-[#a8a29e] hover:text-gold transition-colors rounded-full bg-ecru-100 dark:bg-[#2d2d2d] border border-wabi dark:border-[#4a4a4a]"
              title={currentLang === 'en' ? 'My Vessel' : '器'}
              aria-label={currentLang === 'en' ? 'My Vessel' : '器'}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
          )}
          
          <LanguageSwitcher currentLang={currentLang} />
          
          {/* Dark Mode Toggle */}
          {variant !== 'transparent' && (
            <button 
              id="dark-mode-toggle"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-ecru-200 dark:bg-[#2d2d2d] border border-wabi dark:border-[#4a4a4a] text-sm hover:scale-110 transition-transform"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              <span class="dark:hidden">🌙</span>
              <span class="hidden dark:inline">☀️</span>
            </button>
          )}
          
          {/* Mobile Menu Button */}
          {variant !== 'transparent' && <MobileMenuButton />}
          
          {/* Desktop: Begin button */}
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
      
      {/* Mobile Menu (hidden by default, toggled by JS) */}
      {variant !== 'transparent' && (
        <div id="mobile-menu" class="hidden md:hidden bg-ecru dark:bg-[#1e1e1e] border-t border-wabi dark:border-[#4a4a4a]">
          <nav class="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
            <a href={`/?lang=${currentLang}#about`} class="text-ink-600 dark:text-[#e8e4dc] hover:text-gold transition-colors py-2">
              {currentLang === 'en' ? 'About' : '概要'}
            </a>
            <a href={`/?lang=${currentLang}#philosophy`} class="text-ink-600 dark:text-[#e8e4dc] hover:text-gold transition-colors py-2">
              {currentLang === 'en' ? 'Philosophy' : '哲学'}
            </a>
            <a href={`/profile?lang=${currentLang}`} class="text-ink-600 dark:text-[#e8e4dc] hover:text-gold transition-colors py-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {currentLang === 'en' ? 'My Vessel' : '器'}
            </a>
            <a href={`/install?lang=${currentLang}`} class="text-ink-600 dark:text-[#e8e4dc] hover:text-gold transition-colors py-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {currentLang === 'en' ? 'Add to Home' : 'ホーム画面に追加'}
            </a>
            <a href={`/pricing?lang=${currentLang}`} class="text-ink-600 dark:text-[#e8e4dc] hover:text-gold transition-colors py-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              {currentLang === 'en' ? 'Premium' : 'プレミアム'}
            </a>
            <a 
              href={`/check-in?lang=${currentLang}`} 
              class="px-5 py-3 bg-indigo-800 text-ecru rounded-full hover:bg-indigo-700 transition-colors text-center"
            >
              {currentLang === 'en' ? 'Begin' : '始める'}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

// Footer Component
export const Footer = ({ currentLang }: { currentLang: Language }) => {
  return (
    <footer class="py-8 px-6 bg-ink-900 dark:bg-[#0a0a0a] text-ecru-400">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <p class="text-sm">{currentLang === 'en' ? '© 2024 KINTSUGI MIND — The Japanese Art of Resilience' : '© 2024 KINTSUGI MIND — 日本発：回復と調和のメンタルヘルス'}</p>
          <a 
            href={`/install?lang=${currentLang}`}
            class="flex items-center gap-2 text-sm text-ecru-400 hover:text-gold transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {currentLang === 'en' ? 'Add to Home Screen' : 'ホーム画面に追加'}
          </a>
        </div>
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
      title: { en: 'GARDEN', ja: '庭 GARDEN' },
      subtitle: { en: 'The Garden — Morita Therapy', ja: '庭 ― 森田療法' },
      description: {
        en: "Don't eliminate anxiety — act alongside it. Separate emotions from actions and live purpose-driven.",
        ja: '不安を消すのではなく、不安とともに行動する。感情と行動を分離し、「目的本位」の生き方へ。'
      },
      tags: { en: ['Arugamama', 'Action'], ja: ['あるがまま', '行動'] }
    },
    study: {
      icon: '📚',
      gradient: 'from-amber-200 to-amber-400',
      title: { en: 'STUDY', ja: '書斎 STUDY' },
      subtitle: { en: 'The Study — Naikan', ja: '書斎 ― 内観法' },
      description: {
        en: 'Rediscover your connection to the world through three questions. Visualize that you are not alone.',
        ja: '3つの問いで自分と世界の繋がりを再発見。孤独ではないことを、縁の図として可視化します。'
      },
      tags: { en: ['Kansha', 'Connection'], ja: ['感謝', '繋がり'] }
    },
    tatami: {
      icon: '🧘',
      gradient: 'from-indigo-200 to-indigo-400',
      title: { en: 'TATAMI', ja: '座敷 TATAMI' },
      subtitle: { en: 'The Tatami Room — Zen', ja: '座敷 ― 禅' },
      description: {
        en: 'Stop thinking and return to bodily sensations. Breathe with haptic feedback and contemplate koans.',
        ja: '思考を止め、身体感覚に戻る。デバイスの振動に合わせた呼吸と、答えのない公案が気づきを促します。'
      },
      tags: { en: ['Mu', 'Stillness'], ja: ['無', '静寂'] }
    }
  }

  const c = config[room]

  return (
    <a href={`/${room}?lang=${currentLang}`} class="room-card bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-2xl p-8 shadow-wabi cursor-pointer block">
      <div class={`w-16 h-16 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-3xl mb-6`}>
        {c.icon}
      </div>
      <h3 class="text-2xl text-indigo-800 dark:text-[#e8e4dc] mb-2">{c.title[currentLang]}</h3>
      <p class="text-gold text-sm mb-4 font-jp">{c.subtitle[currentLang]}</p>
      <p class="text-ink-600 dark:text-[#a8a29e] text-sm mb-4">{c.description[currentLang]}</p>
      <div class="flex flex-wrap gap-2">
        {c.tags[currentLang].map(tag => (
          <span class="px-3 py-1 bg-ecru-200 dark:bg-[#2d2d2d] rounded-full text-xs text-ink-600 dark:text-[#a8a29e]">{tag}</span>
        ))}
      </div>
    </a>
  )
}

// Kintsugi Vessel SVG
export const KintsugiVessel = ({ currentLang = 'en' }: { currentLang?: Language }) => {
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
        {currentLang === 'en' ? '"Your scars make you beautiful"' : '「あなたの傷が、あなたを美しくする」'}
      </p>
    </div>
  )
}
