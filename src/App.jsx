import React, { useState, useEffect } from 'react';
import './App.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign, Calendar, MapPin } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function App() {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CSVデータを読み込む
    fetch('/sales_data.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim();
          });
          return row;
        });
        setSalesData(data);
        setFilteredData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('データの読み込みエラー:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = salesData;

    if (selectedPrefecture !== 'all') {
      filtered = filtered.filter(item => item.prefecture === selectedPrefecture);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedDateRange) {
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.order_date) >= filterDate);
    }

    setFilteredData(filtered);
  }, [salesData, selectedPrefecture, selectedCategory, selectedDateRange]);

  // 統計データの計算
  const totalSales = filteredData.reduce((sum, item) => sum + parseInt(item.total_price || 0), 0);
  const totalOrders = filteredData.length;
  const uniqueCustomers = new Set(filteredData.map(item => item.customer_id)).size;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

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

  // 月別売上推移データ
  const monthlyData = filteredData.reduce((acc, item) => {
    const date = new Date(item.order_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const price = parseInt(item.total_price || 0);
    acc[monthKey] = (acc[monthKey] || 0) + price;
    return acc;
  }, {});

  const monthlyChartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month: month,
      sales: value
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

  // ユニークな値を取得
  const uniquePrefectures = [...new Set(salesData.map(item => item.prefecture))].sort();
  const uniqueCategories = [...new Set(salesData.map(item => item.category))].sort();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">売上データダッシュボード</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">データを読み込み中...</div>
          </div>
        ) : (
          <>
            {/* フィルター */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
                <SelectTrigger>
                  <SelectValue placeholder="都道府県を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての都道府県</SelectItem>
                  {uniquePrefectures.map(prefecture => (
                    <SelectItem key={prefecture} value={prefecture}>{prefecture}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのカテゴリ</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全期間</SelectItem>
                  <SelectItem value="30days">過去30日</SelectItem>
                  <SelectItem value="90days">過去90日</SelectItem>
                  <SelectItem value="1year">過去1年</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* KPI カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総売上</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">¥{totalSales.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">注文数</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ユニーク顧客数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueCustomers.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均注文額</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">¥{Math.round(averageOrderValue).toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* チャート */}
            <Tabs defaultValue="category" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="category">カテゴリ別</TabsTrigger>
                <TabsTrigger value="prefecture">地域別</TabsTrigger>
                <TabsTrigger value="monthly">月別推移</TabsTrigger>
                <TabsTrigger value="age">年齢層別</TabsTrigger>
              </TabsList>

              <TabsContent value="category">
                <Card>
                  <CardHeader>
                    <CardTitle>カテゴリ別売上</CardTitle>
                    <CardDescription>商品カテゴリごとの売上分布</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '売上']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prefecture">
                <Card>
                  <CardHeader>
                    <CardTitle>都道府県別売上（上位10位）</CardTitle>
                    <CardDescription>地域ごとの売上ランキング</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={prefectureChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '売上']} />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly">
                <Card>
                  <CardHeader>
                    <CardTitle>月別売上推移</CardTitle>
                    <CardDescription>時系列での売上変化</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '売上']} />
                        <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="age">
                <Card>
                  <CardHeader>
                    <CardTitle>年齢層別売上</CardTitle>
                    <CardDescription>年齢グループごとの売上分析</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={ageChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '売上']} />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

