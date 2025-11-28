/**
 * KINTSUGI MIND - Frontend Application
 * The Japanese Art of Resilience
 */

// ========================================
// Utility Functions
// ========================================

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
// Check-in Page Logic
// ========================================

function initCheckIn() {
  const weatherButtons = document.querySelectorAll('#weather-selection button');
  
  weatherButtons.forEach(button => {
    button.addEventListener('click', () => {
      const weather = button.dataset.weather;
      window.location.href = `/check-in?weather=${weather}`;
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
  
  if (!emotionInput || !addCloudBtn) return;
  
  // Add cloud when button clicked
  addCloudBtn.addEventListener('click', () => {
    const emotion = emotionInput.value.trim();
    if (emotion) {
      addCloud(emotion, cloudContainer);
      emotionInput.value = '';
      fetchMoritaGuidance(emotion);
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
        recordAction(action, true);
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

async function fetchMoritaGuidance(emotion) {
  try {
    const response = await fetch('/api/morita/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion })
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

async function recordAction(action, completed) {
  try {
    await fetch('/api/garden/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, completed })
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
          fetchNaikanQuestion(naikanStep, chatContainer);
          updateProgress(naikanStep);
        } else {
          showNaikanConclusion(chatContainer);
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

function addBotMessage(text, hint, container) {
  const message = document.createElement('div');
  message.className = 'chat-bubble bg-ecru-200 p-4 max-w-[80%] animate-fade-in';
  message.innerHTML = `
    <p class="text-ink-700 text-sm mb-1">
      <span class="text-gold">内観ガイド</span>
    </p>
    <p class="text-ink-600">${text}</p>
    ${hint ? `<p class="text-xs text-ink-400 mt-2">${hint}</p>` : ''}
  `;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

async function fetchNaikanQuestion(step, container) {
  try {
    const response = await fetch(`/api/naikan/question?step=${step}`);
    const data = await response.json();
    addBotMessage(data.japanese, data.hint, container);
  } catch (err) {
    console.error('Failed to fetch question:', err);
  }
}

function updateProgress(step) {
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
    progressText.textContent = `問い ${Math.min(step, 3)} / 3`;
  }
}

function showNaikanConclusion(container) {
  const message = document.createElement('div');
  message.className = 'chat-bubble bg-gold/20 p-4 max-w-[90%] animate-fade-in';
  message.innerHTML = `
    <p class="text-ink-700 text-sm mb-2">
      <span class="text-gold">内観ガイド</span>
    </p>
    <p class="text-ink-600 mb-4">
      ありがとうございます。今日の内観が終わりました。
    </p>
    <p class="text-ink-600 mb-4">
      あなたは多くの縁に支えられ、また多くを与えています。
      孤独ではありません。
    </p>
    <p class="text-ink-500 text-sm italic">
      "縁起 (Engi) — すべては繋がりの中に"
    </p>
  `;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
  
  updateProgress(4); // All complete
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
  const koanContainer = document.getElementById('koan-container');
  
  if (!startBtn || !breathingCircle) return;
  
  startBtn.addEventListener('click', () => {
    if (zenSession) {
      stopZenSession();
      startBtn.textContent = '座禅を始める';
    } else {
      startZenSession(breathingCircle, breathInstruction, koanContainer);
      startBtn.textContent = '終了する';
    }
  });
}

function startZenSession(circle, instruction, koanContainer) {
  // Start breathing cycle
  breathPhase = 'inhale';
  updateBreathPhase(circle, instruction);
  
  zenSession = setInterval(() => {
    breathPhase = breathPhase === 'inhale' ? 'exhale' : 'inhale';
    updateBreathPhase(circle, instruction);
    
    // Haptic feedback at phase change
    vibrate(breathPhase === 'inhale' ? [100] : [50, 50, 50]);
  }, 4000); // 4 seconds per phase
  
  // Show koan after some time
  setTimeout(async () => {
    if (zenSession && koanContainer) {
      await showKoan(koanContainer);
    }
  }, 24000); // Show after 24 seconds (3 full cycles)
}

function stopZenSession() {
  if (zenSession) {
    clearInterval(zenSession);
    zenSession = null;
  }
}

function updateBreathPhase(circle, instruction) {
  circle.classList.remove('inhale', 'exhale');
  void circle.offsetWidth; // Force reflow for animation restart
  circle.classList.add(breathPhase);
  
  if (instruction) {
    if (breathPhase === 'inhale') {
      instruction.innerHTML = '息を吸う';
      instruction.nextElementSibling.textContent = 'Breathe in';
    } else {
      instruction.innerHTML = '息を吐く';
      instruction.nextElementSibling.textContent = 'Breathe out';
    }
  }
}

async function showKoan(container) {
  try {
    const response = await fetch('/api/zen/koan');
    const data = await response.json();
    
    const koanText = container.querySelector('#koan-text');
    if (koanText) {
      koanText.textContent = `"${data.japanese}"`;
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
});
