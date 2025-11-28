/**
 * KINTSUGI MIND - Notification & Reminder System
 * Local notifications for daily mindfulness reminders
 */

class KintsugiNotifications {
  constructor() {
    this.STORAGE_KEY = 'kintsugi-notifications';
    this.permission = 'default';
    this.settings = this.loadSettings();
    this.checkInterval = null;
  }

  // Default settings
  getDefaultSettings() {
    return {
      enabled: false,
      morningReminder: {
        enabled: true,
        time: '08:00',
        message: {
          en: 'Good morning! How is your inner weather today?',
          ja: 'おはようございます！今日の心の天気はいかがですか？'
        }
      },
      eveningReminder: {
        enabled: true,
        time: '21:00',
        message: {
          en: 'Take a moment to breathe before sleep.',
          ja: '眠る前に、少し呼吸の時間を。'
        }
      },
      customReminders: [],
      lastNotified: {}
    };
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('[Notifications] Failed to load settings:', e);
    }
    return this.getDefaultSettings();
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('[Notifications] Failed to save settings:', e);
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('[Notifications] Not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    this.permission = 'denied';
    return false;
  }

  // Check current permission status
  checkPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Enable notifications
  async enable() {
    const granted = await this.requestPermission();
    if (granted) {
      this.settings.enabled = true;
      this.saveSettings();
      this.startChecking();
      return true;
    }
    return false;
  }

  // Disable notifications
  disable() {
    this.settings.enabled = false;
    this.saveSettings();
    this.stopChecking();
  }

  // Show a notification
  showNotification(title, body, options = {}) {
    if (this.permission !== 'granted' || !this.settings.enabled) {
      return null;
    }

    const lang = localStorage.getItem('kintsugi-lang') || 'en';
    
    const notification = new Notification(title, {
      body: body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: options.tag || 'kintsugi-reminder',
      requireInteraction: false,
      silent: false,
      ...options
    });

    notification.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };

    return notification;
  }

  // Check if it's time for a reminder
  checkReminders() {
    if (!this.settings.enabled) return;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const today = now.toISOString().split('T')[0];
    const lang = localStorage.getItem('kintsugi-lang') || 'en';

    // Check morning reminder
    if (this.settings.morningReminder.enabled) {
      const reminderKey = `morning_${today}`;
      if (currentTime === this.settings.morningReminder.time && 
          !this.settings.lastNotified[reminderKey]) {
        this.showNotification(
          'KINTSUGI MIND',
          this.settings.morningReminder.message[lang],
          { tag: 'morning-reminder', url: `/check-in?lang=${lang}` }
        );
        this.settings.lastNotified[reminderKey] = true;
        this.saveSettings();
      }
    }

    // Check evening reminder
    if (this.settings.eveningReminder.enabled) {
      const reminderKey = `evening_${today}`;
      if (currentTime === this.settings.eveningReminder.time && 
          !this.settings.lastNotified[reminderKey]) {
        this.showNotification(
          'KINTSUGI MIND',
          this.settings.eveningReminder.message[lang],
          { tag: 'evening-reminder', url: `/tatami?lang=${lang}` }
        );
        this.settings.lastNotified[reminderKey] = true;
        this.saveSettings();
      }
    }

    // Check custom reminders
    this.settings.customReminders.forEach((reminder, index) => {
      if (!reminder.enabled) return;
      const reminderKey = `custom_${index}_${today}`;
      if (currentTime === reminder.time && !this.settings.lastNotified[reminderKey]) {
        this.showNotification(
          'KINTSUGI MIND',
          reminder.message[lang] || reminder.message.en,
          { tag: `custom-${index}`, url: reminder.url || `/check-in?lang=${lang}` }
        );
        this.settings.lastNotified[reminderKey] = true;
        this.saveSettings();
      }
    });

    // Clean old lastNotified entries (keep only last 7 days)
    this.cleanOldNotifications();
  }

  // Clean notifications older than 7 days
  cleanOldNotifications() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];

    for (const key of Object.keys(this.settings.lastNotified)) {
      const dateMatch = key.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch && dateMatch[0] < cutoffDate) {
        delete this.settings.lastNotified[key];
      }
    }
  }

  // Start checking for reminders every minute
  startChecking() {
    if (this.checkInterval) return;
    
    // Check immediately
    this.checkReminders();
    
    // Then check every minute
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 60000);
    
    console.log('[Notifications] Started reminder checking');
  }

  // Stop checking
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[Notifications] Stopped reminder checking');
    }
  }

  // Update reminder settings
  updateReminder(type, settings) {
    if (type === 'morning') {
      this.settings.morningReminder = { ...this.settings.morningReminder, ...settings };
    } else if (type === 'evening') {
      this.settings.eveningReminder = { ...this.settings.eveningReminder, ...settings };
    }
    this.saveSettings();
  }

  // Add custom reminder
  addCustomReminder(reminder) {
    this.settings.customReminders.push({
      enabled: true,
      time: reminder.time || '12:00',
      message: reminder.message || { en: 'Time for mindfulness', ja: 'マインドフルネスの時間です' },
      url: reminder.url || null
    });
    this.saveSettings();
  }

  // Remove custom reminder
  removeCustomReminder(index) {
    this.settings.customReminders.splice(index, 1);
    this.saveSettings();
  }

  // Test notification
  async testNotification() {
    const granted = await this.requestPermission();
    if (granted) {
      const lang = localStorage.getItem('kintsugi-lang') || 'en';
      this.showNotification(
        'KINTSUGI MIND',
        lang === 'ja' ? 'テスト通知です。リマインダーが正常に動作しています。' : 'Test notification. Reminders are working correctly.',
        { tag: 'test' }
      );
      return true;
    }
    return false;
  }

  // Get status info
  getStatus() {
    return {
      supported: 'Notification' in window,
      permission: this.checkPermission(),
      enabled: this.settings.enabled,
      morningReminder: this.settings.morningReminder,
      eveningReminder: this.settings.eveningReminder,
      customReminders: this.settings.customReminders
    };
  }
}

// Motivational messages for different times
const motivationalMessages = {
  morning: {
    en: [
      'Good morning! How is your inner weather today?',
      'A new day begins. What small action will you take?',
      'Rise gently. Your journey continues today.',
      'Morning light brings new possibilities.',
      'Breathe in the fresh morning air.'
    ],
    ja: [
      'おはようございます！今日の心の天気はいかがですか？',
      '新しい一日が始まります。今日はどんな小さな行動をしますか？',
      '穏やかに起きましょう。あなたの旅は今日も続きます。',
      '朝の光が新しい可能性をもたらします。',
      '新鮮な朝の空気を吸い込みましょう。'
    ]
  },
  evening: {
    en: [
      'Take a moment to breathe before sleep.',
      'How did your day go? Time to reflect.',
      'Release the day\'s tensions. You did well.',
      'The day is complete. Rest with gratitude.',
      'Time to let go and prepare for peaceful sleep.'
    ],
    ja: [
      '眠る前に、少し呼吸の時間を。',
      '今日はいかがでしたか？振り返りの時間です。',
      '今日の緊張を解き放ちましょう。よく頑張りました。',
      '一日が終わります。感謝とともに休みましょう。',
      '手放して、穏やかな眠りの準備を。'
    ]
  },
  afternoon: {
    en: [
      'Afternoon check-in: How are you feeling?',
      'Take a mindful break.',
      'Pause and breathe for a moment.',
      'Remember to stay present.',
      'A moment of calm in the middle of the day.'
    ],
    ja: [
      '午後のチェックイン：今の調子はいかがですか？',
      'マインドフルな休憩を取りましょう。',
      '一度立ち止まって、呼吸を。',
      '今この瞬間に意識を向けて。',
      '一日の真ん中で、静かなひとときを。'
    ]
  }
};

// Get a random message for the time of day
function getMotivationalMessage(timeOfDay, lang = 'en') {
  const messages = motivationalMessages[timeOfDay]?.[lang] || motivationalMessages.morning[lang];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Create global instance
window.kintsugiNotifications = new KintsugiNotifications();

// Auto-start checking if enabled
document.addEventListener('DOMContentLoaded', () => {
  if (window.kintsugiNotifications.settings.enabled) {
    window.kintsugiNotifications.startChecking();
  }
});
