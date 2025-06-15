import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign, Calendar, MapPin, AlertTriangle, Target, Zap, Download, Search, Filter, Eye, BarChart3, Activity, Database, FileText } from 'lucide-react';
import { useDataProcessor, useAutoRefresh } from './hooks/useDataProcessor';
import { calculateKPIs, calculateTrends, detectAnomalies, generateForecast, segmentCustomers, calculateSeasonality } from './utils/analytics';
import DataStatusPanel from './components/DataStatusPanel';
import DataTable from './components/DataTable';
import ReportGenerator from './components/ReportGenerator';

const COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
];

const CHART_COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];

function App() {
  const { salesData, loading, error, lastUpdated, dataStats, refreshData } = useDataProcessor();
  const { isAutoRefreshEnabled, toggleAutoRefresh } = useAutoRefresh(refreshData);
  
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [comparisonMode, setComparisonMode] = useState('previous_period');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('overview');

  const { currentData, previousData } = useMemo(() => {
    let filtered = salesData;

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedPrefecture !== 'all') {
      filtered = filtered.filter(item => item.prefecture === selectedPrefecture);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    let currentData = filtered;
    let previousData = [];

    if (selectedDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      const prevFilterDate = new Date();
      
      switch (selectedDateRange) {
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          prevFilterDate.setDate(now.getDate() - 60);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          prevFilterDate.setDate(now.getDate() - 180);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          prevFilterDate.setFullYear(now.getFullYear() - 2);
          break;
      }
      
      currentData = filtered.filter(item => new Date(item.order_date) >= filterDate);
      previousData = filtered.filter(item => {
        const itemDate = new Date(item.order_date);
        return itemDate >= prevFilterDate && itemDate < filterDate;
      });
    }

    return { currentData, previousData };
  }, [salesData, selectedPrefecture, selectedCategory, selectedDateRange, searchTerm]);

  useEffect(() => {
    setFilteredData(currentData);
  }, [currentData]);

  const kpis = useMemo(() => calculateKPIs(currentData, previousData), [currentData, previousData]);
  const trends = useMemo(() => calculateTrends(currentData, 'monthly'), [currentData]);
  const dailyTrends = useMemo(() => calculateTrends(currentData, 'daily'), [currentData]);
  const anomalies = useMemo(() => {
    const monthlyTrends = trends.map(t => ({ period: t.period, value: t.sales }));
    return detectAnomalies(monthlyTrends);
  }, [trends]);
  const forecast = useMemo(() => {
    const monthlyTrends = trends.map(t => ({ period: t.period, value: t.sales }));
    return generateForecast(monthlyTrends);
  }, [trends]);
  const customerSegments = useMemo(() => segmentCustomers(currentData), [currentData]);
  const seasonality = useMemo(() => calculateSeasonality(currentData), [currentData]);

  // カテゴリ別売上データ
  const categoryData = filteredData.reduce((acc, item) => {
    const category = item.category;
    const price = parseInt(item.total_price || 0);
    acc[category] = (acc[category] || 0) + price;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([category, value]) => ({
    name: category,
    value: value
  }));

  // 都道府県別売上データ（上位10位）
  const prefectureData = filteredData.reduce((acc, item) => {
    const prefecture = item.prefecture;
    const price = parseInt(item.total_price || 0);
    acc[prefecture] = (acc[prefecture] || 0) + price;
    return acc;
  }, {});

  const prefectureChartData = Object.entries(prefectureData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([prefecture, value]) => ({
      name: prefecture,
      value: value
    }));

  // 年齢層別データ
  const ageData = filteredData.reduce((acc, item) => {
    const ageRange = item.age_range;
    const price = parseInt(item.total_price || 0);
    acc[ageRange] = (acc[ageRange] || 0) + price;
    return acc;
  }, {});

  const ageChartData = Object.entries(ageData).map(([age, value]) => ({
    name: age,
    value: value
  }));

  // 予測データとトレンドデータを結合
  const combinedForecastData = [
    ...trends.slice(-6).map(t => ({ period: t.period, sales: t.sales, forecast: null, type: 'actual' })),
    ...forecast.map(f => ({ period: `予測${f.period}`, sales: null, forecast: f.value, type: 'forecast' }))
  ];

  // 顧客セグメント分析データ
  const segmentData = Object.entries(
    customerSegments.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {})
  ).map(([segment, count]) => ({ name: segment, value: count }));

  // ユニークな値を取得
  const uniquePrefectures = [...new Set(salesData.map(item => item.prefecture))].sort();
  const uniqueCategories = [...new Set(salesData.map(item => item.category))].sort();

  const exportToCSV = () => {
    const csvContent = [
      Object.keys(filteredData[0] || {}).join(','),
      ...filteredData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `sales-data-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text animate-slide-up float-animation">売上データダッシュボード</h1>
          <p className="text-white/70 text-xl mb-2 animate-slide-up text-gradient">次世代セールス分析プラットフォーム</p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full glow-effect"></div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="modern-card p-8 text-center">
              <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-lg text-white/90 mb-2">データを読み込み中...</div>
              <div className="text-sm text-white/60">しばらくお待ちください</div>
            </div>
          </div>
        ) : (
          <>
            {/* データステータスパネル */}
            <div className="mb-8">
              <DataStatusPanel
                loading={loading}
                error={error}
                lastUpdated={lastUpdated}
                dataStats={dataStats}
                onRefresh={refreshData}
                isAutoRefreshEnabled={isAutoRefreshEnabled}
                onToggleAutoRefresh={toggleAutoRefresh}
              />
            </div>

            {/* 異常アラート */}
            {anomalies.length > 0 && (
              <div className="mb-8">
                <Card className="glass-card border-orange-500/20 bg-orange-500/5">
                  <CardHeader>
                    <CardTitle className="text-orange-300 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      異常検知アラート
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 mb-2">以下の期間で通常と異なる売上パターンが検出されました：</p>
                    <div className="flex flex-wrap gap-2">
                      {anomalies.map((anomaly, index) => (
                        <span key={index} className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm">
                          {anomaly.period}: ¥{anomaly.value.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 検索・フィルター・操作パネル */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-8">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="データを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-card border-white/10 text-white pl-10 h-12"
                  />
                </div>
              </div>
              
              <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
                <SelectTrigger className="modern-card border-white/10 text-white hover-lift h-12">
                  <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="都道府県" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全都道府県</SelectItem>
                  {uniquePrefectures.map(prefecture => (
                    <SelectItem key={prefecture} value={prefecture}>{prefecture}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="modern-card border-white/10 text-white hover-lift h-12">
                  <ShoppingCart className="h-4 w-4 mr-2 text-cyan-400" />
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全カテゴリ</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="modern-card border-white/10 text-white hover-lift h-12">
                  <Calendar className="h-4 w-4 mr-2 text-green-400" />
                  <SelectValue placeholder="期間" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全期間</SelectItem>
                  <SelectItem value="30days">過去30日</SelectItem>
                  <SelectItem value="90days">過去90日</SelectItem>
                  <SelectItem value="1year">過去1年</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={exportToCSV}
                className="modern-card bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white h-12"
              >
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </Button>
            </div>

            {/* KPI カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-slide-up">
              <Card className="metric-card hover-lift group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-white/90">総売上</CardTitle>
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{kpis.totalSales?.formatted}</div>
                  <div className="flex items-center text-sm">
                    <div className={`flex items-center mr-2 ${
                      kpis.totalSales?.growth >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {kpis.totalSales?.growth >= 0 ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingUp className="h-3 w-3 rotate-180 mr-1" />
                      }
                      <span>{Math.abs(kpis.totalSales?.growth || 0).toFixed(1)}%</span>
                    </div>
                    <span className="text-white/60">前期比</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card hover-lift group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-white/90">注文数</CardTitle>
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{kpis.totalOrders?.formatted}</div>
                  <div className="flex items-center text-sm">
                    <div className={`flex items-center mr-2 ${
                      kpis.totalOrders?.growth >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {kpis.totalOrders?.growth >= 0 ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingUp className="h-3 w-3 rotate-180 mr-1" />
                      }
                      <span>{Math.abs(kpis.totalOrders?.growth || 0).toFixed(1)}%</span>
                    </div>
                    <span className="text-white/60">前期比</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card hover-lift group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-white/90">ユニーク顧客数</CardTitle>
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{kpis.uniqueCustomers?.formatted}</div>
                  <div className="flex items-center text-sm">
                    <div className={`flex items-center mr-2 ${
                      kpis.uniqueCustomers?.growth >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {kpis.uniqueCustomers?.growth >= 0 ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingUp className="h-3 w-3 rotate-180 mr-1" />
                      }
                      <span>{Math.abs(kpis.uniqueCustomers?.growth || 0).toFixed(1)}%</span>
                    </div>
                    <span className="text-white/60">前期比</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card hover-lift group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-white/90">平均注文額</CardTitle>
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{kpis.avgOrderValue?.formatted}</div>
                  <div className="flex items-center text-sm">
                    <div className={`flex items-center mr-2 ${
                      kpis.avgOrderValue?.growth >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {kpis.avgOrderValue?.growth >= 0 ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingUp className="h-3 w-3 rotate-180 mr-1" />
                      }
                      <span>{Math.abs(kpis.avgOrderValue?.growth || 0).toFixed(1)}%</span>
                    </div>
                    <span className="text-white/60">前期比</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* チャート */}
            <Tabs defaultValue="overview" className="space-y-8 animate-slide-up">
              <TabsList className="grid w-full grid-cols-9 modern-card p-2 h-16">
                <TabsTrigger value="overview" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">概要</TabsTrigger>
                <TabsTrigger value="category" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">カテゴリ</TabsTrigger>
                <TabsTrigger value="geography" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">地域</TabsTrigger>
                <TabsTrigger value="trends" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">トレンド</TabsTrigger>
                <TabsTrigger value="forecast" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">予測</TabsTrigger>
                <TabsTrigger value="customers" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">顧客</TabsTrigger>
                <TabsTrigger value="seasonality" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">季節性</TabsTrigger>
                <TabsTrigger value="data" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">データ</TabsTrigger>
                <TabsTrigger value="reports" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 rounded-xl transition-all duration-300 h-12">レポート</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="modern-card hover-lift">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-white text-2xl font-bold">月別売上推移</CardTitle>
                      <CardDescription className="text-white/60 text-lg">時系列での売上変化</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="period" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" />
                          <Tooltip 
                            formatter={(value) => [`¥${value.toLocaleString()}`, '売上']}
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                          <Area type="monotone" dataKey="sales" stroke="#667eea" fill="url(#salesGradient)" strokeWidth={2} />
                          <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="modern-card hover-lift">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-white text-2xl font-bold">カテゴリ別売上</CardTitle>
                      <CardDescription className="text-white/60 text-lg">商品カテゴリごとの売上分布</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`¥${value.toLocaleString()}`, '売上']}
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="category">
                <Card className="modern-card hover-lift">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-white text-2xl font-bold">カテゴリ別詳細分析</CardTitle>
                    <CardDescription className="text-white/60 text-lg">商品カテゴリごとの詳細売上分析</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <ComposedChart data={categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="name" stroke="#ffffff60" />
                        <YAxis stroke="#ffffff60" />
                        <Tooltip 
                          formatter={(value) => [`¥${value.toLocaleString()}`, '売上']}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" fill="#667eea" radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="geography">
                <Card className="modern-card hover-lift">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-white text-2xl font-bold">都道府県別売上ランキング</CardTitle>
                    <CardDescription className="text-white/60 text-lg">地域ごとの売上分析</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <BarChart data={prefectureChartData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis type="number" stroke="#ffffff60" />
                        <YAxis dataKey="name" type="category" stroke="#ffffff60" width={100} />
                        <Tooltip 
                          formatter={(value) => [`¥${value.toLocaleString()}`, '売上']}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" fill="url(#prefectureGradient)" radius={[0, 4, 4, 0]} />
                        <defs>
                          <linearGradient id="prefectureGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f5576c" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends">
                <Card className="modern-card hover-lift">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-white text-2xl font-bold">詳細トレンド分析</CardTitle>
                    <CardDescription className="text-white/60 text-lg">売上、注文数、顧客数の複合分析</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <ComposedChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="period" stroke="#ffffff60" />
                        <YAxis yAxisId="left" stroke="#ffffff60" />
                        <YAxis yAxisId="right" orientation="right" stroke="#ffffff60" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'sales' ? `¥${value.toLocaleString()}` : value.toLocaleString(),
                            name === 'sales' ? '売上' : name === 'orders' ? '注文数' : '顧客数'
                          ]}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        />
                        <Bar yAxisId="left" dataKey="sales" fill="#667eea" name="sales" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f093fb" strokeWidth={3} name="orders" />
                        <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#4facfe" strokeWidth={3} name="customers" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forecast">
                <Card className="modern-card hover-lift">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-white text-2xl font-bold flex items-center gap-2">
                      <Zap className="h-6 w-6 text-yellow-400" />
                      売上予測分析
                    </CardTitle>
                    <CardDescription className="text-white/60 text-lg">AI予測による将来の売上トレンド</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <ComposedChart data={combinedForecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="period" stroke="#ffffff60" />
                        <YAxis stroke="#ffffff60" />
                        <Tooltip 
                          formatter={(value, name) => [
                            `¥${value?.toLocaleString() || 0}`,
                            name === 'sales' ? '実績売上' : '予測売上'
                          ]}
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        />
                        <Area type="monotone" dataKey="sales" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="forecast" stackId="1" stroke="#feca57" fill="#feca57" fillOpacity={0.4} strokeDasharray="5 5" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customers">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="modern-card hover-lift">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-white text-2xl font-bold">顧客セグメント分析</CardTitle>
                      <CardDescription className="text-white/60 text-lg">RFM分析による顧客分類</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={segmentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {segmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [value.toLocaleString(), '顧客数']}
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="modern-card hover-lift">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-white text-2xl font-bold">年齢層別売上</CardTitle>
                      <CardDescription className="text-white/60 text-lg">年齢グループごとの売上分析</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ageChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="name" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" />
                          <Tooltip 
                            formatter={(value) => [`¥${value.toLocaleString()}`, '売上']}
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                          <Bar dataKey="value" fill="url(#ageGradient)" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#38f9d7" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="seasonality">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="modern-card hover-lift">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-white text-2xl font-bold">月別季節性分析</CardTitle>
                      <CardDescription className="text-white/60 text-lg">月ごとの売上パターン</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={seasonality.monthly}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="name" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" />
                          <Tooltip 
                            formatter={(value) => [`¥${value.toLocaleString()}`, '売上']}
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                          <Bar dataKey="value" fill="url(#monthlyGradient)" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="modern-card hover-lift">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-white text-2xl font-bold">曜日別売上パターン</CardTitle>
                      <CardDescription className="text-white/60 text-lg">曜日ごとの売上傾向</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={seasonality.weekly}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="name" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" />
                          <Tooltip 
                            formatter={(value) => [`¥${value.toLocaleString()}`, '売上']}
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                          <Bar dataKey="value" fill="url(#weeklyGradient)" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#fa709a" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#fee140" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="data">
                <DataTable 
                  data={filteredData} 
                  title="売上詳細データ" 
                  description="フィルタリングされた売上データの詳細一覧"
                />
              </TabsContent>

              <TabsContent value="reports">
                <ReportGenerator 
                  data={filteredData}
                  kpis={kpis}
                  trends={trends}
                  anomalies={anomalies}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default App;