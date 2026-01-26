# 🔒 KINTSUGI MIND セキュリティ監査レポート

**監査日**: 2026-01-26  
**監査基準**: Dev Bible - SECURITY_CHECKLIST.md, GENERIC_LESSONS_CLOUDFLARE.md  

---

## 📊 監査サマリー

| カテゴリ | 状態 | 必須項目 | 推奨項目 |
|---------|------|---------|---------|
| 認証・認可 | ✅ 良好 | 5/5 | 3/5 |
| データ保護 | ⚠️ 要改善 | 4/5 | 2/3 |
| APIセキュリティ | ⚠️ 要改善 | 3/5 | 1/3 |
| フロントエンド | ✅ 良好 | 2/2 | 2/2 |
| インフラ・設定 | ✅ 良好 | 3/3 | 4/5 |
| 課金システム | ✅ 良好 | 4/4 | 2/3 |

**総合評価**: 🟡 概ね良好（改善点あり）

---

## ✅ 適切に実装されている項目

### 1. 認証・セッション管理

```typescript
// ✅ セッションCookieの設定が適切
setCookie(c, 'kintsugi_session', sessionId, {
  path: '/',
  httpOnly: true,    // ✅ XSS対策
  secure: true,      // ✅ HTTPS必須化
  sameSite: 'Lax',   // ✅ CSRF対策
  expires: expiresAt
})
```

- ✅ セッションIDは`crypto.randomUUID()`で生成（十分にランダム）
- ✅ セッションに30日の有効期限
- ✅ ログアウト時にセッション削除（DBとCookie両方）
- ✅ 期限切れセッションのチェック実装済み

### 2. SQLインジェクション対策

```typescript
// ✅ プリペアドステートメント使用
const session = await db.prepare(
  'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
).bind(sessionId).first()
```

- ✅ 全SQLでプリペアドステートメント（`.bind()`）を使用
- ✅ 文字列連結でSQLを組み立てていない

### 3. 環境変数・シークレット管理

```bash
# ✅ .gitignoreに含まれている
.env
.env.production
.dev.vars
```

- ✅ `.dev.vars`が`.gitignore`に含まれている
- ✅ APIキーがコードにハードコードされていない
- ✅ Google OAuth、Gemini APIキーは環境変数で管理

### 4. 課金判定ロジック

```typescript
// ✅ Dev Bible 1-1準拠: ステータスと期限の両方をチェック
if (expiresAt && now > expiresAt) {
  return { plan: 'free', status: 'expired', expiresAt: sub.current_period_end }
}
```

- ✅ ステータスだけでなく期限もチェック
- ✅ `getUserSubscription`関数で一元化
- ✅ 重複レコード対策（ORDER BY + LIMIT 1）

### 5. フロントエンドセキュリティ

- ✅ APIキーがフロントエンドに含まれていない
- ✅ 信頼できるCDN（cdn.tailwindcss.com, cdn.jsdelivr.net）を使用

---

## ⚠️ 改善が必要な項目

### 1. 🔴 SELECT * の使用（4箇所）

**問題**: `SELECT *`は不要なカラムも取得し、`password_hash`などが漏洩するリスクがある

**現状**:
```typescript
// ❌ src/index.tsx 4箇所で使用
'SELECT * FROM profiles WHERE user_id = ?'
```

**修正案**:
```typescript
// ✅ 必要なカラムのみ明示的に指定
'SELECT id, total_repairs, stats_total_visits, stats_current_streak, 
        stats_longest_streak, stats_garden_actions, stats_study_sessions, 
        stats_tatami_sessions, last_visit, created_at, updated_at 
 FROM profiles WHERE user_id = ?'
```

**対応優先度**: 🟡 中（profilesテーブルには機密情報はないが、習慣として修正すべき）

---

### 2. 🔴 レートリミットが未実装

**問題**: ログインAPIやAI APIにレートリミットがなく、ブルートフォース攻撃やAPI濫用のリスク

**Dev Bible参照**: SECURITY_CHECKLIST.md セクション4.1

**現状**: レートリミットの実装なし

**修正案**:
```typescript
// Cloudflare KVを使用したシンプルなレートリミット
async function rateLimit(
  c: Context, 
  key: string, 
  limit: number, 
  windowSeconds: number
): Promise<boolean> {
  const kv = c.env.KV
  if (!kv) return true  // KVがない場合はスキップ
  
  const windowKey = `rate:${key}:${Math.floor(Date.now() / 1000 / windowSeconds)}`
  const current = parseInt(await kv.get(windowKey) || '0')
  
  if (current >= limit) {
    return false  // 制限超過
  }
  
  await kv.put(windowKey, String(current + 1), { expirationTtl: windowSeconds })
  return true
}

// 使用例: ログインAPIに適用
app.get('/auth/google/callback', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown'
  const allowed = await rateLimit(c, `login:${ip}`, 10, 60) // 1分間に10回まで
  
  if (!allowed) {
    return c.json({ error: 'Too many requests' }, 429)
  }
  // ... 処理続行
})
```

**対応優先度**: 🔴 高（セキュリティリスク）

---

### 3. 🟡 CORS設定が未定義

**問題**: 本番環境でのCORS設定が明示的に定義されていない

**Dev Bible参照**: SECURITY_CHECKLIST.md セクション4.3

**現状**: CORS設定なし（Cloudflare Pagesのデフォルト挙動に依存）

**修正案**:
```typescript
import { cors } from 'hono/cors'

// 本番環境用CORS設定
app.use('/api/*', cors({
  origin: [
    'https://kintsugi-mind.pages.dev',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
  ].filter(Boolean),
  credentials: true
}))
```

**対応優先度**: 🟡 中（現状はCloudflare Pagesで同一オリジン）

---

### 4. 🟡 セキュリティヘッダーが未設定

**問題**: X-Content-Type-Options、X-Frame-Options等のセキュリティヘッダーが未設定

**Dev Bible参照**: SECURITY_CHECKLIST.md セクション6.2

**修正案**:
```typescript
// セキュリティヘッダーミドルウェア
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})
```

**対応優先度**: 🟡 中

---

### 5. 🟡 期限切れセッションの自動削除が未実装

**問題**: 期限切れセッションがDBに残り続ける

**Dev Bible参照**: SECURITY_CHECKLIST.md セクション2.2

**現状**: ログイン時の期限チェックのみ、古いセッションの削除なし

**修正案**:
```typescript
// 定期的なクリーンアップ（管理APIまたはCron Job）
app.post('/api/admin/cleanup-sessions', async (c) => {
  // 管理者認証チェック...
  
  const result = await db.prepare(`
    DELETE FROM sessions WHERE expires_at < datetime('now')
  `).run()
  
  return c.json({ deleted: result.meta.changes })
})
```

**対応優先度**: 🟢 低（機能に影響なし、DB容量のみ）

---

## 📋 改善アクションプラン

### 即時対応（本番リリース前）

| # | 項目 | 工数目安 |
|---|------|---------|
| 1 | レートリミット実装（KV使用） | 2時間 |
| 2 | SELECT * を具体的なカラムに変更 | 30分 |
| 3 | セキュリティヘッダー追加 | 30分 |

### 短期対応（1週間以内）

| # | 項目 | 工数目安 |
|---|------|---------|
| 4 | CORS設定の明示的定義 | 30分 |
| 5 | 期限切れセッション削除API | 1時間 |
| 6 | npm audit実行と脆弱性確認 | 30分 |

### 中長期対応（Stripe統合時）

| # | 項目 | 工数目安 |
|---|------|---------|
| 7 | Webhook冪等性の確保 | 2時間 |
| 8 | 課金データ整合性チェック機能 | 3時間 |

---

## 🔗 関連ドキュメント

- [Dev Bible - SECURITY_CHECKLIST.md](../../dev-bible/SECURITY_CHECKLIST.md)
- [Dev Bible - GENERIC_LESSONS_CLOUDFLARE.md](../../dev-bible/GENERIC_LESSONS_CLOUDFLARE.md)

---

*監査者: AI Assistant*  
*次回監査予定: Stripe統合完了後*
