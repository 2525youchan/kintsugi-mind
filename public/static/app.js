/**
 * KINTSUGI MIND - Frontend Application
 * The Japanese Art of Resilience
 */

// ========================================
// Language & Utility Functions
// ========================================

function getLang() {
  // Check URL params
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang');
  if (lang === 'ja' || lang === 'en') {
    localStorage.setItem('kintsugi-lang', lang);
    return lang;
  }
  
  // Check localStorage
  const stored = localStorage.getItem('kintsugi-lang');
  if (stored === 'ja' || stored === 'en') {
    return stored;
  }
  
  // Check data-lang attribute
  const dataLang = document.body.closest('[data-lang]')?.dataset?.lang;
  if (dataLang) return dataLang;
  
  // Default to English
  return 'en';
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Haptic feedback (if supported)
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
  }
};

// ========================================
// Check-in Page Logic
// ========================================

function initCheckIn() {
  const weatherButtons = document.querySelectorAll('#weather-selection button, #weather-selection a');
  const lang = getLang();
  
  weatherButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // If it's a link, let it navigate naturally
      if (button.tagName === 'A') return;
      
      e.preventDefault();
      const weather = button.dataset.weather;
      window.location.href = `/check-in?weather=${weather}&lang=${lang}`;
    });
  });
}

// ========================================
// GARDEN Mode (Morita Therapy)
// ========================================

let clouds = [];
let plants = [];

function initGarden() {
  const emotionInput = document.getElementById('emotion-input');
  const addCloudBtn = document.getElementById('add-cloud-btn');
  const cloudContainer = document.getElementById('cloud-container');
  const actionCheckboxes = document.querySelectorAll('#action-list input[type="checkbox"]');
  const gardenPlants = document.getElementById('garden-plants');
  const lang = getLang();
  
  if (!emotionInput || !addCloudBtn) return;
  
  // Add cloud when button clicked
  addCloudBtn.addEventListener('click', () => {
    const emotion = emotionInput.value.trim();
    if (emotion) {
      addCloud(emotion, cloudContainer);
      emotionInput.value = '';
      fetchMoritaGuidance(emotion, lang);
    }
  });
  
  // Also add cloud on Enter key
  emotionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCloudBtn.click();
    }
  });
  
  // Track action completions
  actionCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const action = checkbox.dataset.action;
      if (checkbox.checked) {
        growPlant(gardenPlants);
        vibrate([50]);
        recordAction(action, true, lang);
      }
    });
  });
}

function addCloud(text, container) {
  // Clear placeholder if exists
  const placeholder = container.querySelector('.opacity-50');
  if (placeholder) {
    placeholder.remove();
  }
  
  const cloud = document.createElement('div');
  cloud.className = 'cloud absolute px-4 py-2 text-sm text-ink-600 max-w-xs animate-fade-in';
  cloud.textContent = text;
  
  // Random position in the sky
  cloud.style.left = `${randomBetween(10, 70)}%`;
  cloud.style.top = `${randomBetween(10, 60)}%`;
  cloud.style.animationDelay = `${randomBetween(0, 2)}s`;
  
  container.appendChild(cloud);
  clouds.push({ text, element: cloud });
}

function growPlant(container) {
  // Clear placeholder if exists
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
  
  if (!chatContainer || !inputEl || !sendBtn) return;
  
  sendBtn.addEventListener('click', () => {
    const response = inputEl.value.trim();
    if (response) {
      addUserMessage(response, chatContainer);
      naikanResponses.push(response);
      inputEl.value = '';
      
      // Move to next question after a delay
      setTimeout(() => {
        naikanStep++;
        if (naikanStep <= 3) {
          addNaikanQuestion(naikanStep, chatContainer, lang);
          updateProgress(naikanStep, lang);
        } else {
          showNaikanConclusion(chatContainer, lang);
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
  
  updateProgress(4, lang); // All complete
}

// ========================================
// TATAMI Mode (Zen / Breathing)
// ========================================

let zenSession = null;
let breathPhase = 'inhale';

function initTatami() {
  const startBtn = document.getElementById('start-zen-btn');
  const breathingCircle = document.getElementById('breathing-circle');
  const breathInstruction = document.getElementById('breath-instruction');
  const breathInstructionSub = document.getElementById('breath-instruction-sub');
  const koanContainer = document.getElementById('koan-container');
  const lang = getLang();
  
  if (!startBtn || !breathingCircle) return;
  
  startBtn.addEventListener('click', () => {
    if (zenSession) {
      stopZenSession();
      startBtn.textContent = startBtn.dataset.startText;
    } else {
      startZenSession(breathingCircle, breathInstruction, breathInstructionSub, koanContainer, lang);
      startBtn.textContent = startBtn.dataset.stopText;
    }
  });
}

function startZenSession(circle, instruction, instructionSub, koanContainer, lang) {
  // Start breathing cycle
  breathPhase = 'inhale';
  updateBreathPhase(circle, instruction, instructionSub, lang);
  
  zenSession = setInterval(() => {
    breathPhase = breathPhase === 'inhale' ? 'exhale' : 'inhale';
    updateBreathPhase(circle, instruction, instructionSub, lang);
    
    // Haptic feedback at phase change
    vibrate(breathPhase === 'inhale' ? [100] : [50, 50, 50]);
  }, 4000); // 4 seconds per phase
  
  // Show koan after some time
  setTimeout(async () => {
    if (zenSession && koanContainer) {
      await showKoan(koanContainer, lang);
    }
  }, 24000); // Show after 24 seconds (3 full cycles)
}

function stopZenSession() {
  if (zenSession) {
    clearInterval(zenSession);
    zenSession = null;
  }
}

function updateBreathPhase(circle, instruction, instructionSub, lang) {
  circle.classList.remove('inhale', 'exhale');
  void circle.offsetWidth; // Force reflow for animation restart
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
// Initialize based on current page
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  // Save language preference when switching
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam) {
    localStorage.setItem('kintsugi-lang', langParam);
  }
  
  if (path === '/check-in') {
    initCheckIn();
  } else if (path === '/garden') {
    initGarden();
  } else if (path === '/study') {
    initStudy();
  } else if (path === '/tatami') {
    initTatami();
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
