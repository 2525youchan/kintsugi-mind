/**
 * KINTSUGI MIND - Kintsugi Progression System
 * 金継ぎプログレッションシステム
 * 
 * ユーザーの成長を「レベル」ではなく「深み」で表現
 */

export interface Crack {
  id: string
  type: 'anxiety' | 'absence' | 'struggle'  // 不安吐露 / 未ログイン / 困難
  date: string  // ISO date string
  text?: string  // 不安の内容（オプション）
  repaired: boolean  // 金継ぎ済みか
  repairedDate?: string
}

export interface Activity {
  id: string
  type: 'garden' | 'study' | 'tatami'  // 庭・書斎・座敷
  date: string
  details?: {
    actionCount?: number  // GARDEN: 完了したアクション数
    questionsAnswered?: number  // STUDY: 回答した問い数
    breathingMinutes?: number  // TATAMI: 呼吸した分数
  }
}

export interface KintsugiProfile {
  // 基本情報
  id: string
  createdAt: string
  lastVisit: string
  
  // 器の状態
  cracks: Crack[]  // ヒビの履歴
  totalRepairs: number  // 金継ぎ総数
  
  // 活動履歴
  activities: Activity[]
  
  // 統計
  stats: {
    totalVisits: number
    currentStreak: number  // 連続日数
    longestStreak: number
    gardenActions: number
    studySessions: number
    tatamiSessions: number
  }
}

// デフォルトプロファイル
export function createDefaultProfile(): KintsugiProfile {
  const now = new Date().toISOString()
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
  }
}

// ユニークID生成
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 日付を YYYY-MM-DD 形式に
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

// 2つの日付の差（日数）
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// ========================================
// プロファイル操作
// ========================================

// 訪問を記録（ストリーク計算）
export function recordVisit(profile: KintsugiProfile): KintsugiProfile {
  const today = toDateString(new Date())
  const lastVisit = profile.lastVisit.split('T')[0]
  
  if (today === lastVisit) {
    // 同じ日は何もしない
    return profile
  }
  
  const daysDiff = daysBetween(lastVisit, today)
  
  let newStreak = profile.stats.currentStreak
  const newCracks = [...profile.cracks]
  
  if (daysDiff === 1) {
    // 連続訪問
    newStreak += 1
  } else if (daysDiff > 1) {
    // 途切れた → ヒビを追加
    for (let i = 1; i < daysDiff; i++) {
      const missedDate = new Date(lastVisit)
      missedDate.setDate(missedDate.getDate() + i)
      newCracks.push({
        id: generateId(),
        type: 'absence',
        date: toDateString(missedDate),
        repaired: false
      })
    }
    newStreak = 1
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
  }
}

// 不安を記録（ヒビを追加）
export function recordAnxiety(profile: KintsugiProfile, text: string): KintsugiProfile {
  const newCrack: Crack = {
    id: generateId(),
    type: 'anxiety',
    date: new Date().toISOString(),
    text: text,
    repaired: false
  }
  
  return {
    ...profile,
    cracks: [...profile.cracks, newCrack]
  }
}

// アクティビティを記録（金継ぎを実行）
export function recordActivity(
  profile: KintsugiProfile, 
  type: 'garden' | 'study' | 'tatami',
  details?: Activity['details']
): KintsugiProfile {
  const activity: Activity = {
    id: generateId(),
    type,
    date: new Date().toISOString(),
    details
  }
  
  // 未修復のヒビを1つ修復
  const updatedCracks = [...profile.cracks]
  const unrepairedIndex = updatedCracks.findIndex(c => !c.repaired)
  let repairCount = 0
  
  if (unrepairedIndex !== -1) {
    updatedCracks[unrepairedIndex] = {
      ...updatedCracks[unrepairedIndex],
      repaired: true,
      repairedDate: new Date().toISOString()
    }
    repairCount = 1
  }
  
  // 統計を更新
  const stats = { ...profile.stats }
  if (type === 'garden') {
    stats.gardenActions += details?.actionCount || 1
  } else if (type === 'study') {
    stats.studySessions += 1
  } else if (type === 'tatami') {
    stats.tatamiSessions += 1
  }
  
  return {
    ...profile,
    cracks: updatedCracks,
    totalRepairs: profile.totalRepairs + repairCount,
    activities: [...profile.activities, activity],
    stats
  }
}

// ========================================
// 器のビジュアル計算
// ========================================

export interface VesselVisual {
  // ヒビのパス（SVG path data）
  cracks: {
    path: string
    repaired: boolean
    type: Crack['type']
  }[]
  // 器の「深み」レベル（0-100）
  depth: number
  // 金の輝き度（0-100）
  goldIntensity: number
  // 器の色合い（使い込み度）
  patina: number
}

// ヒビのパスを生成（シード値で決定論的に）
function generateCrackPath(seed: string, index: number): string {
  // シンプルなハッシュ関数
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash
  }
  
  // パスのバリエーション
  const variations = [
    `M${60 + (hash % 40)} 40 L${55 + (hash % 30)} 80 L${65 + (hash % 20)} 120 L${50 + (hash % 40)} 160`,
    `M${100 + (hash % 30)} 50 L${110 + (hash % 20)} 90 L${95 + (hash % 25)} 130`,
    `M${70 + (hash % 30)} 100 L${85 + (hash % 20)} 140 L${75 + (hash % 25)} 180`,
    `M${110 + (hash % 25)} 70 L${120 + (hash % 20)} 110 L${105 + (hash % 30)} 150 L${115 + (hash % 20)} 190`,
    `M${80 + (hash % 20)} 130 L${95 + (hash % 25)} 170 L${85 + (hash % 20)} 200`,
    `M${50 + (hash % 30)} 80 L${60 + (hash % 25)} 120 L${45 + (hash % 30)} 160`,
    `M${130 + (hash % 20)} 60 L${140 + (hash % 15)} 100 L${125 + (hash % 25)} 140`,
    `M${90 + (hash % 25)} 50 L${100 + (hash % 20)} 85 L${85 + (hash % 30)} 120 L${95 + (hash % 20)} 155`
  ]
  
  return variations[(index + Math.abs(hash)) % variations.length]
}

// プロファイルから器のビジュアルを計算
export function calculateVesselVisual(profile: KintsugiProfile): VesselVisual {
  const cracks = profile.cracks.map((crack, index) => ({
    path: generateCrackPath(crack.id, index),
    repaired: crack.repaired,
    type: crack.type
  }))
  
  // 深み = 活動総数 + ヒビの数（経験の豊かさ）
  const depth = Math.min(100, 
    (profile.activities.length * 5) + 
    (profile.cracks.length * 3) +
    (profile.stats.totalVisits)
  )
  
  // 金の輝き = 修復したヒビの割合 × 修復総数
  const repairedCount = profile.cracks.filter(c => c.repaired).length
  const repairRatio = profile.cracks.length > 0 
    ? repairedCount / profile.cracks.length 
    : 0
  const goldIntensity = Math.min(100, repairRatio * 50 + profile.totalRepairs * 5)
  
  // 経年感 = 作成からの日数
  const daysSinceCreation = daysBetween(
    profile.createdAt.split('T')[0], 
    toDateString(new Date())
  )
  const patina = Math.min(100, daysSinceCreation * 2)
  
  return {
    cracks,
    depth,
    goldIntensity,
    patina
  }
}

// ========================================
// 日本語/英語のメッセージ
// ========================================

export const kintsugiMessages = {
  vesselTitle: {
    en: 'Your Vessel',
    ja: 'あなたの器'
  },
  statsTitle: {
    en: 'Your Journey',
    ja: 'あなたの歩み'
  },
  totalVisits: {
    en: 'Total Visits',
    ja: '総訪問日数'
  },
  currentStreak: {
    en: 'Current Streak',
    ja: '連続日数'
  },
  longestStreak: {
    en: 'Longest Streak',
    ja: '最長連続'
  },
  totalRepairs: {
    en: 'Golden Repairs',
    ja: '金継ぎ回数'
  },
  gardenActions: {
    en: 'Garden Actions',
    ja: '庭での行動'
  },
  studySessions: {
    en: 'Study Sessions',
    ja: '内観セッション'
  },
  tatamiSessions: {
    en: 'Tatami Sessions',
    ja: '座禅セッション'
  },
  depthLabel: {
    en: 'Depth of Experience',
    ja: '経験の深み'
  },
  goldLabel: {
    en: 'Golden Radiance',
    ja: '金の輝き'
  },
  emptyVessel: {
    en: 'Your vessel is new and unblemished. Through your journey, it will gain character.',
    ja: 'あなたの器はまだ新しく、傷ひとつありません。歩みの中で、個性が刻まれていきます。'
  },
  firstCrack: {
    en: 'Your first crack has appeared. This is not damage — it is the beginning of your story.',
    ja: '最初のヒビが入りました。これは傷ではありません。あなたの物語の始まりです。'
  },
  repairMessage: {
    en: 'A crack has been repaired with gold. Your vessel grows more beautiful.',
    ja: 'ヒビが金で修復されました。あなたの器はより美しくなりました。'
  }
}
