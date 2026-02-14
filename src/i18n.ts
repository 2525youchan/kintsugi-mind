/**
 * KINTSUGI MIND - Internationalization (i18n)
 * Localization Dictionary based on requirement spec
 */

export type Language = 'en' | 'ja'

export const translations = {
  // ========================================
  // Common / Navigation
  // ========================================
  common: {
    appName: {
      en: 'KINTSUGI MIND',
      ja: 'KINTSUGI MIND'
    },
    tagline: {
      en: 'The Japanese Art of Resilience',
      ja: '日本発：回復と調和のメンタルヘルス'
    },
    begin: {
      en: 'Begin',
      ja: '始める'
    },
    about: {
      en: 'About',
      ja: '概要'
    },
    philosophy: {
      en: 'Philosophy',
      ja: '哲学'
    }
  },

  // ========================================
  // Home Page
  // ========================================
  home: {
    heroTitle: {
      en: 'Your Scars',
      ja: 'あなたの傷は'
    },
    heroTitleAccent: {
      en: 'Make You Beautiful',
      ja: 'あなたを美しくする'
    },
    heroDescription: {
      en: 'Ancient Japanese wisdom — Morita Therapy, Naikan, and Zen — delivered through AI for a new form of wellbeing.',
      ja: '古来より伝わる日本の知恵 ― 森田療法・内観法・禅 ― をAIが現代に届ける、新しいウェルビーイングの形。'
    },
    weatherQuestion: {
      en: 'How is your inner weather?',
      ja: '今の心の天気は？'
    },
    weatherSubtext: {
      en: 'Select how you\'re feeling today',
      ja: '今日の気分を選んでください'
    },
    teaHouseTitle: {
      en: 'The Tea House Architecture',
      ja: '心の茶室'
    },
    teaHouseDescription: {
      en: 'We guide you to the right "room" based on your current state of mind.',
      ja: 'あなたの状態に合わせて、最適な「部屋」へご案内します。'
    },
    // GARDEN Room
    gardenTitle: {
      en: 'GARDEN',
      ja: '庭 GARDEN'
    },
    gardenSubtitle: {
      en: 'The Garden — Morita Therapy',
      ja: '庭 ― 森田療法'
    },
    gardenDescription: {
      en: 'Don\'t eliminate anxiety — act alongside it. Separate emotions from actions and live purpose-driven.',
      ja: '不安を消すのではなく、不安とともに行動する。感情と行動を分離し、「目的本位」の生き方へ。'
    },
    // STUDY Room
    studyTitle: {
      en: 'STUDY',
      ja: '書斎 STUDY'
    },
    studySubtitle: {
      en: 'The Study — Naikan',
      ja: '書斎 ― 内観法'
    },
    studyDescription: {
      en: 'Rediscover your connection to the world through three questions. Visualize that you are not alone.',
      ja: '3つの問いで自分と世界の繋がりを再発見。孤独ではないことを、縁の図として可視化します。'
    },
    // TATAMI Room
    tatamiTitle: {
      en: 'TATAMI',
      ja: '座敷 TATAMI'
    },
    tatamiSubtitle: {
      en: 'The Tatami Room — Zen',
      ja: '座敷 ― 禅'
    },
    tatamiDescription: {
      en: 'Stop thinking and return to bodily sensations. Breathe with haptic feedback and contemplate koans.',
      ja: '思考を止め、身体感覚に戻る。デバイスの振動に合わせた呼吸と、答えのない公案が気づきを促します。'
    },
    // About Section
    aboutTitle: {
      en: 'No Fixing Needed',
      ja: '「直す」必要はない'
    },
    aboutP1: {
      en: 'Tired of Western approaches that focus on "fixing" and "controlling" your mind?',
      ja: '西洋的な「修正・コントロール」のアプローチに疲れていませんか？'
    },
    aboutP2: {
      en: 'KINTSUGI MIND doesn\'t try to "fix" your heart — we help you use it as it is.',
      ja: 'KINTSUGI MINDは、心を「直す」のではなく、あるがまま「使う」ことを提案します。'
    },
    aboutP3: {
      en: 'Like a kintsugi vessel, we don\'t deny our cracks — we transform them into beauty. That is our wellbeing.',
      ja: '金継ぎの器のように、傷を否定せず、それを美として昇華する ― それが私たちのウェルビーイングです。'
    },
    vesselQuote: {
      en: '"Your scars make you beautiful"',
      ja: '「あなたの傷が、あなたを美しくする」'
    },
    // CTA Section
    ctaTitle: {
      en: 'Begin Your Journey',
      ja: 'あなたの旅を始めよう'
    },
    ctaDescription: {
      en: 'You can live beautifully and strongly, even with anxiety.<br/>Start your kintsugi journey today.',
      ja: '不安があっても、美しく強く生きられる。<br/>今日から、あなたの金継ぎを始めましょう。'
    },
    ctaButton: {
      en: 'Enter the Tea House',
      ja: '茶室に入る'
    }
  },

  // ========================================
  // Check-in Page
  // ========================================
  checkin: {
    welcome: {
      en: 'Welcome to the Tea House',
      ja: '心の茶室へようこそ'
    },
    question: {
      en: 'How is your inner weather?',
      ja: '今の心の天気はどうですか？'
    },
    selectPrompt: {
      en: 'Select how you\'re feeling to find your room',
      ja: '天気を選んで、今日の心の状態を教えてください'
    },
    suggestedRoom: {
      en: 'Suggested Room',
      ja: 'おすすめの部屋'
    },
    viewAllRooms: {
      en: 'View all rooms →',
      ja: 'すべての部屋を見る →'
    },
    // Weather messages
    sunny: {
      en: 'A calm day. Let\'s cherish this harmony.',
      ja: '穏やかな日ですね。この調和を大切にしましょう。'
    },
    cloudy: {
      en: 'A bit cloudy. That\'s natural too.',
      ja: '少し曇り空。それも自然なことです。'
    },
    rainy: {
      en: 'On rainy days, let\'s walk in the rain.',
      ja: '雨の日は、雨の中を歩きましょう。'
    },
    stormy: {
      en: 'Even in the storm, you are here.',
      ja: '嵐の中でも、あなたはここにいます。'
    },
    // Room suggestions
    gardenSuggestion: {
      en: 'Start with small actions, alongside your anxiety',
      ja: '不安とともに、小さな行動から'
    },
    studySuggestion: {
      en: 'Time to reflect on your connections',
      ja: '繋がりを見つめ直す時間'
    },
    tatamiSuggestion: {
      en: 'Return to the present in stillness',
      ja: '静寂の中で、今に還る'
    }
  },

  // ========================================
  // GARDEN Page (Morita Therapy)
  // ========================================
  garden: {
    skyTitle: {
      en: 'Sky',
      ja: '空'
    },
    skyDescription: {
      en: 'Let your emotions float as clouds',
      ja: '感情を雲として浮かべる'
    },
    groundTitle: {
      en: 'Ground',
      ja: '地'
    },
    groundDescription: {
      en: 'Choose a micro-action',
      ja: '小さな行動を選ぶ'
    },
    inputPlaceholder: {
      en: 'Write your anxiety or emotions here...',
      ja: '今感じている不安や感情を書いてください...'
    },
    floatButton: {
      en: 'Float',
      ja: '浮かべる'
    },
    cloudNote: {
      en: 'These clouds won\'t disappear. And that\'s okay.',
      ja: 'これらの雲は消えません。それで大丈夫です。'
    },
    cloudPlaceholder: {
      en: 'Type your emotions below<br/>and they will float as clouds',
      ja: '下に不安や感情を入力すると<br/>雲として浮かびます'
    },
    microActionTitle: {
      en: 'Suggested Micro-Actions:',
      ja: 'おすすめの小さな行動:'
    },
    actionCup: {
      en: 'Wash a single cup',
      ja: 'コップを一つ洗う'
    },
    actionStand: {
      en: 'Stand up for just 1 minute',
      ja: '1分だけ立ち上がる'
    },
    actionWater: {
      en: 'Drink a glass of water',
      ja: '水を一杯飲む'
    },
    actionWindow: {
      en: 'Open a window and look outside',
      ja: '窓を開けて外を見る'
    },
    plantGrowth: {
      en: 'Complete actions to grow your garden',
      ja: '行動を完了すると、植物が育ちます'
    },
    // AI Guidance
    guidanceDefault: {
      en: 'Feeling anxious? That\'s natural for a human being.<br/>So, what will your hands do?',
      ja: '不安ですか。それは人間として自然です。<br/>では、手は何をしますか？'
    }
  },

  // ========================================
  // STUDY Page (Naikan)
  // ========================================
  study: {
    title: {
      en: 'Deep Reflection',
      ja: '内観'
    },
    subtitle: {
      en: 'Rediscover your connection to the world through three questions',
      ja: '3つの問いで、自分と世界のつながりを見つめ直す'
    },
    guideName: {
      en: 'Naikan Guide',
      ja: '内観ガイド'
    },
    inputPlaceholder: {
      en: 'Write what comes to mind...',
      ja: '思い浮かんだことを書いてください...'
    },
    sendButton: {
      en: 'Send',
      ja: '送信'
    },
    question: {
      en: 'Question',
      ja: '問い'
    },
    // Questions
    q1: {
      en: 'Was there a moment today when someone\'s work or kindness helped you?',
      ja: '今日、誰かの仕事や優しさに助けられた瞬間はありましたか？'
    },
    q1Hint: {
      en: 'A store clerk, family, train operator... even the smallest things count.',
      ja: 'コンビニの店員、家族、電車の運転手...どんな小さなことでも。'
    },
    q2: {
      en: 'What did you offer to the world today?',
      ja: '今日、あなたは世界に何を提供しましたか？'
    },
    q2Hint: {
      en: 'Work, a smile, words to someone... anything counts.',
      ja: '仕事、笑顔、誰かへの言葉...何でも構いません。'
    },
    q3: {
      en: 'Was there a moment when you relied on someone\'s tolerance?',
      ja: '誰かの寛容さに甘えた場面はありましたか？'
    },
    q3Hint: {
      en: 'This is not about guilt — it\'s about awareness of connection.',
      ja: 'これは反省ではなく、繋がりへの気づきです。'
    },
    // Conclusion
    conclusionTitle: {
      en: 'Thank you. Today\'s reflection is complete.',
      ja: 'ありがとうございます。今日の内観が終わりました。'
    },
    conclusionMessage: {
      en: 'You are supported by many connections, and you give much in return. You are not alone.',
      ja: 'あなたは多くの縁に支えられ、また多くを与えています。孤独ではありません。'
    },
    conclusionQuote: {
      en: '"Engi (縁起) — Everything exists within connection"',
      ja: '"縁起 — すべては繋がりの中に"'
    }
  },

  // ========================================
  // TATAMI Page (Zen)
  // ========================================
  tatami: {
    mu: {
      en: 'Mu — Emptiness',
      ja: '無 — Mu'
    },
    breatheIn: {
      en: 'Breathe in',
      ja: '息を吸う'
    },
    breatheOut: {
      en: 'Breathe out',
      ja: '息を吐く'
    },
    startButton: {
      en: 'Begin Zazen',
      ja: '座禅を始める'
    },
    stopButton: {
      en: 'End Session',
      ja: '終了する'
    },
    koanTitle: {
      en: 'Zen Puzzle — Koan',
      ja: '公案 — Zen Puzzle'
    },
    koanNote: {
      en: 'Don\'t search for the answer. Walk with the question.',
      ja: '答えを探さないでください。問いと共に歩んでください。'
    },
    hapticNote: {
      en: '※ Breathe along with your device\'s vibration<br/>(Please enable vibration)',
      ja: '※ デバイスの振動に合わせて呼吸してください<br/>(振動機能をオンにしてください)'
    }
  },

  // ========================================
  // Localization Dictionary (from spec)
  // ========================================
  concepts: {
    arugamama: {
      en: 'Active Acceptance',
      ja: 'あるがまま'
    },
    arugamamaDesc: {
      en: 'Not passive resignation, but active acceptance',
      ja: '受動的諦めではなく、能動的な受容'
    },
    toraware: {
      en: 'Mental Trap / Getting Hooked',
      ja: 'とらわれ'
    },
    purposeLed: {
      en: 'Purpose-Led',
      ja: '目的本位'
    },
    purposeLedDesc: {
      en: 'Led by purpose, not emotions',
      ja: '感情ではなく目的にリードされる'
    },
    realityOverFeelings: {
      en: 'Reality over Feelings',
      ja: '事実唯真'
    },
    naikan: {
      en: 'Deep Reflection',
      ja: '内観'
    },
    koan: {
      en: 'Zen Puzzle',
      ja: '公案'
    }
  }
}

// Helper function to get translation
export function t(key: string, lang: Language): string {
  const keys = key.split('.')
  let result: any = translations
  
  for (const k of keys) {
    if (result[k] === undefined) {
      console.warn(`Translation missing: ${key}`)
      return key
    }
    result = result[k]
  }
  
  if (typeof result === 'object' && result[lang]) {
    return result[lang]
  }
  
  return key
}

// Get language from query param or cookie
export function getLanguage(c: any): Language {
  const langParam = c.req.query('lang')
  if (langParam === 'ja' || langParam === 'en') {
    return langParam
  }
  
  // Check Accept-Language header for default
  const acceptLang = c.req.header('Accept-Language') || ''
  if (acceptLang.startsWith('ja')) {
    return 'ja'
  }
  
  return 'en' // Default to English for global audience
}
