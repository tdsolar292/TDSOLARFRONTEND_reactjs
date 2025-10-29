import React, { useState, useEffect, useMemo } from "react";
import "./FinancialReports.css";
import Spinner from "react-bootstrap/Spinner";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import config from "../../config";
import axios from "axios";
import AddFinancialDataModal from "./AddFinancialDataModal";
import exportFinancialDataToExcel from "./FinancialDataExcel";
import { useAuth } from "../../auth";
import financialReportConfig from "./financialReportConfig";
import FinancialSummary from "./FinancialSummary";

const cardDataTemplate = [
  { value: 0, label: "Credit", icon: "bi-graph-up", color: "var(--success)" },
  { value: 0, label: "Debit", icon: "bi-graph-down", color: "var(--danger)" },
  { value: 0, label: "Net Balance", icon: "bi-cash-coin", color: "var(--primary)" }
];

const tableDisplayHeaders = ["Code", "Date", "From Account", "To Account", "C/D", "Main Header", "Sub Header", "Amount", "Actions"];

// Format date from YYYY-MM-DD to DD-MM-YYYY
const formatDate = (d) => {
  if (!d || typeof d !== 'string') return d;
  const parts = d.split('-');
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d;
};

const FinancialReports = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fromAccountFilter, setFromAccountFilter] = useState("");
  const [toAccountFilter, setToAccountFilter] = useState("");
  const [cdFilter, setCdFilter] = useState("");
  const [mainHeaderFilter, setMainHeaderFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [mainAccountFilter, setMainAccountFilter] = useState([]);
  const [verifiedFilter, setVerifiedFilter] = useState("");

  const [cardData, setCardData] = useState(cardDataTemplate);
  const [reports, setReports] = useState([]);
  const [allData, setAllData] = useState([]);
  const [accountOptions, setAccountOptions] = useState((financialReportConfig?.accountNames || []));
  const [mainHeaderOptions, setMainHeaderOptions] = useState([]);
  const [codeOptions, setCodeOptions] = useState([]);
  const [summary, setSummary] = useState({ credit: 0, debit: 0, net: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [section, setSection] = useState('creditDebit');
  const [showFilters, setShowFilters] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null });
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewDetails, setViewDetails] = useState({ show: false, item: null });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [showMainAccountDropdown, setShowMainAccountDropdown] = useState(false);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [preventPageReset, setPreventPageReset] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  const sections = [
    { key: 'creditDebit', label: 'Credit & Debit Acc' },
    { key: 'loanPayment', label: 'Loan & Payment Acc' },
    { key: 'settlements', label: 'Settlements Acc' },
    { key: 'pendings', label: 'Pendings' },
    { key: 'summary', label: 'Summary' },
  ];

  const filters = useMemo(() => ({ 
    code: codeFilter, 
    fromAccount: fromAccountFilter, 
    toAccount: toAccountFilter, 
    cd: cdFilter, 
    mainHeader: mainHeaderFilter, 
    from: startDate, 
    to: endDate,
    mainAccount: mainAccountFilter,
    verified: verifiedFilter
  }), [codeFilter, fromAccountFilter, toAccountFilter, cdFilter, mainHeaderFilter, startDate, endDate, mainAccountFilter, verifiedFilter]);

  // Calculate verification counts (excluding verified filter for accurate counts)
  const verificationCounts = useMemo(() => {
    let filtered = allData;
    
    // Apply all filters except verified filter
    if (filters.mainAccount && filters.mainAccount.length > 0) {
      filtered = filtered.filter(r => 
        filters.mainAccount.includes(r.fromAccount) || filters.mainAccount.includes(r.toAccount)
      );
    }
    if (filters.fromAccount) filtered = filtered.filter(r => r.fromAccount === filters.fromAccount);
    if (filters.toAccount) filtered = filtered.filter(r => r.toAccount === filters.toAccount);
    if (filters.cd) filtered = filtered.filter(r => r.cd === filters.cd);
    if (filters.mainHeader) filtered = filtered.filter(r => r.mainHeader === filters.mainHeader);
    if (filters.code) {
      const q = filters.code.toLowerCase();
      filtered = filtered.filter(r => (r.code || "").toLowerCase().includes(q));
    }
    if (filters.from) filtered = filtered.filter(r => r.date >= filters.from);
    if (filters.to) filtered = filtered.filter(r => r.date <= filters.to);
    
    const total = filtered.length;
    const verified = filtered.filter(r => r.isVerified === true).length;
    const unverified = filtered.filter(r => !r.isVerified).length;
    
    return { total, verified, unverified };
  }, [allData, filters.code, filters.fromAccount, filters.toAccount, filters.cd, filters.mainHeader, filters.from, filters.to, filters.mainAccount]);

  const filteredData = useMemo(() => {
    let filtered = allData;
    
    // Main Account filter - shows all transactions involving these accounts
    if (filters.mainAccount && filters.mainAccount.length > 0) {
      filtered = filtered.filter(r => 
        filters.mainAccount.includes(r.fromAccount) || filters.mainAccount.includes(r.toAccount)
      );
    }
    
    if (filters.fromAccount) filtered = filtered.filter(r => r.fromAccount === filters.fromAccount);
    if (filters.toAccount) filtered = filtered.filter(r => r.toAccount === filters.toAccount);
    if (filters.cd) filtered = filtered.filter(r => r.cd === filters.cd);
    if (filters.mainHeader) filtered = filtered.filter(r => r.mainHeader === filters.mainHeader);
    if (filters.code) {
      const q = filters.code.toLowerCase();
      filtered = filtered.filter(r => (r.code || "").toLowerCase().includes(q));
    }
    if (filters.from) filtered = filtered.filter(r => r.date >= filters.from);
    if (filters.to) filtered = filtered.filter(r => r.date <= filters.to);
    
    // Verified filter
    if (filters.verified === "YES") {
      filtered = filtered.filter(r => r.isVerified === true);
    } else if (filters.verified === "NO") {
      filtered = filtered.filter(r => !r.isVerified);
    }
    
    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        
        // Handle amount as number
        if (sortColumn === 'amount') {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        }
        
        // Handle date
        if (sortColumn === 'date') {
          aVal = aVal || '';
          bVal = bVal || '';
        }
        
        // String comparison for other fields
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [allData, filters, sortColumn, sortDirection]);

  useEffect(() => { fetchData(); }, []);
  // Detect mobile viewport for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      try {
        setIsMobile(window.innerWidth <= 768);
      } catch (_) {
        setIsMobile(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => { 
    recomputeFromFiltered(); 
    if (!preventPageReset) {
      setPage(1);
    }
    setPreventPageReset(false);
    setSelectedItems([]); 
  }, [filteredData, pageSize]);
  useEffect(() => { 
    // On page change, only update the paginated slice to avoid unnecessary recomputations
    setReports(paginate(filteredData));
    setSelectedItems([]); 
  }, [page]);
  
  // Handle clicking outside the Main Account dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMainAccountDropdown && !event.target.closest('.main-account-multiselect')) {
        setShowMainAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMainAccountDropdown]);

  // Function to handle navigation from Summary tab with filters
  const handleNavigateFromSummary = (filters) => {
    setSection('creditDebit');
    
    // Apply filters
    if (filters.cd) setCdFilter(filters.cd);
    if (filters.fromAccount) setFromAccountFilter(filters.fromAccount);
    if (filters.toAccount && !filters.fromAccount) setToAccountFilter(filters.toAccount);
    if (filters.from) setStartDate(filters.from);
    if (filters.to) setEndDate(filters.to);
    
    // Show filters panel
    setShowFilters(true);
  };

  const paginate = (list) => {
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = `${config.MernBaseURL}/financialData/getAll`;
      const response = await axios.get(apiUrl, { headers: { Accept: 'application/json' } });
      const payload = response?.data;
      const all = Array.isArray(payload) ? payload : (payload?.data || []);

      setAllData(all);
      const derivedAccounts = Array.from(new Set([...all.map(r => r.fromAccount), ...all.map(r => r.toAccount)].filter(Boolean))).sort();
      const derivedMainHeaders = Array.from(new Set(all.map(r => r.mainHeader).filter(Boolean))).sort();
      const derivedCodes = Array.from(new Set(all.map(r => r.code).filter(Boolean))).sort();

      const cfgAccounts = (financialReportConfig?.accountNames || []);
      // Combine all three main header lists for filter dropdown
      const allMainHeaders = [
        ...(financialReportConfig?.mainHeadersDebit || []),
        ...(financialReportConfig?.mainHeadersCredit || []),
        ...(financialReportConfig?.mainHeadersLoan || [])
      ];

      setAccountOptions(cfgAccounts.length ? cfgAccounts : derivedAccounts);
      setMainHeaderOptions(allMainHeaders.length ? allMainHeaders : derivedMainHeaders);
      setCodeOptions(derivedCodes);
    } catch (e) {
      console.error('Failed to load financial data from API', e);
      setAllData([]);
    } finally { setLoading(false); }
  };

  const recomputeFromFiltered = () => {
    // Calculate totals with dynamic C/D when Main Account filter is active
    const totalCredit = filteredData.reduce((acc, r) => {
      // Dynamic C/D based on Main Account perspective
      if (mainAccountFilter && mainAccountFilter.length > 0) {
        if (mainAccountFilter.includes(r.toAccount)) {
          return acc + Number(r.amount || 0); // Money coming in = Credit
        }
        return acc; // Money going out counted in debit
      }
      
      // Default: use original C/D
      return acc + (r.cd === 'C' ? Number(r.amount || 0) : 0);
    }, 0);
    
    const totalDebit = filteredData.reduce((acc, r) => {
      // Dynamic C/D based on Main Account perspective
      if (mainAccountFilter && mainAccountFilter.length > 0) {
        if (mainAccountFilter.includes(r.fromAccount)) {
          return acc + Number(r.amount || 0); // Money going out = Debit
        }
        return acc; // Money coming in counted in credit
      }
      
      // Default: use original C/D
      return acc + (r.cd === 'D' ? Number(r.amount || 0) : 0);
    }, 0);
    
    const net = totalCredit - totalDebit;
    setSummary({ credit: totalCredit, debit: totalDebit, net });
    setTotal(filteredData.length);
    setTotalPages(Math.max(1, Math.ceil(filteredData.length / pageSize)));
    setReports(paginate(filteredData));
    setCardData(cardDataTemplate.map(card => card.label === 'Credit' ? { ...card, value: totalCredit } : card.label === 'Debit' ? { ...card, value: totalDebit } : { ...card, value: net }));
  };

  const mapToRow = (item) => ({
    code: item.code || "",
    date: item.date || "",
    fromAccount: item.fromAccount || "",
    toAccount: item.toAccount || "",
    cd: item.cd || "",
    mainHeader: item.mainHeader || "",
    subHeader: item.subHeader || "",
    amount: Number(item.amount || 0)
  });

  const formatAmount = (val) => { if (!val) return ""; try { return `₹${Number(val).toLocaleString()}`; } catch { return `${val}`; } };

  // Check if data was generated from Payment Receipt
  const isFromPaymentReceipt = (item) => {
    return item.generatedBy && typeof item.generatedBy === 'string' && item.generatedBy.toLowerCase().includes('payment receipt');
  };

  // Get dynamic C/D based on Main Account perspective
  const getDynamicCD = (item) => {
    // If Main Account filter is active, show perspective from that account
    if (mainAccountFilter && mainAccountFilter.length > 0) {
      // If main account is receiving (toAccount), it's a Credit for them
      if (mainAccountFilter.includes(item.toAccount)) {
        return 'C';
      }
      // If main account is sending (fromAccount), it's a Debit for them
      if (mainAccountFilter.includes(item.fromAccount)) {
        return 'D';
      }
    }
    
    // Default to original C/D
    return item.cd;
  };

  const clearFilters = () => { 
    setFromAccountFilter(""); 
    setToAccountFilter(""); 
    setCdFilter(""); 
    setMainHeaderFilter(""); 
    setCodeFilter(""); 
    setStartDate(""); 
    setEndDate(""); 
    setMainAccountFilter([]);
    setVerifiedFilter("");
    setSortColumn('');
    setSortDirection('asc');
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) return <i className="bi bi-arrow-down-up sort-icon-inactive"></i>;
    return sortDirection === 'asc' 
      ? <i className="bi bi-arrow-up sort-icon-active"></i>
      : <i className="bi bi-arrow-down sort-icon-active"></i>;
  };

  const handleExportExcel = () => { exportFinancialDataToExcel({ rows: allData, user, filters }); };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDeleteClick = (item) => {
    setDeleteConfirm({ show: true, item });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.item) return;
    
    try {
      const url = `${config.MernBaseURL}/financialData/delete/${deleteConfirm.item._id}`;
      const payload = {
        deletedBy: user?.username,
        deletedAt: new Date().toISOString().split('T')[0]
      };
      
      await axios.put(url, payload, { headers: { "Content-Type": "application/json" } });
      
      // Refresh data after delete
      fetchData();
      setDeleteConfirm({ show: false, item: null });
      
      // Show success message
      setToast({ show: true, message: 'Financial record deleted successfully!', variant: 'success' });
    } catch (error) {
      console.error('Failed to delete financial data', error);
      setToast({ show: true, message: 'Failed to delete record. Please try again.', variant: 'danger' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, item: null });
  };

  const handleViewDetails = (item) => {
    setViewDetails({ show: true, item });
  };

  const handleViewClose = () => {
    setViewDetails({ show: false, item: null });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleModalSuccess = (isEdit, updatedItem) => {
    // If editing, preserve the current page and highlight the row
    if (isEdit && editingItem) {
      setPreventPageReset(true);
      setHighlightedRowId(editingItem._id);
      
      // Clear highlight after 10 seconds
      setTimeout(() => {
        setHighlightedRowId(null);
      }, 10000);
    }
    
    fetchData();
    handleModalClose();
    
    // Show success message
    const message = isEdit 
      ? 'Financial record updated successfully!' 
      : 'Financial record added successfully!';
    setToast({ show: true, message, variant: 'success' });
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Only select unverified items
      const unverifiedIds = reports.filter(item => !item.isVerified).map(item => item._id);
      setSelectedItems(unverifiedIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleVerifySelected = async () => {
    if (selectedItems.length === 0) {
      setToast({ show: true, message: 'Please select items to verify', variant: 'warning' });
      return;
    }

    setVerifying(true);
    try {
      const updatePromises = selectedItems.map(itemId => 
        axios.put(
          `${config.MernBaseURL}/financialData/verify/${itemId}`,
          {
            isVerified: true,
            verifiedBy: user?.username,
            verifiedAt: new Date().toISOString().split('T')[0]
          },
          { headers: { 'Content-Type': 'application/json' } }
        )
      );

      await Promise.all(updatePromises);
      
      // Refresh data and clear selection
      fetchData();
      setSelectedItems([]);
      setToast({ 
        show: true, 
        message: `${selectedItems.length} record(s) verified successfully!`, 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Failed to verify records', error);
      setToast({ 
        show: true, 
        message: 'Failed to verify records. Please try again.', 
        variant: 'danger' 
      });
    } finally {
      setVerifying(false);
    }
  };
  
  // Handle Main Account checkbox toggle
  const handleMainAccountToggle = (account) => {
    setMainAccountFilter(prev => {
      if (prev.includes(account)) {
        return prev.filter(a => a !== account);
      } else {
        return [...prev, account];
      }
    });
    setPage(1);
  };
  
  // Handle Select/Deselect All for Main Account
  const handleMainAccountSelectAll = () => {
    if (mainAccountFilter.length === accountOptions.length) {
      setMainAccountFilter([]);
    } else {
      setMainAccountFilter([...accountOptions]);
    }
    setPage(1);
  };

  return (
    <div className="financial-reports-box">
      {/* Section selector boxes */}
      <div className="fr-sections" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {sections.map(s => (
            <button
              type="button"
              key={s.key}
              className={`fr-section-box ${section === s.key ? 'active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        
        {/* Action buttons moved here */}
        <div className="header-actions">
          <button 
            type="button" 
            className="btn btn-outline-secondary icon-btn" 
            onClick={() => setShowSummary(!showSummary)} 
            title={showSummary ? "Hide Summary" : "Show Summary"}
          >
            <i className={`bi ${showSummary ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary icon-btn filter-toggle-btn" 
            onClick={() => setShowFilters(!showFilters)} 
            title="Toggle Filters"
          >
            <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'}`}></i>
          </button>
          <button 
            type="button" 
            className="btn btn-outline-success icon-btn" 
            onClick={fetchData} 
            title="Reload Data"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
          <button type="button" className="btn btn-outline-primary icon-btn" onClick={clearFilters} title="Clear Filters">
            <i className="bi bi-eraser"></i>
          </button>
          <button type="button" className="financial-reports-add-btn icon-btn" onClick={() => setShowModal(true)} title="Add Financial Data">
            <i className="bi bi-plus-circle"></i>
          </button>
          <button type="button" className="financial-reports-download-btn icon-btn" onClick={handleExportExcel} title="Download Data">
            <i className="bi bi-download"></i>
          </button>
          {isAdmin && selectedItems.length > 0 && (
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={handleVerifySelected}
              disabled={verifying}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.7rem', borderRadius: '8px', fontSize: '0.85rem' }}
              title={`Verify ${selectedItems.length} selected item${selectedItems.length > 1 ? 's' : ''}`}
            >
              {verifying ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  Verify ({selectedItems.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {section === 'creditDebit' ? (
        <>
      <div className="financial-reports-topbar" style={{ overflow: 'visible' }}>
        {/* Header with title and action buttons */}
        <div className="topbar-header">
          <div className="controls-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 className="financial-reports-title">Financial Reports</h1>
              {showSummary && (
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                    Credit: ₹{summary.credit.toLocaleString()}
                  </span>
                  <span style={{ color: 'var(--danger)', fontWeight: '600' }}>
                    Debit: ₹{summary.debit.toLocaleString()}
                  </span>
                  <span style={{ color: summary.net >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                    Net: ₹{summary.net.toLocaleString()}
                  </span>
                  <span style={{ color: 'var(--info)', fontWeight: '600' }}>
                    | Total: {verificationCounts.total}
                  </span>
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                    Verified: {verificationCounts.verified}
                  </span>
                  <span style={{ color: 'var(--warning)', fontWeight: '600' }}>
                    Not-Verified: {verificationCounts.unverified}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="filters-panel" style={{ overflow: 'visible', position: 'relative' }}>
            <div className="filters-grid" style={{ overflow: 'visible', position: 'relative' }}>
              {/* Code */}
              <div className="filter-item">
                <label>Code</label>
                <div className="filter-code-input">
                  <input type="text" list="code-options" className="financial-reports-input" placeholder="Search/select code" value={codeFilter} onChange={(e) => { setCodeFilter(e.target.value); setPage(1);} } />
                  {codeFilter && (
                    <button type="button" className="code-clear-btn" aria-label="Clear code filter" onClick={() => { setCodeFilter(""); setPage(1); }}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
                <datalist id="code-options">{codeOptions.map(code => (<option key={code} value={code} />))}</datalist>
              </div>

              {/* Main Account - Multi-Select */}
              <div className="filter-item" style={{ position: 'relative' }}>
                <label>Main Account</label>
                <div className="main-account-multiselect" style={{ position: 'relative' }}>
                  <div 
                    className="financial-reports-select" 
                    style={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingRight: '2rem'
                    }}
                    onClick={() => setShowMainAccountDropdown(!showMainAccountDropdown)}
                  >
                    <span style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {mainAccountFilter.length === 0 
                        ? 'All' 
                        : mainAccountFilter.length === accountOptions.length
                        ? 'All Selected'
                        : `${mainAccountFilter.length} Selected`
                      }
                    </span>
                    <i className={`bi bi-chevron-${showMainAccountDropdown ? 'up' : 'down'}`} style={{ position: 'absolute', right: '0.75rem' }}></i>
                  </div>
                  
                  {showMainAccountDropdown && (
                    <div className="multiselect-dropdown" style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      zIndex: 9999,
                      marginTop: '4px',
                      minWidth: '200px',
                      width: 'auto',
                      whiteSpace: 'nowrap'
                    }}>
                      {/* Select All Option */}
                      <div 
                        style={{
                          padding: '0.5rem 0.65rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: 'var(--light-bg)',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={handleMainAccountSelectAll}
                      >
                        <input 
                          type="checkbox" 
                          checked={mainAccountFilter.length === accountOptions.length}
                          onChange={() => {}}
                          style={{ cursor: 'pointer', width: '14px', height: '14px', flexShrink: 0 }}
                        />
                        <span>Select All</span>
                      </div>
                      
                      {/* Account Options */}
                      {accountOptions.map(acc => (
                        <div 
                          key={acc}
                          style={{
                            padding: '0.5rem 0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'background-color 0.2s',
                            backgroundColor: mainAccountFilter.includes(acc) ? 'var(--light-primary)' : 'transparent',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap'
                          }}
                          onClick={() => handleMainAccountToggle(acc)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = mainAccountFilter.includes(acc) ? 'var(--light-primary)' : 'transparent'}
                        >
                          <input 
                            type="checkbox" 
                            checked={mainAccountFilter.includes(acc)}
                            onChange={() => {}}
                            style={{ cursor: 'pointer', width: '14px', height: '14px', flexShrink: 0 }}
                          />
                          <span>{acc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* From Account */}
              <div className="filter-item">
                <label>From Account</label>
                <select className="financial-reports-select" value={fromAccountFilter} onChange={(e) => { setFromAccountFilter(e.target.value); setPage(1);} }>
                  <option value="">All</option>
                  {accountOptions.map(acc => (<option key={acc} value={acc}>{acc}</option>))}
                </select>
              </div>

              {/* To Account */}
              <div className="filter-item">
                <label>To Account</label>
                <select className="financial-reports-select" value={toAccountFilter} onChange={(e) => { setToAccountFilter(e.target.value); setPage(1);} }>
                  <option value="">All</option>
                  {accountOptions.map(acc => (<option key={acc} value={acc}>{acc}</option>))}
                </select>
              </div>

              {/* C/D */}
              <div className="filter-item">
                <label>C/D</label>
                <select className="financial-reports-select" value={cdFilter} onChange={(e) => { setCdFilter(e.target.value); setPage(1);} }>
                  <option value="">All</option>
                  <option value="C">Credit</option>
                  <option value="D">Debit</option>
                </select>
              </div>

              {/* Main Header */}
              <div className="filter-item">
                <label>Main Header</label>
                <select className="financial-reports-select" value={mainHeaderFilter} onChange={(e) => { setMainHeaderFilter(e.target.value); setPage(1);} }>
                  <option value="">All</option>
                  {mainHeaderOptions.map(h => (<option key={h} value={h}>{h}</option>))}
                </select>
              </div>

              {/* From Date */}
              <div className="filter-item">
                <label>From</label>
                <input type="date" className="financial-reports-date-input" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1);} } />
              </div>

              {/* To Date */}
              <div className="filter-item">
                <label>To</label>
                <input type="date" className="financial-reports-date-input" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1);} } />
              </div>

              {/* Verified Status */}
              <div className="filter-item">
                <label>Verified</label>
                <select className="financial-reports-select" value={verifiedFilter} onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1);} }>
                  <option value="">All ({verificationCounts.total})</option>
                  <option value="YES">YES ({verificationCounts.verified})</option>
                  <option value="NO">NO ({verificationCounts.unverified})</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="table-container">
        <div className={`table-responsive ${isMobile ? 'table-layout-auto' : 'table-layout-fixed'}`}>
          <table className="table financial-reports-table">
            <thead>
              <tr>
                {isAdmin && (
                  <th scope="col" style={{ width: '50px' }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={reports.filter(item => !item.isVerified).length > 0 && 
                               selectedItems.length === reports.filter(item => !item.isVerified).length}
                      title="Select All Unverified"
                    />
                  </th>
                )}
                <th scope="col" className="sortable" onClick={() => handleSort('code')} style={isMobile ? undefined : { width: '15%' }}>
                  Code {getSortIcon('code')}
                </th>
                <th scope="col" className="sortable" onClick={() => handleSort('date')} style={isMobile ? undefined : { width: '9%' }}>
                  Date {getSortIcon('date')}
                </th>
                <th scope="col" className="sortable" onClick={() => handleSort('fromAccount')} style={isMobile ? undefined : { width: '8%' }}>
                  From Account {getSortIcon('fromAccount')}
                </th>
                <th scope="col" className="sortable" onClick={() => handleSort('throughBy')} style={isMobile ? undefined : { width: '8%' }}>
                  Through/By {getSortIcon('throughBy')}
                </th>
                <th scope="col" className="sortable" onClick={() => handleSort('toAccount')} style={isMobile ? undefined : { width: '8%' }}>
                  To Account {getSortIcon('toAccount')}
                </th>
                <th scope="col" className="sortable" onClick={() => handleSort('cd')} style={isMobile ? undefined : { width: '4%' }}>
                  C/D {getSortIcon('cd')}
                </th>
                <th scope="col" className="sortable" onClick={() => handleSort('mainHeader')} style={isMobile ? undefined : { width: '20%' }}>
                  Main Header {getSortIcon('mainHeader')}
                </th>
                <th scope="col" className="sortable" onClick={() => handleSort('subHeader')} style={isMobile ? undefined : { width: '10%' }}>
                  Sub Header {getSortIcon('subHeader')}
                </th>
                <th scope="col" className="sortable" onClick={() => handleSort('amount')} style={isMobile ? undefined : { width: '8%' }}>
                  Amount {getSortIcon('amount')}
                </th>
                <th scope="col" style={{ width: '8%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item, idx) => { const row = mapToRow(item); return (
                <tr key={item._id || idx} className={`${isFromPaymentReceipt(item) ? 'from-payment-receipt' : ''} ${selectedItems.includes(item._id) ? 'row-selected' : ''} ${highlightedRowId === item._id ? 'highlighted-row' : ''}`}>
                  {isAdmin && (
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        disabled={item.isVerified}
                        title={item.isVerified ? "Already verified" : "Select for verification"}
                        style={{ cursor: item.isVerified ? 'not-allowed' : 'pointer' }}
                      />
                    </td>
                  )}
                  <td title={row.code} style={isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { width: '15%', maxWidth: '15%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.code}
                    {isFromPaymentReceipt(item) && (
                      <span 
                        className="payment-receipt-badge" 
                        title={`Generated from Payment Receipt by ${item.generatedBy}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          float: 'right'
                        }}
                      >
                        <i className="bi bi-receipt" style={{ marginRight: '3px' }}></i>
                        PR
                      </span>
                    )}
                  </td>
                  <td title={formatDate(row.date)} style={isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { width: '9%', maxWidth: '9%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDate(row.date)}</td>
                  <td title={row.fromAccount} style={isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { width: '8%', maxWidth: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.fromAccount}</td>
                  <td title={item.throughBy || ''} style={isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { width: '8%', maxWidth: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.throughBy || '-'}</td>
                  <td title={row.toAccount} style={isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { width: '8%', maxWidth: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.toAccount}</td>
                  <td title={getDynamicCD(item)} style={isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { width: '4%', maxWidth: '4%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span className={getDynamicCD(item) === 'C' ? 'amount-credit' : 'amount-debit'}>{getDynamicCD(item)}</span></td>
                  <td title={row.mainHeader} style={isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { width: '20%', maxWidth: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.mainHeader}</td>
                  <td title={row.subHeader} style={isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { width: '10%', maxWidth: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.subHeader}</td>
                  <td style={{ width: '8%', maxWidth: '8%' }}>
                    {item.isVerified ? (
                      <i 
                        className="bi bi-check" 
                        title={`Verified by ${item.verifiedBy || 'Admin'} on ${item.verifiedAt || 'N/A'}`}
                        style={{
                          color: '#28a745',
                          fontSize: '1rem',
                          marginRight: '4px'
                        }}
                      ></i>
                    ) : (
                      <span style={{ display: 'inline-block', width: '1rem', marginRight: '4px' }}></span>
                    )}
                    <span className={getDynamicCD(item) === 'C' ? 'amount-credit' : 'amount-debit'}>{formatAmount(row.amount)}</span>
                  </td>
                  <td style={{ width: '8%', maxWidth: '8%' }}>
                    <div className="action-buttons">
                      <button 
                        type="button" 
                        className="btn-action btn-view" 
                        onClick={() => handleViewDetails(item)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        type="button" 
                        className="btn-action btn-edit" 
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button 
                        type="button" 
                        className="btn-action btn-delete" 
                        onClick={() => handleDeleteClick(item)}
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-left">
            <span className="pagination-info">Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, total)} of {total}</span>
            <div className="page-size-selector">
              <label>Show</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="page-size-select">
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          <div className="pagination-nav">
            <button className="page-arrow" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} title="Previous">
              <i className="bi bi-chevron-left"></i>
            </button>
            <div className="page-numbers">
              {buildPageList(page, totalPages).map((p, idx) => (
                <React.Fragment key={idx}>
                  {p === '...'
                    ? <span className="page-ellipsis">...</span>
                    : <button className={`page-num ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>}
                </React.Fragment>
              ))}
            </div>
            <button className="page-arrow" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} title="Next">
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

        </>
      ) : section === 'summary' ? (
        <FinancialSummary onNavigateToReports={handleNavigateFromSummary} />
      ) : (
        <div className="fr-placeholder">
          <h3>{sections.find(s => s.key === section)?.label}</h3>
          <p>Content will appear here.</p>
        </div>
      )}

      {loading && (<div className="loading-overlay"><div className="loading-content"><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner><p>Loading financial reports...</p></div></div>)}

      {showModal && (<AddFinancialDataModal editData={editingItem} allData={allData} onClose={handleModalClose} onSuccess={() => handleModalSuccess(!!editingItem)} />)}

      {/* View Details Modal */}
      {viewDetails.show && viewDetails.item && (
        <div className="view-modal-overlay">
          <div className="view-modal">
            <div className="view-modal-header">
              <h3><i className="bi bi-eye"></i> Transaction Details</h3>
              <button type="button" className="close-btn" onClick={handleViewClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="view-modal-body">
              <table className="view-details-table">
                <tbody>
                  {Object.entries(viewDetails.item).map(([key, value]) => {
                    // Skip internal fields
                    if (key === '__v' || key === '_id') return null;
                    
                    // Format the key name
                    const formattedKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())
                      .trim();
                    
                    // Format the value
                    let formattedValue = value;
                    if (value === null || value === undefined || value === '') {
                      formattedValue = 'N/A';
                    } else if (key === 'amount') {
                      formattedValue = formatAmount(value);
                    } else if (typeof value === 'boolean') {
                      formattedValue = value ? 'Yes' : 'No';
                    } else if (typeof value === 'object') {
                      formattedValue = JSON.stringify(value, null, 2);
                    } else {
                      formattedValue = String(value);
                    }
                    
                    return (
                      <tr key={key}>
                        <td className="view-key">{formattedKey}</td>
                        <td className="view-val">{formattedValue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="view-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleViewClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Confirm Delete</h3>
              <button type="button" className="close-btn" onClick={handleDeleteCancel}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="delete-modal-body">
              <div className="delete-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <p>Are you sure you want to delete this financial record?</p>
              <div className="delete-details">
                <p><strong>Code:</strong> {deleteConfirm.item?.code}</p>
                <p><strong>Date:</strong> {deleteConfirm.item?.date}</p>
                <p><strong>Amount:</strong> {formatAmount(deleteConfirm.item?.amount)}</p>
              </div>
              <p className="delete-warning">This action will mark the record as deleted and can be tracked.</p>
            </div>
            <div className="delete-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={toast.show} 
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <i className={`bi ${toast.variant === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            <strong className="me-auto">{toast.variant === 'success' ? 'Success' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'success' ? 'text-white' : 'text-white'}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

// concise pagination with ellipses
function buildPageList(current, total) {
  const pages = [];
  if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); return pages; }
  if (current <= 3) { pages.push(1, 2, 3, "...", total - 1, total); }
  else if (current >= total - 2) { pages.push(1, 2, "...", total - 2, total - 1, total); }
  else { pages.push(1, "...", current - 1, current, current + 1, "...", total); }
  return pages;
}

export default FinancialReports;
