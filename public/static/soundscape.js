/**
 * KINTSUGI MIND - Soundscape System
 * Ambient sounds for meditation and mindfulness
 * Uses Web Audio API for synthesized nature sounds
 */

class Soundscape {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.sounds = {};
    this.isPlaying = false;
    this.currentPreset = null;
    this.volume = 0.5;
    
    // Sound presets for different modes
    this.presets = {
      // TATAMI - Zen meditation sounds
      tatami: {
        name: { en: 'Zen Space', ja: '禅の空間' },
        sounds: ['silence', 'bell', 'wind'],
        description: { en: 'Peaceful silence with occasional bell', ja: '静寂と時折響く鈴の音' }
      },
      tatamiRain: {
        name: { en: 'Rain Meditation', ja: '雨音瞑想' },
        sounds: ['rain', 'thunder_distant'],
        description: { en: 'Gentle rain for deep focus', ja: '集中を深める優しい雨音' }
      },
      tatamiNight: {
        name: { en: 'Night Stillness', ja: '夜の静けさ' },
        sounds: ['crickets', 'wind_soft'],
        description: { en: 'Peaceful night ambiance', ja: '穏やかな夜の雰囲気' }
      },
      // GARDEN - Nature sounds
      garden: {
        name: { en: 'Garden Morning', ja: '朝の庭' },
        sounds: ['birds', 'wind_leaves', 'stream'],
        description: { en: 'Morning garden atmosphere', ja: '朝の庭の雰囲気' }
      },
      gardenForest: {
        name: { en: 'Forest Bathing', ja: '森林浴' },
        sounds: ['birds', 'wind_leaves', 'cicadas'],
        description: { en: 'Deep forest immersion', ja: '深い森の中に浸る' }
      },
      gardenWater: {
        name: { en: 'Water Garden', ja: '水の庭' },
        sounds: ['stream', 'fountain', 'birds_soft'],
        description: { en: 'Flowing water tranquility', ja: '流れる水の静けさ' }
      }
    };
  }

  // Initialize Audio Context (must be called after user interaction)
  async init() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
      console.log('[Soundscape] Audio context initialized');
    } catch (e) {
      console.error('[Soundscape] Failed to initialize:', e);
    }
  }

  // Set master volume (0-1)
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
    }
  }

  // Start a preset
  async play(presetKey) {
    await this.init();
    
    if (this.currentPreset === presetKey && this.isPlaying) return;
    
    // Stop current sounds
    this.stop();
    
    const preset = this.presets[presetKey];
    if (!preset) {
      console.error('[Soundscape] Unknown preset:', presetKey);
      return;
    }
    
    this.currentPreset = presetKey;
    this.isPlaying = true;
    
    // Start each sound in the preset
    for (const soundType of preset.sounds) {
      this.startSound(soundType);
    }
    
    console.log('[Soundscape] Playing preset:', presetKey);
  }

  // Stop all sounds
  stop() {
    this.isPlaying = false;
    this.currentPreset = null;
    
    // Stop and disconnect all sounds
    for (const key of Object.keys(this.sounds)) {
      try {
        if (this.sounds[key].stop) {
          this.sounds[key].stop();
        }
        if (this.sounds[key].disconnect) {
          this.sounds[key].disconnect();
        }
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    this.sounds = {};
    console.log('[Soundscape] Stopped');
  }

  // Toggle play/pause
  async toggle(presetKey) {
    if (this.isPlaying && this.currentPreset === presetKey) {
      this.stop();
      return false;
    } else {
      await this.play(presetKey);
      return true;
    }
  }

  // Start individual sound generator
  startSound(type) {
    if (!this.audioContext || !this.isPlaying) return;
    
    switch (type) {
      case 'silence':
        // Just silence - no sound
        break;
      case 'bell':
        this.createBellSound();
        break;
      case 'wind':
        this.createWindSound(0.15);
        break;
      case 'wind_soft':
        this.createWindSound(0.08);
        break;
      case 'wind_leaves':
        this.createWindLeavesSound();
        break;
      case 'rain':
        this.createRainSound();
        break;
      case 'thunder_distant':
        this.createDistantThunder();
        break;
      case 'birds':
        this.createBirdSound(0.3);
        break;
      case 'birds_soft':
        this.createBirdSound(0.15);
        break;
      case 'stream':
        this.createStreamSound();
        break;
      case 'fountain':
        this.createFountainSound();
        break;
      case 'crickets':
        this.createCricketsSound();
        break;
      case 'cicadas':
        this.createCicadasSound();
        break;
    }
  }

  // === SOUND GENERATORS ===

  // Meditation bell - plays periodically
  createBellSound() {
    const playBell = () => {
      if (!this.isPlaying || !this.audioContext) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      // Bell-like harmonics
      osc.type = 'sine';
      osc.frequency.value = 800 + Math.random() * 100;
      
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1;
      
      gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gain.gain.exponentialDecayTo = (value, time) => {
        gain.gain.setTargetAtTime(0.001, this.audioContext.currentTime + time, time / 3);
      };
      gain.gain.setTargetAtTime(0.001, this.audioContext.currentTime + 3, 1);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 4);
      
      // Schedule next bell (30-60 seconds)
      if (this.isPlaying) {
        setTimeout(playBell, 30000 + Math.random() * 30000);
      }
    };
    
    // First bell after 5-10 seconds
    setTimeout(playBell, 5000 + Math.random() * 5000);
  }

  // Wind sound using filtered noise
  createWindSound(baseVolume = 0.15) {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = baseVolume;
    
    // Modulate wind intensity
    const modulateWind = () => {
      if (!this.isPlaying) return;
      const newFreq = 300 + Math.random() * 200;
      const newGain = baseVolume * (0.5 + Math.random() * 0.5);
      filter.frequency.setTargetAtTime(newFreq, this.audioContext.currentTime, 2);
      gain.gain.setTargetAtTime(newGain, this.audioContext.currentTime, 2);
      setTimeout(modulateWind, 3000 + Math.random() * 3000);
    };
    modulateWind();
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    
    this.sounds.wind = noise;
  }

  // Wind through leaves
  createWindLeavesSound() {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.3;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.08;
    
    // Rustling modulation
    const modulate = () => {
      if (!this.isPlaying) return;
      gain.gain.setTargetAtTime(0.05 + Math.random() * 0.08, this.audioContext.currentTime, 0.5);
      filter.frequency.setTargetAtTime(2500 + Math.random() * 1500, this.audioContext.currentTime, 0.3);
      setTimeout(modulate, 500 + Math.random() * 1000);
    };
    modulate();
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    
    this.sounds.windLeaves = noise;
  }

  // Rain sound
  createRainSound() {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    // Multiple filters for rain texture
    const lowFilter = this.audioContext.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.value = 8000;
    
    const highFilter = this.audioContext.createBiquadFilter();
    highFilter.type = 'highpass';
    highFilter.frequency.value = 1000;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.25;
    
    noise.connect(lowFilter);
    lowFilter.connect(highFilter);
    highFilter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    
    this.sounds.rain = noise;
  }

  // Distant thunder
  createDistantThunder() {
    const playThunder = () => {
      if (!this.isPlaying || !this.audioContext) return;
      
      const bufferSize = 3 * this.audioContext.sampleRate;
      const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.audioContext.createBufferSource();
      noise.buffer = noiseBuffer;
      
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150;
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.5);
      gain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 1);
      gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 4);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      noise.stop(this.audioContext.currentTime + 4);
      
      // Schedule next thunder (45-90 seconds)
      if (this.isPlaying) {
        setTimeout(playThunder, 45000 + Math.random() * 45000);
      }
    };
    
    // First thunder after 15-30 seconds
    setTimeout(playThunder, 15000 + Math.random() * 15000);
  }

  // Bird chirps
  createBirdSound(volume = 0.3) {
    const chirp = () => {
      if (!this.isPlaying || !this.audioContext) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      const baseFreq = 2000 + Math.random() * 2000;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.audioContext.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, this.audioContext.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.2);
      
      // Multiple chirps in sequence
      const chirpCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 1; i < chirpCount; i++) {
        setTimeout(() => {
          if (!this.isPlaying) return;
          const osc2 = this.audioContext.createOscillator();
          const gain2 = this.audioContext.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(baseFreq * (0.9 + Math.random() * 0.2), this.audioContext.currentTime);
          gain2.gain.setValueAtTime(volume * 0.8, this.audioContext.currentTime);
          gain2.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
          osc2.connect(gain2);
          gain2.connect(this.masterGain);
          osc2.start();
          osc2.stop(this.audioContext.currentTime + 0.15);
        }, i * 150);
      }
      
      // Schedule next bird (3-8 seconds)
      if (this.isPlaying) {
        setTimeout(chirp, 3000 + Math.random() * 5000);
      }
    };
    
    // Start after short delay
    setTimeout(chirp, 1000 + Math.random() * 2000);
  }

  // Stream/brook sound
  createStreamSound() {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter1 = this.audioContext.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.value = 1000;
    filter1.Q.value = 0.5;
    
    const filter2 = this.audioContext.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 500;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.15;
    
    // Babbling modulation
    const modulate = () => {
      if (!this.isPlaying) return;
      filter1.frequency.setTargetAtTime(800 + Math.random() * 600, this.audioContext.currentTime, 0.3);
      gain.gain.setTargetAtTime(0.12 + Math.random() * 0.08, this.audioContext.currentTime, 0.2);
      setTimeout(modulate, 300 + Math.random() * 500);
    };
    modulate();
    
    noise.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    
    this.sounds.stream = noise;
  }

  // Fountain sound
  createFountainSound() {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 0.8;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.1;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    
    this.sounds.fountain = noise;
  }

  // Cricket sounds
  createCricketsSound() {
    const chirp = () => {
      if (!this.isPlaying || !this.audioContext) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 4000 + Math.random() * 1000;
      
      // Rapid on-off for cricket sound
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(0, now);
      for (let i = 0; i < 10; i++) {
        gain.gain.setValueAtTime(0.15, now + i * 0.04);
        gain.gain.setValueAtTime(0, now + i * 0.04 + 0.02);
      }
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(now + 0.5);
      
      // Schedule next cricket
      if (this.isPlaying) {
        setTimeout(chirp, 500 + Math.random() * 2000);
      }
    };
    
    setTimeout(chirp, 500 + Math.random() * 1000);
  }

  // Cicada sounds (summer)
  createCicadasSound() {
    const buzz = () => {
      if (!this.isPlaying || !this.audioContext) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.value = 4500 + Math.random() * 500;
      
      filter.type = 'bandpass';
      filter.frequency.value = 5000;
      filter.Q.value = 5;
      
      const duration = 2 + Math.random() * 3;
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, this.audioContext.currentTime + duration - 0.5);
      gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
      
      // Schedule next cicada
      if (this.isPlaying) {
        setTimeout(buzz, 3000 + Math.random() * 5000);
      }
    };
    
    setTimeout(buzz, 1000 + Math.random() * 2000);
  }

  // Get available presets for a mode
  getPresetsForMode(mode) {
    const modePresets = {};
    for (const [key, preset] of Object.entries(this.presets)) {
      if (key.startsWith(mode)) {
        modePresets[key] = preset;
      }
    }
    return modePresets;
  }
}

// Create global instance
window.soundscape = new Soundscape();
