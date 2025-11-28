/**
 * KINTSUGI MIND - Frontend Application
 * The Japanese Art of Resilience
 */

// ========================================
// Seasonal System - 四季 (Shiki)
// ========================================

const SEASONS = {
  spring: {
    name: { en: 'Spring', ja: '春' },
    emoji: '🌸',
    colors: {
      primary: '#f8b4d9', // cherry blossom pink
      secondary: '#fce7f3',
      accent: '#ec4899'
    },
    messages: {
      en: [
        'Like cherry blossoms, embrace change with grace',
        'Spring rain nourishes new growth',
        'Each day is a fresh beginning'
      ],
      ja: [
        '桜のように、変化を優雅に受け入れて',
        '春の雨が新しい芽を育てる',
        '毎日が新しい始まり'
      ]
    },
    greetings: {
      morning: { en: 'Good morning 🌸', ja: 'おはようございます 🌸' },
      afternoon: { en: 'Good afternoon 🌷', ja: 'こんにちは 🌷' },
      evening: { en: 'Good evening 🌙', ja: 'こんばんは 🌙' }
    },
    bgGradient: 'from-pink-50 to-rose-100 dark:from-pink-950/20 dark:to-rose-950/20'
  },
  summer: {
    name: { en: 'Summer', ja: '夏' },
    emoji: '🌻',
    colors: {
      primary: '#22d3ee',
      secondary: '#e0f2fe',
      accent: '#0891b2'
    },
    messages: {
      en: [
        'Find coolness in the shade of your mind',
        'Like flowing water, let troubles pass',
        'Summer teaches us to slow down'
      ],
      ja: [
        '心の木陰で涼を感じて',
        '水のように、悩みを流して',
        '夏はゆっくりすることを教えてくれる'
      ]
    },
    greetings: {
      morning: { en: 'Good morning 🌻', ja: 'おはようございます 🌻' },
      afternoon: { en: 'Stay cool 🌊', ja: '涼しくお過ごしください 🌊' },
      evening: { en: 'Cool evening 🌙', ja: '涼しい夜を 🌙' }
    },
    bgGradient: 'from-cyan-50 to-sky-100 dark:from-cyan-950/20 dark:to-sky-950/20'
  },
  autumn: {
    name: { en: 'Autumn', ja: '秋' },
    emoji: '🍂',
    colors: {
      primary: '#f97316',
      secondary: '#fff7ed',
      accent: '#ea580c'
    },
    messages: {
      en: [
        'Like falling leaves, release what no longer serves',
        'Autumn invites deep reflection',
        'In letting go, we find peace'
      ],
      ja: [
        '落ち葉のように、手放す勇気を',
        '秋は深い内省を誘う',
        '手放すことで、平和を見つける'
      ]
    },
    greetings: {
      morning: { en: 'Good morning 🍂', ja: 'おはようございます 🍂' },
      afternoon: { en: 'Pleasant autumn day 🍁', ja: '秋の午後をお楽しみください 🍁' },
      evening: { en: 'Cool autumn night 🌙', ja: '秋の夜長を 🌙' }
    },
    bgGradient: 'from-orange-50 to-amber-100 dark:from-orange-950/20 dark:to-amber-950/20'
  },
  winter: {
    name: { en: 'Winter', ja: '冬' },
    emoji: '❄️',
    colors: {
      primary: '#94a3b8',
      secondary: '#f1f5f9',
      accent: '#475569'
    },
    messages: {
      en: [
        'In stillness, find inner warmth',
        'Winter teaches patience and rest',
        'Like snow, let silence bring clarity'
      ],
      ja: [
        '静けさの中に、内なる温もりを',
        '冬は忍耐と休息を教える',
        '雪のように、静寂が明晰さをもたらす'
      ]
    },
    greetings: {
      morning: { en: 'Good morning ❄️', ja: 'おはようございます ❄️' },
      afternoon: { en: 'Stay warm 🍵', ja: '温かくお過ごしください 🍵' },
      evening: { en: 'Cozy evening 🌙', ja: '温かい夜を 🌙' }
    },
    bgGradient: 'from-slate-50 to-gray-100 dark:from-slate-950/20 dark:to-gray-950/20'
  }
};

// Get current season based on date
function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// Get time of day
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

// Get seasonal greeting
function getSeasonalGreeting(lang = 'en') {
  const season = getCurrentSeason();
  const time = getTimeOfDay();
  return SEASONS[season].greetings[time][lang];
}

// Get random seasonal message
function getSeasonalMessage(lang = 'en') {
  const season = getCurrentSeason();
  const messages = SEASONS[season].messages[lang];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Get seasonal info
function getSeasonalInfo() {
  const season = getCurrentSeason();
  return {
    season,
    ...SEASONS[season]
  };
}

// Apply seasonal theme to element
function applySeasonalTheme(element) {
  if (!element) return;
  
  const season = getCurrentSeason();
  const bgGradient = SEASONS[season].bgGradient;
  
  // Add seasonal gradient class
  element.classList.add('bg-gradient-to-br', ...bgGradient.split(' '));
}

// Update seasonal elements on the page
function updateSeasonalElements(lang = 'en') {
  // Update greeting elements
  const greetingEl = document.querySelector('[data-seasonal="greeting"]');
  if (greetingEl) {
    greetingEl.textContent = getSeasonalGreeting(lang);
  }
  
  // Update message elements
  const messageEl = document.querySelector('[data-seasonal="message"]');
  if (messageEl) {
    messageEl.textContent = getSeasonalMessage(lang);
  }
  
  // Update seasonal emoji
  const emojiEl = document.querySelector('[data-seasonal="emoji"]');
  if (emojiEl) {
    const season = getCurrentSeason();
    emojiEl.textContent = SEASONS[season].emoji;
  }
  
  // Update season name
  const seasonNameEl = document.querySelector('[data-seasonal="name"]');
  if (seasonNameEl) {
    const season = getCurrentSeason();
    seasonNameEl.textContent = SEASONS[season].name[lang];
  }
}

// ========================================
// Subscription System
// ========================================

let currentSubscription = { plan: 'free', limits: {}, usage: {} };

// Get subscription status
async function getSubscription() {
  try {
    const response = await fetch('/api/subscription');
    const data = await response.json();
    currentSubscription = data;
    return data;
  } catch (e) {
    console.error('Failed to get subscription:', e);
    return currentSubscription;
  }
}

// Check if feature is available
async function checkFeature(feature) {
  try {
    const response = await fetch(`/api/subscription/check/${feature}`);
    return await response.json();
  } catch (e) {
    console.error('Failed to check feature:', e);
    return { allowed: true, remaining: -1, limit: -1 };
  }
}

// Record feature usage
async function useFeature(feature) {
  try {
    const response = await fetch(`/api/subscription/use/${feature}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (e) {
    console.error('Failed to record usage:', e);
    return { success: false };
  }
}

// Show upgrade modal
function showUpgradeModal(feature, lang = 'en') {
  const messages = {
    ai_chat: {
      en: "You've reached your daily AI conversation limit.",
      ja: '本日のAI対話回数が上限に達しました。'
    },
    checkin: {
      en: "You've reached your daily check-in limit.",
      ja: '本日のチェックイン回数が上限に達しました。'
    },
    default: {
      en: 'This feature requires Premium.',
      ja: 'この機能はプレミアムで利用できます。'
    }
  };
  
  const message = messages[feature] || messages.default;
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'upgrade-modal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fade-in">
      <div class="text-center">
        <div class="text-4xl mb-4">✨</div>
        <h3 class="text-xl text-indigo-800 dark:text-[#e8e4dc] mb-2">
          ${lang === 'en' ? 'Upgrade to Premium' : 'プレミアムにアップグレード'}
        </h3>
        <p class="text-ink-500 dark:text-[#78716c] mb-6">
          ${message[lang]}
        </p>
        <div class="space-y-3">
          <a 
            href="/pricing?lang=${lang}" 
            class="block w-full px-6 py-3 bg-gold text-ink font-medium rounded-full hover:bg-gold-400 transition-colors"
          >
            ${lang === 'en' ? 'View Plans' : 'プランを見る'}
          </a>
          <button 
            onclick="closeUpgradeModal()"
            class="block w-full px-6 py-3 text-ink-500 dark:text-[#78716c] hover:text-ink-700 dark:hover:text-[#a8a29e] transition-colors"
          >
            ${lang === 'en' ? 'Maybe Later' : 'あとで'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeUpgradeModal();
  });
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.remove();
}

// ========================================
// Authentication System
// ========================================

let currentUser = null;

// Check authentication status on page load
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (data.authenticated && data.user) {
      currentUser = data.user;
      updateAuthUI(data.user);
      
      // If just logged in, sync local data to server
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth_success')) {
        await syncLocalDataToServer();
        // Remove auth_success param from URL
        urlParams.delete('auth_success');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  } catch (e) {
    console.error('Auth status check failed:', e);
  }
}

// Update UI based on auth status
function updateAuthUI(user) {
  const lang = getLang();
  
  // Header login button
  const loginBtn = document.getElementById('header-login-btn');
  const userAvatar = document.getElementById('header-user-avatar');
  const userPicture = document.getElementById('header-user-picture');
  
  if (loginBtn && userAvatar && userPicture && user) {
    loginBtn.classList.add('hidden');
    userAvatar.classList.remove('hidden');
    userAvatar.classList.add('flex');
    userPicture.src = user.picture;
    userPicture.alt = user.name;
  }
  
  // Profile page account banner
  const loggedOutBanner = document.getElementById('account-logged-out');
  const loggedInBanner = document.getElementById('account-logged-in');
  const userAvatarProfile = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  
  if (loggedOutBanner && loggedInBanner && user) {
    loggedOutBanner.classList.add('hidden');
    loggedInBanner.classList.remove('hidden');
    
    if (userAvatarProfile) userAvatarProfile.src = user.picture;
    if (userName) userName.textContent = user.name;
    if (userEmail) userEmail.textContent = user.email;
  }
  
  // Mobile vessel text update
  const mobileVesselText = document.getElementById('mobile-vessel-text');
  if (mobileVesselText && user) {
    mobileVesselText.textContent = user.name.split(' ')[0]; // First name
  }
}

// Sync local data to server after login
async function syncLocalDataToServer() {
  const localProfile = loadProfile();
  
  try {
    const response = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: localProfile })
    });
    
    if (response.ok) {
      console.log('[Auth] Local data synced to server');
    }
  } catch (e) {
    console.error('Sync failed:', e);
  }
}

// Logout handler
function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      currentUser = null;
      window.location.reload();
    } catch (e) {
      console.error('Logout failed:', e);
    }
  });
}

// ========================================
// Dark Mode System
// ========================================

const DARK_MODE_KEY = 'kintsugi-dark-mode';

// Initialize dark mode on page load (before DOM ready for no flash)
(function initDarkModeEarly() {
  const savedMode = localStorage.getItem(DARK_MODE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedMode === 'dark' || (savedMode === null && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();

// Initialize dark mode toggle after DOM ready
function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  if (!toggle) return;
  
  const isDark = document.documentElement.classList.contains('dark');
  updateDarkModeUI(isDark);
  
  toggle.addEventListener('click', () => {
    const currentlyDark = document.documentElement.classList.contains('dark');
    const newMode = !currentlyDark;
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(DARK_MODE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(DARK_MODE_KEY, 'light');
    }
    
    updateDarkModeUI(newMode);
    
    // Smooth transition feedback
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Vibrate for tactile feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  });
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedMode = localStorage.getItem(DARK_MODE_KEY);
    if (savedMode === null) {
      // Only auto-switch if user hasn't explicitly set preference
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      updateDarkModeUI(e.matches);
    }
  });
}

function updateDarkModeUI(isDark) {
  const toggle = document.getElementById('dark-mode-toggle');
  
  // Update aria attributes
  if (toggle) {
    toggle.setAttribute('aria-pressed', isDark);
    toggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  
  // Update theme icon on profile page
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = isDark ? '🌙' : '☀️';
  }
  
  // Update meta theme color for mobile browsers
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = isDark ? '#121212' : '#1e3a5f';
  }
}

// ========================================
// Kintsugi Profile System (LocalStorage)
// ========================================

const STORAGE_KEY = 'kintsugi-profile';

// Default profile structure
function createDefaultProfile() {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    createdAt: now,
    lastVisit: now,
    cracks: [],
    totalRepairs: 0,
    activities: [],
    stats: {
      totalVisits: 1,
      currentStreak: 1,
      longestStreak: 1,
      gardenActions: 0,
      studySessions: 0,
      tatamiSessions: 0
    }
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function toDateString(date) {
  return date.toISOString().split('T')[0];
}

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Load profile from localStorage
function loadProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load profile:', e);
  }
  return createDefaultProfile();
}

// Save profile to localStorage
function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

// Record a visit and update streak
function recordVisit(profile) {
  const today = toDateString(new Date());
  const lastVisit = profile.lastVisit.split('T')[0];
  
  if (today === lastVisit) {
    return profile; // Same day, no update
  }
  
  const daysDiff = daysBetween(lastVisit, today);
  let newStreak = profile.stats.currentStreak;
  const newCracks = [...profile.cracks];
  
  if (daysDiff === 1) {
    // Consecutive visit
    newStreak += 1;
  } else if (daysDiff > 1) {
    // Streak broken - add absence cracks
    for (let i = 1; i < Math.min(daysDiff, 7); i++) { // Max 7 cracks for absence
      const missedDate = new Date(lastVisit);
      missedDate.setDate(missedDate.getDate() + i);
      newCracks.push({
        id: generateId(),
        type: 'absence',
        date: toDateString(missedDate),
        repaired: false
      });
    }
    newStreak = 1;
  }
  
  return {
    ...profile,
    lastVisit: new Date().toISOString(),
    cracks: newCracks,
    stats: {
      ...profile.stats,
      totalVisits: profile.stats.totalVisits + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(profile.stats.longestStreak, newStreak)
    }
  };
}

// Record anxiety (adds a crack)
function recordAnxiety(profile, text) {
  const newCrack = {
    id: generateId(),
    type: 'anxiety',
    date: new Date().toISOString(),
    text: text,
    repaired: false
  };
  
  return {
    ...profile,
    cracks: [...profile.cracks, newCrack]
  };
}

// Record activity (repairs a crack)
function recordActivityToProfile(profile, type, details = {}) {
  const activity = {
    id: generateId(),
    type,
    date: new Date().toISOString(),
    details
  };
  
  // Repair one unrepaired crack
  const updatedCracks = [...profile.cracks];
  const unrepairedIndex = updatedCracks.findIndex(c => !c.repaired);
  let repairCount = 0;
  
  if (unrepairedIndex !== -1) {
    updatedCracks[unrepairedIndex] = {
      ...updatedCracks[unrepairedIndex],
      repaired: true,
      repairedDate: new Date().toISOString()
    };
    repairCount = 1;
  }
  
  // Update stats
  const stats = { ...profile.stats };
  if (type === 'garden') {
    stats.gardenActions += details.actionCount || 1;
  } else if (type === 'study') {
    stats.studySessions += 1;
  } else if (type === 'tatami') {
    stats.tatamiSessions += 1;
  }
  
  return {
    ...profile,
    cracks: updatedCracks,
    totalRepairs: profile.totalRepairs + repairCount,
    activities: [...profile.activities, activity],
    stats
  };
}

// Calculate vessel visual properties
function calculateVesselVisual(profile) {
  // Depth = activities + cracks + visits
  const depth = Math.min(100,
    (profile.activities.length * 5) +
    (profile.cracks.length * 3) +
    (profile.stats.totalVisits)
  );
  
  // Gold intensity = repair ratio × repair count
  const repairedCount = profile.cracks.filter(c => c.repaired).length;
  const repairRatio = profile.cracks.length > 0
    ? repairedCount / profile.cracks.length
    : 0;
  const goldIntensity = Math.min(100, repairRatio * 50 + profile.totalRepairs * 5);
  
  return { depth, goldIntensity, repairedCount };
}

// Generate crack SVG paths based on vessel type
function generateCrackPaths(cracks, vesselType = 'chawan') {
  // Different crack patterns for each vessel type
  const pathVariationsByType = {
    chawan: [
      (h) => `M${60 + (h % 40)} 40 L${55 + (h % 30)} 80 L${65 + (h % 20)} 120 L${50 + (h % 40)} 160`,
      (h) => `M${100 + (h % 30)} 50 L${110 + (h % 20)} 90 L${95 + (h % 25)} 130`,
      (h) => `M${70 + (h % 30)} 100 L${85 + (h % 20)} 140 L${75 + (h % 25)} 180`,
      (h) => `M${110 + (h % 25)} 70 L${120 + (h % 20)} 110 L${105 + (h % 30)} 150`,
    ],
    tsubo: [
      (h) => `M${80 + (h % 20)} 50 L${75 + (h % 25)} 90 L${85 + (h % 20)} 130 L${70 + (h % 30)} 170`,
      (h) => `M${120 + (h % 15)} 60 L${125 + (h % 20)} 100 L${115 + (h % 25)} 140 L${130 + (h % 15)} 180`,
      (h) => `M${100 + (h % 20)} 80 L${95 + (h % 25)} 120 L${105 + (h % 20)} 160`,
      (h) => `M${90 + (h % 15)} 100 L${85 + (h % 20)} 140 L${95 + (h % 15)} 180 L${88 + (h % 20)} 210`,
    ],
    sara: [
      (h) => `M${50 + (h % 30)} 100 L${60 + (h % 25)} 120 L${45 + (h % 35)} 140 L${55 + (h % 30)} 160`,
      (h) => `M${130 + (h % 30)} 100 L${140 + (h % 20)} 120 L${125 + (h % 25)} 140 L${135 + (h % 30)} 160`,
      (h) => `M${80 + (h % 25)} 95 L${95 + (h % 20)} 115 L${85 + (h % 25)} 135 L${100 + (h % 20)} 155`,
      (h) => `M${100 + (h % 20)} 90 L${110 + (h % 25)} 110 L${95 + (h % 30)} 130`,
    ],
    tokkuri: [
      (h) => `M${95 + (h % 10)} 30 L${90 + (h % 15)} 50 L${100 + (h % 10)} 70`,
      (h) => `M${70 + (h % 20)} 100 L${65 + (h % 25)} 140 L${75 + (h % 20)} 180 L${60 + (h % 30)} 210`,
      (h) => `M${130 + (h % 15)} 100 L${135 + (h % 20)} 140 L${125 + (h % 25)} 180 L${140 + (h % 15)} 210`,
      (h) => `M${100 + (h % 15)} 120 L${95 + (h % 20)} 160 L${105 + (h % 15)} 200`,
    ],
    hachi: [
      (h) => `M${60 + (h % 30)} 70 L${55 + (h % 25)} 110 L${65 + (h % 20)} 150 L${50 + (h % 30)} 190`,
      (h) => `M${140 + (h % 20)} 70 L${145 + (h % 15)} 110 L${135 + (h % 25)} 150 L${150 + (h % 15)} 190`,
      (h) => `M${100 + (h % 25)} 80 L${95 + (h % 20)} 120 L${105 + (h % 25)} 160 L${90 + (h % 30)} 200`,
      (h) => `M${80 + (h % 20)} 100 L${90 + (h % 25)} 140 L${75 + (h % 20)} 180`,
    ]
  };
  
  const pathVariations = pathVariationsByType[vesselType] || pathVariationsByType.chawan;
  
  return cracks.map((crack, index) => {
    // Simple hash from id
    let hash = 0;
    for (let i = 0; i < crack.id.length; i++) {
      hash = ((hash << 5) - hash) + crack.id.charCodeAt(i);
      hash = hash & hash;
    }
    hash = Math.abs(hash);
    
    const pathFn = pathVariations[(index + hash) % pathVariations.length];
    return {
      path: pathFn(hash),
      repaired: crack.repaired,
      type: crack.type
    };
  });
}

// ========================================
// Language & Utility Functions
// ========================================

function getLang() {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang');
  if (lang === 'ja' || lang === 'en') {
    localStorage.setItem('kintsugi-lang', lang);
    return lang;
  }
  
  const stored = localStorage.getItem('kintsugi-lang');
  if (stored === 'ja' || stored === 'en') {
    return stored;
  }
  
  const dataLang = document.querySelector('[data-lang]')?.dataset?.lang;
  if (dataLang) return dataLang;
  
  return 'en';
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function vibrate(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// ========================================
// Translations for dynamic content
// ========================================
const i18n = {
  garden: {
    guidanceResponses: {
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
  },
  study: {
    guideName: { en: 'Naikan Guide', ja: '内観ガイド' },
    questions: {
      1: {
        text: { 
          en: "Was there a moment today when someone's work or kindness helped you?",
          ja: "今日、誰かの仕事や優しさに助けられた瞬間はありましたか？"
        },
        hint: {
          en: "A store clerk, family, train operator... even the smallest things count.",
          ja: "コンビニの店員、家族、電車の運転手...どんな小さなことでも。"
        }
      },
      2: {
        text: {
          en: "What did you offer to the world today?",
          ja: "今日、あなたは世界に何を提供しましたか？"
        },
        hint: {
          en: "Work, a smile, words to someone... anything counts.",
          ja: "仕事、笑顔、誰かへの言葉...何でも構いません。"
        }
      },
      3: {
        text: {
          en: "Was there a moment when you relied on someone's tolerance?",
          ja: "誰かの寛容さに甘えた場面はありましたか？"
        },
        hint: {
          en: "This is not about guilt — it's about awareness of connection.",
          ja: "これは反省ではなく、繋がりへの気づきです。"
        }
      }
    },
    conclusion: {
      title: {
        en: "Thank you. Today's reflection is complete.",
        ja: "ありがとうございます。今日の内観が終わりました。"
      },
      message: {
        en: "You are supported by many connections, and you give much in return. You are not alone.",
        ja: "あなたは多くの縁に支えられ、また多くを与えています。孤独ではありません。"
      },
      quote: {
        en: '"Engi (縁起) — Everything exists within connection"',
        ja: '"縁起 — すべては繋がりの中に"'
      }
    }
  },
  tatami: {
    breatheIn: { en: 'Breathe in', ja: '息を吸う' },
    breatheOut: { en: 'Breathe out', ja: '息を吐く' }
  },
  profile: {
    repairMessage: {
      en: 'A crack has been repaired with gold. Your vessel grows more beautiful.',
      ja: 'ヒビが金で修復されました。あなたの器はより美しくなりました。'
    },
    newCrack: {
      en: 'A new crack has appeared. This is not damage — it is part of your story.',
      ja: '新しいヒビが入りました。これは傷ではありません。あなたの物語の一部です。'
    }
  }
};

// ========================================
// Profile Page Logic
// ========================================

function initProfile() {
  const lang = getLang();
  let profile = loadProfile();
  
  // Record visit
  profile = recordVisit(profile);
  saveProfile(profile);
  
  // Update UI
  updateProfileUI(profile, lang);
  
  // Initialize notification settings
  initNotificationSettings(lang);
  
  // Initialize check-in calendar
  initCheckinCalendar(lang);
}

// ========================================
// Check-in Calendar
// ========================================

const CHECKIN_HISTORY_KEY = 'kintsugi-checkin-history';
const WEATHER_EMOJIS = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  stormy: '⛈️'
};

// Load check-in history from localStorage
function loadCheckinHistory() {
  try {
    const data = localStorage.getItem(CHECKIN_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Save check-in to history
function saveCheckinToHistory(weather, note = '') {
  const history = loadCheckinHistory();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Check if already checked in today
  const existingIndex = history.findIndex(h => h.date === today);
  if (existingIndex >= 0) {
    history[existingIndex] = { date: today, weather, note, timestamp: new Date().toISOString() };
  } else {
    history.push({ date: today, weather, note, timestamp: new Date().toISOString() });
  }
  
  // Keep only last 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const filtered = history.filter(h => new Date(h.date) >= oneYearAgo);
  
  localStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(filtered));
  return filtered;
}

// Get check-ins for a specific month
function getCheckinsForMonth(year, month) {
  const history = loadCheckinHistory();
  return history.filter(h => {
    const date = new Date(h.date);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
}

// Initialize check-in calendar
function initCheckinCalendar(lang) {
  const calendarGrid = document.getElementById('calendar-grid');
  const monthLabel = document.getElementById('calendar-month');
  const prevBtn = document.getElementById('calendar-prev');
  const nextBtn = document.getElementById('calendar-next');
  
  if (!calendarGrid || !monthLabel) return;
  
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth() + 1;
  
  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 
         'July', 'August', 'September', 'October', 'November', 'December'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', 
         '7月', '8月', '9月', '10月', '11月', '12月']
  };
  
  async function renderCalendar(year, month) {
    // Update month label
    monthLabel.textContent = lang === 'ja' 
      ? `${year}年 ${monthNames.ja[month - 1]}`
      : `${monthNames.en[month - 1]} ${year}`;
    
    // Get checkins for this month (try server first, fallback to local)
    let checkins = [];
    let checkinMap = {};
    
    try {
      // Try to get from server
      const response = await fetch(`/api/checkins?year=${year}&month=${month}`);
      const data = await response.json();
      
      if (data.source === 'server' && data.checkins.length > 0) {
        checkins = data.checkins;
        // Map server checkins by date
        checkins.forEach(c => {
          const date = c.created_at.split('T')[0];
          if (!checkinMap[date]) {
            checkinMap[date] = c;
          }
        });
      } else {
        // Use local storage
        const localCheckins = getCheckinsForMonth(year, month);
        localCheckins.forEach(c => {
          checkinMap[c.date] = c;
        });
      }
    } catch (e) {
      // Fallback to local storage
      const localCheckins = getCheckinsForMonth(year, month);
      localCheckins.forEach(c => {
        checkinMap[c.date] = c;
      });
    }
    
    // Calculate calendar grid
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    // Clear grid
    calendarGrid.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'aspect-square';
      calendarGrid.appendChild(emptyCell);
    }
    
    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const checkin = checkinMap[dateStr];
      const isToday = dateStr === today;
      const isFuture = new Date(dateStr) > new Date();
      
      const cell = document.createElement('div');
      cell.className = `
        aspect-square flex flex-col items-center justify-center rounded-lg text-xs
        ${isToday ? 'ring-2 ring-gold ring-offset-1' : ''}
        ${isFuture ? 'text-ink-300 dark:text-[#4a4a4a]' : 'text-ink-600 dark:text-[#a8a29e]'}
        ${checkin ? 'bg-ecru-100 dark:bg-[#2d2d2d]' : 'hover:bg-ecru-50 dark:hover:bg-[#252525]'}
        transition-colors cursor-default
      `;
      
      // Day number
      const daySpan = document.createElement('span');
      daySpan.className = `text-[10px] ${isToday ? 'font-bold text-gold' : ''}`;
      daySpan.textContent = day;
      cell.appendChild(daySpan);
      
      // Weather emoji if checked in
      if (checkin) {
        const weatherSpan = document.createElement('span');
        weatherSpan.className = 'text-sm leading-none mt-0.5';
        weatherSpan.textContent = WEATHER_EMOJIS[checkin.weather] || '✓';
        cell.appendChild(weatherSpan);
        
        // Tooltip with note if available
        if (checkin.note) {
          cell.title = checkin.note;
        }
      }
      
      calendarGrid.appendChild(cell);
    }
  }
  
  // Navigation
  prevBtn?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  });
  
  nextBtn?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  });
  
  // Initial render
  renderCalendar(currentYear, currentMonth);
}

function initNotificationSettings(lang) {
  const enableBtn = document.getElementById('enable-reminders-btn');
  const disableBtn = document.getElementById('disable-reminders-btn');
  const testBtn = document.getElementById('test-notification-btn');
  const settingsContainer = document.getElementById('reminder-settings');
  const toggleContainer = document.getElementById('reminder-toggle-container');
  const statusEl = document.getElementById('notification-status');
  const deniedEl = document.getElementById('notification-denied');
  const morningTimeInput = document.getElementById('morning-time');
  const eveningTimeInput = document.getElementById('evening-time');
  
  if (!enableBtn || !window.kintsugiNotifications) return;
  
  const notifications = window.kintsugiNotifications;
  
  // Update UI based on current state
  function updateNotificationUI() {
    const status = notifications.getStatus();
    
    if (status.permission === 'denied') {
      deniedEl?.classList.remove('hidden');
      enableBtn.disabled = true;
      enableBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    if (status.enabled) {
      settingsContainer?.classList.remove('hidden');
      toggleContainer?.classList.add('hidden');
      statusEl.textContent = lang === 'en' ? 'On' : 'オン';
      statusEl.classList.remove('bg-ink-100', 'text-ink-500');
      statusEl.classList.add('bg-green-100', 'text-green-700');
      
      // Set current times
      if (morningTimeInput && status.morningReminder) {
        morningTimeInput.value = status.morningReminder.time;
      }
      if (eveningTimeInput && status.eveningReminder) {
        eveningTimeInput.value = status.eveningReminder.time;
      }
    } else {
      settingsContainer?.classList.add('hidden');
      toggleContainer?.classList.remove('hidden');
      statusEl.textContent = lang === 'en' ? 'Off' : 'オフ';
      statusEl.classList.remove('bg-green-100', 'text-green-700');
      statusEl.classList.add('bg-ink-100', 'text-ink-500');
    }
  }
  
  // Initial UI update
  updateNotificationUI();
  
  // Enable button
  enableBtn.addEventListener('click', async () => {
    const enabled = await notifications.enable();
    if (enabled) {
      updateNotificationUI();
    } else {
      const permission = notifications.checkPermission();
      if (permission === 'denied') {
        deniedEl?.classList.remove('hidden');
      }
    }
  });
  
  // Disable button
  disableBtn?.addEventListener('click', () => {
    notifications.disable();
    updateNotificationUI();
  });
  
  // Test button
  testBtn?.addEventListener('click', async () => {
    const sent = await notifications.testNotification();
    if (!sent) {
      alert(lang === 'en' 
        ? 'Could not send test notification. Please check permissions.' 
        : 'テスト通知を送信できませんでした。権限を確認してください。');
    }
  });
  
  // Time inputs
  morningTimeInput?.addEventListener('change', (e) => {
    notifications.updateReminder('morning', { time: e.target.value });
  });
  
  eveningTimeInput?.addEventListener('change', (e) => {
    notifications.updateReminder('evening', { time: e.target.value });
  });
}

// Vessel SVG paths for different vessel types
const VESSEL_PATHS = {
  // 茶碗 (Tea Bowl) - Default, wide and shallow
  chawan: {
    path: 'M40 60 Q40 20 100 20 Q160 20 160 60 L150 200 Q150 220 100 220 Q50 220 50 200 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Tea Bowl', ja: '茶碗' },
    emoji: '🍵'
  },
  // 壺 (Jar) - Tall and rounded
  tsubo: {
    path: 'M70 30 Q70 10 100 10 Q130 10 130 30 L135 50 Q160 70 160 120 Q160 180 130 200 L125 220 Q125 230 100 230 Q75 230 75 220 L70 200 Q40 180 40 120 Q40 70 65 50 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Jar', ja: '壺' },
    emoji: '🏺'
  },
  // 皿 (Plate) - Wide and flat
  sara: {
    path: 'M20 120 Q20 80 100 80 Q180 80 180 120 L170 160 Q170 180 100 180 Q30 180 30 160 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Plate', ja: '皿' },
    emoji: '🍽️'
  },
  // 徳利 (Sake Bottle) - Narrow neck, wide body
  tokkuri: {
    path: 'M85 20 Q85 10 100 10 Q115 10 115 20 L115 50 Q115 60 120 70 L140 90 Q160 110 160 150 Q160 200 130 220 Q130 230 100 230 Q70 230 70 220 Q40 200 40 150 Q40 110 60 90 L80 70 Q85 60 85 50 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Sake Bottle', ja: '徳利' },
    emoji: '🍶'
  },
  // 鉢 (Bowl) - Deep and rounded
  hachi: {
    path: 'M30 80 Q30 50 100 50 Q170 50 170 80 L165 180 Q165 220 100 220 Q35 220 35 180 Z',
    viewBox: '0 0 200 240',
    name: { en: 'Bowl', ja: '鉢' },
    emoji: '🥣'
  }
};

function updateProfileUI(profile, lang) {
  // Stats
  document.getElementById('stat-visits').textContent = profile.stats.totalVisits;
  document.getElementById('stat-streak').textContent = profile.stats.currentStreak;
  document.getElementById('stat-longest').textContent = profile.stats.longestStreak;
  document.getElementById('stat-repairs').textContent = profile.totalRepairs;
  document.getElementById('stat-garden').textContent = profile.stats.gardenActions;
  document.getElementById('stat-study').textContent = profile.stats.studySessions;
  document.getElementById('stat-tatami').textContent = profile.stats.tatamiSessions;
  
  // Cracks
  const repairedCount = profile.cracks.filter(c => c.repaired).length;
  const unrepairedCount = profile.cracks.length - repairedCount;
  document.getElementById('stat-repaired').textContent = repairedCount;
  document.getElementById('stat-unrepaired').textContent = unrepairedCount;
  
  // Update vessel shape based on selected type
  const vesselType = profile.vesselType || getSelectedVessel() || 'chawan';
  const vesselData = VESSEL_PATHS[vesselType] || VESSEL_PATHS.chawan;
  
  // Update SVG path
  const vesselShape = document.getElementById('vessel-shape');
  if (vesselShape) {
    vesselShape.setAttribute('d', vesselData.path);
  }
  
  // Update vessel type display
  const vesselTypeDisplay = document.getElementById('vessel-type-display');
  if (vesselTypeDisplay) {
    vesselTypeDisplay.innerHTML = `${vesselData.emoji} ${vesselData.name[lang]}`;
  }
  
  // Vessel visual
  const visual = calculateVesselVisual(profile);
  
  document.getElementById('depth-value').textContent = `${Math.round(visual.depth)}%`;
  document.getElementById('depth-bar').style.width = `${visual.depth}%`;
  document.getElementById('gold-value').textContent = `${Math.round(visual.goldIntensity)}%`;
  document.getElementById('gold-bar').style.width = `${visual.goldIntensity}%`;
  
  // Render cracks on vessel (adjusted for vessel type)
  const cracksGroup = document.getElementById('cracks-group');
  if (cracksGroup) {
    cracksGroup.innerHTML = '';
    const crackPaths = generateCrackPaths(profile.cracks, vesselType);
    
    crackPaths.forEach(crack => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', crack.path);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-width', crack.repaired ? '3' : '2');
      path.setAttribute('stroke', crack.repaired ? '#c9a227' : '#1a1a1a');
      if (crack.repaired) {
        path.setAttribute('filter', 'url(#goldGlow)');
        path.classList.add('gold-glow');
      }
      cracksGroup.appendChild(path);
    });
  }
  
  // Update message based on state
  const messageEl = document.getElementById('vessel-message');
  if (messageEl) {
    if (profile.cracks.length === 0) {
      messageEl.textContent = lang === 'en' 
        ? 'Your vessel is new and unblemished. Through your journey, it will gain character.'
        : 'あなたの器はまだ新しく、傷ひとつありません。歩みの中で、個性が刻まれていきます。';
    } else if (repairedCount > 0) {
      messageEl.textContent = lang === 'en'
        ? `${repairedCount} crack${repairedCount > 1 ? 's' : ''} repaired with gold. Your vessel tells a beautiful story.`
        : `${repairedCount}箇所のヒビが金で修復されました。あなたの器は美しい物語を語っています。`;
    } else {
      messageEl.textContent = lang === 'en'
        ? 'Your vessel has cracks waiting to be repaired. Continue your journey to heal them with gold.'
        : 'ヒビが修復を待っています。歩みを続けて、金で繋いでいきましょう。';
    }
  }
}

// ========================================
// GARDEN Mode (Morita Therapy)
// ========================================

let clouds = [];
let plants = [];
let gardenActionCount = 0;
let completedActionIds = new Set(); // Track completed actions to prevent duplicate plants

// All possible micro-actions with categories
// 豊富なバリエーションでユーザーが飽きないように
const microActions = {
  // 身体を動かす (Body Movement)
  body: {
    en: [
      { id: 'stand', text: 'Stand up for just 1 minute', time: '1min' },
      { id: 'stretch', text: 'Do 3 simple stretches', time: '1min' },
      { id: 'walk', text: 'Walk to another room and back', time: '30s' },
      { id: 'shoulders', text: 'Roll your shoulders 5 times', time: '15s' },
      { id: 'stairs', text: 'Go up and down stairs once', time: '1min' },
      { id: 'tiptoe', text: 'Stand on tiptoes for 10 seconds', time: '15s' },
      { id: 'neck', text: 'Gently rotate your neck', time: '30s' },
      { id: 'hands', text: 'Open and close your hands 10 times', time: '15s' },
      { id: 'twist', text: 'Twist your upper body gently', time: '20s' },
      { id: 'shake', text: 'Shake out your arms and legs', time: '15s' },
      { id: 'squat', text: 'Do 3 slow squats', time: '30s' },
      { id: 'balance', text: 'Stand on one foot for 10 seconds', time: '20s' },
      { id: 'wrists', text: 'Rotate your wrists 5 times each', time: '15s' },
      { id: 'ankles', text: 'Circle your ankles 5 times each', time: '15s' },
      { id: 'sidebend', text: 'Bend gently to each side', time: '20s' },
      { id: 'armraise', text: 'Raise your arms overhead slowly', time: '15s' },
      { id: 'march', text: 'March in place for 30 seconds', time: '30s' },
      { id: 'fingerstretch', text: 'Spread your fingers wide, then relax', time: '10s' },
    ],
    ja: [
      { id: 'stand', text: '1分だけ立ち上がる', time: '1min' },
      { id: 'stretch', text: '3回だけストレッチする', time: '1min' },
      { id: 'walk', text: '別の部屋まで歩いて戻る', time: '30s' },
      { id: 'shoulders', text: '肩を5回まわす', time: '15s' },
      { id: 'stairs', text: '階段を一往復する', time: '1min' },
      { id: 'tiptoe', text: 'つま先立ちを10秒キープ', time: '15s' },
      { id: 'neck', text: '首をゆっくり回す', time: '30s' },
      { id: 'hands', text: '手を10回グーパーする', time: '15s' },
      { id: 'twist', text: '上半身をゆっくりひねる', time: '20s' },
      { id: 'shake', text: '腕と足を振ってほぐす', time: '15s' },
      { id: 'squat', text: 'ゆっくりスクワットを3回', time: '30s' },
      { id: 'balance', text: '片足で10秒立つ', time: '20s' },
      { id: 'wrists', text: '手首を左右5回ずつ回す', time: '15s' },
      { id: 'ankles', text: '足首を左右5回ずつ回す', time: '15s' },
      { id: 'sidebend', text: '体を左右にゆっくり倒す', time: '20s' },
      { id: 'armraise', text: '両腕をゆっくり上げる', time: '15s' },
      { id: 'march', text: 'その場で30秒足踏みする', time: '30s' },
      { id: 'fingerstretch', text: '指を大きく広げて、緩める', time: '10s' },
    ]
  },
  // 水・飲み物 (Hydration)
  water: {
    en: [
      { id: 'water', text: 'Drink a glass of water', time: '15s' },
      { id: 'tea', text: 'Make yourself a cup of tea', time: '3min' },
      { id: 'warmwater', text: 'Drink a glass of warm water', time: '15s' },
      { id: 'lemon', text: 'Add lemon to your water', time: '30s' },
      { id: 'herbal', text: 'Brew a cup of herbal tea', time: '3min' },
      { id: 'slowsip', text: 'Sip water slowly, counting 5 sips', time: '30s' },
      { id: 'coldwater', text: 'Splash cold water on your face', time: '15s' },
      { id: 'handwash', text: 'Wash your hands with warm water', time: '30s' },
      { id: 'gargle', text: 'Gargle with water', time: '15s' },
      { id: 'icecube', text: 'Hold an ice cube in your hand briefly', time: '15s' },
    ],
    ja: [
      { id: 'water', text: '水を一杯飲む', time: '15s' },
      { id: 'tea', text: 'お茶を一杯いれる', time: '3min' },
      { id: 'warmwater', text: '白湯を一杯飲む', time: '15s' },
      { id: 'lemon', text: 'レモン水を作って飲む', time: '30s' },
      { id: 'herbal', text: 'ハーブティーを淹れる', time: '3min' },
      { id: 'slowsip', text: '水を5口、ゆっくり飲む', time: '30s' },
      { id: 'coldwater', text: '顔に冷たい水をかける', time: '15s' },
      { id: 'handwash', text: '温かいお湯で手を洗う', time: '30s' },
      { id: 'gargle', text: '水でうがいをする', time: '15s' },
      { id: 'icecube', text: '氷を手に握ってみる', time: '15s' },
    ]
  },
  // 整理・片付け (Tidying)
  tidy: {
    en: [
      { id: 'cup', text: 'Wash a single cup', time: '30s' },
      { id: 'desk', text: 'Clear one item from your desk', time: '15s' },
      { id: 'trash', text: 'Throw away one piece of trash', time: '10s' },
      { id: 'fold', text: 'Fold one piece of clothing', time: '30s' },
      { id: 'wipe', text: 'Wipe one surface clean', time: '30s' },
      { id: 'arrange', text: 'Straighten something nearby', time: '15s' },
      { id: 'dish', text: 'Put one dish in the dishwasher', time: '15s' },
      { id: 'book', text: 'Return one book to its shelf', time: '15s' },
      { id: 'pen', text: 'Put one pen back in its place', time: '10s' },
      { id: 'pillow', text: 'Fluff a pillow or cushion', time: '15s' },
      { id: 'shoes', text: 'Align one pair of shoes', time: '10s' },
      { id: 'drawer', text: 'Organize one small drawer section', time: '1min' },
      { id: 'dust', text: 'Dust one small area', time: '30s' },
      { id: 'cord', text: 'Untangle or organize one cord', time: '30s' },
      { id: 'bag', text: 'Remove one item from your bag', time: '15s' },
      { id: 'plant', text: 'Remove one dead leaf from a plant', time: '15s' },
    ],
    ja: [
      { id: 'cup', text: 'コップを一つ洗う', time: '30s' },
      { id: 'desk', text: '机の上を一つだけ片付ける', time: '15s' },
      { id: 'trash', text: 'ゴミを一つ捨てる', time: '10s' },
      { id: 'fold', text: '服を一枚だけたたむ', time: '30s' },
      { id: 'wipe', text: 'どこか一カ所を拭く', time: '30s' },
      { id: 'arrange', text: '近くのものを整える', time: '15s' },
      { id: 'dish', text: 'お皿を一枚だけ洗う', time: '15s' },
      { id: 'book', text: '本を一冊だけ棚に戻す', time: '15s' },
      { id: 'pen', text: 'ペンを一本だけ元に戻す', time: '10s' },
      { id: 'pillow', text: 'クッションを整える', time: '15s' },
      { id: 'shoes', text: '靴を一足だけ揃える', time: '10s' },
      { id: 'drawer', text: '引き出しの一角を整理する', time: '1min' },
      { id: 'dust', text: '一カ所だけほこりを払う', time: '30s' },
      { id: 'cord', text: 'ケーブルを一本だけ整理する', time: '30s' },
      { id: 'bag', text: 'カバンから一つ物を出す', time: '15s' },
      { id: 'plant', text: '植物の枯れ葉を一枚取る', time: '15s' },
    ]
  },
  // 感覚を使う (Senses)
  senses: {
    en: [
      { id: 'window', text: 'Open a window and look outside', time: '30s' },
      { id: 'breathe', text: 'Take 3 deep breaths', time: '30s' },
      { id: 'listen', text: 'Close your eyes and listen for 30 seconds', time: '30s' },
      { id: 'touch', text: 'Touch 3 different textures around you', time: '30s' },
      { id: 'smell', text: 'Smell something pleasant (tea, soap, etc.)', time: '15s' },
      { id: 'sky', text: 'Look at the sky for 1 minute', time: '1min' },
      { id: 'plant', text: 'Look at a plant or photo of nature', time: '30s' },
      { id: 'feet', text: 'Feel the ground beneath your feet', time: '30s' },
      { id: 'colors', text: 'Find 3 things of the same color', time: '30s' },
      { id: 'farclose', text: 'Look at something far, then near', time: '20s' },
      { id: 'temperature', text: 'Notice the temperature of the air', time: '15s' },
      { id: 'heartbeat', text: 'Feel your heartbeat for 30 seconds', time: '30s' },
      { id: 'palms', text: 'Press your palms together and feel the warmth', time: '20s' },
      { id: 'sounds', text: 'Count how many sounds you can hear', time: '30s' },
      { id: 'light', text: 'Notice how light falls in the room', time: '30s' },
      { id: 'fabric', text: 'Feel the fabric of what you\'re wearing', time: '15s' },
    ],
    ja: [
      { id: 'window', text: '窓を開けて外を見る', time: '30s' },
      { id: 'breathe', text: '深呼吸を3回する', time: '30s' },
      { id: 'listen', text: '目を閉じて30秒間耳を澄ます', time: '30s' },
      { id: 'touch', text: '周りの3つの質感に触れる', time: '30s' },
      { id: 'smell', text: '良い香りを嗅ぐ（お茶、石鹸など）', time: '15s' },
      { id: 'sky', text: '1分間空を眺める', time: '1min' },
      { id: 'plant', text: '植物や自然の写真を見る', time: '30s' },
      { id: 'feet', text: '足の裏で床を感じる', time: '30s' },
      { id: 'colors', text: '同じ色のものを3つ探す', time: '30s' },
      { id: 'farclose', text: '遠く、近くを交互に見る', time: '20s' },
      { id: 'temperature', text: '空気の温度を感じる', time: '15s' },
      { id: 'heartbeat', text: '30秒間心臓の鼓動を感じる', time: '30s' },
      { id: 'palms', text: '両手を合わせて温かさを感じる', time: '20s' },
      { id: 'sounds', text: '聞こえる音を数えてみる', time: '30s' },
      { id: 'light', text: '部屋の光の当たり方を観察する', time: '30s' },
      { id: 'fabric', text: '着ている服の生地を感じる', time: '15s' },
    ]
  },
  // つながり (Connection)
  connect: {
    en: [
      { id: 'smile', text: 'Smile at yourself in a mirror', time: '10s' },
      { id: 'thanks', text: 'Think of one thing you\'re grateful for', time: '30s' },
      { id: 'message', text: 'Send a short message to someone', time: '1min' },
      { id: 'photo', text: 'Look at a favorite photo', time: '30s' },
      { id: 'pet', text: 'Pet an animal (or stuffed toy)', time: '1min' },
      { id: 'hug', text: 'Give yourself a hug', time: '15s' },
      { id: 'memory', text: 'Recall a happy memory for 30 seconds', time: '30s' },
      { id: 'compliment', text: 'Think of one thing you like about yourself', time: '30s' },
      { id: 'wish', text: 'Silently wish someone well', time: '15s' },
      { id: 'voice', text: 'Say something kind to yourself out loud', time: '15s' },
      { id: 'hands', text: 'Hold your own hand gently', time: '15s' },
      { id: 'face', text: 'Gently touch your face with kindness', time: '15s' },
    ],
    ja: [
      { id: 'smile', text: '鏡の自分に微笑む', time: '10s' },
      { id: 'thanks', text: '感謝できることを一つ思い浮かべる', time: '30s' },
      { id: 'message', text: '誰かに短いメッセージを送る', time: '1min' },
      { id: 'photo', text: 'お気に入りの写真を見る', time: '30s' },
      { id: 'pet', text: 'ペット（またはぬいぐるみ）を撫でる', time: '1min' },
      { id: 'hug', text: '自分を抱きしめる', time: '15s' },
      { id: 'memory', text: '幸せな思い出を30秒思い出す', time: '30s' },
      { id: 'compliment', text: '自分の好きなところを一つ考える', time: '30s' },
      { id: 'wish', text: '誰かの幸せを心の中で願う', time: '15s' },
      { id: 'voice', text: '自分に優しい言葉を声に出す', time: '15s' },
      { id: 'hands', text: '自分の手を優しく握る', time: '15s' },
      { id: 'face', text: '優しく自分の顔に触れる', time: '15s' },
    ]
  },
  // 創造性 (Creativity) - NEW
  creative: {
    en: [
      { id: 'doodle', text: 'Draw a tiny doodle', time: '30s' },
      { id: 'hum', text: 'Hum a tune for 20 seconds', time: '20s' },
      { id: 'cloud', text: 'Find a shape in the clouds or ceiling', time: '30s' },
      { id: 'word', text: 'Think of a word that describes how you feel', time: '15s' },
      { id: 'color', text: 'Pick a color that matches your mood', time: '10s' },
      { id: 'story', text: 'Make up a one-sentence story', time: '30s' },
      { id: 'rhyme', text: 'Think of two words that rhyme', time: '15s' },
      { id: 'imagine', text: 'Imagine your happy place for 30 seconds', time: '30s' },
      { id: 'rename', text: 'Give a nearby object a funny name', time: '15s' },
      { id: 'pattern', text: 'Find an interesting pattern nearby', time: '20s' },
    ],
    ja: [
      { id: 'doodle', text: '小さな落書きを描く', time: '30s' },
      { id: 'hum', text: '20秒間鼻歌を歌う', time: '20s' },
      { id: 'cloud', text: '雲や天井に形を見つける', time: '30s' },
      { id: 'word', text: '今の気持ちを一言で表す', time: '15s' },
      { id: 'color', text: '今の気分に合う色を選ぶ', time: '10s' },
      { id: 'story', text: '一文だけの物語を作る', time: '30s' },
      { id: 'rhyme', text: '韻を踏む言葉を2つ考える', time: '15s' },
      { id: 'imagine', text: '幸せな場所を30秒想像する', time: '30s' },
      { id: 'rename', text: '近くの物に面白い名前をつける', time: '15s' },
      { id: 'pattern', text: '近くの面白い模様を見つける', time: '20s' },
    ]
  },
  // マインドフルネス (Mindfulness) - NEW
  mindful: {
    en: [
      { id: 'present', text: 'Notice 5 things you can see right now', time: '30s' },
      { id: 'body', text: 'Scan your body from head to toe', time: '1min' },
      { id: 'anchor', text: 'Focus on one point for 20 seconds', time: '20s' },
      { id: 'pause', text: 'Simply pause and do nothing for 30 seconds', time: '30s' },
      { id: 'accept', text: 'Accept this moment as it is', time: '20s' },
      { id: 'nowfeel', text: 'Name one thing you feel right now', time: '15s' },
      { id: 'release', text: 'Breathe out and let go of tension', time: '20s' },
      { id: 'gentle', text: 'Soften your jaw and shoulders', time: '15s' },
      { id: 'slow', text: 'Do one thing very slowly', time: '30s' },
      { id: 'observe', text: 'Observe your thoughts without judging', time: '30s' },
    ],
    ja: [
      { id: 'present', text: '今見えるものを5つ数える', time: '30s' },
      { id: 'body', text: '頭からつま先まで体を感じる', time: '1min' },
      { id: 'anchor', text: '一点を20秒間見つめる', time: '20s' },
      { id: 'pause', text: '30秒間何もせず立ち止まる', time: '30s' },
      { id: 'accept', text: 'この瞬間をあるがままに受け入れる', time: '20s' },
      { id: 'nowfeel', text: '今感じていることを一つ言葉にする', time: '15s' },
      { id: 'release', text: '息を吐いて緊張を手放す', time: '20s' },
      { id: 'gentle', text: '顎と肩の力を抜く', time: '15s' },
      { id: 'slow', text: '何か一つをとてもゆっくりする', time: '30s' },
      { id: 'observe', text: '考えを批判せず観察する', time: '30s' },
    ]
  },
  // 季節・自然 (Nature/Seasonal) - NEW
  nature: {
    en: [
      { id: 'fresh', text: 'Step outside for 30 seconds', time: '30s' },
      { id: 'tree', text: 'Look at a tree or plant', time: '30s' },
      { id: 'breeze', text: 'Feel the air on your skin', time: '20s' },
      { id: 'sun', text: 'Feel warmth (sunlight or heating)', time: '30s' },
      { id: 'rain', text: 'Listen to or imagine rain', time: '30s' },
      { id: 'bird', text: 'Listen for birds or nature sounds', time: '30s' },
      { id: 'stone', text: 'Hold a small object from nature', time: '20s' },
      { id: 'green', text: 'Look at something green', time: '15s' },
      { id: 'moon', text: 'Think about what phase the moon is in', time: '15s' },
      { id: 'weather', text: 'Notice today\'s weather', time: '15s' },
    ],
    ja: [
      { id: 'fresh', text: '30秒だけ外に出る', time: '30s' },
      { id: 'tree', text: '木や植物を見る', time: '30s' },
      { id: 'breeze', text: '肌で風を感じる', time: '20s' },
      { id: 'sun', text: '温かさを感じる（日光や暖房）', time: '30s' },
      { id: 'rain', text: '雨の音を聴くか想像する', time: '30s' },
      { id: 'bird', text: '鳥の声や自然の音を聴く', time: '30s' },
      { id: 'stone', text: '自然のものを手に持つ', time: '20s' },
      { id: 'green', text: '緑色のものを見る', time: '15s' },
      { id: 'moon', text: '今の月の形を思い浮かべる', time: '15s' },
      { id: 'weather', text: '今日の天気を感じる', time: '15s' },
    ]
  }
};

// Select random actions from different categories
// Ensures maximum variety by picking from different categories
function getRandomActions(lang, count = 5) {
  const categories = Object.keys(microActions);
  const selectedActions = [];
  const usedIds = new Set();
  
  // Shuffle categories for randomness
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
  
  // First pass: pick one from each category until we have enough
  for (const category of shuffledCategories) {
    if (selectedActions.length >= count) break;
    
    const categoryActions = microActions[category][lang];
    // Shuffle actions within category
    const shuffledActions = [...categoryActions].sort(() => Math.random() - 0.5);
    
    for (const action of shuffledActions) {
      if (!usedIds.has(action.id)) {
        selectedActions.push({ ...action, category });
        usedIds.add(action.id);
        break;
      }
    }
  }
  
  // Second pass: if we need more, pick randomly from any category
  let attempts = 0;
  while (selectedActions.length < count && attempts < 50) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryActions = microActions[randomCategory][lang];
    const randomAction = categoryActions[Math.floor(Math.random() * categoryActions.length)];
    
    if (!usedIds.has(randomAction.id)) {
      selectedActions.push({ ...randomAction, category: randomCategory });
      usedIds.add(randomAction.id);
    }
    attempts++;
  }
  
  // Shuffle final result so order is random
  return selectedActions.sort(() => Math.random() - 0.5);
}

// Render action list
function renderActionList(actions, container, gardenPlants, lang) {
  container.innerHTML = '';
  
  actions.forEach((action, index) => {
    // Create unique ID for this action instance
    const actionUniqueId = `${action.id}-${index}-${Date.now()}`;
    
    const label = document.createElement('label');
    label.className = 'flex items-center gap-3 p-3 bg-white/60 dark:bg-[#2d2d2d]/60 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-[#3d3d3d]/80 transition-colors';
    label.innerHTML = `
      <input type="checkbox" class="w-5 h-5 accent-gold" data-action="${action.id}" data-unique-id="${actionUniqueId}" />
      <span class="text-ink-700 dark:text-[#e8e4dc]">${action.text}</span>
      <span class="text-ink-400 dark:text-[#78716c] text-xs ml-auto">${action.time}</span>
    `;
    
    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', () => {
      const uniqueId = checkbox.dataset.uniqueId;
      
      if (checkbox.checked) {
        // Only add plant if this specific action hasn't been completed
        if (!completedActionIds.has(uniqueId)) {
          completedActionIds.add(uniqueId);
          growPlant(gardenPlants);
          vibrate([50]);
          gardenActionCount++;
          
          // Record activity
          let profile = loadProfile();
          profile = recordActivityToProfile(profile, 'garden', { actionCount: 1 });
          saveProfile(profile);
          
          recordAction(action.id, true, lang);
        }
      } else {
        // When unchecked, remove from completed set (but don't remove plant - it stays as history)
        completedActionIds.delete(uniqueId);
      }
    });
    
    container.appendChild(label);
  });
}

function initGarden() {
  const emotionInput = document.getElementById('emotion-input');
  const addCloudBtn = document.getElementById('add-cloud-btn');
  const cloudContainer = document.getElementById('cloud-container');
  const actionList = document.getElementById('action-list');
  const gardenPlants = document.getElementById('garden-plants');
  const refreshBtn = document.getElementById('refresh-actions-btn');
  const lang = getLang();
  
  // Load profile and record visit
  let profile = loadProfile();
  profile = recordVisit(profile);
  saveProfile(profile);
  
  if (!emotionInput || !addCloudBtn) return;
  
  // Generate random actions (5 actions for more variety)
  let currentActions = getRandomActions(lang, 5);
  renderActionList(currentActions, actionList, gardenPlants, lang);
  
  // Refresh button functionality
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Animate the button
      refreshBtn.classList.add('animate-spin-once');
      setTimeout(() => refreshBtn.classList.remove('animate-spin-once'), 300);
      
      // Clear completed actions for old set (new actions = new tracking)
      completedActionIds.clear();
      
      // Get new random actions (different from current)
      currentActions = getRandomActions(lang, 5);
      
      // Fade out, update, fade in
      actionList.style.opacity = '0';
      actionList.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        renderActionList(currentActions, actionList, gardenPlants, lang);
        actionList.style.opacity = '1';
        actionList.style.transform = 'translateY(0)';
      }, 200);
    });
    
    // Add transition styles
    actionList.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  }
  
  addCloudBtn.addEventListener('click', () => {
    const emotion = emotionInput.value.trim();
    if (emotion) {
      addCloud(emotion, cloudContainer);
      emotionInput.value = '';
      fetchMoritaGuidance(emotion, lang);
      
      // Record anxiety as a crack
      let profile = loadProfile();
      profile = recordAnxiety(profile, emotion);
      saveProfile(profile);
    }
  });
  
  emotionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCloudBtn.click();
    }
  });
}

// Track used positions to prevent overlap
let usedCloudPositions = [];

function addCloud(text, container) {
  const placeholder = container.querySelector('.opacity-50');
  if (placeholder) {
    placeholder.remove();
  }
  
  const cloud = document.createElement('div');
  cloud.className = 'cloud absolute px-4 py-2 text-sm text-ink-600 max-w-xs animate-fade-in';
  cloud.textContent = text;
  
  // Calculate position that doesn't overlap with existing clouds
  const position = findNonOverlappingPosition();
  cloud.style.left = `${position.x}%`;
  cloud.style.top = `${position.y}%`;
  cloud.style.animationDelay = `${randomBetween(0, 1)}s`;
  
  container.appendChild(cloud);
  clouds.push({ text, element: cloud, position });
  usedCloudPositions.push(position);
}

// Find a position that doesn't overlap with existing clouds
function findNonOverlappingPosition() {
  // Predefined grid positions for better distribution
  const gridPositions = [
    { x: 15, y: 15 },
    { x: 55, y: 10 },
    { x: 35, y: 35 },
    { x: 10, y: 55 },
    { x: 60, y: 45 },
    { x: 40, y: 60 },
    { x: 70, y: 25 },
    { x: 25, y: 75 },
    { x: 65, y: 70 },
  ];
  
  // Use next available grid position
  const cloudIndex = usedCloudPositions.length;
  if (cloudIndex < gridPositions.length) {
    return gridPositions[cloudIndex];
  }
  
  // If all grid positions used, find random non-overlapping position
  const minDistance = 25; // Minimum distance between clouds (%)
  let attempts = 0;
  let bestPosition = { x: randomBetween(10, 65), y: randomBetween(10, 65) };
  
  while (attempts < 20) {
    const newPos = { x: randomBetween(10, 65), y: randomBetween(10, 65) };
    let isValid = true;
    
    for (const usedPos of usedCloudPositions) {
      const distance = Math.sqrt(
        Math.pow(newPos.x - usedPos.x, 2) + Math.pow(newPos.y - usedPos.y, 2)
      );
      if (distance < minDistance) {
        isValid = false;
        break;
      }
    }
    
    if (isValid) {
      return newPos;
    }
    attempts++;
  }
  
  return bestPosition;
}

function growPlant(container) {
  const placeholder = container.querySelector('.text-center');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Limit max plants: 10 for mobile, 15 for desktop
  const isMobile = window.innerWidth < 768;
  const maxPlants = isMobile ? 8 : 12;
  
  // If at max, remove oldest plant before adding new one
  if (plants.length >= maxPlants) {
    const oldestPlant = plants.shift();
    if (oldestPlant && oldestPlant.parentNode) {
      oldestPlant.style.opacity = '0';
      oldestPlant.style.transform = 'scale(0)';
      setTimeout(() => oldestPlant.remove(), 300);
    }
  }
  
  const plantTypes = ['🌱', '🌿', '🍀', '🌾', '🌻', '🪴', '☘️', '🌸'];
  const plant = document.createElement('div');
  plant.className = 'text-2xl sm:text-3xl animate-grow inline-block';
  plant.textContent = plantTypes[plants.length % plantTypes.length];
  plant.style.animationDelay = '0.1s';
  plant.style.transition = 'opacity 0.3s, transform 0.3s';
  
  container.appendChild(plant);
  plants.push(plant);
}

async function fetchMoritaGuidance(emotion, lang) {
  try {
    const response = await fetch('/api/morita/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion, lang })
    });
    const data = await response.json();
    
    const guidanceEl = document.getElementById('morita-guidance');
    if (guidanceEl) {
      guidanceEl.innerHTML = `
        <p class="text-ink-600 text-sm">
          <span class="text-gold">●</span> ${data.guidance}
        </p>
      `;
    }
  } catch (err) {
    console.error('Failed to fetch guidance:', err);
  }
}

async function recordAction(action, completed, lang) {
  try {
    await fetch('/api/garden/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, completed, lang })
    });
  } catch (err) {
    console.error('Failed to record action:', err);
  }
}

// ========================================
// STUDY Mode (Naikan Therapy) with Connection Mandala
// ========================================

let naikanStep = 1;
let naikanResponses = [];
let naikanConnections = []; // Store person + response for mandala

function initStudy() {
  console.log('[KINTSUGI] initStudy called');
  const chatContainer = document.getElementById('naikan-chat');
  const inputEl = document.getElementById('naikan-input');
  const personEl = document.getElementById('naikan-person');
  const sendBtn = document.getElementById('naikan-send-btn');
  const lang = getLang();
  
  console.log('[KINTSUGI] Elements found:', {
    chatContainer: !!chatContainer,
    inputEl: !!inputEl,
    personEl: !!personEl,
    sendBtn: !!sendBtn
  });
  
  // Load profile and record visit
  let profile = loadProfile();
  profile = recordVisit(profile);
  saveProfile(profile);
  
  if (!chatContainer || !inputEl || !sendBtn) {
    console.log('[KINTSUGI] Missing required elements, returning');
    return;
  }
  
  console.log('[KINTSUGI] Adding click listener to sendBtn');
  sendBtn.addEventListener('click', () => {
    console.log('[KINTSUGI] Send button clicked!');
    const response = inputEl.value.trim();
    const person = personEl ? personEl.value.trim() : '';
    console.log('[KINTSUGI] Input values:', { response, person });
    
    if (!response) {
      console.log('[KINTSUGI] Response is empty, showing validation');
      // Shake the input and show message
      inputEl.classList.add('shake-animation');
      inputEl.style.borderColor = '#d97706';
      inputEl.placeholder = lang === 'en' ? '⚠️ Please enter something...' : '⚠️ 何か入力してください...';
      setTimeout(() => {
        inputEl.classList.remove('shake-animation');
        inputEl.style.borderColor = '';
      }, 500);
      inputEl.focus();
      return;
    }
    
    // Process the response
    console.log('[KINTSUGI] Processing response...');
    
    // Store connection data
    const connectionTypes = ['received', 'given', 'forgiven'];
    const currentPerson = person || (lang === 'en' ? 'Someone' : '誰か');
    naikanConnections.push({
      person: currentPerson,
      description: response,
      type: connectionTypes[naikanStep - 1]
    });
    
    // Show user message with person name
    const displayMessage = person ? `${person}: ${response}` : response;
    addUserMessage(displayMessage, chatContainer);
    naikanResponses.push(response);
    
    // Clear inputs
    inputEl.value = '';
    if (personEl) personEl.value = '';
    
    // Get AI reflection
    const currentStep = naikanStep;
    fetchNaikanReflection(currentStep, currentPerson, response, lang, chatContainer).then(() => {
      naikanStep++;
      if (naikanStep <= 3) {
        setTimeout(() => {
          addNaikanQuestion(naikanStep, chatContainer, lang);
          updateProgress(naikanStep, lang);
          updatePersonInputLabel(naikanStep, lang);
        }, 500);
      } else {
        setTimeout(() => {
          showNaikanConclusion(chatContainer, lang);
          
          // Record study session completion
          let profile = loadProfile();
          profile = recordActivityToProfile(profile, 'study', { 
            questionsAnswered: 3,
            connections: naikanConnections 
          });
          saveProfile(profile);
          
          // Show mandala after a brief moment
          setTimeout(() => {
            showConnectionMandala(naikanConnections, lang);
          }, 2000);
        }, 500);
      }
    });
  });
  
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });
  
  if (personEl) {
    personEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        inputEl.focus();
      }
    });
  }
}

// Update the person input label based on question
function updatePersonInputLabel(step, lang) {
  const labels = {
    1: { en: 'Who helped you? (name or role)', ja: '誰に助けられましたか？（名前や役割）' },
    2: { en: 'Who did you help? (name or role)', ja: '誰を助けましたか？（名前や役割）' },
    3: { en: 'Who showed you patience? (name or role)', ja: '誰が寛容でしたか？（名前や役割）' }
  };
  
  const placeholders = {
    1: { en: 'e.g., Mom, a coworker, the barista...', ja: '例：母、同僚、カフェの店員...' },
    2: { en: 'e.g., A friend, my child, a stranger...', ja: '例：友人、子供、見知らぬ人...' },
    3: { en: 'e.g., My partner, my boss, myself...', ja: '例：パートナー、上司、自分自身...' }
  };
  
  const labelEl = document.querySelector('label[for="naikan-person"], label.text-xs.text-ink-500');
  const personEl = document.getElementById('naikan-person');
  
  if (labelEl && labels[step]) {
    labelEl.textContent = labels[step][lang];
  }
  if (personEl && placeholders[step]) {
    personEl.placeholder = placeholders[step][lang];
  }
}

function addUserMessage(text, container) {
  const message = document.createElement('div');
  message.className = 'chat-bubble user bg-indigo-100 p-4 max-w-[80%] ml-auto animate-fade-in';
  message.innerHTML = `<p class="text-ink-700">${text}</p>`;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

// Fetch AI reflection for Naikan
async function fetchNaikanReflection(step, person, response, lang, container) {
  const guideName = i18n.study.guideName[lang];
  
  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  const typingIndicator = document.createElement('div');
  typingIndicator.id = typingId;
  typingIndicator.className = 'chat-bubble bg-ecru-200 p-4 max-w-[80%] animate-fade-in';
  typingIndicator.innerHTML = `
    <p class="text-ink-700 text-sm mb-1">
      <span class="text-gold">${guideName}</span>
    </p>
    <p class="text-ink-400 text-sm">
      ${lang === 'en' ? '...' : '...'}
    </p>
  `;
  container.appendChild(typingIndicator);
  container.scrollTop = container.scrollHeight;
  
  try {
    const res = await fetch('/api/naikan/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, person, response, lang })
    });
    const data = await res.json();
    
    // Remove typing indicator and show response
    const typing = document.getElementById(typingId);
    if (typing) {
      typing.innerHTML = `
        <p class="text-ink-700 text-sm mb-1">
          <span class="text-gold">${guideName}</span>
        </p>
        <p class="text-ink-600">${data.reflection}</p>
      `;
    }
  } catch (err) {
    console.error('Failed to fetch Naikan reflection:', err);
    // Remove typing indicator on error
    const typing = document.getElementById(typingId);
    if (typing) typing.remove();
  }
}

function addNaikanQuestion(step, container, lang) {
  const q = i18n.study.questions[step];
  const guideName = i18n.study.guideName[lang];
  
  const message = document.createElement('div');
  message.className = 'chat-bubble bg-ecru-200 p-4 max-w-[80%] animate-fade-in';
  message.innerHTML = `
    <p class="text-ink-700 text-sm mb-1">
      <span class="text-gold">${guideName}</span>
    </p>
    <p class="text-ink-600">${q.text[lang]}</p>
    <p class="text-xs text-ink-400 mt-2">${q.hint[lang]}</p>
  `;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

function updateProgress(step, lang) {
  const dots = document.querySelectorAll('.flex.justify-center.gap-2 div');
  dots.forEach((dot, index) => {
    if (index < step) {
      dot.className = 'w-3 h-3 rounded-full bg-gold';
    } else {
      dot.className = 'w-3 h-3 rounded-full bg-ecru-300';
    }
  });
  
  const progressText = document.querySelector('.text-ink-400.text-sm');
  if (progressText) {
    const questionLabel = lang === 'ja' ? '問い' : 'Question';
    progressText.textContent = `${questionLabel} ${Math.min(step, 3)} / 3`;
  }
}

function showNaikanConclusion(container, lang) {
  const c = i18n.study.conclusion;
  const guideName = i18n.study.guideName[lang];
  
  const message = document.createElement('div');
  message.className = 'chat-bubble bg-gold/20 p-4 max-w-[90%] animate-fade-in';
  message.innerHTML = `
    <p class="text-ink-700 text-sm mb-2">
      <span class="text-gold">${guideName}</span>
    </p>
    <p class="text-ink-600 mb-4">${c.title[lang]}</p>
    <p class="text-ink-600 mb-4">${c.message[lang]}</p>
    <p class="text-ink-500 text-sm italic">${c.quote[lang]}</p>
    <p class="text-ink-400 text-xs mt-4">
      ${lang === 'en' ? '✨ Preparing your Connection Mandala...' : '✨ 縁の曼荼羅を準備しています...'}
    </p>
  `;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
  
  updateProgress(4, lang);
}

// ========================================
// Connection Mandala Visualization
// ========================================

function showConnectionMandala(connections, lang) {
  const chatSection = document.getElementById('study-chat-section');
  const mandalaSection = document.getElementById('mandala-section');
  const mandalaContainer = document.getElementById('mandala-container');
  
  if (!chatSection || !mandalaSection || !mandalaContainer) return;
  
  // Fade out chat, fade in mandala
  chatSection.classList.add('animate-fade-out');
  setTimeout(() => {
    chatSection.classList.add('hidden');
    mandalaSection.classList.remove('hidden');
    mandalaSection.classList.add('animate-fade-in');
    
    // Generate and render the mandala
    renderMandala(mandalaContainer, connections, lang);
  }, 500);
}

function renderMandala(container, connections, lang) {
  const size = 400;
  const center = size / 2;
  const innerRadius = 40;
  const outerRadius = 150;
  
  // Color scheme for connection types
  const colors = {
    received: { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },  // amber
    given: { main: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)' },     // green
    forgiven: { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)' }  // purple
  };
  
  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'w-full h-full');
  
  // Defs for gradients and filters
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  // Glow filter
  defs.innerHTML = `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);
  
  // Background circles (mandala rings)
  for (let i = 3; i >= 1; i--) {
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', center);
    ring.setAttribute('cy', center);
    ring.setAttribute('r', innerRadius + (outerRadius - innerRadius) * (i / 3));
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', 'rgba(201, 162, 39, 0.15)');
    ring.setAttribute('stroke-width', '1');
    ring.classList.add('mandala-ring-anim');
    ring.style.animationDelay = `${i * 0.2}s`;
    svg.appendChild(ring);
  }
  
  // Center node (You)
  const centerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  centerGroup.classList.add('mandala-center');
  
  const centerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerGlow.setAttribute('cx', center);
  centerGlow.setAttribute('cy', center);
  centerGlow.setAttribute('r', innerRadius);
  centerGlow.setAttribute('fill', 'rgba(201, 162, 39, 0.3)');
  centerGlow.setAttribute('filter', 'url(#softGlow)');
  centerGroup.appendChild(centerGlow);
  
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', center);
  centerCircle.setAttribute('cy', center);
  centerCircle.setAttribute('r', innerRadius - 5);
  centerCircle.setAttribute('fill', '#c9a227');
  centerCircle.setAttribute('filter', 'url(#glow)');
  centerGroup.appendChild(centerCircle);
  
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('x', center);
  centerText.setAttribute('y', center + 5);
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('fill', '#1e3a5f');
  centerText.setAttribute('font-size', '14');
  centerText.setAttribute('font-weight', '600');
  centerText.textContent = lang === 'en' ? 'You' : 'あなた';
  centerGroup.appendChild(centerText);
  
  svg.appendChild(centerGroup);
  
  // Connection nodes
  const totalNodes = connections.length;
  connections.forEach((conn, index) => {
    const angle = (index / totalNodes) * 2 * Math.PI - Math.PI / 2;
    const nodeRadius = outerRadius - 20;
    const x = center + Math.cos(angle) * nodeRadius;
    const y = center + Math.sin(angle) * nodeRadius;
    
    const color = colors[conn.type] || colors.received;
    const delay = 0.5 + index * 0.3;
    
    // Connection line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', center);
    line.setAttribute('y1', center);
    line.setAttribute('x2', x);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', color.main);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('opacity', '0.6');
    line.classList.add('mandala-line');
    line.style.animationDelay = `${delay}s`;
    svg.appendChild(line);
    
    // Node group
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.classList.add('mandala-node');
    nodeGroup.style.animationDelay = `${delay + 0.2}s`;
    
    // Node glow
    const nodeGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    nodeGlow.setAttribute('cx', x);
    nodeGlow.setAttribute('cy', y);
    nodeGlow.setAttribute('r', 35);
    nodeGlow.setAttribute('fill', color.glow);
    nodeGlow.setAttribute('filter', 'url(#softGlow)');
    nodeGroup.appendChild(nodeGlow);
    
    // Node circle
    const nodeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    nodeCircle.setAttribute('cx', x);
    nodeCircle.setAttribute('cy', y);
    nodeCircle.setAttribute('r', 28);
    nodeCircle.setAttribute('fill', color.main);
    nodeCircle.setAttribute('filter', 'url(#glow)');
    nodeGroup.appendChild(nodeCircle);
    
    // Person name
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', x);
    nameText.setAttribute('y', y + 4);
    nameText.setAttribute('text-anchor', 'middle');
    nameText.setAttribute('fill', '#1e3a5f');
    nameText.setAttribute('font-size', '11');
    nameText.setAttribute('font-weight', '500');
    // Truncate long names
    const displayName = conn.person.length > 8 ? conn.person.substring(0, 7) + '…' : conn.person;
    nameText.textContent = displayName;
    nodeGroup.appendChild(nameText);
    
    svg.appendChild(nodeGroup);
    
    // Tooltip with description (positioned below/beside node)
    const tooltipY = y > center ? y + 45 : y - 45;
    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tooltip.setAttribute('x', x);
    tooltip.setAttribute('y', tooltipY);
    tooltip.setAttribute('text-anchor', 'middle');
    tooltip.setAttribute('fill', 'rgba(245, 240, 232, 0.7)');
    tooltip.setAttribute('font-size', '9');
    tooltip.classList.add('mandala-tooltip');
    tooltip.style.animationDelay = `${delay + 0.5}s`;
    // Truncate description
    const desc = conn.description.length > 25 ? conn.description.substring(0, 24) + '…' : conn.description;
    tooltip.textContent = desc;
    svg.appendChild(tooltip);
  });
  
  // Clear and append
  container.innerHTML = '';
  container.appendChild(svg);
}

// Add CSS for mandala animations
function addMandalaStyles() {
  if (document.getElementById('mandala-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'mandala-styles';
  style.textContent = `
    @keyframes mandalaFadeIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes mandalaLineGrow {
      from { stroke-dashoffset: 200; opacity: 0; }
      to { stroke-dashoffset: 0; opacity: 0.6; }
    }
    
    @keyframes mandalaNodePop {
      0% { opacity: 0; transform: scale(0); }
      70% { transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes mandalaRingSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes tooltipFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .animate-fade-out {
      animation: fadeOut 0.5s ease-out forwards;
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    .mandala-center {
      animation: mandalaFadeIn 0.8s ease-out forwards;
    }
    
    .mandala-line {
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      animation: mandalaLineGrow 0.6s ease-out forwards;
    }
    
    .mandala-node {
      opacity: 0;
      transform-origin: center;
      animation: mandalaNodePop 0.5s ease-out forwards;
    }
    
    .mandala-ring-anim {
      transform-origin: center;
      animation: mandalaRingSpin 60s linear infinite;
    }
    
    .mandala-tooltip {
      opacity: 0;
      animation: tooltipFadeIn 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

// Initialize mandala styles on load
addMandalaStyles();

// ========================================
// TATAMI Mode (Zen / Breathing)
// ========================================

let zenSession = null;
let breathPhase = 'inhale';
let zenStartTime = null;

function initTatami() {
  const startBtn = document.getElementById('start-zen-btn');
  const breathingCircle = document.getElementById('breathing-circle');
  const breathInstruction = document.getElementById('breath-instruction');
  const breathInstructionSub = document.getElementById('breath-instruction-sub');
  const koanContainer = document.getElementById('koan-container');
  const lang = getLang();
  
  // Load profile and record visit
  let profile = loadProfile();
  profile = recordVisit(profile);
  saveProfile(profile);
  
  if (!startBtn || !breathingCircle) return;
  
  startBtn.addEventListener('click', () => {
    if (zenSession) {
      stopZenSession(lang);
      startBtn.textContent = startBtn.dataset.startText;
    } else {
      startZenSession(breathingCircle, breathInstruction, breathInstructionSub, koanContainer, lang);
      startBtn.textContent = startBtn.dataset.stopText;
    }
  });
}

function startZenSession(circle, instruction, instructionSub, koanContainer, lang) {
  zenStartTime = Date.now();
  breathPhase = 'inhale';
  updateBreathPhase(circle, instruction, instructionSub, lang);
  
  zenSession = setInterval(() => {
    breathPhase = breathPhase === 'inhale' ? 'exhale' : 'inhale';
    updateBreathPhase(circle, instruction, instructionSub, lang);
    vibrate(breathPhase === 'inhale' ? [100] : [50, 50, 50]);
  }, 4000);
  
  setTimeout(async () => {
    if (zenSession && koanContainer) {
      await showKoan(koanContainer, lang);
    }
  }, 24000);
}

function stopZenSession(lang) {
  if (zenSession) {
    clearInterval(zenSession);
    zenSession = null;
    
    // Calculate session duration
    const duration = zenStartTime ? Math.round((Date.now() - zenStartTime) / 60000) : 1;
    
    // Record tatami session
    let profile = loadProfile();
    profile = recordActivityToProfile(profile, 'tatami', { breathingMinutes: duration });
    saveProfile(profile);
    
    zenStartTime = null;
  }
}

function updateBreathPhase(circle, instruction, instructionSub, lang) {
  circle.classList.remove('inhale', 'exhale');
  void circle.offsetWidth;
  circle.classList.add(breathPhase);
  
  if (instruction) {
    const t = i18n.tatami;
    if (breathPhase === 'inhale') {
      instruction.textContent = t.breatheIn[lang];
      if (instructionSub) {
        instructionSub.textContent = lang === 'ja' ? 'Breathe in' : '';
      }
    } else {
      instruction.textContent = t.breatheOut[lang];
      if (instructionSub) {
        instructionSub.textContent = lang === 'ja' ? 'Breathe out' : '';
      }
    }
  }
}

async function showKoan(container, lang) {
  try {
    const response = await fetch(`/api/zen/koan?lang=${lang}`);
    const data = await response.json();
    
    const koanText = container.querySelector('#koan-text');
    if (koanText) {
      koanText.textContent = `"${data.text}"`;
    }
    
    container.classList.remove('hidden');
    container.classList.add('animate-fade-in');
  } catch (err) {
    console.error('Failed to fetch koan:', err);
  }
}

// ========================================
// Mobile Menu Toggle (initialized in initMobileMenu at DOMContentLoaded)
// ========================================
// Note: Main mobile menu functions are defined at end of file with initMobileMenu()

// ========================================
// Soundscape Control
// ========================================

function initSoundControl(mode) {
  const lang = getLang();
  
  if (mode === 'tatami') {
    initTatamiSoundControl(lang);
  } else if (mode === 'garden') {
    initGardenSoundControl(lang);
  }
}

function initTatamiSoundControl(lang) {
  const toggleBtn = document.getElementById('sound-toggle-btn');
  const iconOff = document.getElementById('sound-icon-off');
  const iconOn = document.getElementById('sound-icon-on');
  const presetsContainer = document.getElementById('sound-presets');
  const volumeControl = document.getElementById('volume-control');
  const volumeSlider = document.getElementById('volume-slider');
  const presetButtons = document.querySelectorAll('#sound-presets .sound-preset');
  
  if (!toggleBtn || !window.soundscape) return;
  
  let currentPreset = 'tatami';
  let isPlaying = false;
  
  // Toggle button
  toggleBtn.addEventListener('click', async () => {
    if (isPlaying) {
      window.soundscape.stop();
      isPlaying = false;
      iconOff.classList.remove('hidden');
      iconOn.classList.add('hidden');
      presetsContainer.classList.add('hidden');
      volumeControl.classList.add('hidden');
    } else {
      await window.soundscape.play(currentPreset);
      isPlaying = true;
      iconOff.classList.add('hidden');
      iconOn.classList.remove('hidden');
      presetsContainer.classList.remove('hidden');
      presetsContainer.classList.add('flex');
      volumeControl.classList.remove('hidden');
      volumeControl.classList.add('flex');
      updatePresetButtons(currentPreset, presetButtons);
    }
  });
  
  // Preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentPreset = btn.dataset.preset;
      await window.soundscape.play(currentPreset);
      isPlaying = true;
      iconOff.classList.add('hidden');
      iconOn.classList.remove('hidden');
      updatePresetButtons(currentPreset, presetButtons);
    });
  });
  
  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      window.soundscape.setVolume(e.target.value / 100);
    });
  }
}

function initGardenSoundControl(lang) {
  const toggleBtn = document.getElementById('garden-sound-toggle');
  const iconOff = document.getElementById('garden-sound-icon-off');
  const iconOn = document.getElementById('garden-sound-icon-on');
  const presetsContainer = document.getElementById('garden-sound-presets');
  const volumeSlider = document.getElementById('garden-volume-slider');
  const presetButtons = document.querySelectorAll('#garden-sound-presets .sound-preset');
  const soundControl = document.getElementById('garden-sound-control');
  
  if (!toggleBtn || !window.soundscape) {
    console.log('[Soundscape] Garden sound control not initialized - missing elements');
    return;
  }
  
  console.log('[Soundscape] Garden sound control initialized');
  
  let currentPreset = 'garden';
  let isPlaying = false;
  let menuOpen = false;
  
  // Helper function to open menu
  function openMenu() {
    presetsContainer.classList.remove('hidden');
    presetsContainer.classList.add('flex', 'flex-col');
    menuOpen = true;
    console.log('[Soundscape] Menu opened');
  }
  
  // Helper function to close menu
  function closeMenu() {
    presetsContainer.classList.add('hidden');
    presetsContainer.classList.remove('flex', 'flex-col');
    menuOpen = false;
    console.log('[Soundscape] Menu closed');
  }
  
  // Helper function to stop sound
  function stopSound() {
    window.soundscape.stop();
    isPlaying = false;
    iconOff.classList.remove('hidden');
    iconOn.classList.add('hidden');
    console.log('[Soundscape] Sound stopped');
  }
  
  // Toggle button - toggle menu AND sound
  toggleBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[Soundscape] Toggle clicked, menuOpen:', menuOpen);
    
    if (!menuOpen) {
      // Open menu and start playing if not already
      openMenu();
      
      if (!isPlaying) {
        await window.soundscape.play(currentPreset);
        isPlaying = true;
        iconOff.classList.add('hidden');
        iconOn.classList.remove('hidden');
        updatePresetButtons(currentPreset, presetButtons);
      }
    } else {
      // Close menu (but keep sound playing)
      closeMenu();
    }
  });
  
  // Long press to stop sound (both mouse and touch)
  let pressTimer;
  const startPress = () => {
    pressTimer = setTimeout(() => {
      if (isPlaying) {
        stopSound();
        closeMenu();
      }
    }, 500);
  };
  const endPress = () => clearTimeout(pressTimer);
  
  toggleBtn.addEventListener('mousedown', startPress);
  toggleBtn.addEventListener('mouseup', endPress);
  toggleBtn.addEventListener('mouseleave', endPress);
  toggleBtn.addEventListener('touchstart', startPress, { passive: true });
  toggleBtn.addEventListener('touchend', endPress);
  toggleBtn.addEventListener('touchcancel', endPress);
  
  // Click/Touch outside to close menu (but keep sound playing)
  function handleOutsideClick(e) {
    if (!menuOpen) return;
    if (!soundControl) return;
    
    const target = e.target;
    const isInsideControl = soundControl.contains(target);
    
    console.log('[Soundscape] Outside click check:', { menuOpen, isInsideControl, target: target.id || target.className });
    
    if (!isInsideControl) {
      closeMenu();
    }
  }
  
  // Use capture phase for better detection
  document.addEventListener('click', handleOutsideClick, true);
  document.addEventListener('touchend', (e) => {
    // Small delay to allow click to process first
    setTimeout(() => handleOutsideClick(e), 10);
  }, { passive: true });
  
  // Preset buttons - switch sound
  presetButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentPreset = btn.dataset.preset;
      await window.soundscape.play(currentPreset);
      isPlaying = true;
      iconOff.classList.add('hidden');
      iconOn.classList.remove('hidden');
      updatePresetButtons(currentPreset, presetButtons);
    });
  });
  
  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      window.soundscape.setVolume(e.target.value / 100);
    });
  }
  
  // Stop button
  const stopBtn = document.getElementById('garden-sound-stop');
  if (stopBtn) {
    stopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopSound();
      closeMenu();
    });
  }
}

function updatePresetButtons(activePreset, buttons) {
  buttons.forEach(btn => {
    if (btn.dataset.preset === activePreset) {
      btn.classList.add('bg-gold/30', 'text-gold', 'border-gold/50');
      btn.classList.remove('bg-ecru/10', 'text-ecru/60');
    } else {
      btn.classList.remove('bg-gold/30', 'text-gold', 'border-gold/50');
      btn.classList.add('bg-ecru/10', 'text-ecru/60');
    }
  });
}

// ========================================
// Weekly Report
// ========================================

function initWeeklyReport() {
  const lang = getLang();
  const profile = loadProfile();
  
  // Calculate week range
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  
  // Format date range
  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return lang === 'en' 
      ? `${month}/${day}`
      : `${month}月${day}日`;
  };
  
  const dateRangeEl = document.getElementById('report-date-range');
  if (dateRangeEl) {
    dateRangeEl.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  }
  
  // Calculate weekly stats from activities
  const weekStart = startOfWeek.toISOString().split('T')[0];
  const weeklyActivities = profile.activities.filter(a => {
    const activityDate = a.date.split('T')[0];
    return activityDate >= weekStart;
  });
  
  // Count by type
  const gardenCount = weeklyActivities.filter(a => a.type === 'garden').length;
  const studyCount = weeklyActivities.filter(a => a.type === 'study').length;
  const tatamiCount = weeklyActivities.filter(a => a.type === 'tatami').length;
  const totalSessions = gardenCount + studyCount + tatamiCount;
  
  // Count repairs this week
  const weeklyRepairs = profile.cracks.filter(c => {
    if (!c.repaired || !c.repairedDate) return false;
    const repairDate = c.repairedDate.split('T')[0];
    return repairDate >= weekStart;
  }).length;
  
  // Update summary cards
  document.getElementById('report-streak').textContent = profile.stats.currentStreak;
  document.getElementById('report-total-sessions').textContent = totalSessions;
  document.getElementById('report-repairs').textContent = weeklyRepairs;
  
  // Most active mode
  const mostActiveIcon = document.getElementById('report-most-active-icon');
  const mostActiveName = document.getElementById('report-most-active-name');
  if (mostActiveIcon && mostActiveName) {
    const modes = [
      { count: gardenCount, icon: '🌱', name: { en: 'Garden', ja: '庭' } },
      { count: studyCount, icon: '📚', name: { en: 'Study', ja: '書斎' } },
      { count: tatamiCount, icon: '🧘', name: { en: 'Tatami', ja: '座敷' } }
    ];
    const mostActive = modes.reduce((a, b) => a.count > b.count ? a : b);
    if (mostActive.count > 0) {
      mostActiveIcon.textContent = mostActive.icon;
      mostActiveName.textContent = mostActive.name[lang];
    } else {
      mostActiveIcon.textContent = '—';
      mostActiveName.textContent = lang === 'en' ? 'None yet' : 'まだなし';
    }
  }
  
  // Activity breakdown bars
  const maxCount = Math.max(gardenCount, studyCount, tatamiCount, 1);
  document.getElementById('report-garden-count').textContent = gardenCount;
  document.getElementById('report-garden-bar').style.width = `${(gardenCount / maxCount) * 100}%`;
  document.getElementById('report-study-count').textContent = studyCount;
  document.getElementById('report-study-bar').style.width = `${(studyCount / maxCount) * 100}%`;
  document.getElementById('report-tatami-count').textContent = tatamiCount;
  document.getElementById('report-tatami-bar').style.width = `${(tatamiCount / maxCount) * 100}%`;
  
  // Daily calendar
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    const dayStr = dayDate.toISOString().split('T')[0];
    
    const dayEl = document.getElementById(`day-${i}`);
    const dayContent = document.getElementById(`day-${i}-content`);
    
    if (!dayEl || !dayContent) continue;
    
    // Count activities on this day
    const dayActivities = weeklyActivities.filter(a => a.date.split('T')[0] === dayStr);
    const dayRepairs = profile.cracks.filter(c => 
      c.repaired && c.repairedDate && c.repairedDate.split('T')[0] === dayStr
    ).length;
    
    const activityCount = dayActivities.length;
    
    // Style based on activity
    dayEl.classList.remove('bg-ecru-200', 'bg-green-200', 'bg-green-400', 'bg-gold');
    
    if (dayRepairs > 0) {
      dayEl.classList.add('bg-gold');
      dayContent.textContent = '✦';
      dayContent.classList.remove('text-ink-400');
      dayContent.classList.add('text-white');
    } else if (activityCount >= 3) {
      dayEl.classList.add('bg-green-400');
      dayContent.textContent = activityCount;
      dayContent.classList.remove('text-ink-400');
      dayContent.classList.add('text-white');
    } else if (activityCount >= 1) {
      dayEl.classList.add('bg-green-200');
      dayContent.textContent = activityCount;
      dayContent.classList.remove('text-white');
      dayContent.classList.add('text-green-800');
    } else {
      dayEl.classList.add('bg-ecru-200');
      dayContent.textContent = '-';
      dayContent.classList.remove('text-white', 'text-green-800');
      dayContent.classList.add('text-ink-400');
    }
  }
  
  // Weekly encouragement (based on performance)
  const encouragements = {
    excellent: {
      en: [
        '"You\'ve shown remarkable dedication this week. Your vessel shines brightly."',
        '"Every session has added golden light to your journey. Well done."',
        '"Your commitment to mindfulness is inspiring. Keep walking this beautiful path."'
      ],
      ja: [
        '「今週は素晴らしい取り組みでした。あなたの器は輝いています。」',
        '「すべてのセッションが、あなたの歩みに金の光を加えました。」',
        '「マインドフルネスへの取り組みは素晴らしいです。この美しい道を歩み続けてください。」'
      ]
    },
    good: {
      en: [
        '"Every step forward, no matter how small, is progress."',
        '"You\'re building something beautiful, one moment at a time."',
        '"Your presence here matters. Every breath is a victory."'
      ],
      ja: [
        '「どんなに小さくても、前への一歩は進歩です。」',
        '「一瞬一瞬、美しいものを築いています。」',
        '「ここにいること自体が大切です。一呼吸ごとが勝利です。」'
      ]
    },
    starting: {
      en: [
        '"The journey of a thousand miles begins with a single step."',
        '"Be gentle with yourself. You\'re exactly where you need to be."',
        '"Your vessel awaits. When you\'re ready, it will welcome you."'
      ],
      ja: [
        '「千里の道も一歩から。」',
        '「自分に優しくしてください。今いる場所が、今の正しい場所です。」',
        '「あなたの器は待っています。準備ができたら、迎え入れてくれます。」'
      ]
    }
  };
  
  let category = 'starting';
  if (totalSessions >= 7) {
    category = 'excellent';
  } else if (totalSessions >= 3) {
    category = 'good';
  }
  
  const messages = encouragements[category][lang];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const encouragementEl = document.getElementById('weekly-encouragement');
  if (encouragementEl) {
    encouragementEl.textContent = randomMessage;
  }
  
  // Initialize share functionality
  initShareFeature(profile, totalSessions, randomMessage, lang);
}

// ========================================
// Share Feature
// ========================================

function initShareFeature(profile, totalSessions, encouragement, lang) {
  // Update share card values
  const shareStreakEl = document.getElementById('share-streak-value');
  const shareMessageEl = document.getElementById('share-message');
  
  if (shareStreakEl) {
    shareStreakEl.textContent = profile.stats.currentStreak;
  }
  if (shareMessageEl) {
    // Use a shorter version for share
    const shareMessages = {
      en: [
        '"Your scars make you beautiful."',
        '"One step at a time, one breath at a time."',
        '"Every day is a new beginning."',
        '"In stillness, find strength."'
      ],
      ja: [
        '「傷は、あなたを美しくする。」',
        '「一歩ずつ、一呼吸ずつ。」',
        '「毎日が新しい始まり。」',
        '「静けさの中に、強さを見つける。」'
      ]
    };
    const msg = shareMessages[lang][Math.floor(Math.random() * shareMessages[lang].length)];
    shareMessageEl.textContent = msg;
  }
  
  // Generate share text
  const generateShareText = () => {
    const streakText = lang === 'en' 
      ? `🎯 ${profile.stats.currentStreak} day streak`
      : `🎯 ${profile.stats.currentStreak}日連続`;
    
    const sessionText = lang === 'en'
      ? `📊 ${totalSessions} sessions this week`
      : `📊 今週${totalSessions}セッション`;
    
    const tagline = lang === 'en'
      ? '✨ Your scars make you beautiful'
      : '✨ 傷が、あなたを美しくする';
    
    return `${streakText}\n${sessionText}\n\n${tagline}\n\n#KintsugiMind #金継ぎ #Mindfulness`;
  };
  
  // Copy text button
  const copyBtn = document.getElementById('share-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = generateShareText();
      try {
        await navigator.clipboard.writeText(text);
        // Show feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${lang === 'en' ? 'Copied!' : 'コピーしました！'}`;
        copyBtn.classList.add('bg-green-100', 'text-green-700');
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.classList.remove('bg-green-100', 'text-green-700');
        }, 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    });
  }
  
  // Twitter/X button
  const twitterBtn = document.getElementById('share-twitter-btn');
  if (twitterBtn) {
    twitterBtn.addEventListener('click', () => {
      const text = generateShareText();
      const url = window.location.origin;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank', 'width=550,height=420');
    });
  }
  
  // Native share button
  const nativeBtn = document.getElementById('share-native-btn');
  if (nativeBtn) {
    // Only show if Web Share API is supported
    if (navigator.share) {
      nativeBtn.addEventListener('click', async () => {
        const text = generateShareText();
        try {
          await navigator.share({
            title: 'KINTSUGI MIND',
            text: text,
            url: window.location.origin
          });
        } catch (e) {
          if (e.name !== 'AbortError') {
            console.error('Share failed:', e);
          }
        }
      });
    } else {
      // Hide native share button if not supported
      nativeBtn.style.display = 'none';
    }
  }
}

// ========================================
// Onboarding System
// ========================================

const ONBOARDING_KEY = 'kintsugi-onboarding-complete';
const VESSEL_KEY = 'kintsugi-vessel';

let currentOnboardingStep = 1;
let selectedVessel = null;

// Check if user has completed onboarding
function hasCompletedOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

// Mark onboarding as complete
function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

// Get selected vessel
function getSelectedVessel() {
  return localStorage.getItem(VESSEL_KEY) || 'chawan';
}

// Save selected vessel
function saveSelectedVessel(vesselId) {
  localStorage.setItem(VESSEL_KEY, vesselId);
}

// Navigate to onboarding step
function goToStep(step) {
  const prevStep = document.getElementById(`onboarding-step-${currentOnboardingStep}`);
  const nextStep = document.getElementById(`onboarding-step-${step}`);
  const prevDot = document.getElementById(`dot-${currentOnboardingStep}`);
  const nextDot = document.getElementById(`dot-${step}`);
  
  if (prevStep && nextStep) {
    // Fade out current step
    prevStep.classList.add('opacity-0', 'pointer-events-none');
    prevStep.classList.remove('opacity-100');
    
    // Fade in next step
    setTimeout(() => {
      nextStep.classList.remove('opacity-0', 'pointer-events-none');
      nextStep.classList.add('opacity-100');
    }, 300);
    
    // Update dots
    if (prevDot) {
      prevDot.classList.remove('bg-gold', 'w-4');
      prevDot.classList.add('bg-indigo-300', 'dark:bg-[#4a4a4a]', 'w-2');
    }
    if (nextDot) {
      nextDot.classList.remove('bg-indigo-300', 'dark:bg-[#4a4a4a]', 'w-2');
      nextDot.classList.add('bg-gold', 'w-4');
    }
    
    currentOnboardingStep = step;
    
    // Trigger crack animation on step 2
    if (step === 2) {
      setTimeout(() => {
        const crackLine = document.getElementById('crack-line');
        if (crackLine) {
          crackLine.style.strokeDashoffset = '0';
          crackLine.style.transition = 'stroke-dashoffset 2s ease-out';
        }
      }, 500);
    }
  }
}

// Select a vessel
function selectVessel(vesselId) {
  selectedVessel = vesselId;
  
  // Update UI
  document.querySelectorAll('.vessel-option').forEach(btn => {
    btn.classList.remove('border-gold', 'ring-2', 'ring-gold/30', 'scale-105');
    btn.classList.add('border-transparent');
  });
  
  const selected = document.querySelector(`[data-vessel="${vesselId}"]`);
  if (selected) {
    selected.classList.remove('border-transparent');
    selected.classList.add('border-gold', 'ring-2', 'ring-gold/30', 'scale-105');
    
    // Show confirm section
    const confirmSection = document.getElementById('vessel-confirm');
    const vesselNameEl = document.getElementById('selected-vessel-name');
    if (confirmSection && vesselNameEl) {
      confirmSection.classList.remove('hidden');
      
      const vesselNames = {
        chawan: { en: 'Tea Bowl', ja: '茶碗' },
        tsubo: { en: 'Jar', ja: '壺' },
        sara: { en: 'Plate', ja: '皿' },
        tokkuri: { en: 'Sake Bottle', ja: '徳利' },
        hachi: { en: 'Bowl', ja: '鉢' }
      };
      const lang = getLang();
      vesselNameEl.textContent = vesselNames[vesselId]?.[lang] || vesselId;
    }
  }
  
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// Complete onboarding
function completeOnboarding() {
  if (selectedVessel) {
    saveSelectedVessel(selectedVessel);
  }
  markOnboardingComplete();
  
  // Add profile vessel type
  let profile = loadProfile();
  profile.vesselType = selectedVessel || 'chawan';
  saveProfile(profile);
  
  // Redirect to home with animation
  const container = document.getElementById('onboarding-container');
  if (container) {
    container.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    container.style.opacity = '0';
    container.style.transform = 'scale(1.1)';
  }
  
  setTimeout(() => {
    const lang = getLang();
    window.location.href = `/?lang=${lang}`;
  }, 500);
}

// Skip onboarding
function skipOnboarding() {
  markOnboardingComplete();
  const lang = getLang();
  window.location.href = `/?lang=${lang}`;
}

// Check and redirect to onboarding if needed
function checkOnboardingRedirect() {
  const path = window.location.pathname;
  
  // Don't redirect if already on welcome page
  if (path === '/welcome') return false;
  
  // Only redirect from home page
  if (path === '/' && !hasCompletedOnboarding()) {
    const lang = getLang();
    window.location.href = `/welcome?lang=${lang}`;
    return true;
  }
  
  return false;
}

// Initialize onboarding page
function initOnboarding() {
  console.log('[Onboarding] Initializing...');
  
  // Make functions globally available
  window.goToStep = goToStep;
  window.selectVessel = selectVessel;
  window.completeOnboarding = completeOnboarding;
  window.skipOnboarding = skipOnboarding;
  
  // Set initial dot state
  const dot1 = document.getElementById('dot-1');
  if (dot1) {
    dot1.classList.add('w-4');
    dot1.classList.remove('w-2');
  }
}

// ========================================
// Initialize based on current page
// ========================================

console.log('[KINTSUGI] app.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[KINTSUGI] DOMContentLoaded fired');
  const path = window.location.pathname;
  console.log('[KINTSUGI] Current path:', path);
  
  // Initialize dark mode toggle
  initDarkMode();
  
  // Check authentication status (non-blocking)
  checkAuthStatus();
  
  // Initialize logout button if present
  initLogout();
  
  // Save language preference
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam) {
    localStorage.setItem('kintsugi-lang', langParam);
  }
  
  // Check for onboarding redirect (only on home page)
  if (checkOnboardingRedirect()) {
    return; // Stop further initialization if redirecting
  }
  
  // Initialize based on page
  if (path === '/welcome') {
    initOnboarding();
  } else if (path === '/profile') {
    initProfile();
  } else if (path === '/check-in') {
    // Record visit
    let profile = loadProfile();
    profile = recordVisit(profile);
    saveProfile(profile);
    
    // Save weather check-in to history if weather is selected
    const weatherParam = urlParams.get('weather');
    if (weatherParam && ['sunny', 'cloudy', 'rainy', 'stormy'].includes(weatherParam)) {
      saveCheckinToHistory(weatherParam);
      
      // Also send to server (non-blocking)
      fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: weatherParam })
      }).catch(e => console.log('Server checkin failed, saved locally'));
    }
  } else if (path === '/garden') {
    initGarden();
    initSoundControl('garden');
  } else if (path === '/study') {
    initStudy();
  } else if (path === '/tatami') {
    initTatami();
    initSoundControl('tatami');
  } else if (path === '/report') {
    initWeeklyReport();
  } else if (path === '/') {
    // Home page - record visit and update seasonal elements
    let profile = loadProfile();
    profile = recordVisit(profile);
    saveProfile(profile);
    
    // Update seasonal greetings and messages
    const lang = getLang();
    updateSeasonalElements(lang);
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Update language switcher to preserve current path
  document.querySelectorAll('.rounded-full a[href^="?lang="]').forEach(link => {
    const lang = link.href.includes('lang=ja') ? 'ja' : 'en';
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', lang);
    link.href = currentUrl.toString();
  });
  
  // Initialize mobile menu
  initMobileMenu();
});

// ========================================
// Mobile Menu System
// ========================================

let mobileMenuOpen = false;

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  
  if (!mobileMenu) return;
  
  mobileMenuOpen = !mobileMenuOpen;
  
  if (mobileMenuOpen) {
    mobileMenu.classList.remove('hidden');
    if (iconOpen) iconOpen.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
  } else {
    mobileMenu.classList.add('hidden');
    if (iconOpen) iconOpen.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  
  if (!mobileMenu) return;
  
  mobileMenuOpen = false;
  mobileMenu.classList.add('hidden');
  if (iconOpen) iconOpen.classList.remove('hidden');
  if (iconClose) iconClose.classList.add('hidden');
}

function initMobileMenu() {
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBtn = document.getElementById('mobile-menu-btn');
    
    if (!mobileMenu || !menuBtn) return;
    
    // Check if click is outside menu and menu button
    if (mobileMenuOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  // Close menu when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      closeMobileMenu();
    }
  });
  
  // Close menu when clicking on menu links
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }
}

// Make toggleMobileMenu globally accessible
window.toggleMobileMenu = toggleMobileMenu;
