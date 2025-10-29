import React, { useState, useMemo, useEffect } from 'react';
import './FinancialReports.css';
import './FinancialOverview.css';
import financialReportConfig from './financialReportConfig';
import config from '../../config';
import axios from 'axios';
import AddPaymentModal from './AddPaymentModal';

const FinancialOverview = ({ allData = [] }) => {
  // State declarations
  const [paymentsIn, setPaymentsIn] = useState([]);
  const [paymentsOut, setPaymentsOut] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiTotalIn, setApiTotalIn] = useState(0);
  const [apiTotalOut, setApiTotalOut] = useState(0);
  const [showSummary, setShowSummary] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('in'); // 'in' or 'out'
  const [editingPayment, setEditingPayment] = useState(null);

  // Calculate bank account details from allData
  const bankAccounts = useMemo(() => {
    const accountNames = financialReportConfig?.accountNames || [];
    
    return accountNames.map((accountName, index) => {
      // Calculate Debit: Sum of ALL amounts where this account is in fromAccount (money going OUT)
      const debitTransactions = allData.filter(item => 
        item.fromAccount === accountName
      );
      const totalDebit = debitTransactions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      
      // Calculate Credit: Sum of ALL amounts where this account is in toAccount (money coming IN)
      const creditTransactions = allData.filter(item => 
        item.toAccount === accountName
      );
      const totalCredit = creditTransactions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      
      // Calculate Balance: Credit - Debit
      const balance = totalCredit - totalDebit;
      
      return {
        id: index + 1,
        bankName: accountName,
        debit: totalDebit,
        credit: totalCredit,
        balance: balance
      };
    }).filter(account => 
      account.bankName !== 'NA' && // Exclude NA account
      (account.debit !== 0 || account.credit !== 0 || account.balance !== 0) // Show only accounts with transactions
    );
  }, [allData]);

  // Calculate summary data from bank accounts
  const summaryData = useMemo(() => {
    // Separate credit card and non-credit card accounts
    const nonCreditCardAccounts = bankAccounts.filter(account => 
      !account.bankName.toUpperCase().includes('CREDIT CARD')
    );
    const creditCardAccounts = bankAccounts.filter(account => 
      account.bankName.toUpperCase().includes('CREDIT CARD')
    );
    
    // Calculate Total Bank Balance (excluding credit cards)
    const totalBankBalance = nonCreditCardAccounts.reduce((sum, account) => sum + account.balance, 0);
    
    // Calculate only NEGATIVE credit card balances
    const negativeCreditCardBalance = creditCardAccounts
      .filter(account => account.balance < 0)
      .reduce((sum, account) => sum + account.balance, 0);
    
    return {
      totalBankBalance: totalBankBalance,
      creditCardBalance: negativeCreditCardBalance,
      showCreditCardSummary: negativeCreditCardBalance < 0, // Show only if there are negative balances
      totalIn: apiTotalIn, // From API
      totalOut: apiTotalOut, // From API
      currentStatus: totalBankBalance // Same as total bank balance (excluding credit cards)
    };
  }, [bankAccounts, apiTotalIn, apiTotalOut]);

  // Fetch financial summary data from API
  useEffect(() => {
    fetchFinancialSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const handleAddPaymentIn = () => {
    setModalType('in');
    setEditingPayment(null);
    setShowModal(true);
  };

  const handleAddPaymentOut = () => {
    setModalType('out');
    setEditingPayment(null);
    setShowModal(true);
  };

  const handleAction = (type, id) => {
    const [action, paymentType] = type.split('-'); // e.g., 'edit-in' or 'delete-out'
    
    if (action === 'edit') {
      // Find the payment data
      const paymentArray = paymentType === 'in' ? paymentsIn : paymentsOut;
      const payment = paymentArray.find(p => p._id === id);
      
      if (payment) {
        setModalType(paymentType);
        setEditingPayment(payment);
        setShowModal(true);
      }
    } else if (action === 'delete') {
      // Handle delete (can be implemented later)
      console.log(`Delete ${paymentType} payment with id ${id}`);
      // TODO: Implement delete functionality
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleModalSuccess = () => {
    // Refetch data after successful add/edit
    fetchFinancialSummary();
  };

  const fetchFinancialSummary = async () => {
    setLoading(true);
    try {
      const apiUrl = `${config.MernBaseURL}/financialSummary/getAll`;
      const response = await axios.get(apiUrl);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        const summaryData = response.data.data[0];
        
        // Extract IN payments
        const inPayments = (summaryData.in || []).map(item => ({
          _id: item._id,
          clientName: item.client,
          purpose: item.desc,
          amount: item.amount,
          generatedBy: item.generatedBy
        }));
        
        // Extract OUT payments
        const outPayments = (summaryData.out || []).map(item => ({
          _id: item._id,
          clientName: item.client,
          purpose: item.desc,
          amount: item.amount,
          generatedBy: item.generatedBy
        }));
        
        setPaymentsIn(inPayments);
        setPaymentsOut(outPayments);
        setApiTotalIn(summaryData.totalIn || 0);
        setApiTotalOut(summaryData.totalOut || 0);
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="financial-overview-container">
      {/* Summary Cards */}
      <div className="overview-summary-section">
        <div className="summary-header">
          <h2 className="summary-title">Financial Summary</h2>
          <button 
            className="summary-toggle-btn"
            onClick={() => setShowSummary(!showSummary)}
            title={showSummary ? "Hide Summary" : "Show Summary"}
          >
            <i className={`bi ${showSummary ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
        </div>
        {showSummary && (
        <div className="summary-cards">
          <div key="total-bank-balance" className="summary-card">
            <div className="summary-label">Total Bank Balance</div>
            <div className="summary-value positive">
              {formatAmount(summaryData.totalBankBalance)}
            </div>
          </div>
          {summaryData.showCreditCardSummary && (
            <div key="credit-card" className="summary-card credit-card-warning">
              <div className="summary-label">CREDIT CARD</div>
              <div className="summary-value negative">
                {summaryData.creditCardBalance < 0 ? '-' : ''}{formatAmount(summaryData.creditCardBalance)}
              </div>
            </div>
          )}
          <div key="total-in" className="summary-card">
            <div className="summary-label">Total IN</div>
            <div className="summary-value positive">
              {formatAmount(summaryData.totalIn)}
            </div>
          </div>
          <div key="total-out" className="summary-card">
            <div className="summary-label">Total OUT</div>
            <div className="summary-value negative">
              {summaryData.totalOut < 0 ? '-' : ''}{formatAmount(summaryData.totalOut)}
            </div>
          </div>
          <div key="current-status" className="summary-card highlighted">
            <div className="summary-label">Current Status</div>
            <div className="summary-value status">
              {formatAmount(summaryData.currentStatus)}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Tables Section */}
      <div className="overview-tables-section">
        {/* Bank Account Details Table */}
        <div className="overview-table-container">
          <div className="overview-table-header">
            <h3>All The Bank Account Details</h3>
          </div>
          <div className="overview-table-wrapper">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Bank Name</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {bankAccounts.map((account, index) => {
                  const isCreditCard = account.bankName.toUpperCase().includes('CREDIT CARD');
                  return (
                    <tr key={account.id} className={isCreditCard ? 'credit-card-row' : ''}>
                      <td>{index + 1}</td>
                      <td>{account.bankName || ''}</td>
                      <td className="positive">{account.credit ? formatAmount(account.credit) : ''}</td>
                      <td className="negative">{account.debit ? formatAmount(account.debit) : ''}</td>
                      <td className={account.balance < 0 ? 'negative' : account.balance > 0 ? 'positive' : ''}>
                        {account.balance ? (account.balance < 0 ? '-' : '') + formatAmount(account.balance) : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Future Payments IN Details Table */}
        <div className="overview-table-container">
          <div className="overview-table-header">
            <h3>Future Payments IN Details</h3>
            <button className="add-btn" onClick={handleAddPaymentIn}>
              <i className="bi bi-plus-circle"></i> Add+
            </button>
          </div>
          <div className="overview-table-wrapper">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Client Name</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentsIn.length > 0 ? (
                  paymentsIn.map((payment, index) => (
                    <tr key={payment._id}>
                      <td>{index + 1}</td>
                      <td>{payment.clientName}</td>
                      <td>{payment.purpose}</td>
                      <td className="positive">{formatAmount(payment.amount)}</td>
                      <td>
                        <button 
                          key={`edit-in-${payment._id}`}
                          className="action-btn edit"
                          onClick={() => handleAction('edit-in', payment._id)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          key={`delete-in-${payment._id}`}
                          className="action-btn delete"
                          onClick={() => handleAction('delete-in', payment._id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="empty-payments-in">
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                      {loading ? 'Loading...' : 'No payment records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Future Payments OUT Details Table */}
        <div className="overview-table-container">
          <div className="overview-table-header">
            <h3>Future Payments OUT Details</h3>
            <button className="add-btn" onClick={handleAddPaymentOut}>
              <i className="bi bi-plus-circle"></i> Add+
            </button>
          </div>
          <div className="overview-table-wrapper">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Client Name</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentsOut.length > 0 ? (
                  paymentsOut.map((payment, index) => (
                    <tr key={payment._id}>
                      <td>{index + 1}</td>
                      <td>{payment.clientName}</td>
                      <td>{payment.purpose}</td>
                      <td className="amount">{formatAmount(payment.amount)}</td>
                      <td>
                        <button 
                          key={`edit-out-${payment._id}`}
                          className="action-btn edit"
                          onClick={() => handleAction('edit-out', payment._id)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          key={`delete-out-${payment._id}`}
                          className="action-btn delete"
                          onClick={() => handleAction('delete-out', payment._id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="empty-payments-out">
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                      {loading ? 'Loading...' : 'No payment records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Payment Modal */}
      <AddPaymentModal
        show={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type={modalType}
        editData={editingPayment}
      />
    </div>
  );
};

export default FinancialOverview;
