import React, { useState, useEffect, useMemo } from "react";
import "./FinancialSummary.css";
import axios from "axios";
import config from "../../config";
import financialReportConfig from "./financialReportConfig";
import Spinner from "react-bootstrap/Spinner";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialSummary = ({ onNavigateToReports }) => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [allData, setAllData] = useState([]);
  const [accountFilter, setAccountFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(false);
  const [accountOptions, setAccountOptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = `${config.MernBaseURL}/financialData/getAll`;
      const response = await axios.get(apiUrl, { headers: { Accept: 'application/json' } });
      const payload = response?.data;
      const all = Array.isArray(payload) ? payload : (payload?.data || []);
      
      setAllData(all);
      
      // Get unique accounts from data
      const derivedAccounts = Array.from(
        new Set([
          ...all.map(r => r.fromAccount),
          ...all.map(r => r.toAccount)
        ].filter(Boolean))
      ).sort();
      
      const cfgAccounts = financialReportConfig?.accountNames || [];
      setAccountOptions(cfgAccounts.length ? cfgAccounts : derivedAccounts);
    } catch (e) {
      console.error('Failed to load financial data', e);
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = allData;
    
    // Filter by account (either fromAccount or toAccount)
    if (accountFilter) {
      filtered = filtered.filter(r => 
        r.fromAccount === accountFilter || r.toAccount === accountFilter
      );
    }
    
    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(r => r.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => r.date <= endDate);
    }
    
    return filtered;
  }, [allData, accountFilter, startDate, endDate]);

  const metrics = useMemo(() => {
    // Exclude CD (loan) transactions from balance calculations
    const totalCredit = filteredData.reduce((acc, r) => 
      acc + (r.cd === 'C' ? Number(r.amount || 0) : 0), 0
    );
    const totalDebit = filteredData.reduce((acc, r) => 
      acc + (r.cd === 'D' ? Number(r.amount || 0) : 0), 0
    );
    const totalCD = filteredData.reduce((acc, r) => 
      acc + (r.cd === 'CD' ? Number(r.amount || 0) : 0), 0
    );
    const balance = totalCredit - totalDebit;
    
    // Calculate transaction counts (CD not affecting totals)
    const creditCount = filteredData.filter(r => r.cd === 'C').length;
    const debitCount = filteredData.filter(r => r.cd === 'D').length;
    const cdCount = filteredData.filter(r => r.cd === 'CD').length;
    const totalTransactions = filteredData.length;
    
    // Calculate averages
    const avgCredit = creditCount > 0 ? totalCredit / creditCount : 0;
    const avgDebit = debitCount > 0 ? totalDebit / debitCount : 0;
    const avgCD = cdCount > 0 ? totalCD / cdCount : 0;
    
    return {
      totalCredit,
      totalDebit,
      totalCD,
      balance,
      creditCount,
      debitCount,
      cdCount,
      totalTransactions,
      avgCredit,
      avgDebit,
      avgCD
    };
  }, [filteredData]);

  // Prepare chart data
  const pieChartData = useMemo(() => [
    { name: 'Credits', value: metrics.totalCredit, color: '#22c55e' },
    { name: 'Debits', value: metrics.totalDebit, color: '#ef4444' },
    { name: 'Loan/Self', value: metrics.totalCD, color: '#3b82f6' }
  ].filter(item => item.value > 0), [metrics]);

  const barChartData = useMemo(() => [
    { name: 'Credit', amount: metrics.totalCredit, count: metrics.creditCount, fill: '#22c55e' },
    { name: 'Debit', amount: metrics.totalDebit, count: metrics.debitCount, fill: '#ef4444' },
    { name: 'Loan/Self', amount: metrics.totalCD, count: metrics.cdCount, fill: '#3b82f6' }
  ], [metrics]);

  // Monthly trend data
  const trendData = useMemo(() => {
    // Group transactions by month
    const monthlyData = {};
    filteredData.forEach(item => {
      if (!item.date) return;
      const month = item.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, credit: 0, debit: 0, loan: 0 };
      }
      const amount = Number(item.amount || 0);
      if (item.cd === 'C') monthlyData[month].credit += amount;
      else if (item.cd === 'D') monthlyData[month].debit += amount;
      else if (item.cd === 'CD') monthlyData[month].loan += amount;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [filteredData]);

  const clearFilters = () => {
    setAccountFilter("");
    setStartDate("");
    setEndDate("");
  };

  const formatAmount = (val) => {
    if (!val && val !== 0) return "₹0";
    try {
      return `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    } catch {
      return `₹${val}`;
    }
  };

  const handleCardClick = (cdType) => {
    if (onNavigateToReports) {
      const filters = {
        cd: cdType,
        fromAccount: accountFilter,
        toAccount: accountFilter,
        from: startDate,
        to: endDate
      };
      onNavigateToReports(filters);
    }
  };

  return (
    <div className="financial-summary-container">
      {/* Header with filters */}
      <div className="fs-header">
        <div className="fs-header-content">
          <div className="fs-title-section">
            <h2 className="fs-title">Financial Summary Dashboard</h2>
            <p className="fs-subtitle">
              {accountFilter ? `Account: ${accountFilter}` : "All Accounts"} 
              {startDate || endDate ? ` | ${startDate || 'All'} to ${endDate || 'All'}` : ' | All Dates'}
            </p>
          </div>
          
          <div className="fs-actions">
            <button 
              type="button" 
              className="btn btn-outline-primary icon-btn" 
              onClick={clearFilters}
              title="Clear Filters"
            >
              <i className="bi bi-eraser"></i>
            </button>
            <button 
              type="button" 
              className="btn btn-outline-success icon-btn" 
              onClick={fetchData}
              title="Refresh Data"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        <div className="fs-filters">
          <div className="filter-item">
            <label>Account</label>
            <select 
              className="fs-select" 
              value={accountFilter} 
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              <option value="">All Accounts</option>
              {accountOptions.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>From Date</label>
            <input 
              type="date" 
              className="fs-date-input" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>To Date</label>
            <input 
              type="date" 
              className="fs-date-input" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Metrics Cards */}
      <div className="fs-metrics-grid">
        {/* Total Credits Card */}
        <div 
          className="fs-metric-card credit-card clickable" 
          onClick={() => handleCardClick('C')}
          title="Click to view credit transactions"
        >
          <div className="fs-card-header">
            <div className="fs-card-icon">
              <i className="bi bi-arrow-down-circle"></i>
            </div>
            <div className="fs-card-badge">
              <span>{metrics.creditCount} transactions</span>
            </div>
          </div>
          <div className="fs-card-body">
            <h3 className="fs-card-title">Total Credits</h3>
            <p className="fs-card-amount">{formatAmount(metrics.totalCredit)}</p>
            <div className="fs-card-detail">
              <i className="bi bi-graph-up-arrow"></i>
              <span>Avg: {formatAmount(metrics.avgCredit)}</span>
            </div>
          </div>
        </div>

        {/* Total Debits Card */}
        <div 
          className="fs-metric-card debit-card clickable" 
          onClick={() => handleCardClick('D')}
          title="Click to view debit transactions"
        >
          <div className="fs-card-header">
            <div className="fs-card-icon">
              <i className="bi bi-arrow-up-circle"></i>
            </div>
            <div className="fs-card-badge">
              <span>{metrics.debitCount} transactions</span>
            </div>
          </div>
          <div className="fs-card-body">
            <h3 className="fs-card-title">Total Debits</h3>
            <p className="fs-card-amount">{formatAmount(metrics.totalDebit)}</p>
            <div className="fs-card-detail">
              <i className="bi bi-graph-down-arrow"></i>
              <span>Avg: {formatAmount(metrics.avgDebit)}</span>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div 
          className={`fs-metric-card balance-card ${metrics.balance >= 0 ? 'positive' : 'negative'} clickable`}
          onClick={() => handleCardClick('')}
          title="Click to view all transactions"
        >
          <div className="fs-card-header">
            <div className="fs-card-icon">
              <i className="bi bi-wallet2"></i>
            </div>
            <div className="fs-card-badge">
              <span>{metrics.totalTransactions} total</span>
            </div>
          </div>
          <div className="fs-card-body">
            <h3 className="fs-card-title">Net Balance</h3>
            <p className="fs-card-amount">{formatAmount(metrics.balance)}</p>
            <div className="fs-card-detail">
              <i className={`bi ${metrics.balance >= 0 ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
              <span>{metrics.balance >= 0 ? 'Surplus' : 'Deficit'}</span>
            </div>
          </div>
        </div>

        {/* Loan & Self Transactions Card */}
        <div 
          className="fs-metric-card loan-card clickable" 
          onClick={() => handleCardClick('CD')}
          title="Click to view loan/self transactions"
        >
          <div className="fs-card-header">
            <div className="fs-card-icon">
              <i className="bi bi-arrow-left-right"></i>
            </div>
            <div className="fs-card-badge">
              <span>{metrics.cdCount} transactions</span>
            </div>
          </div>
          <div className="fs-card-body">
            <h3 className="fs-card-title">Loan & Self</h3>
            <p className="fs-card-amount">{formatAmount(metrics.totalCD)}</p>
            <div className="fs-card-detail">
              <i className="bi bi-currency-exchange"></i>
              <span>Avg: {formatAmount(metrics.avgCD)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="fs-charts-section">
        {/* Pie Chart - Distribution */}
        <div className="fs-chart-card">
          <div className="fs-chart-header">
            <h3 className="fs-chart-title">
              <i className="bi bi-pie-chart"></i>
              Transaction Distribution
            </h3>
            <p className="fs-chart-subtitle">by Amount</p>
          </div>
          <div className="fs-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatAmount(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Comparison */}
        <div className="fs-chart-card">
          <div className="fs-chart-header">
            <h3 className="fs-chart-title">
              <i className="bi bi-bar-chart"></i>
              Transaction Comparison
            </h3>
            <p className="fs-chart-subtitle">Amount & Count</p>
          </div>
          <div className="fs-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? formatAmount(value) : value,
                    name === 'amount' ? 'Amount' : 'Transactions'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Trends */}
        <div className="fs-chart-card fs-chart-wide">
          <div className="fs-chart-header">
            <h3 className="fs-chart-title">
              <i className="bi bi-graph-up"></i>
              Monthly Trend (Last 6 Months)
            </h3>
            <p className="fs-chart-subtitle">Transaction Flow Over Time</p>
          </div>
          <div className="fs-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => formatAmount(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="credit" stroke="#22c55e" strokeWidth={2} name="Credits" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="debit" stroke="#ef4444" strokeWidth={2} name="Debits" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="loan" stroke="#3b82f6" strokeWidth={2} name="Loan/Self" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="fs-stats-grid">
        <div className="fs-stat-box">
          <div className="fs-stat-icon credit-bg">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="fs-stat-content">
            <p className="fs-stat-label">Credit Transactions</p>
            <h4 className="fs-stat-value">{metrics.creditCount}</h4>
          </div>
        </div>

        <div className="fs-stat-box">
          <div className="fs-stat-icon debit-bg">
            <i className="bi bi-credit-card"></i>
          </div>
          <div className="fs-stat-content">
            <p className="fs-stat-label">Debit Transactions</p>
            <h4 className="fs-stat-value">{metrics.debitCount}</h4>
          </div>
        </div>

        <div className="fs-stat-box">
          <div className="fs-stat-icon balance-bg">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="fs-stat-content">
            <p className="fs-stat-label">Total Transactions</p>
            <h4 className="fs-stat-value">{metrics.totalTransactions}</h4>
          </div>
        </div>

        <div className="fs-stat-box">
          <div className="fs-stat-icon loan-bg">
            <i className="bi bi-arrow-left-right"></i>
          </div>
          <div className="fs-stat-content">
            <p className="fs-stat-label">Loan/Self Transactions</p>
            <h4 className="fs-stat-value">{metrics.cdCount}</h4>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading summary...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSummary;
