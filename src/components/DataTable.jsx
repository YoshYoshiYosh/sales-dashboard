import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Download, Eye, Search } from 'lucide-react';

const DataTable = ({ data, title, description }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterConfig, setFilterConfig] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      sortable: true,
      filterable: true
    }));
  }, [data]);

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    
    // グローバルフィルター適用
    if (globalFilter) {
      sortableData = sortableData.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(globalFilter.toLowerCase())
        )
      );
    }

    // 列フィルター適用
    Object.entries(filterConfig).forEach(([key, value]) => {
      if (value) {
        sortableData = sortableData.filter(item =>
          item[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // ソート適用
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // 数値かどうかを判定
        const aIsNumber = !isNaN(parseFloat(aValue)) && isFinite(aValue);
        const bIsNumber = !isNaN(parseFloat(bValue)) && isFinite(bValue);

        if (aIsNumber && bIsNumber) {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        } else {
          aValue = aValue?.toString().toLowerCase() || '';
          bValue = bValue?.toString().toLowerCase() || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableData;
  }, [data, sortConfig, filterConfig, globalFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleColumnFilter = (key, value) => {
    setFilterConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-white/40" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-400" /> : 
      <ArrowDown className="h-4 w-4 text-blue-400" />;
  };

  const formatCellValue = (value, key) => {
    if (key.includes('price') || key.includes('total')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `¥${numValue.toLocaleString()}`;
      }
    }
    if (key.includes('date')) {
      try {
        return new Date(value).toLocaleDateString('ja-JP');
      } catch {
        return value;
      }
    }
    return value;
  };

  const exportToCSV = () => {
    const csvContent = [
      columns.map(col => col.label).join(','),
      ...sortedData.map(row => 
        columns.map(col => row[col.key]).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="modern-card hover-lift">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="text-white/60 text-lg">{description}</CardDescription>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={exportToCSV}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
          </div>
        </div>
        
        {/* グローバル検索 */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
            <Input
              placeholder="全体を検索..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="modern-card border-white/10 text-white pl-10"
            />
          </div>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="modern-card border-white/10 text-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10行</SelectItem>
              <SelectItem value="20">20行</SelectItem>
              <SelectItem value="50">50行</SelectItem>
              <SelectItem value="100">100行</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* データ統計 */}
        <div className="flex gap-4 mb-6">
          <Badge className="bg-blue-500/20 text-blue-300">
            総件数: {data.length.toLocaleString()}
          </Badge>
          <Badge className="bg-green-500/20 text-green-300">
            表示中: {sortedData.length.toLocaleString()}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-300">
            ページ: {currentPage} / {totalPages}
          </Badge>
        </div>

        {/* テーブル */}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  {columns.map((column) => (
                    <TableHead key={column.key} className="text-white/90 font-semibold">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/90 hover:text-white hover:bg-white/10 p-0"
                            onClick={() => handleSort(column.key)}
                          >
                            {column.label}
                            {getSortIcon(column.key)}
                          </Button>
                        </div>
                        <Input
                          placeholder={`${column.label}で検索...`}
                          value={filterConfig[column.key] || ''}
                          onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                          className="h-8 text-xs bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow 
                    key={index} 
                    className="border-white/10 hover:bg-white/5 transition-colors"
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className="text-white/80">
                        {formatCellValue(row[column.key], column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ページネーション */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-white/60 text-sm">
            {((currentPage - 1) * pageSize + 1).toLocaleString()} - {Math.min(currentPage * pageSize, sortedData.length).toLocaleString()} 件 / 全 {sortedData.length.toLocaleString()} 件
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-white/20 text-white hover:bg-white/10"
            >
              前へ
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-purple-500 to-cyan-500"
                        : "border-white/20 text-white hover:bg-white/10"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-white/20 text-white hover:bg-white/10"
            >
              次へ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;