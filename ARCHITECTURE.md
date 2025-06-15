# 🤖 売上データダッシュボード - AIエージェント向け完全技術仕様書

## 🎯 システム概要

本プロジェクトは、CSV形式の売上データを可視化するためのモダンなWebアプリケーションです。React、Vite、TailwindCSSを使用して構築され、インタラクティブなダッシュボードとチャート機能を提供します。

このドキュメントは、AIエージェントが本プロジェクトを理解・拡張・保守するための包括的な技術仕様書です。

## 🏗️ アーキテクチャ概要

### アプリケーション種別
- **シングルページアプリケーション (SPA)**
- **クライアントサイドレンダリング (CSR)**

### アーキテクチャパターン
- **コンポーネントベースアーキテクチャ**
- **フックベースの状態管理**
- **プレゼンテーション・コンテナパターン**
- **Container/Presentational Pattern**: ロジックとUIの分離
- **Custom Hooks Pattern**: 再利用可能なロジック
- **Compound Component Pattern**: UIコンポーネントの構成
- **Observer Pattern**: リアルタイムデータ更新

### アプリケーション構造
```
Frontend (React SPA)
├── Presentation Layer (Components)
├── Business Logic Layer (Hooks + Utils)
├── Data Access Layer (Data Processors)
└── State Management (React State + useMemo)
```

## 🔧 技術スタック詳細

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
- **Lucide React 0.510.0** - アイコンライブラリ
- **Framer Motion 12.15.0** - アニメーションライブラリ

### データ可視化
- **Recharts 2.15.3** - チャート・グラフライブラリ
  - Bar Chart, Pie Chart, Line Chart, Area Chart, Composed Chart対応

### フォーム・バリデーション
- **React Hook Form 7.56.3** - フォーム管理
- **Zod 3.24.4** - スキーマバリデーション

### その他のライブラリ
- **React Router DOM 7.6.1** - ルーティング
- **Date-fns 4.1.0** - 日付操作
- **Class Variance Authority** - CSS-in-JS ユーティリティ
- **Next Themes** - テーマ管理
- **Sonner** - 通知システム

### 開発ツール
```json
{
  "eslint": "^9.25.0",                  // リンター
  "@vitejs/plugin-react": "^4.4.1",    // Reactプラグイン
  "tw-animate-css": "^1.2.9"           // TailwindCSSアニメーション
}
```

## 📁 ディレクトリ構造詳細

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
│   │   ├── ui/                 # shadcn/ui コンポーネント群
│   │   │   ├── card.jsx           # カードコンポーネント
│   │   │   ├── tabs.jsx           # タブコンポーネント
│   │   │   ├── select.jsx         # セレクトボックス（ダークテーマ対応済み）
│   │   │   ├── table.jsx          # テーブルコンポーネント
│   │   │   ├── button.jsx         # ボタンコンポーネント
│   │   │   ├── input.jsx          # インプットコンポーネント
│   │   │   ├── textarea.jsx       # テキストエリア
│   │   │   ├── switch.jsx         # スイッチコンポーネント
│   │   │   ├── label.jsx          # ラベルコンポーネント
│   │   │   ├── badge.jsx          # バッジコンポーネント
│   │   │   └── ... (45個のUIコンポーネント)
│   │   ├── DataStatusPanel.jsx    # データステータス監視パネル
│   │   ├── DataTable.jsx          # 高機能データテーブル
│   │   └── ReportGenerator.jsx    # レポート生成機能
│   ├── hooks/
│   │   ├── use-mobile.js       # モバイル判定フック
│   │   └── useDataProcessor.js # データ処理・管理フック
│   ├── utils/
│   │   └── analytics.js        # 分析・計算ユーティリティ
│   └── lib/
│       └── utils.js            # ユーティリティ関数
├── components.json             # shadcn/ui設定
├── vite.config.js             # Vite設定
├── eslint.config.js           # ESLint設定
├── jsconfig.json              # JavaScript設定
└── package.json               # 依存関係定義
```

## 🗂️ データフロー

### 1. データ取得フロー
```
CSV File (public/sales_data.csv)
    ↓ fetch()
useDataProcessor Hook
    ↓ processRawData()
Validated Data
    ↓ useMemo()
Filtered Data
    ↓ Analytics Utils
Computed Metrics
```

### 2. 状態管理フロー
```
Raw Data (useState)
    ↓ useEffect()
Filtered Data (useMemo)
    ↓ Analytics Processing
KPIs, Trends, Anomalies (useMemo)
    ↓ React Rendering
UI Components
```

### 3. ユーザーインタラクション
```
User Input (Filters/Search)
    ↓ Event Handlers
State Updates
    ↓ useMemo Recalculation
Data Re-processing
    ↓ Component Re-render
Updated UI
```

### 詳細データフロー（従来版）
```
CSV File (public/sales_data.csv) 
  → fetch() API
  → CSV解析
  → JSON変換
  → salesData状態更新

salesData + フィルター条件
  → useEffect()
  → 条件適用
  → filteredData状態更新

filteredData
  → 統計計算 (総売上、注文数等)
  → チャートデータ生成
  → Recharts コンポーネント描画
```

## 🧩 コンポーネントアーキテクチャ

### メインコンポーネント構造
```
App (src/App.jsx)
├── データステータスパネル (DataStatusPanel)
├── 異常検知アラート
├── 検索・フィルター・操作パネル
│   ├── グローバル検索 (Input)
│   ├── 都道府県選択 (Select)
│   ├── カテゴリ選択 (Select)
│   ├── 期間選択 (Select)
│   └── エクスポートボタン (Button)
├── KPIカードセクション
│   ├── 総売上カード (Card)
│   ├── 注文数カード (Card) 
│   ├── ユニーク顧客数カード (Card)
│   └── 平均注文額カード (Card)
└── チャートセクション (Tabs)
    ├── 概要 - 全体サマリー (AreaChart + PieChart)
    ├── カテゴリ - カテゴリ別売上 (ComposedChart)
    ├── 地域 - 都道府県別売上 (BarChart)
    ├── トレンド - 複合トレンド分析 (ComposedChart)
    ├── 予測 - AI売上予測 (ComposedChart)
    ├── 顧客 - 顧客セグメント+年齢層 (PieChart + BarChart)
    ├── 季節性 - 月別+曜日別 (BarChart x2)
    ├── データ - 詳細データテーブル (DataTable)
    └── レポート - レポート生成 (ReportGenerator)
```

### 状態管理

#### メイン状態（強化版）
```javascript
// データ処理フック
const { salesData, loading, error, lastUpdated, dataStats, refreshData } = useDataProcessor();
const { isAutoRefreshEnabled, toggleAutoRefresh } = useAutoRefresh(refreshData);

// フィルター・検索状態
const [filteredData, setFilteredData] = useState([]);
const [selectedPrefecture, setSelectedPrefecture] = useState('all');
const [selectedCategory, setSelectedCategory] = useState('all');
const [selectedDateRange, setSelectedDateRange] = useState('all');
const [comparisonMode, setComparisonMode] = useState('previous_period');
const [searchTerm, setSearchTerm] = useState('');
const [viewMode, setViewMode] = useState('overview');

// 計算済みデータ（useMemo）
const kpis = useMemo(() => calculateKPIs(currentData, previousData), [currentData, previousData]);
const trends = useMemo(() => calculateTrends(currentData, 'monthly'), [currentData]);
const anomalies = useMemo(() => detectAnomalies(trends), [trends]);
const forecast = useMemo(() => generateForecast(trends), [trends]);
const customerSegments = useMemo(() => segmentCustomers(currentData), [currentData]);
const seasonality = useMemo(() => calculateSeasonality(currentData), [currentData]);
```

## 🔌 API仕様

### useDataProcessor Hook
```javascript
const {
  salesData,          // Array<SalesRecord> - 生データ
  loading,            // boolean - ローディング状態
  error,              // string | null - エラーメッセージ
  lastUpdated,        // Date | null - 最終更新時刻
  dataStats,          // Object - データ統計情報
  refreshData         // Function - データ再取得
} = useDataProcessor();
```

### useAutoRefresh Hook
```javascript
const {
  isAutoRefreshEnabled,    // boolean - 自動更新状態
  toggleAutoRefresh        // Function - 自動更新切り替え
} = useAutoRefresh(refreshCallback, intervalMs);
```

### Analytics Utils
```javascript
// KPI計算
calculateKPIs(currentData, previousData) => {
  totalSales: { value, growth, formatted },
  totalOrders: { value, growth, formatted },
  uniqueCustomers: { value, growth, formatted },
  avgOrderValue: { value, growth, formatted }
}

// トレンド分析
calculateTrends(data, period) => Array<{
  period: string,
  sales: number,
  orders: number,
  customers: number,
  avgOrderValue: number
}>

// 異常検知
detectAnomalies(data, threshold) => Array<{
  period: string,
  value: number
}>

// 売上予測
generateForecast(historicalData, periods) => Array<{
  period: number,
  value: number,
  confidence: number
}>

// 顧客セグメント分析
segmentCustomers(data) => Array<{
  id: string,
  totalSpent: number,
  orderCount: number,
  avgOrderValue: number,
  daysSinceLastOrder: number,
  segment: string
}>

// 季節性分析
calculateSeasonality(data) => {
  monthly: Array<{ name: string, value: number }>,
  weekly: Array<{ name: string, value: number }>
}
```

### Data Schemas

#### SalesRecord
```typescript
interface SalesRecord {
  customer_id: string;        // 顧客ID
  order_date: string;         // 注文日 (YYYY-MM-DD)
  total_price: string;        // 注文総額 (数値文字列)
  category: string;           // 商品カテゴリ
  prefecture: string;         // 都道府県
  age_range: string;          // 年齢層 (e.g., "20-29")
}
```

#### ProcessedData
```typescript
interface ProcessedData extends SalesRecord {
  total_price: number;        // 数値に変換済み
  order_date: Date;           // Dateオブジェクトに変換済み
}
```

#### DataStats
```typescript
interface DataStats {
  totalRows: number;          // 総行数
  validRows: number;          // 有効行数
  invalidRows: number;        // 無効行数
  validationRate: string;     // 有効率 (%)
}
```

## 🧩 主要コンポーネント仕様

### DataStatusPanel.jsx
**機能**: データの状態監視とコントロール
```javascript
Props: {
  loading: boolean,
  error: string | null,
  lastUpdated: Date | null,
  dataStats: DataStats,
  onRefresh: Function,
  isAutoRefreshEnabled: boolean,
  onToggleAutoRefresh: Function
}

Features: {
  - リアルタイムデータステータス表示
  - エラー詳細表示と再試行機能
  - 自動更新の有効/無効切り替え
  - データ統計情報表示
}
```

### DataTable.jsx
**機能**: 高機能データテーブル表示
```javascript
Props: {
  data: Array<SalesRecord>,
  title: string,
  description: string
}

Features: {
  - 列ごとのソート・フィルタリング
  - グローバル検索機能
  - ページネーション (10/20/50/100行)
  - CSVエクスポート機能
  - レスポンシブ対応
  - データ統計バッジ表示
}
```

### ReportGenerator.jsx
**機能**: カスタマイズ可能なレポート生成
```javascript
Props: {
  data: Array<SalesRecord>,
  kpis: KPIData,
  trends: Array<TrendData>,
  anomalies: Array<AnomalyData>
}

Features: {
  - PDF/HTMLエクスポート
  - レポート設定カスタマイズ
  - KPI・チャート・データテーブル含有
  - 自動レポート生成
  - 生成統計表示
}
```

## 🎨 スタイリングシステム

### Tailwind CSS設定
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'float': 'float 3s ease-in-out infinite'
      }
    }
  }
}
```

### カスタムCSS変数
```css
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

### Component Classes
```css
.glass-card {
  @apply backdrop-blur-sm bg-white/10 border border-white/20;
}

.modern-card {
  @apply backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 
         border border-white/20 rounded-xl shadow-xl;
}

.metric-card {
  @apply modern-card p-6 transition-all duration-300;
}

.hover-lift {
  @apply hover:transform hover:-translate-y-1 hover:shadow-2xl 
         transition-all duration-300;
}
```

### UIコンポーネント設計
#### Atomic Design原則の部分採用
- **Atoms**: 基本UIコンポーネント (`src/components/ui/`)
- **Molecules**: 複合コンポーネント (KPIカード、フィルター)
- **Organisms**: 大きな機能単位 (ダッシュボード全体)

#### shadcn/ui活用
- **統一されたデザインシステム**
- **アクセシビリティ対応済み**
- **カスタマイズ可能**
- **TypeScript対応** (このプロジェクトはJavaScript使用)

### Select Component (修正済み)
**問題**: ダークテーマでの視認性不良
**解決**: 以下のスタイル修正を実装
```javascript
// SelectContent: bg-gray-900 text-white border-gray-700
// SelectItem: hover:bg-white/10 data-[state=checked]:bg-blue-600
// 視認性とアクセシビリティを大幅改善
```

### Chart Components
**使用ライブラリ**: Recharts 2.15.3
**対応チャート**:
- `AreaChart` - トレンド表示
- `PieChart` - カテゴリ分布
- `BarChart` - 地域・年齢別データ
- `LineChart` - 時系列データ
- `ComposedChart` - 複合データ表示

### Animation System
**Framer Motion**: ページ全体のアニメーション
**CSS Animations**: ホバー効果とマイクロインタラクション
```css
.animate-fade-in { animation: fadeIn 0.6s ease-out }
.animate-slide-up { animation: slideUp 0.8s ease-out }
.hover-lift { transform: translateY(-4px) on hover }
```

## 🔍 デバッグ・モニタリング

### データ検証
```javascript
// useDataProcessor.js内の検証ロジック
const validateDataRow = (row) => {
  const errors = [];
  if (!row.customer_id) errors.push('Customer ID is missing');
  if (!row.order_date || isNaN(Date.parse(row.order_date))) {
    errors.push('Invalid order date');
  }
  if (!row.total_price || isNaN(parseFloat(row.total_price))) {
    errors.push('Invalid total price');
  }
  return errors;
};
```

### エラーハンドリング
```javascript
// 統一されたエラーハンドリングパターン
try {
  const processedData = processRawData(csvText);
  setSalesData(processedData);
} catch (err) {
  setError(err.message);
  console.error('Data processing error:', err);
}
```

### パフォーマンス監視
```javascript
// useMemoを活用した計算最適化
const expensiveCalculation = useMemo(() => {
  console.time('Analytics calculation');
  const result = performComplexAnalysis(data);
  console.timeEnd('Analytics calculation');
  return result;
}, [data]);
```

## 🚀 パフォーマンス考慮事項

### データ処理最適化
- **useEffect依存配列の適切な管理**
- **useMemo による計算結果キャッシュ**
- **大量データのフィルタリング効率化**

### レンダリング最適化
- **React.memo未使用** (将来の改善点)
- **useCallback未使用** (将来の改善点)
- **チャートコンポーネントの条件分岐**

### パフォーマンスメトリクス
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### ビジネスメトリクス
- **データ処理能力**: 100,000行まで対応
- **フィルタリング応答時間**: < 200ms
- **チャート描画時間**: < 500ms
- **メモリ使用量**: < 100MB

## 🔒 セキュリティ考慮事項

### データ保護
- **CSVデータは静的ファイル** (本番環境では要検討)
- **クライアントサイド処理** (サーバーサイド処理が望ましい場合も)

### 入力値検証
- **フィルター値の検証**
- **CSV解析エラーハンドリング**

### データ検証
```javascript
// 入力データの厳密な検証
const sanitizeInput = (input) => {
  return input.toString().replace(/[<>]/g, '');
};
```

### XSS対策
```javascript
// React標準のエスケープ処理を活用
const SafeContent = ({ content }) => {
  return <div>{content}</div>; // 自動エスケープ
};
```

## 🚀 拡張性設計

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

### 拡張ポイント

#### 1. 新しい分析機能の追加
```javascript
// utils/analytics.js に新しい関数を追加
export const calculateNewMetric = (data) => {
  // 新しいメトリック計算ロジック
  return processedData;
};

// App.jsx で使用
const newMetric = useMemo(() => calculateNewMetric(currentData), [currentData]);
```

#### 2. 新しいチャートタイプの追加
```javascript
// 新しいTabsContentを追加
<TabsContent value="new-analysis">
  <Card className="modern-card hover-lift">
    <CardHeader>
      <CardTitle>新しい分析</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={400}>
        <NewChartType data={newMetric} />
      </ResponsiveContainer>
    </CardContent>
  </Card>
</TabsContent>
```

#### 3. データソース拡張
```javascript
// useDataProcessor.js の拡張
const loadDataFromAPI = async () => {
  const response = await fetch('/api/sales-data');
  const data = await response.json();
  return processApiData(data);
};
```

#### 4. リアルタイム機能の追加
```javascript
// WebSocket接続の実装例
const useRealtimeData = () => {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      updateData(newData);
    };
    return () => ws.close();
  }, []);
};
```

## 🧪 テスト戦略

### ユニットテスト
```javascript
// Analytics関数のテスト例
describe('calculateKPIs', () => {
  test('正しくKPIを計算する', () => {
    const mockData = [
      { total_price: 1000, customer_id: 'C1' },
      { total_price: 2000, customer_id: 'C2' }
    ];
    const result = calculateKPIs(mockData, []);
    expect(result.totalSales.value).toBe(3000);
  });
});
```

### インテグレーションテスト
```javascript
// コンポーネント統合テスト
describe('DataTable', () => {
  test('データを正しく表示する', () => {
    render(<DataTable data={mockData} />);
    expect(screen.getByText('総件数: 2')).toBeInTheDocument();
  });
});
```

## 🔄 開発・デプロイメント

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

### ビルド最適化
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-select']
        }
      }
    }
  }
});
```

### 環境設定
```bash
# 開発環境
VITE_API_URL=http://localhost:3001
VITE_DEBUG=true

# 本番環境  
VITE_API_URL=https://api.production.com
VITE_DEBUG=false
```

### Git フック
```bash
# pre-commit
#!/bin/sh
pnpm lint && pnpm test
```

## 📚 参考資料

### 主要ライブラリドキュメント
- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Recharts](https://recharts.org/)

### アーキテクチャパターン
- [React Hook Patterns](https://react.dev/reference/react)
- [Component Composition](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- [State Management Patterns](https://react.dev/learn/managing-state)

## まとめ

Sales Dashboardは、モダンなReactエコシステムを活用した効率的なダッシュボードアプリケーションです。shadcn/uiとTailwindCSSによる統一されたUI、Rechartsによる豊富な可視化機能、そして適切に構造化されたコンポーネントアーキテクチャにより、保守性と拡張性を両立しています。

リアルタイムデータ処理、AI予測、異常検知など、データドリブンな意思決定を支援する高度な機能を搭載した企業レベルの分析プラットフォームとして設計されています。

今後の改善点として、パフォーマンス最適化、状態管理の改善、バックエンドAPI統合などが挙げられます。

---

**このアーキテクチャドキュメントを参照して、効率的な開発・保守・拡張を実現してください。** 🤖🏗️