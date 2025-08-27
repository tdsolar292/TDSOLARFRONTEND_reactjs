import React, { useState, useEffect, useMemo } from "react";
import "./FinancialReports.css";
import Spinner from "react-bootstrap/Spinner";
import config from "../../config";
import axios from "axios";
import AddFinancialDataModal from "./AddFinancialDataModal";
import exportFinancialDataToExcel from "./FinancialDataExcel";
import { useAuth } from "../../auth";

const cardDataTemplate = [
  { value: 0, label: "Credit", icon: "bi-graph-up", color: "var(--success)" },
  { value: 0, label: "Debit", icon: "bi-graph-down", color: "var(--danger)" },
  { value: 0, label: "Net Balance", icon: "bi-cash-coin", color: "var(--primary)" }
];

const tableDisplayHeaders = ["Code", "Date", "Mode", "Head of Account", "Description for Transaction", "Credit", "Debit"];

const FinancialReports = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [headFilter, setHeadFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");

  const [cardData, setCardData] = useState(cardDataTemplate);
  const [reports, setReports] = useState([]);
  const [allData, setAllData] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [headOptions, setHeadOptions] = useState([]);
  const [codeOptions, setCodeOptions] = useState([]);
  const [summary, setSummary] = useState({ credit: 0, debit: 0, net: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const filters = useMemo(() => ({ code: codeFilter, account: accountFilter, head: headFilter, from: startDate, to: endDate }), [codeFilter, accountFilter, headFilter, startDate, endDate]);

  const filteredData = useMemo(() => {
    let filtered = allData;
    if (filters.account) filtered = filtered.filter(r => r.accountMode === filters.account);
    if (filters.head) filtered = filtered.filter(r => r.headOfAccount === filters.head);
    if (filters.code) {
      const q = filters.code.toLowerCase();
      filtered = filtered.filter(r => (r.code || "").toLowerCase().includes(q));
    }
    if (filters.from) filtered = filtered.filter(r => r.date >= filters.from);
    if (filters.to) filtered = filtered.filter(r => r.date <= filters.to);
    return filtered;
  }, [allData, filters]);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { recomputeFromFiltered(); setPage(1); }, [filteredData]);
  useEffect(() => { setReports(paginate(filteredData)); }, [page]);

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
      setAccountOptions(Array.from(new Set(all.map(r => r.accountMode).filter(Boolean))).sort());
      setHeadOptions(Array.from(new Set(all.map(r => r.headOfAccount).filter(Boolean))).sort());
      setCodeOptions(Array.from(new Set(all.map(r => r.code).filter(Boolean))).sort());
    } catch (e) {
      console.error('Failed to load financial data from API', e);
      setAllData([]);
    } finally { setLoading(false); }
  };

  const recomputeFromFiltered = () => {
    const totalCredit = filteredData.reduce((acc, r) => acc + (r.transactionType === 'Credit' ? Number(r.amount || 0) : 0), 0);
    const totalDebit = filteredData.reduce((acc, r) => acc + (r.transactionType === 'Debit' ? Number(r.amount || 0) : 0), 0);
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
    mode: item.accountMode || "",
    head: item.headOfAccount || "",
    desc: item.description || "",
    credit: item.transactionType === 'Credit' ? Number(item.amount || 0) : 0,
    debit: item.transactionType === 'Debit' ? Number(item.amount || 0) : 0
  });

  const formatAmount = (val) => { if (!val) return ""; try { return `₹${Number(val).toLocaleString()}`; } catch { return `${val}`; } };

  const clearFilters = () => { setAccountFilter(""); setHeadFilter(""); setCodeFilter(""); setStartDate(""); setEndDate(""); };

  const handleExportExcel = () => { exportFinancialDataToExcel({ rows: filteredData, user, filters }); };

  return (
    <div className="financial-reports-box">
      <div className="financial-reports-topbar">
        <div className="controls-row">
          {/* Title */}
          <div className="controls-title">
            <h1 className="financial-reports-title">Financial Reports</h1>
            <p className="financial-reports-subtitle">Compact overview</p>
          </div>

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

          {/* Mode */}
          <div className="filter-item">
            <label>Mode</label>
            <select className="financial-reports-select" value={accountFilter} onChange={(e) => { setAccountFilter(e.target.value); setPage(1);} }>
              <option value="">All</option>
              {accountOptions.map(acc => (<option key={acc} value={acc}>{acc}</option>))}
            </select>
          </div>

          {/* Head */}
          <div className="filter-item">
            <label>Head</label>
            <select className="financial-reports-select" value={headFilter} onChange={(e) => { setHeadFilter(e.target.value); setPage(1);} }>
              <option value="">All</option>
              {headOptions.map(h => (<option key={h} value={h}>{h}</option>))}
            </select>
          </div>

          {/* From */}
          <div className="filter-item">
            <label>From</label>
            <input type="date" className="financial-reports-date-input" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1);} } />
          </div>

          {/* To */}
          <div className="filter-item">
            <label>To</label>
            <input type="date" className="financial-reports-date-input" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1);} } />
          </div>

          {/* Actions */}
          <div className="controls-actions">
          <button type="button" className="btn btn-outline-primary" onClick={clearFilters}>Clear</button>
            <button type="button" className="financial-reports-add-btn" onClick={() => setShowModal(true)}><i className="bi bi-plus-circle"></i> Add Financial Data</button>
            <button type="button" className="financial-reports-download-btn" onClick={handleExportExcel}><i className="bi bi-download"></i> Download Data</button>
            
          </div>
        </div>
      </div>

      <div className="summary-cards">
        {cardData.map((card, index) => {
          const valueClass = card.label === 'Credit' ? 'amount-credit' : card.label === 'Debit' ? 'amount-debit' : (card.value >= 0 ? 'amount-credit' : 'amount-debit');
          return (
            <div key={index} className="summary-card">
              <div className="summary-card-icon" style={{ color: card.color }}>
                <i className={`bi ${card.icon}`}></i>
              </div>
              <div className="summary-card-content">
                <div className="summary-card-label">{card.label}</div>
                <div className={`summary-card-value ${valueClass}`}>{typeof card.value === 'number' ? `₹${card.value.toLocaleString()}` : card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="table financial-reports-table">
            <thead><tr>{tableDisplayHeaders.map((h, i) => (<th key={i} scope="col">{h}</th>))}</tr></thead>
            <tbody>
              {reports.map((item, idx) => { const row = mapToRow(item); return (
                <tr key={idx}>
                  <td>{row.code}</td>
                  <td>{row.date}</td>
                  <td>{row.mode}</td>
                  <td>{row.head}</td>
                  <td>{row.desc}</td>
                  <td ><span className="amount-credit">{formatAmount(row.credit)}</span></td>
                  <td ><span className="amount-debit">{formatAmount(row.debit)}</span></td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>

        <div className="balance-summary">
          <div className="summary-title">Balance Summary {filters.account ? `- ${filters.account}` : '- All Accounts'}</div>
          <div className="summary-items">
            <div>Credit: <span className="amount-credit">{formatAmount(summary.credit)}</span></div>
            <div>Debit: <span className="amount-debit">{formatAmount(summary.debit)}</span></div>
            <div>Net: <span className={summary.net >= 0 ? 'amount-credit' : 'amount-debit'}>{formatAmount(summary.net)}</span></div>
          </div>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} entries</div>
          <nav>
            <ul className="pagination">
              <li className="page-item"><button className="btn btn-outline-primary" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</button></li>
              {buildPageList(page, totalPages).map((p, idx) => (
                <li key={idx} className="page-item">
                  {p === '...'
                    ? <span className="btn disabled" style={{ pointerEvents: 'none' }}>...</span>
                    : <button className={`btn ${p === page ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPage(p)}>{p}</button>}
                </li>
              ))}
              <li className="page-item"><button className="btn btn-outline-primary" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</button></li>
            </ul>
          </nav>
        </div>
      </div>

      {loading && (<div className="loading-overlay"><div className="loading-content"><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner><p>Loading financial reports...</p></div></div>)}

      {showModal && (<AddFinancialDataModal onClose={() => setShowModal(false)} onSuccess={fetchData} />)}
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
