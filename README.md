# 🚀 売上データダッシュボード - 次世代セールス分析プラットフォーム

## 📊 プロジェクト概要

本プロジェクトは、企業の売上データを包括的に分析・可視化する最先端のダッシュボードアプリケーションです。リアルタイムデータ処理、AI予測、異常検知など、データドリブンな意思決定を支援する高度な機能を搭載しています。

## ✨ 主要機能

### 🎯 分析機能
- **リアルタイム売上監視** - 自動更新によるリアルタイムデータ表示
- **AI売上予測** - 機械学習による将来トレンド予測
- **異常検知システム** - 売上パターンの自動監視・アラート
- **顧客セグメント分析** - RFM分析による顧客分類
- **季節性分析** - 月別・曜日別売上パターン分析
- **地域分析** - 都道府県別売上ランキング
- **カテゴリ分析** - 商品カテゴリ別詳細分析

### 📈 ダッシュボード機能
- **9つの専門分析タブ**
  - 📊 概要 - 全体の売上サマリー
  - 🏷️ カテゴリ - 商品カテゴリ別詳細分析
  - 🗾 地域 - 都道府県別売上ランキング
  - 📈 トレンド - 複合的なトレンド分析
  - 🔮 予測 - AI による売上予測
  - 👥 顧客 - 顧客セグメント・年齢層分析
  - 📅 季節性 - 時間軸での売上パターン
  - 📋 データ - 詳細データテーブル
  - 📄 レポート - カスタマイズ可能なレポート生成

### 🔍 データ操作機能
- **高度な検索・フィルタリング**
  - 全文検索機能
  - 都道府県・カテゴリ・期間フィルター
  - リアルタイム絞り込み
- **データテーブル機能**
  - 列ごとのソート・フィルタリング
  - ページネーション（10/20/50/100行）
  - CSVエクスポート
- **レポート生成**
  - PDF/HTMLエクスポート
  - カスタマイズ可能なレポート設定
  - 自動レポート生成

### 📊 KPI監視
- **主要指標の追跡**
  - 総売上（前期比較付き）
  - 注文数（成長率表示）
  - ユニーク顧客数（トレンド表示）
  - 平均注文額（変化率表示）
- **リアルタイム更新**
- **視覚的なトレンド表示**

## 🛠️ 技術スタック

- **フロントエンド**: React 19.1.0 + Vite
- **スタイリング**: Tailwind CSS 4.1.7
- **UIコンポーネント**: Radix UI + カスタムコンポーネント
- **チャート**: Recharts 2.15.3
- **アイコン**: Lucide React
- **日付処理**: date-fns 4.1.0
- **アニメーション**: Framer Motion 12.15.0

## 🚀 セットアップ

### 前提条件
- Node.js 18.0.0 以上
- pnpm (推奨) または npm

### インストール
```bash
# リポジトリをクローン
git clone [repository-url]
cd sales-dashboard

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

### ビルド
```bash
# 本番用ビルド
pnpm build

# プレビュー
pnpm preview
```

## 📁 ファイル構造

```
sales-dashboard/
├── public/
│   └── sales_data.csv          # サンプル売上データ
├── src/
│   ├── components/
│   │   ├── ui/                 # 基本UIコンポーネント
│   │   ├── DataStatusPanel.jsx # データステータス表示
│   │   ├── DataTable.jsx       # データテーブル
│   │   └── ReportGenerator.jsx # レポート生成
│   ├── hooks/
│   │   └── useDataProcessor.js # データ処理フック
│   ├── utils/
│   │   └── analytics.js        # 分析ユーティリティ
│   ├── App.jsx                 # メインアプリケーション
│   ├── App.css                 # アプリケーションスタイル
│   └── main.jsx               # エントリーポイント
├── package.json
└── README.md
```

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: Purple to Cyan グラデーション
- **セカンダリ**: Blue, Pink, Green, Orange
- **背景**: Dark theme with glass morphism
- **テキスト**: White with opacity variations

### アニメーション
- **Fade-in**: コンテンツの滑らかな表示
- **Slide-up**: 上向きスライド効果
- **Hover-lift**: ホバー時の浮き上がり効果
- **Float**: 浮遊アニメーション

## 📊 データ形式

### CSVデータ構造
```csv
customer_id,order_date,total_price,category,prefecture,age_range
C001,2024-01-15,5000,Electronics,東京都,30-39
C002,2024-01-16,3500,Fashion,大阪府,20-29
...
```

### 必須フィールド
- `customer_id`: 顧客ID
- `order_date`: 注文日（YYYY-MM-DD形式）
- `total_price`: 注文総額
- `category`: 商品カテゴリ
- `prefecture`: 都道府県
- `age_range`: 年齢層

## 🔧 カスタマイズ

### データソースの変更
1. `public/sales_data.csv` を新しいデータで置き換え
2. `useDataProcessor.js` でデータ取得先を変更
3. 必要に応じて `analytics.js` の計算ロジックを調整

### 新しい分析機能の追加
1. `utils/analytics.js` に分析関数を追加
2. `App.jsx` で新しいタブを作成
3. チャートコンポーネントを実装

### UIのカスタマイズ
1. `App.css` でグローバルスタイルを調整
2. `components/ui/` のコンポーネントを編集
3. 新しいアニメーションや色の追加

## 🚀 デプロイ

### Vercel（推奨）
```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel
```

### Netlify
```bash
# ビルド
pnpm build

# dist/ フォルダをNetlifyにアップロード
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "preview", "--host"]
```

## 📈 パフォーマンス

### 最適化済み機能
- **仮想化**: 大量データの効率的表示
- **メモ化**: 計算結果のキャッシュ
- **遅延読み込み**: 必要時のみデータロード
- **バンドル最適化**: Viteによる最適化

### パフォーマンス指標
- **初回表示**: < 2秒
- **データ処理**: 10万件まで対応
- **メモリ使用量**: 効率的なガベージコレクション

## 🛡️ セキュリティ

- **データ検証**: 入力データの厳密な検証
- **XSS対策**: React標準のエスケープ処理
- **CSRF対策**: 適切なHTTPヘッダー設定
- **機密情報**: 環境変数による管理

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

- **Issues**: GitHubのIssueページで報告
- **ドキュメント**: `/docs` フォルダを参照
- **コミュニティ**: ディスカッションページで質問

---

**最強の売上分析ダッシュボードで、データドリブンな意思決定を実現しましょう！** 🚀📊