import { useState, useEffect, useCallback, useMemo } from 'react';

export const useDataProcessor = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataStats, setDataStats] = useState({});

  const validateDataRow = useCallback((row) => {
    const errors = [];
    
    if (!row.customer_id) errors.push('Customer ID is missing');
    if (!row.order_date || isNaN(Date.parse(row.order_date))) errors.push('Invalid order date');
    if (!row.total_price || isNaN(parseFloat(row.total_price))) errors.push('Invalid total price');
    if (!row.category) errors.push('Category is missing');
    if (!row.prefecture) errors.push('Prefecture is missing');
    
    return errors;
  }, []);

  const processRawData = useCallback((csvText) => {
    try {
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const validRows = [];
      const invalidRows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',');
        const row = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        
        const validationErrors = validateDataRow(row);
        
        if (validationErrors.length === 0) {
          row.total_price = parseFloat(row.total_price);
          row.order_date = new Date(row.order_date);
          validRows.push(row);
        } else {
          invalidRows.push({ row, errors: validationErrors, lineNumber: i + 1 });
        }
      }
      
      const stats = {
        totalRows: lines.length - 1,
        validRows: validRows.length,
        invalidRows: invalidRows.length,
        validationRate: ((validRows.length / (lines.length - 1)) * 100).toFixed(2)
      };
      
      setDataStats(stats);
      
      if (invalidRows.length > 0) {
        console.warn(`Data validation: ${invalidRows.length} invalid rows found`, invalidRows);
      }
      
      return validRows;
    } catch (err) {
      throw new Error(`Data processing failed: ${err.message}`);
    }
  }, [validateDataRow]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/sales_data.csv');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      const processedData = processRawData(csvText);
      
      setSalesData(processedData);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err.message);
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [processRawData]);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dataProcessorAPI = useMemo(() => ({
    salesData,
    loading,
    error,
    lastUpdated,
    dataStats,
    refreshData,
    retryLoad: loadData
  }), [salesData, loading, error, lastUpdated, dataStats, refreshData, loadData]);

  return dataProcessorAPI;
};

export const useAutoRefresh = (refreshCallback, intervalMs = 300000) => { // 5分間隔
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;
    
    const interval = setInterval(() => {
      refreshCallback();
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled, refreshCallback, intervalMs]);
  
  return {
    isAutoRefreshEnabled,
    setIsAutoRefreshEnabled,
    toggleAutoRefresh: () => setIsAutoRefreshEnabled(prev => !prev)
  };
};