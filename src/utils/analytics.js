import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, eachMonthOfInterval, eachDayOfInterval } from 'date-fns';

export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const detectAnomalies = (data, threshold = 2) => {
  if (data.length < 3) return [];
  
  const values = data.map(d => d.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return data.filter(d => Math.abs(d.value - mean) > threshold * stdDev);
};

export const generateForecast = (historicalData, periods = 6) => {
  if (historicalData.length < 3) return [];
  
  const values = historicalData.map(d => d.value);
  const n = values.length;
  
  // Simple linear regression for trend
  const xSum = n * (n - 1) / 2;
  const ySum = values.reduce((sum, val) => sum + val, 0);
  const xySum = values.reduce((sum, val, i) => sum + val * i, 0);
  const x2Sum = n * (n - 1) * (2 * n - 1) / 6;
  
  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;
  
  const forecast = [];
  for (let i = 0; i < periods; i++) {
    const futureValue = slope * (n + i) + intercept;
    forecast.push({
      period: n + i + 1,
      value: Math.max(0, futureValue),
      confidence: Math.max(0.3, 0.9 - i * 0.1)
    });
  }
  
  return forecast;
};

export const calculateTrends = (data, period = 'monthly') => {
  if (!data.length) return [];
  
  const groupedData = {};
  
  data.forEach(item => {
    const date = new Date(item.order_date);
    let key;
    
    switch (period) {
      case 'daily':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = format(weekStart, 'yyyy-MM-dd');
        break;
      case 'monthly':
        key = format(date, 'yyyy-MM');
        break;
      case 'yearly':
        key = format(date, 'yyyy');
        break;
      default:
        key = format(date, 'yyyy-MM');
    }
    
    if (!groupedData[key]) {
      groupedData[key] = { sales: 0, orders: 0, customers: new Set() };
    }
    
    groupedData[key].sales += parseFloat(item.total_price || 0);
    groupedData[key].orders += 1;
    groupedData[key].customers.add(item.customer_id);
  });
  
  return Object.entries(groupedData)
    .map(([period, data]) => ({
      period,
      sales: data.sales,
      orders: data.orders,
      customers: data.customers.size,
      avgOrderValue: data.orders > 0 ? data.sales / data.orders : 0
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
};

export const calculateKPIs = (data, previousData = []) => {
  const totalSales = data.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  const totalOrders = data.length;
  const uniqueCustomers = new Set(data.map(item => item.customer_id)).size;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  const prevTotalSales = previousData.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  const prevTotalOrders = previousData.length;
  const prevUniqueCustomers = new Set(previousData.map(item => item.customer_id)).size;
  const prevAvgOrderValue = prevTotalOrders > 0 ? prevTotalSales / prevTotalOrders : 0;
  
  return {
    totalSales: {
      value: totalSales,
      growth: calculateGrowthRate(totalSales, prevTotalSales),
      formatted: `¥${totalSales.toLocaleString()}`
    },
    totalOrders: {
      value: totalOrders,
      growth: calculateGrowthRate(totalOrders, prevTotalOrders),
      formatted: totalOrders.toLocaleString()
    },
    uniqueCustomers: {
      value: uniqueCustomers,
      growth: calculateGrowthRate(uniqueCustomers, prevUniqueCustomers),
      formatted: uniqueCustomers.toLocaleString()
    },
    avgOrderValue: {
      value: avgOrderValue,
      growth: calculateGrowthRate(avgOrderValue, prevAvgOrderValue),
      formatted: `¥${Math.round(avgOrderValue).toLocaleString()}`
    }
  };
};

export const segmentCustomers = (data) => {
  const customerStats = {};
  
  data.forEach(item => {
    const customerId = item.customer_id;
    if (!customerStats[customerId]) {
      customerStats[customerId] = {
        totalSpent: 0,
        orderCount: 0,
        lastOrder: new Date(item.order_date),
        firstOrder: new Date(item.order_date)
      };
    }
    
    const stats = customerStats[customerId];
    stats.totalSpent += parseFloat(item.total_price || 0);
    stats.orderCount += 1;
    
    const orderDate = new Date(item.order_date);
    if (orderDate > stats.lastOrder) stats.lastOrder = orderDate;
    if (orderDate < stats.firstOrder) stats.firstOrder = orderDate;
  });
  
  const customers = Object.entries(customerStats).map(([id, stats]) => ({
    id,
    ...stats,
    avgOrderValue: stats.orderCount > 0 ? stats.totalSpent / stats.orderCount : 0,
    daysSinceLastOrder: Math.floor((new Date() - stats.lastOrder) / (1000 * 60 * 60 * 24))
  }));
  
  // RFM分析のための閾値計算
  const totalSpentValues = customers.map(c => c.totalSpent).sort((a, b) => b - a);
  const orderCountValues = customers.map(c => c.orderCount).sort((a, b) => b - a);
  const recencyValues = customers.map(c => c.daysSinceLastOrder).sort((a, b) => a - b);
  
  const monetaryThreshold = totalSpentValues[Math.floor(totalSpentValues.length * 0.33)];
  const frequencyThreshold = orderCountValues[Math.floor(orderCountValues.length * 0.33)];
  const recencyThreshold = recencyValues[Math.floor(recencyValues.length * 0.33)];
  
  return customers.map(customer => ({
    ...customer,
    segment: getCustomerSegment(customer, monetaryThreshold, frequencyThreshold, recencyThreshold)
  }));
};

const getCustomerSegment = (customer, monetaryThreshold, frequencyThreshold, recencyThreshold) => {
  const isHighValue = customer.totalSpent >= monetaryThreshold;
  const isFrequent = customer.orderCount >= frequencyThreshold;
  const isRecent = customer.daysSinceLastOrder <= recencyThreshold;
  
  if (isHighValue && isFrequent && isRecent) return 'Champions';
  if (isHighValue && isFrequent && !isRecent) return 'Loyal Customers';
  if (isHighValue && !isFrequent && isRecent) return 'Potential Loyalists';
  if (isHighValue && !isFrequent && !isRecent) return 'At Risk';
  if (!isHighValue && isFrequent && isRecent) return 'New Customers';
  if (!isHighValue && isFrequent && !isRecent) return 'Promising';
  if (!isHighValue && !isFrequent && isRecent) return 'Need Attention';
  return 'Cannot Lose Them';
};

export const calculateSeasonality = (data) => {
  const monthlyData = {};
  const weeklyData = {};
  
  data.forEach(item => {
    const date = new Date(item.order_date);
    const month = date.getMonth();
    const dayOfWeek = date.getDay();
    const sales = parseFloat(item.total_price || 0);
    
    monthlyData[month] = (monthlyData[month] || 0) + sales;
    weeklyData[dayOfWeek] = (weeklyData[dayOfWeek] || 0) + sales;
  });
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return {
    monthly: Object.entries(monthlyData).map(([month, sales]) => ({
      name: monthNames[parseInt(month)],
      value: sales
    })),
    weekly: Object.entries(weeklyData).map(([day, sales]) => ({
      name: dayNames[parseInt(day)],
      value: sales
    }))
  };
};