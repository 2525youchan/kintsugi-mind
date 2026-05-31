# KINTSUGI MIND — AI 開発引き継ぎ書

> **最終更新**: 2026-02-15  
> **最終コミット**: `15f9c16` (main)  
> **直近セッション**: dev-bible 準拠修正（JST対応、Toast通知、API統一等）

---

## 1. プロジェクト概要

**KINTSUGI MIND（金継ぎマインド）** は、日本の伝統的な「金継ぎ」の哲学に基づくメンタルヘルス PWA です。  
「心を直す」のではなく「傷を美として昇華する」というアプローチで、森田療法・内観法・禅の3つの日本の治療法を AI で提供します。

### コンセプト
- **No Fixing**: 心を「直す」のではなく、あるがまま「使う」
- **Action Oriented**: 静止する瞑想ではなく、動く禅
- **Wabi-Sabi Growth**: 傷を否定せず、金継ぎのように美として昇華

---

## 2. 技術スタック

| 項目 | 技術 |
|------|------|
| Framework | Hono (TypeScript) |
| Platform | Cloudflare Pages / Workers |
| Database | Cloudflare D1 (SQLite) |
| Auth | Google OAuth 2.0（自前実装） |
| AI | Google Gemini API |
| Styling | Tailwind CSS (CDN) |
| Dev Server | Wrangler + PM2 |
| PWA | Service Worker (手動キャッシュ管理) |

---

## 3. ファイル構成と行数

```
/home/user/webapp/
├── src/
│   ├── index.tsx          (5108行) メインアプリ - 全ルート + API
│   ├── components.tsx      (411行) 共有UIコンポーネント（Header, Footer, WeatherIcon等）
│   ├── renderer.tsx        (178行) HTMLレンダラー（<head>、CSS、フォント）
│   └── i18n.ts                     国際化辞書 (en/ja)
├── public/
│   ├── static/
│   │   ├── app.js         (4952行) フロントエンドJS（全ページのロジック）
│   │   ├── soundscape.js   (660行) Web Audio APIによる環境音生成
│   │   ├── notifications.js (356行) Push通知管理
│   │   └── style.css       (823行) カスタムCSS
│   ├── sw.js              (210行) Service Worker
│   ├── manifest.json              PWAマニフェスト
│   ├── icons/                     PWAアイコン（72〜512px）
│   └── apple-touch-icon.png
├── migrations/
│   ├── 0001_initial_schema.sql    users, profiles, cracks, activities, checkins, sessions
│   ├── 0002_subscriptions.sql     subscriptions, usage, premium_vessels
│   └── 0003_challenge_system.sql  user_unlocks, challenge_data
├── ecosystem.config.cjs           PM2設定（wrangler pages dev）
├── wrangler.jsonc                 Cloudflare設定（D1バインディング）
├── .dev.vars                      開発用シークレット
└── vite.config.ts                 Viteビルド設定
```

---

## 4. 環境設定

### ローカル開発
```bash
cd /home/user/webapp
npm run build                      # Vite SSRビルド → dist/
pm2 start ecosystem.config.cjs     # wrangler pages dev --d1=kintsugi-mind-db --local
# → http://localhost:3000
```

### シークレット（.dev.vars）
```
GEMINI_API_KEY=...          # Google Gemini API
GOOGLE_CLIENT_ID=...        # Google OAuth
GOOGLE_CLIENT_SECRET=...    # Google OAuth
SESSION_SECRET=...          # セッション署名用
```

### デプロイ
```bash
npm run build
npx wrangler pages deploy dist --project-name kintsugi-mind
```

### GitHub
- リポジトリ: https://github.com/2525youchan/kintsugi-mind
- ブランチ: `main` のみ
- push 前に `setup_github_environment` を呼ぶ必要あり

### Cloudflare
- プロジェクト名: `kintsugi-mind`
- D1 DB: `kintsugi-mind-db` (ID: `ad8f97ca-a75f-4613-a106-1a32013d8444`)
- 本番URL: https://kintsugi-mind.pages.dev

---

## 5. ページ構成とルート一覧

### フロントエンドページ
| パス | ページ | 説明 |
|------|--------|------|
| `/` | ホーム | 四季の挨拶、今日の禅語、天気チェックイン誘導 |
| `/welcome` | オンボーディング | 金継ぎ哲学スライド + 器選択 |
| `/check-in` | チェックイン | 天気で心の状態を記録 → 部屋へ誘導 |
| `/garden` | 庭（森田療法） | AIガイダンス付き行動リスト |
| `/study` | 書斎（内観法） | 3問のAIチャット + 縁の曼荼羅 |
| `/tatami` | 座敷（禅） | 呼吸ガイド + 公案表示 + 環境音 |
| `/profile` | プロフィール | 統計、ストリーク、器表示、同期 |
| `/report` | 週間レポート | 7日間の活動サマリー |
| `/zen-archive` | 禅語アーカイブ | 50の禅語一覧 + 解説 |
| `/challenge` | 7日間チャレンジ | デイリーミッション |
| `/diagnosis` | 器診断クイズ | 5問の性格診断 |
| `/pricing` | 料金プラン | Free/Premium比較 |
| `/install` | インストール案内 | PWAホーム画面追加手順 |
| `/about/kintsugi` | 金継ぎとは | 哲学の説明ページ |

### API エンドポイント
| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/auth/status` | ログイン状態確認 |
| GET | `/api/auth/login/google` | Google OAuth開始 |
| GET | `/api/auth/callback/google` | OAuthコールバック |
| POST | `/api/auth/logout` | ログアウト |
| POST | `/api/auth/sync` | ローカル→サーバー同期 |
| GET | `/api/auth/profile` | サーバープロフィール取得 |
| POST | `/api/morita/guidance` | 森田療法AIガイダンス (Gemini) |
| GET | `/api/naikan/question` | 内観の質問取得 |
| POST | `/api/naikan/reflect` | 内観AIリフレクション (Gemini) |
| GET | `/api/zen/koan` | 禅公案生成 (Gemini) |
| POST | `/api/garden/action` | 庭アクション記録 |
| POST | `/api/checkin` | チェックイン保存 |
| GET | `/api/checkins` | チェックイン履歴取得 |
| GET | `/api/subscription` | サブスクリプション状態 |
| GET | `/api/subscription/check/:feature` | 機能利用可否チェック |
| POST | `/api/subscription/use/:feature` | 機能利用記録 |
| GET | `/api/vessels` | 器リスト取得 |
| POST | `/api/challenge/sync` | チャレンジ同期 |
| GET | `/api/challenge/status` | チャレンジ状態取得 |
| GET | `/api/sync/profile` | プロフィール同期（GET） |
| POST | `/api/sync/profile` | プロフィール同期（POST） |
| POST | `/api/sync/activity` | アクティビティ同期 |
| GET | `/api/sync/status` | 同期状態確認 |
| GET | `/api/health` | ヘルスチェック |

---

## 6. データモデル

### LocalStorage（オフラインファースト）
- `kintsugi-profile`: ユーザープロフィール（ストリーク、器、統計）
- `kintsugi-checkin-history`: チェックイン履歴（天気 + 日付）
- `kintsugi-challenge`: 7日間チャレンジ進捗
- `kintsugi-lang`: 言語設定（en/ja）
- `kintsugi-dark-mode`: ダークモード設定
- `kintsugi-onboarding-complete`: オンボーディング完了フラグ

### D1 Database
ログイン時に LocalStorage ↔ D1 を双方向同期。主要テーブル:
- `users` — Google OAuth ユーザー
- `profiles` — 統計・ストリーク
- `checkins` — 天気チェックイン
- `activities` — 行動ログ
- `subscriptions` — サブスクリプション（Stripe 未統合）
- `usage` — 機能使用量（レート制限）
- `sessions` — 認証セッション

---

## 7. 開発履歴（最近20コミット）

```
15f9c16 README: dev-bible準拠の将来作業チェックリストを追記
7000e38 dev-bible compliance: JST timezone, DOMContentLoaded timing, toast notifications, etc.
242a394 Bump SW cache to v6 for iOS audio fix deployment
7d7e61d Fix: iOS audio playback (AudioContext unlock, silent buffer, double-tap prevention)
1002afa Fix: move navigation outside main flex container on STUDY/TATAMI pages
d26b6df Bump service worker cache to v5
4656f65 Fix: remove deprecated apple-mobile-web-app-capable meta tag
e87ad8b Bump service worker cache version to v4
74da79e Add room navigation at bottom of Garden, Study, and Tatami pages
15ab069 Fix: align plant growth hint text
4748ff0 Fix: cloud text hidden behind pseudo-elements
855ec95 Fix: cloud text invisible in dark mode
d973ddf Fix: prevent gold logo circle from becoming elliptical
f7a76e1 Add dark mode toggle to header for all pages
f691925 Add explanation text to all 50 zen quotes with bilingual display
776db9e Fix zen quote category misclassification
2d5d5c0 Fix [object Object] display in zen archive today's quote source
487a99d i18n: Translate zen quote source names to Japanese
280b348 Improve dark mode contrast on profile vessel section
34d94e5 Fix i18n: ensure Japanese text is displayed when language is set to Japanese
```

---

## 8. 直近セッションで行った作業

### 今回のセッション概要
1. **コンソールログの問題修正**: `apple-mobile-web-app-capable` 非推奨メタ削除、アイコン404修正
2. **STUDY/TATAMI ナビゲーション重なり修正**: `<main>` 内の flex レイアウトからナビ `<section>` を外に移動
3. **iOS 瞑想音声再生修正** (dev-bible 7-11):
   - AudioContext の `suspended` → `resume()` 対応
   - サイレントバッファ再生によるアンロック
   - 二重タップ防止フラグ（`isSoundToggling`, `isZenStarting`）
   - `visibilitychange` 時の resume
4. **dev-bible 全体準拠修正**:
   - **3-3**: JST タイムゾーン（`getNowJST()`, `getTodayJST()`, `toDateString()` を全箇所に適用）
   - **7-2**: `DOMContentLoaded` → `readyState` チェック付き安全初期化
   - **7-1**: STUDY ページの `dot-1/2/3`, `progress-text` に `study-` 接頭辞
   - **7-6**: `showLoading()` / `hideLoading()` ユーティリティ
   - **7-8**: `showToast()` トースト通知システム（4タイプ）
   - **7-9**: 音声トグル・カレンダーボタンの min-h 44px
   - **5-1/5-3**: `apiError()` ヘルパーで全API レスポンス統一
   - **4-1**: SW キャッシュ v7 + オフラインレスポンス改善

---

## 9. 既知の問題・注意点

### ⚠️ 重要な注意
1. **Tailwind CSS は CDN** — 本番では非推奨だが現在はそのまま。オフライン時に FOUC あり。
2. **app.js が巨大** (4952行) — 1ファイルに全ページのロジックが入っている。分割検討が必要。
3. **index.tsx が巨大** (5108行) — 全ルート + 全API が1ファイル。将来的にルート分割を推奨。
4. **Stripe 未統合** — DB スキーマとUI は準備済みだが、実際の決済フローは未実装。
5. **D1 マイグレーションは本番未適用** — ローカル開発 (`--local`) でのみ動作確認済み。
6. **GitHub push 時の認証** — `setup_github_environment` を先に呼ぶこと。トークンは変わる可能性あり。

### 🐛 ユーザー報告済み（未修正）
- STUDYとTATAMI: ナビ重なりは修正済みだが、ユーザー実機テスト待ち
- iOS 瞑想音声: AudioContext fix 実装済み、ユーザーテスト待ち

---

## 10. dev-bible（開発教訓集）

プロジェクトルート外の `/home/user/dev-bible/` に格納。参照すべきファイル:

| ファイル | 内容 |
|----------|------|
| `GENERIC_LESSONS_CLOUDFLARE.md` | 汎用開発教訓（246KB、全11セクション） |
| `KINTSUGI_LESSONS.md` | 金継ぎ固有の教訓（AI画像生成など） |
| `SECURITY_CHECKLIST.md` | セキュリティチェックリスト |
| `HANDOVER_NOTE.md` | プロジェクト引き継ぎメモ |
| `PROJECT_TEMPLATE_CLOUDFLARE.md` | Cloudflare Pages テンプレート |

### dev-bible で対応済みのセクション
3-3, 4-1, 5-1, 5-3, 7-1, 7-2, 7-6, 7-8, 7-9, 7-11

### dev-bible で未対応のセクション（将来作業）
- 7-5 (Tailwind ローカルビルド)、7-7 (スケルトンUI)
- 8-1〜8-6 (テスト全般)
- 6-1〜6-14 (セキュリティ監査)
- 1-1〜1-7 (課金ロジック — Stripe統合時)
- 5-2 (外部API障害対応)、5-4 (ページネーション)

---

## 11. 次に進めるべきタスク（優先度順）

### 🔴 高優先度
1. **全体的なダークモード監査**
   - 各ページ・モーダル・トーストのダーク表示を網羅確認
   - 特に新しい Toast 通知のダーク表示

2. **完全 i18n 監査**
   - 全画面・全エラーメッセージの翻訳漏れチェック
   - `apiError()` のメッセージは日本語のみ → 言語切替対応が必要か検討

3. **D1 本番マイグレーション適用**
   ```bash
   npx wrangler d1 migrations apply kintsugi-mind-db
   ```

### 🟡 中優先度
4. **dev-bible レッスン統合の整理**
5. **バンドルサイズ最適化** — index.tsx / app.js のルート分割検討
6. **Tailwind CSS ローカルビルド移行** (dev-bible 7-5)
7. **外部API障害時のフォールバック** — Gemini API ダウン時に静的ガイダンスを返す

### 🟢 将来タスク
8. **Stripe 決済統合**（最後に実装予定）
9. **E2E テスト (Playwright)**
10. **セキュリティ監査**（git 履歴のシークレット確認等）

---

## 12. 開発のコツ（このプロジェクト固有）

### ビルド・デプロイ手順
```bash
cd /home/user/webapp
npm run build                                          # 必ずビルドしてから
pm2 restart kintsugi-mind                              # ローカル確認
curl http://localhost:3000                              # 動作確認
npx wrangler pages deploy dist --project-name kintsugi-mind  # 本番デプロイ
git add -A && git commit -m "message" && git push origin main
```

### SW キャッシュバージョン
デプロイ時に `public/sw.js` の `CACHE_NAME` をインクリメントすること（現在 v7）。
忘れるとユーザーが古いキャッシュを見続ける。

### JST タイムゾーン
- フロントエンド: `getNowJST()`, `getTodayJST()`, `toDateString()` を使う
- バックエンド (index.tsx): `getTodayJST()` を使う
- **`new Date().toISOString().split('T')[0]` は使わない**（UTC なので 0〜9時に日付がずれる）

### 環境音（soundscape.js）
- Web Audio API で全て合成（音声ファイルなし）
- プリセット: tatami（禅）、rain、night、garden、forest、water
- iOS では `init()` + サイレントバッファでアンロック必須

### i18n パターン
```typescript
// index.tsx（サーバーサイド）
const lang = getLanguage(c)
tx('section', 'key', lang)  // → 翻訳テキスト

// app.js（フロントエンド）
const lang = getLang()  // URLパラメータ or localStorage
```

---

## 13. ユーザー情報

- **GitHub**: 2525youchan
- **言語**: 日本語でのやり取りを好む
- **テスト環境**: iPhone（iOS Safari）でテスト予定
- **プロジェクトオーナーの関心**: メンタルヘルス × 日本文化 × テクノロジー

---

*この引き継ぎ書は 2026-02-15 時点の状態を反映しています。*
