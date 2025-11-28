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

## 🏠 The Tea House Architecture

アプリ全体を「心の茶室」に見立て、ユーザーの状態に合わせて最適な「部屋」へ案内します。

### 3つの部屋（モード）

| 部屋 | ベース理論 | 対象状態 | 提供価値 |
|------|-----------|---------|---------|
| 🌱 **GARDEN（庭）** | 森田療法 | 不安、無気力、先延ばし | Action / Arugamama |
| 📚 **STUDY（書斎）** | 内観法 | 孤独、怒り、人間関係 | Harmony / Kansha |
| 🧘 **TATAMI（座敷）** | 禅 | 混乱、不眠、思考過多 | Stillness / Mu |

## ✅ 実装済み機能 (MVP)

### 1. エントランス（Check-in）
- 心の天気を選ぶUI（☀️⛅🌧️⛈️）
- 天気に基づく部屋のレコメンド
- 和のデザインシステム適用

### 2. GARDEN モード（森田療法）
- **Split Screen UI**: 空（感情）と地（行動）の2分割画面
- 感情を「雲」として浮かべる機能
- Micro-Action（小さな行動）チェックリスト
- 行動完了で植物が育つビジュアル
- 森田療法AIガイダンス（モック）

### 3. STUDY モード（内観法）
- 3つの問いチャットボット
  1. 誰かに助けられた瞬間
  2. 世界に提供したこと
  3. 誰かの寛容さに甘えた場面
- プログレス表示
- 完了時のまとめメッセージ

### 4. TATAMI モード（禅）
- 呼吸ガイド（Breathing Circle）
- 吸う/吐くのアニメーション
- Haptic Feedback（振動対応デバイス）
- 公案（Zen Koan）の表示

## 🌐 URLs

- **Development**: https://3000-if9tga8gtcbj5qwvegti3-2e77fc33.sandbox.novita.ai
- **Production**: (Cloudflare Pages デプロイ後)

### API Endpoints
- `POST /api/morita/guidance` - 森田療法AIガイダンス
- `GET /api/naikan/question?step=1-3` - 内観法の質問取得
- `GET /api/zen/koan` - 禅の公案取得
- `POST /api/garden/action` - 行動記録

## 🎨 Design System (Wa / 和)

### カラーパレット
- **藍色 (Indigo)**: `#1e3a5f` - Primary
- **生成り (Ecru)**: `#f5f0e8` - Background
- **金 (Gold)**: `#c9a227` - Accent / Kintsugi
- **墨 (Ink)**: `#1a1a1a` - Text

### タイポグラフィ
- **英文**: Cormorant Garamond (Serif)
- **日本語**: Noto Serif JP

## 📁 Project Structure

```
kintsugi-mind/
├── src/
│   ├── index.tsx      # メインアプリ & ルーティング
│   └── renderer.tsx   # HTMLテンプレート & Tailwind設定
├── public/
│   └── static/
│       ├── style.css  # 和デザインシステムCSS
│       └── app.js     # フロントエンドJS
├── dist/              # ビルド出力
├── ecosystem.config.cjs # PM2設定
├── wrangler.jsonc     # Cloudflare設定
└── package.json
```

## 🚀 Development

```bash
# 依存関係インストール
npm install

# ビルド
npm run build

# 開発サーバー起動（PM2）
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs --nostream

# ローカルプレビュー
npm run dev
```

## 📋 未実装機能 / Next Steps

### Phase 2: Integration
- [ ] **金継ぎプログレッションシステム**
  - ユーザーの「器」アバター
  - ログイン履歴でヒビが入る（歴史として）
  - ワーク完了で金で修復
- [ ] **D1データベース統合**
  - ユーザーデータ永続化
  - 感情・行動ログの保存
- [ ] **OpenAI API統合**
  - 実際のAIチャット機能
  - 各療法に基づいたペルソナ設定

### Phase 3: Community & Scale
- [ ] Connection Mandala（縁の図）生成
- [ ] 匿名の写真共有機能
- [ ] PWA対応
- [ ] 多言語対応（EN/JP）

## 🛠 Tech Stack

- **Framework**: Hono (TypeScript)
- **Platform**: Cloudflare Pages / Workers
- **Styling**: Tailwind CSS (CDN)
- **Fonts**: Google Fonts
- **Dev Server**: Wrangler + PM2

## 📝 Deployment

```bash
# Cloudflare Pagesへデプロイ
npm run deploy:prod

# または手動で
npm run build
wrangler pages deploy dist --project-name kintsugi-mind
```

---

**© 2024 KINTSUGI MIND — The Japanese Art of Resilience**

*「傷ついた器は、金で繋がれることでより美しくなる。あなたも同じです。」*
