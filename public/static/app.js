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
  
  actions.forEach(action => {
    const label = document.createElement('label');
    label.className = 'flex items-center gap-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors';
    label.innerHTML = `
      <input type="checkbox" class="w-5 h-5 accent-gold" data-action="${action.id}" />
      <span class="text-ink-700">${action.text}</span>
      <span class="text-ink-400 text-xs ml-auto">${action.time}</span>
    `;
    
    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        growPlant(gardenPlants);
        vibrate([50]);
        gardenActionCount++;
        
        // Record activity
        let profile = loadProfile();
        profile = recordActivityToProfile(profile, 'garden', { actionCount: 1 });
        saveProfile(profile);
        
        recordAction(action.id, true, lang);
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

console.log('[KINTSUGI] app.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[KINTSUGI] DOMContentLoaded fired');
  const path = window.location.pathname;
  console.log('[KINTSUGI] Current path:', path);
  
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
