/**
 * KINTSUGI MIND - Frontend Application
 * The Japanese Art of Resilience
 */

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

// Generate crack SVG paths
function generateCrackPaths(cracks) {
  const pathVariations = [
    (h) => `M${60 + (h % 40)} 40 L${55 + (h % 30)} 80 L${65 + (h % 20)} 120 L${50 + (h % 40)} 160`,
    (h) => `M${100 + (h % 30)} 50 L${110 + (h % 20)} 90 L${95 + (h % 25)} 130`,
    (h) => `M${70 + (h % 30)} 100 L${85 + (h % 20)} 140 L${75 + (h % 25)} 180`,
    (h) => `M${110 + (h % 25)} 70 L${120 + (h % 20)} 110 L${105 + (h % 30)} 150 L${115 + (h % 20)} 190`,
    (h) => `M${80 + (h % 20)} 130 L${95 + (h % 25)} 170 L${85 + (h % 20)} 200`,
    (h) => `M${50 + (h % 30)} 80 L${60 + (h % 25)} 120 L${45 + (h % 30)} 160`,
    (h) => `M${130 + (h % 20)} 60 L${140 + (h % 15)} 100 L${125 + (h % 25)} 140`,
    (h) => `M${90 + (h % 25)} 50 L${100 + (h % 20)} 85 L${85 + (h % 30)} 120 L${95 + (h % 20)} 155`
  ];
  
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
}

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
  
  // Vessel visual
  const visual = calculateVesselVisual(profile);
  
  document.getElementById('depth-value').textContent = `${Math.round(visual.depth)}%`;
  document.getElementById('depth-bar').style.width = `${visual.depth}%`;
  document.getElementById('gold-value').textContent = `${Math.round(visual.goldIntensity)}%`;
  document.getElementById('gold-bar').style.width = `${visual.goldIntensity}%`;
  
  // Render cracks on vessel
  const cracksGroup = document.getElementById('cracks-group');
  if (cracksGroup) {
    cracksGroup.innerHTML = '';
    const crackPaths = generateCrackPaths(profile.cracks);
    
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

function initGarden() {
  const emotionInput = document.getElementById('emotion-input');
  const addCloudBtn = document.getElementById('add-cloud-btn');
  const cloudContainer = document.getElementById('cloud-container');
  const actionCheckboxes = document.querySelectorAll('#action-list input[type="checkbox"]');
  const gardenPlants = document.getElementById('garden-plants');
  const lang = getLang();
  
  // Load profile and record visit
  let profile = loadProfile();
  profile = recordVisit(profile);
  saveProfile(profile);
  
  if (!emotionInput || !addCloudBtn) return;
  
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
  
  actionCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const action = checkbox.dataset.action;
      if (checkbox.checked) {
        growPlant(gardenPlants);
        vibrate([50]);
        gardenActionCount++;
        
        // Record activity
        let profile = loadProfile();
        profile = recordActivityToProfile(profile, 'garden', { actionCount: 1 });
        saveProfile(profile);
        
        recordAction(action, true, lang);
      }
    });
  });
}

function addCloud(text, container) {
  const placeholder = container.querySelector('.opacity-50');
  if (placeholder) {
    placeholder.remove();
  }
  
  const cloud = document.createElement('div');
  cloud.className = 'cloud absolute px-4 py-2 text-sm text-ink-600 max-w-xs animate-fade-in';
  cloud.textContent = text;
  
  cloud.style.left = `${randomBetween(10, 70)}%`;
  cloud.style.top = `${randomBetween(10, 60)}%`;
  cloud.style.animationDelay = `${randomBetween(0, 2)}s`;
  
  container.appendChild(cloud);
  clouds.push({ text, element: cloud });
}

function growPlant(container) {
  const placeholder = container.querySelector('.text-center');
  if (placeholder) {
    placeholder.remove();
  }
  
  const plantTypes = ['🌱', '🌿', '🍀', '🌾', '🌻'];
  const plant = document.createElement('div');
  plant.className = 'text-3xl animate-grow';
  plant.textContent = plantTypes[plants.length % plantTypes.length];
  plant.style.animationDelay = '0.1s';
  
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
// STUDY Mode (Naikan Therapy)
// ========================================

let naikanStep = 1;
let naikanResponses = [];

function initStudy() {
  const chatContainer = document.getElementById('naikan-chat');
  const inputEl = document.getElementById('naikan-input');
  const sendBtn = document.getElementById('naikan-send-btn');
  const lang = getLang();
  
  // Load profile and record visit
  let profile = loadProfile();
  profile = recordVisit(profile);
  saveProfile(profile);
  
  if (!chatContainer || !inputEl || !sendBtn) return;
  
  sendBtn.addEventListener('click', () => {
    const response = inputEl.value.trim();
    if (response) {
      addUserMessage(response, chatContainer);
      naikanResponses.push(response);
      inputEl.value = '';
      
      setTimeout(() => {
        naikanStep++;
        if (naikanStep <= 3) {
          addNaikanQuestion(naikanStep, chatContainer, lang);
          updateProgress(naikanStep, lang);
        } else {
          showNaikanConclusion(chatContainer, lang);
          
          // Record study session completion
          let profile = loadProfile();
          profile = recordActivityToProfile(profile, 'study', { questionsAnswered: 3 });
          saveProfile(profile);
        }
      }, 1000);
    }
  });
  
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });
}

function addUserMessage(text, container) {
  const message = document.createElement('div');
  message.className = 'chat-bubble user bg-indigo-100 p-4 max-w-[80%] ml-auto animate-fade-in';
  message.innerHTML = `<p class="text-ink-700">${text}</p>`;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
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
  `;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
  
  updateProgress(4, lang);
}

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
// Mobile Menu Toggle
// ========================================

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  
  if (mobileMenu) {
    const isHidden = mobileMenu.classList.contains('hidden');
    
    if (isHidden) {
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('animate-fade-in');
      if (iconOpen) iconOpen.classList.add('hidden');
      if (iconClose) iconClose.classList.remove('hidden');
    } else {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('animate-fade-in');
      if (iconOpen) iconOpen.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
    }
  }
}

// Make toggleMobileMenu available globally (for onclick attribute)
window.toggleMobileMenu = toggleMobileMenu;

// ========================================
// Initialize based on current page
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  // Save language preference
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam) {
    localStorage.setItem('kintsugi-lang', langParam);
  }
  
  // Initialize based on page
  if (path === '/profile') {
    initProfile();
  } else if (path === '/check-in') {
    // Just record visit
    let profile = loadProfile();
    profile = recordVisit(profile);
    saveProfile(profile);
  } else if (path === '/garden') {
    initGarden();
  } else if (path === '/study') {
    initStudy();
  } else if (path === '/tatami') {
    initTatami();
  } else if (path === '/') {
    // Home page - just record visit
    let profile = loadProfile();
    profile = recordVisit(profile);
    saveProfile(profile);
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
});
