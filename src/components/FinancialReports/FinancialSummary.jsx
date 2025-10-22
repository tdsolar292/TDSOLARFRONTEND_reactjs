import React, { useState, useEffect, useMemo } from "react";
import "./FinancialSummary.css";
import axios from "axios";
import config from "../../config";
import financialReportConfig from "./financialReportConfig";
import Spinner from "react-bootstrap/Spinner";

const FinancialSummary = () => {
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
        <div className="fs-metric-card credit-card">
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
        <div className="fs-metric-card debit-card">
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
        <div className={`fs-metric-card balance-card ${metrics.balance >= 0 ? 'positive' : 'negative'}`}>
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
        <div className="fs-metric-card loan-card">
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
