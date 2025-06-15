import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { FileText, Image, Download, Settings, Calendar, User, BarChart3, TrendingUp } from 'lucide-react';

const ReportGenerator = ({ data, kpis, trends, anomalies }) => {
  const [reportConfig, setReportConfig] = useState({
    title: '売上分析レポート',
    subtitle: '詳細な売上データ分析',
    author: '',
    includeKPIs: true,
    includeTrends: true,
    includeAnomalies: true,
    includeCharts: true,
    includeDataTable: false,
    format: 'pdf',
    dateRange: '全期間'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef();

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      if (reportConfig.format === 'pdf') {
        await generatePDFReport();
      } else {
        await generateImageReport();
      }
    } catch (error) {
      console.error('レポート生成エラー:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFReport = async () => {
    // HTML to PDF変換（実際の実装では、jsPDFやhtmltopdfなどのライブラリを使用）
    const reportHTML = generateReportHTML();
    
    // ブラウザの印刷機能を使用してPDF生成
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const generateImageReport = async () => {
    // HTML to Canvas変換（実際の実装では、html2canvasライブラリを使用）
    const reportHTML = generateReportHTML();
    
    // 簡易的な画像エクスポート（実装例）
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportConfig.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportHTML = () => {
    const currentDate = new Date().toLocaleDateString('ja-JP');
    
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportConfig.title}</title>
    <style>
        body {
            font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 1.2em;
            color: #666;
            margin-bottom: 10px;
        }
        .meta {
            font-size: 0.9em;
            color: #888;
        }
        .section {
            margin-bottom: 40px;
            break-inside: avoid;
        }
        .section-title {
            font-size: 1.8em;
            color: #333;
            border-left: 4px solid #667eea;
            padding-left: 15px;
            margin-bottom: 20px;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .kpi-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .kpi-label {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }
        .kpi-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .kpi-change {
            font-size: 0.9em;
            font-weight: bold;
        }
        .positive { color: #22c55e; }
        .negative { color: #ef4444; }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table th, .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .anomaly-alert {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .anomaly-title {
            color: #856404;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .chart-placeholder {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            font-style: italic;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }
        @media print {
            .no-print { display: none; }
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${reportConfig.title}</h1>
        <p class="subtitle">${reportConfig.subtitle}</p>
        <div class="meta">
            <p>生成日: ${currentDate}</p>
            ${reportConfig.author ? `<p>作成者: ${reportConfig.author}</p>` : ''}
            <p>対象期間: ${reportConfig.dateRange}</p>
        </div>
    </div>

    ${reportConfig.includeKPIs ? `
    <div class="section">
        <h2 class="section-title">主要指標（KPI）</h2>
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-label">総売上</div>
                <div class="kpi-value">${kpis.totalSales?.formatted || '¥0'}</div>
                <div class="kpi-change ${(kpis.totalSales?.growth || 0) >= 0 ? 'positive' : 'negative'}">
                    前期比 ${(kpis.totalSales?.growth || 0) >= 0 ? '+' : ''}${(kpis.totalSales?.growth || 0).toFixed(1)}%
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">注文数</div>
                <div class="kpi-value">${kpis.totalOrders?.formatted || '0'}</div>
                <div class="kpi-change ${(kpis.totalOrders?.growth || 0) >= 0 ? 'positive' : 'negative'}">
                    前期比 ${(kpis.totalOrders?.growth || 0) >= 0 ? '+' : ''}${(kpis.totalOrders?.growth || 0).toFixed(1)}%
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">ユニーク顧客数</div>
                <div class="kpi-value">${kpis.uniqueCustomers?.formatted || '0'}</div>
                <div class="kpi-change ${(kpis.uniqueCustomers?.growth || 0) >= 0 ? 'positive' : 'negative'}">
                    前期比 ${(kpis.uniqueCustomers?.growth || 0) >= 0 ? '+' : ''}${(kpis.uniqueCustomers?.growth || 0).toFixed(1)}%
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">平均注文額</div>
                <div class="kpi-value">${kpis.avgOrderValue?.formatted || '¥0'}</div>
                <div class="kpi-change ${(kpis.avgOrderValue?.growth || 0) >= 0 ? 'positive' : 'negative'}">
                    前期比 ${(kpis.avgOrderValue?.growth || 0) >= 0 ? '+' : ''}${(kpis.avgOrderValue?.growth || 0).toFixed(1)}%
                </div>
            </div>
        </div>
    </div>
    ` : ''}

    ${reportConfig.includeAnomalies && anomalies.length > 0 ? `
    <div class="section">
        <h2 class="section-title">異常検知アラート</h2>
        <div class="anomaly-alert">
            <div class="anomaly-title">⚠️ 異常なパターンが検出されました</div>
            <p>以下の期間で通常と異なる売上パターンが検出されています：</p>
            <ul>
                ${anomalies.map(anomaly => `
                    <li>${anomaly.period}: ¥${anomaly.value.toLocaleString()}</li>
                `).join('')}
            </ul>
        </div>
    </div>
    ` : ''}

    ${reportConfig.includeTrends ? `
    <div class="section">
        <h2 class="section-title">売上トレンド分析</h2>
        ${reportConfig.includeCharts ? `
            <div class="chart-placeholder">
                [チャート: 月別売上推移グラフ]
            </div>
        ` : ''}
        <table class="table">
            <thead>
                <tr>
                    <th>期間</th>
                    <th>売上</th>
                    <th>注文数</th>
                    <th>顧客数</th>
                    <th>平均注文額</th>
                </tr>
            </thead>
            <tbody>
                ${trends.slice(-6).map(trend => `
                    <tr>
                        <td>${trend.period}</td>
                        <td>¥${trend.sales.toLocaleString()}</td>
                        <td>${trend.orders.toLocaleString()}</td>
                        <td>${trend.customers.toLocaleString()}</td>
                        <td>¥${Math.round(trend.avgOrderValue).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${reportConfig.includeDataTable ? `
    <div class="section">
        <h2 class="section-title">詳細データ</h2>
        <p>データ件数: ${data.length.toLocaleString()}件</p>
        <table class="table">
            <thead>
                <tr>
                    ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.slice(0, 20).map(row => `
                    <tr>
                        ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                    </tr>
                `).join('')}
                ${data.length > 20 ? `
                    <tr>
                        <td colspan="${Object.keys(data[0] || {}).length}" style="text-align: center; font-style: italic; color: #666;">
                            ... および他${(data.length - 20).toLocaleString()}件
                        </td>
                    </tr>
                ` : ''}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="footer">
        <p>このレポートは売上データダッシュボードにより自動生成されました。</p>
        <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
    </div>
</body>
</html>
    `;
  };

  return (
    <Card className="modern-card hover-lift">
      <CardHeader className="pb-6">
        <CardTitle className="text-white text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-400" />
          レポート生成
        </CardTitle>
        <CardDescription className="text-white/60 text-lg">
          カスタマイズ可能な分析レポートを生成
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 基本設定 */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            基本設定
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/80 text-sm">レポートタイトル</Label>
              <Input
                value={reportConfig.title}
                onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                className="modern-card border-white/10 text-white mt-1"
              />
            </div>
            
            <div>
              <Label className="text-white/80 text-sm">作成者</Label>
              <Input
                value={reportConfig.author}
                onChange={(e) => setReportConfig(prev => ({ ...prev, author: e.target.value }))}
                placeholder="任意"
                className="modern-card border-white/10 text-white mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-white/80 text-sm">サブタイトル</Label>
            <Textarea
              value={reportConfig.subtitle}
              onChange={(e) => setReportConfig(prev => ({ ...prev, subtitle: e.target.value }))}
              className="modern-card border-white/10 text-white mt-1 h-20"
            />
          </div>
        </div>

        {/* 出力形式 */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">出力形式</h3>
          <Select 
            value={reportConfig.format} 
            onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}
          >
            <SelectTrigger className="modern-card border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF（印刷用）</SelectItem>
              <SelectItem value="image">HTML（ウェブ用）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 含める内容 */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">含める内容</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <Label className="text-white/80">主要指標（KPI）</Label>
              </div>
              <Switch
                checked={reportConfig.includeKPIs}
                onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeKPIs: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <Label className="text-white/80">トレンド分析</Label>
              </div>
              <Switch
                checked={reportConfig.includeTrends}
                onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeTrends: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <span className="text-orange-400">⚠️</span>
                <Label className="text-white/80">異常検知アラート</Label>
              </div>
              <Switch
                checked={reportConfig.includeAnomalies}
                onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeAnomalies: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-purple-400" />
                <Label className="text-white/80">チャート</Label>
              </div>
              <Switch
                checked={reportConfig.includeCharts}
                onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeCharts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 md:col-span-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <Label className="text-white/80">詳細データテーブル（最初の20行）</Label>
              </div>
              <Switch
                checked={reportConfig.includeDataTable}
                onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeDataTable: checked }))}
              />
            </div>
          </div>
        </div>

        {/* 生成統計 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <div className="text-2xl font-bold text-white">{data.length.toLocaleString()}</div>
            <div className="text-white/60 text-sm">データ件数</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20">
            <div className="text-2xl font-bold text-white">{trends.length}</div>
            <div className="text-white/60 text-sm">期間数</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20">
            <div className="text-2xl font-bold text-white">{anomalies.length}</div>
            <div className="text-white/60 text-sm">異常検知</div>
          </div>
        </div>

        {/* 生成ボタン */}
        <Button
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              レポート生成中...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              レポートを生成
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;