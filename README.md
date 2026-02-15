# KINTSUGI MIND — 金継ぎマインド

> **The Japanese Art of Resilience** — 日本発：回復と調和のメンタルヘルスアプリ

## 🎯 Project Overview

**Name**: KINTSUGI MIND  
**Goal**: 西洋的な「修正・コントロール」に疲れた人々へ、日本独自の「受容・共存・調和」の精神をAI技術で提供する  
**Message**: "Your scars make you beautiful" — 不安や苦悩があっても、美しく強く生きられる

### Core Philosophy
- **No Fixing**: 心を「直す」のではなく、あるがまま「使う」
- **Action Oriented**: 静止する瞑想ではなく、動く禅
- **Wabi-Sabi Growth**: 傷を否定せず、「金継ぎ」のように美として昇華

## 🌐 URLs

- **Sandbox**: https://3000-if9tga8gtcbj5qwvegti3-2e77fc33.sandbox.novita.ai
- **GitHub**: https://github.com/2525youchan/kintsugi-mind

## ✅ 実装完了機能

### 認証・データ管理
- ✅ Google OAuth認証（ログイン/ログアウト）
- ✅ LocalStorage ↔ D1データベース双方向同期
- ✅ クラウド同期ステータス表示（プロフィールページ）
- ✅ オフライン対応（PWA / Service Worker）

### マネタイズシステム
- ✅ Free/Premium機能制限設計
- ✅ 料金ページUI（プラン比較・FAQ）
- ✅ 地域別価格設定
  - 英語版: $10/月, $80/年
  - 日本語版: ¥980/月, ¥7,800/年
- ⏳ Stripe決済統合（最後に実装予定）

### コア機能（3つの部屋）
| 部屋 | ベース理論 | 対象状態 | AI機能 |
|------|-----------|---------|--------|
| 🌱 **GARDEN（庭）** | 森田療法 | 不安、無気力 | Gemini AIガイダンス |
| 📚 **STUDY（書斎）** | 内観法 | 孤独、怒り | 内観チャットボット + 縁の曼荼羅 |
| 🧘 **TATAMI（座敷）** | 禅 | 混乱、不眠 | 公案生成 + 呼吸ガイド |

### UI/UX
- ✅ オンボーディングフロー（金継ぎ哲学スライド）
- ✅ 器選択UI（5種類 + プレミアム10種類）
- ✅ チェックイン履歴カレンダー（天気絵文字表示）
- ✅ 四季の挨拶・メッセージシステム
- ✅ 週間レポート + シェア機能
- ✅ ダークモード対応
- ✅ 日英バイリンガル対応

## 🗂 プラン制限

| 機能 | Free | Premium |
|------|------|---------|
| AI対話 | 3回/日 | 無制限 |
| チェックイン | 1回/日 | 無制限 |
| 履歴表示 | 7日間 | 無制限 |
| 器デザイン | 5種類 | 15種類 |
| 詳細分析 | ✗ | ✓ |
| 音声ガイド瞑想 | ✗ | ✓ |
| データエクスポート | ✗ | ✓ |

## 📋 次のタスク（明日以降）

### 高優先度
1. **全体的なダークモード監査** - 各ページ・モーダル・トーストのダーク表示を網羅的に確認・調整
2. **週間レポート最終レビュー** - データ集計ロジック・表示の最終確認
3. **完全 i18n 監査** - 全画面・全エラーメッセージの翻訳漏れチェック

### 中優先度
4. **Cloudflare Pages 本番デプロイ安定化**
   - D1 データベースマイグレーション（本番環境）
   - 環境変数 / Secrets の棚卸し
5. **dev-bible レッスン統合** - KINTSUGI_LESSONS.md と GENERIC_LESSONS_CLOUDFLARE.md の整理

### 将来改善（dev-bible 準拠チェックリスト）

> dev-bible の各セクションを基にした、今後対応すべき技術的改善項目

#### パフォーマンス / ビルド
- [ ] **7-5: Tailwind CSS をローカルビルドに移行** — CDN (cdn.tailwindcss.com) は本番非推奨。オフライン時に FOUC（スタイル崩れ）が発生する。PostCSS + Tailwind CLI でビルド時に CSS を生成する
- [ ] **バンドルサイズ最適化** — `_worker.js` が 250KB 超。コード分割やルート分割の検討

#### テスト / デバッグ
- [ ] **8-1: 本番データでの課金ロジック検証** — Stripe 統合後、テスト→本番の切り替え時に全ユーザー状態を確認
- [ ] **8-2: エッジケーステスト** — 初回利用、データ 0 件、オフライン、低速回線、複数端末同時ログイン
- [ ] **8-3: E2E テスト (Playwright)** — ログイン→チェックイン→庭→書斎→座敷→プロフィールのユーザーフロー自動テスト
- [ ] **8-4: 本番環境デバッグ手順の整備** — ログ収集、エラー追跡、段階的ロールアウト手順

#### セキュリティ
- [ ] **6-1: API キー漏洩チェック** — `.env`, `.dev.vars`, git 履歴にシークレットが含まれていないか確認
- [ ] **6-2: ブルートフォース対策** — レートリミットの閾値見直し（現在: 429 返却済み）
- [ ] **6-3: XSS / SQL インジェクション監査** — `dangerouslySetInnerHTML` 使用箇所の再確認
- [ ] **6-4: Cookie / セッション一貫性チェック** — SameSite, Secure, HttpOnly 属性の確認

#### データベース / ストレージ
- [ ] **3-4: マイグレーション管理の厳格化** — 本番 D1 へのマイグレーション手順書作成、バックアップ・ロールバック手順
- [ ] **3-5: インデックス最適化** — チェックイン履歴・使用量テーブルの検索パフォーマンス確認

#### API / 外部連携
- [ ] **5-2: 外部 API の障害対応** — Gemini API タイムアウト時のフォールバック（オフライン用の静的ガイダンス）
- [ ] **5-4: ページネーション** — チェックイン履歴 API が全件返却になっている。大量データ時のパフォーマンス対策
- [ ] **11-4: レートリミット考慮** — Gemini API の呼び出し回数制限の監視と graceful degradation

#### UI/UX 継続改善
- [ ] **7-3: グラフラベル一貫性** — 週間レポートのチャートラベルが言語切替で正しく更新されるか確認
- [ ] **7-4: 長期間グラフ表示** — チェックイン履歴が増えた時の X 軸ラベル集約（日→週→月）
- [ ] **7-7: スケルトン UI** — ページ読み込み時のスケルトン表示でユーザー体感速度を改善
- [ ] **器画像のスマホ視認性** — dev-bible KINTSUGI_LESSONS 3-3 に基づき、Stage 間の差がスマホで判別できるか実機確認

#### 課金・決済（Stripe 統合時）
- [ ] **1-1: ステータスだけでなく期限も確認** — `current_period_end` を必ずチェック
- [ ] **1-2: 重複レコード対策** — Webhook の冪等性（idempotency key）
- [ ] **1-3: 重複作成防止** — サブスクリプション作成の排他制御
- [ ] **1-4: 複数テーブル整合性** — users, subscriptions, usage テーブルのトランザクション管理
- [ ] **10-1: Stripe Webhook 署名検証** — 本番環境での `stripe-signature` ヘッダー検証
- [ ] **10-2: メール配信** — 課金完了・更新・失敗時の通知メール（Resend 等）

### 最後に実装
6. **Stripe 決済統合**
   - Stripe アカウント設定
   - API キー設定 (`wrangler secret put`)
   - Webhook エンドポイント + 署名検証
   - 料金プラン作成（月額・年額）
   - テストモード→本番モード切替手順

## ✅ 完了済み dev-bible 対応（2026-02-15）

| dev-bible | 対応内容 |
|---|---|
| 3-3 タイムゾーン | 全日付処理を JST (UTC+9) ヘルパーに統一 |
| 4-1 SW キャッシュ | バージョン管理 (v7)、API 除外、オフラインレスポンス改善 |
| 5-1/5-3 API エラー | 統一 `apiError()` ヘルパー + 日本語メッセージ + retryable フラグ |
| 7-1 重複 ID | STUDY ページの dot/progress に `study-` 接頭辞 |
| 7-2 DOMContentLoaded | `readyState` チェックで安全な初期化 |
| 7-6 ローディング | `showLoading()`/`hideLoading()` ユーティリティ |
| 7-8 Toast 通知 | `showToast()` (success/error/info/warning) |
| 7-9 タップターゲット | 音声トグル・カレンダーボタンを min-h 44px に |
| 7-11 iOS 音声再生 | AudioContext unlock、サイレントバッファ、二重タップ防止 |

## 🛠 Tech Stack

- **Framework**: Hono (TypeScript)
- **Platform**: Cloudflare Pages / Workers
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Google OAuth 2.0
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS (CDN)
- **Dev Server**: Wrangler + PM2

## 📁 Project Structure

```
kintsugi-mind/
├── src/
│   ├── index.tsx        # メインアプリ & API
│   ├── components.tsx   # 共有コンポーネント
│   └── i18n.ts          # 国際化
├── public/
│   └── static/
│       ├── app.js       # フロントエンドJS
│       ├── style.css    # カスタムCSS
│       └── sw.js        # Service Worker
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_subscriptions.sql
├── ecosystem.config.cjs  # PM2設定
├── wrangler.jsonc        # Cloudflare設定
└── package.json
```

## 🚀 Development

```bash
# 依存関係インストール
npm install

# ビルド
npm run build

# 開発サーバー起動
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs --nostream
```

---

**最終更新**: 2026-02-15  
**© 2026 KINTSUGI MIND — The Japanese Art of Resilience**

*「傷ついた器は、金で繋がれることでより美しくなる。あなたも同じです。」*
