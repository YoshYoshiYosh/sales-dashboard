import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { RefreshCw, Database, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const DataStatusPanel = ({ 
  loading, 
  error, 
  lastUpdated, 
  dataStats, 
  onRefresh, 
  isAutoRefreshEnabled,
  onToggleAutoRefresh 
}) => {
  const formatLastUpdated = (date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (error) return <AlertTriangle className="h-4 w-4 text-red-400" />;
    return <CheckCircle className="h-4 w-4 text-green-400" />;
  };

  const getStatusText = () => {
    if (loading) return 'データ読み込み中...';
    if (error) return 'エラーが発生しました';
    return 'データ正常';
  };

  const getStatusColor = () => {
    if (loading) return 'bg-blue-500/20 text-blue-300';
    if (error) return 'bg-red-500/20 text-red-300';
    return 'bg-green-500/20 text-green-300';
  };

  return (
    <Card className="glass-card border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          データステータス
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ステータス表示 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-white text-sm">{getStatusText()}</span>
          </div>
          <Badge className={getStatusColor()}>
            {loading ? 'Loading' : error ? 'Error' : 'Active'}
          </Badge>
        </div>

        {/* エラー詳細 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 border-red-500/20 text-red-300 hover:bg-red-500/10"
              onClick={onRefresh}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              再試行
            </Button>
          </div>
        )}

        {/* データ統計 */}
        {dataStats && Object.keys(dataStats).length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-xs">総データ数</p>
              <p className="text-white font-semibold">{dataStats.totalRows?.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-xs">有効データ率</p>
              <p className="text-white font-semibold">{dataStats.validationRate}%</p>
            </div>
          </div>
        )}

        {/* 最終更新時刻 */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock className="h-4 w-4" />
          <span>最終更新: {formatLastUpdated(lastUpdated)}</span>
        </div>

        {/* コントロール */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isAutoRefreshEnabled}
              onCheckedChange={onToggleAutoRefresh}
              className="data-[state=checked]:bg-blue-500"
            />
            <span className="text-white/80 text-sm">自動更新</span>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataStatusPanel;