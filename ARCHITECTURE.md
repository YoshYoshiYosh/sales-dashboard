# Sales Dashboard アーキテクチャドキュメント

## プロジェクト概要

Sales Dashboardは、CSV形式の売上データを可視化するためのモダンなWebアプリケーションです。React、Vite、TailwindCSSを使用して構築され、インタラクティブなダッシュボードとチャート機能を提供します。

## 技術スタック

### フロントエンド
- **React 19.1.0** - UIライブラリ
- **JavaScript (JSX)** - プログラミング言語

### ビルドツール・開発環境
- **Vite 6.3.5** - ビルドツール・開発サーバー
- **ESLint** - コード品質管理
- **pnpm** - パッケージマネージャー

### スタイリング・UI
- **TailwindCSS 4.1.7** - CSSフレームワーク
- **Radix UI** - ヘッドレスUIコンポーネント群
  - Accordion, Alert Dialog, Avatar, Button, Card, Dialog, Dropdown Menu等
- **shadcn/ui** - UIコンポーネントライブラリ
- **Lucide React** - アイコンライブラリ
- **Framer Motion 12.15.0** - アニメーションライブラリ

### データ可視化
- **Recharts 2.15.3** - チャート・グラフライブラリ
  - Bar Chart, Pie Chart, Line Chart対応

### フォーム・バリデーション
- **React Hook Form 7.56.3** - フォーム管理
- **Zod 3.24.4** - スキーマバリデーション

### その他のライブラリ
- **React Router DOM 7.6.1** - ルーティング
- **Date-fns 4.1.0** - 日付操作
- **Class Variance Authority** - CSS-in-JS ユーティリティ
- **Next Themes** - テーマ管理
- **Sonner** - 通知システム

## アーキテクチャ概要

### アプリケーション種別
- **シングルページアプリケーション (SPA)**
- **クライアントサイドレンダリング (CSR)**

### アーキテクチャパターン
- **コンポーネントベースアーキテクチャ**
- **フックベースの状態管理**
- **プレゼンテーション・コンテナパターン**

## ディレクトリ構造

```
sales-dashboard/
├── public/
│   ├── sales_data.csv          # 売上データ（12MB）
│   └── vite.svg                # Viteロゴ
├── src/
│   ├── App.jsx                 # メインアプリケーションコンポーネント
│   ├── App.css                 # アプリケーション固有のスタイル
│   ├── main.jsx                # エントリーポイント
│   ├── index.css               # グローバルスタイル
│   ├── components/
│   │   └── ui/                 # shadcn/ui コンポーネント群
│   │       ├── card.jsx
│   │       ├── tabs.jsx
│   │       ├── select.jsx
│   │       ├── button.jsx
│   │       └── ... (45個のUIコンポーネント)
│   ├── hooks/
│   │   └── use-mobile.js       # モバイル判定フック
│   └── lib/
│       └── utils.js            # ユーティリティ関数
├── components.json             # shadcn/ui設定
├── vite.config.js             # Vite設定
├── eslint.config.js           # ESLint設定
├── jsconfig.json              # JavaScript設定
└── package.json               # 依存関係定義
```

## コンポーネントアーキテクチャ

### メインコンポーネント構造

```
App (src/App.jsx)
├── フィルターセクション
│   ├── 都道府県選択 (Select)
│   ├── カテゴリ選択 (Select)
│   └── 期間選択 (Select)
├── KPIカードセクション
│   ├── 総売上カード (Card)
│   ├── 注文数カード (Card) 
│   ├── ユニーク顧客数カード (Card)
│   └── 平均注文額カード (Card)
└── チャートセクション (Tabs)
    ├── カテゴリ別売上 (PieChart)
    ├── 都道府県別売上 (BarChart)
    ├── 月別売上推移 (LineChart)
    └── 年齢層別売上 (BarChart)
```

### 状態管理

```javascript
// メイン状態
const [salesData, setSalesData] = useState([]);           // 元データ
const [filteredData, setFilteredData] = useState([]);    // フィルター済みデータ
const [loading, setLoading] = useState(true);            // ローディング状態

// フィルター状態
const [selectedPrefecture, setSelectedPrefecture] = useState('all');
const [selectedCategory, setSelectedCategory] = useState('all');
const [selectedDateRange, setSelectedDateRange] = useState('all');
```

## データフロー

### 1. データ読み込み
```
CSV File (public/sales_data.csv) 
  → fetch() API
  → CSV解析
  → JSON変換
  → salesData状態更新
```

### 2. フィルタリング
```
salesData + フィルター条件
  → useEffect()
  → 条件適用
  → filteredData状態更新
```

### 3. データ集計・可視化
```
filteredData
  → 統計計算 (総売上、注文数等)
  → チャートデータ生成
  → Recharts コンポーネント描画
```

## UIコンポーネント設計

### Atomic Design原則の部分採用
- **Atoms**: 基本UIコンポーネント (`src/components/ui/`)
- **Molecules**: 複合コンポーネント (KPIカード、フィルター)
- **Organisms**: 大きな機能単位 (ダッシュボード全体)

### shadcn/ui活用
- **統一されたデザインシステム**
- **アクセシビリティ対応済み**
- **カスタマイズ可能**
- **TypeScript対応** (このプロジェクトはJavaScript使用)

## パフォーマンス考慮事項

### データ処理最適化
- **useEffect依存配列の適切な管理**
- **メモ化対象の選別** (現在は未実装)
- **大量データのフィルタリング効率化**

### レンダリング最適化
- **React.memo未使用** (将来の改善点)
- **useCallback未使用** (将来の改善点)
- **チャートコンポーネントの条件分岐**

## セキュリティ考慮事項

### データ保護
- **CSVデータは静的ファイル** (本番環境では要検討)
- **クライアントサイド処理** (サーバーサイド処理が望ましい場合も)

### 入力値検証
- **フィルター値の検証**
- **CSV解析エラーハンドリング**

## 拡張性設計

### 追加可能な機能
- **データベース接続** (現在はCSVファイル)
- **リアルタイムデータ更新**
- **ユーザー認証**
- **データエクスポート機能**
- **カスタムチャート作成**

### スケーラビリティ
- **状態管理ライブラリ導入** (Redux, Zustand等)
- **APIレイヤー抽象化**
- **マイクロフロントエンド化**

## 開発・デプロイメント

### 開発コマンド
```bash
pnpm dev      # 開発サーバー起動
pnpm build    # プロダクションビルド
pnpm lint     # コード品質チェック
pnpm preview  # ビルド結果プレビュー
```

### ビルド設定
- **Vite設定**: ES modules対応、React plugin、TailwindCSS統合
- **パスエイリアス**: `@/` → `src/` マッピング
- **最適化**: 自動的なコード分割とミニファイ

## まとめ

Sales Dashboardは、モダンなReactエコシステムを活用した効率的なダッシュボードアプリケーションです。shadcn/uiとTailwindCSSによる統一されたUI、Rechartsによる豊富な可視化機能、そして適切に構造化されたコンポーネントアーキテクチャにより、保守性と拡張性を両立しています。

今後の改善点として、パフォーマンス最適化、状態管理の改善、バックエンドAPI統合などが挙げられます。 