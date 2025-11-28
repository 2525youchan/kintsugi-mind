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
1. **全体的なダークモード対応** - 各ページの確認・調整
2. **週間レポート最終レビュー** - デプロイ前確認

### 中優先度
3. **Cloudflare Pages本番デプロイ**
4. **D1データベースマイグレーション（本番）**

### 最後に実装
5. **Stripe決済統合**
   - Stripeアカウント設定
   - API キー設定
   - Webhook設定
   - 料金プラン作成

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

**最終更新**: 2024-11-28  
**© 2024 KINTSUGI MIND — The Japanese Art of Resilience**

*「傷ついた器は、金で繋がれることでより美しくなる。あなたも同じです。」*
