import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../../config';
import axios from "axios";
import { updateInvoiceStatus } from '../common/common.jsx';
import './PaymentReceipt.css'; // Add this import if you want to use custom styles

const getTodayDate = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const PaymentReceipt = ({ show, handleClose, rowData }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    paymentDate: getTodayDate(), // <-- set default to today
    clientName: '',
    clientAddress: '',
    clientMobile: '',
    receiptNo: '',
    paymentDetails: '',
    amount: '',
    paymentMode: '',
    PaymentModeOther: '',
    transactionDetails: '', // <-- New field for transaction details
    clientEmail: '',
    invoiceNumber: '',
    receiptGeneratedBy: '',
    clientState: 'West Bengal', // Default state
    clientPinCode: '',
    proformaInvoiceDB_id:'',//ProformaInvoiceDB_ID
    otp: '',
    sendMailToClient: '',
    toAccount: '', // For financial data
    mainHeader: '' // For financial data
  });

  // Set dummy data on component mount (keep paymentDate as today for localhost)--REMOVED on 04/08/205
  
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [paymentSummary, setPaymentSummary] = useState(null);

  // Fetch payment summary when modal opens or proformaInvoiceNo changes
  useEffect(() => {
    if (rowData) {
      console.log('Row data received:', rowData);
      setFormData((prev) => ({
        ...prev,
        clientId: rowData.clientId || "",
        clientName: rowData.clientName || "",
        clientAddress: rowData.clientAddress || "",
        clientPinCode: rowData.clientPinCode || "",
        clientMobile: rowData.clientMobile || rowData.clientMobile || "",
        clientEmail: rowData["Client clientEmail"] || rowData.clientEmail || "",
        invoiceNumber: rowData.invoiceNumber || "",
        proformaInvoiceDB_id:rowData._id
      }));
    };
    if (show) {
      const proformaInvoiceNo = rowData?.invoiceNumber || '';
      if (proformaInvoiceNo) {
        setSummaryLoading(true);
        setSummaryError('');
        fetch(
          `${config.MernBaseURL}/paymentReceipt/getAllByInvoiceNumber?invoiceNumber=${rowData?.invoiceNumber}`
        )
          .then((res) => res.json())
          .then((data) => {
            console.log('Payment summary data:', data);
            setPaymentSummary(data);
            setSummaryLoading(false);
          })
          .catch((err) => {
            setSummaryError('Failed to load payment summary');
            setSummaryLoading(false);
          });
      } else {
        setPaymentSummary(null);
      }
    };
  }, [show, rowData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset other field if not selecting Others
      ...(name === 'receiptGeneratedBy' && value !== 'Others' ? { ReceiptGeneratedByOther: '' } : {}),
      ...(name === 'paymentMode' && value !== 'Others' ? { PaymentModeOther: '' } : {}),
      // Auto-select "CASH FOR TD" when Cash or Others is selected
      ...(name === 'paymentMode' && (value === 'Cash' || value === 'Others') ? { toAccount: 'CASH FOR TD' } : {}),
    }));
  };

  const handleClientIdChange = (e) => {
    let val = e.target.value.replace(/^Sc/, '');
    val = val.replace(/\D/g, '');
    val = val ? `Sc${val}` : '';
    setFormData((prev) => ({
      ...prev,
      clientId: val,
    }));
  };

  
  const generateReceiptNo = () => {
    const timestamp = Date.now().toString();
    return `REC${timestamp.slice(-8)}`;
  };
  
  const handleSubmit_MERN = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");
    formData.receiptNo = generateReceiptNo();
    formData.paymentMode = formData.paymentMode === 'Others' ? formData.PaymentModeOther : formData.paymentMode;
    formData.receiptGeneratedBy = formData.receiptGeneratedBy === 'Others' ? formData.ReceiptGeneratedByOther : formData.receiptGeneratedBy;

    // Prepare promises array
    const promises = [];

    // Always call payment receipt API
    promises.push(
      axios.post(
        `${config.MernBaseURL}/paymentReceipt/create`,
        { ...formData, formType: 'pr' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
          },
          responseType: 'blob'
        }
      )
    );

    // Call financial data API for all payment modes (including Cash and Others)
    const paymentMode = formData.paymentMode === 'Others' ? formData.PaymentModeOther : formData.paymentMode;
    if (true) { // Allow all payment modes
      const currentDate = new Date();
      const financialData = {
        code: formData.clientId,
        date: formData.paymentDate,
        fromAccount: "NA",
        toAccount: formData.toAccount,
        cd: "C",
        mainHeader: formData.mainHeader,
        subHeader: formData.mainHeader,
        amount: Number(formData.amount),
        generatedBy: `${formData.receiptGeneratedBy} Added from Payment Receipt`,
        generatedAt: currentDate.toISOString(),
        isUpdated: false,
        updatedBy: "",
        updatedAt: "",
        isDeleted: false,
        deletedBy: "",
        deletedAt: ""
      };

      promises.push(
        axios.post(
          `${config.MernBaseURL}/financialData/add`,
          financialData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      );
    }

    // Execute API calls in parallel
    await Promise.all(promises)
      .then((responses) => {
        updateInvoiceStatus(formData?.proformaInvoiceDB_id,'active');//Status Update proforma Invoice DB id
        const blob = responses[0].data;
        const fileURL = window.URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
        setStatus(`✅ Success: Payment Receipt Created${responses.length > 1 ? ' and Financial Data Added' : ''}`);
      })
      .catch((error) => {
        console.error("Error:", error);
        setStatus(`❌ Error: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => {
          resetForm();
          handleClose();
        }, 2200);
      });
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      paymentDate: getTodayDate(),
      clientName: '',
      clientAddress: '',
      clientMobile: '',
      receiptNo: '',
      paymentDetails: '',
      amount: '',
      paymentMode: '',
      PaymentModeOther: '',
      transactionDetails: '', // <-- Reset new field
      clientEmail: '',
      invoiceNumber: '',
      receiptGeneratedBy: '',
      ReceiptGeneratedByOther: '',
      clientState: 'West Bengal',
      clientPinCode: '',
      otp: '',
      sendMailToClient: '',
      toAccount: '',
      mainHeader: ''
    });
    setStatus('');
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Payment Receipt Generation</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ position: 'relative' }}>
        {/* Loader overlay */}
        {summaryLoading && (
          <div
            style={{
              position: 'absolute',
              zIndex: 10,
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {/* Payment Summary Table */}
        <div className="mb-4">
          <h5 className="text-primary">Previous Payment Details</h5>
          {summaryLoading && <div>Loading payment summary...</div>}
          {summaryError && <div className="text-danger">{summaryError}</div>}
          {paymentSummary?.data.length > 0 ? (
            <div>
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Receipt No</th>
                    <th>amount</th>
                    <th>Payment Mode</th>
                    <th>Payment Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSummary.data.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.paymentDate}</td>
                      <td>{row.receiptNo}</td>
                      <td>{row.amount}</td>
                      <td>{row.paymentMode}</td>
                      <td>{row.paymentDetails}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="fw-bold text-end">
                Total Payment Done: <span className="text-success">₹{Number(paymentSummary.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="fw-bold text-end">
                Total Invoice amount: <span className="text-primary">
                  ₹{rowData?.TotalInvoiceAmoutCalculated ? Number(rowData.TotalInvoiceAmoutCalculated).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="fw-bold text-end">
                Total amount Due: <span className="text-danger">
                  ₹{rowData?.TotalInvoiceAmoutCalculated
                    ? (Number(rowData.TotalInvoiceAmoutCalculated) - Number(paymentSummary.totalAmount || 0)).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          ) : (
            !summaryLoading && <div className="text-muted">No previous payments found.</div>
          )}
        </div>
        {isLoading && (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {!isLoading && !status && (
          <Form className="gx-3 gy-2 align-items-center payment-receipt-form" onSubmit={handleSubmit_MERN}>
            <div className="row">
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="clientId">
                  Client ID
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-person-badge"></i>
                  </span>
                  <input
                    type="text"
                    name="clientId"
                    className="form-control border-0 payment-input"
                    id="clientId"
                    placeholder="Example: Sc1044"
                    autoComplete="off"
                    value={formData.clientId}
                    onChange={handleClientIdChange}
                    required
                    disabled
                  />
                </div>
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="invoiceNumber">
                  Proforma Invoice No
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-file-earmark-text"></i>
                  </span>
                  <input
                    type="text"
                    name="invoiceNumber"
                    className="form-control border-0 payment-input"
                    id="invoiceNumber"
                    placeholder="Auto Fetch from Proforma Invoice"
                    value={formData.invoiceNumber}
                    required disabled
                  />
                </div>
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="clientName">
                  Client Name
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="clientName"
                    className="form-control border-0 payment-input"
                    id="clientName"
                    placeholder="Example: John Doe"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="paymentDate">
                  Payment Date
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-calendar-date"></i>
                  </span>
                  <input
                    type="date"
                    name="paymentDate"
                    className="form-control border-0 payment-input"
                    id="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="clientAddress">
                  Client Address
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                  <input
                    type="text"
                    name="clientAddress"
                    className="form-control border-0 payment-input"
                    id="clientAddress"
                    placeholder="Example: 123 Main St, Mumbai"
                    value={formData.clientAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* clientState (Disabled) */}
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="clientState">
                  State
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-flag"></i>
                  </span>
                  <input
                    type="text"
                    name="clientState"
                    className="form-control border-0 payment-input"
                    id="clientState"
                    value="West Bengal"
                    disabled
                  />
                </div>
              </div>

              {/* PIN (not mandatory) */}
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="clientPinCode">
                  PIN Code
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-123"></i>
                  </span>
                  <input
                    type="text"
                    name="clientPinCode"
                    className="form-control border-0 payment-input"
                    id="clientPinCode"
                    placeholder="Example: 700001"
                    value={formData.clientPinCode || ''}
                    onChange={handleChange}
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="clientMobile">
                  Client Mobile
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="text"
                    name="clientMobile"
                    className="form-control border-0 payment-input"
                    id="clientMobile"
                    placeholder="Example: +91-9876543210"
                    value={formData.clientMobile}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="clientEmail">
                  Client Email
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="clientEmail"
                    className="form-control border-0 payment-input"
                    id="clientEmail"
                    placeholder="john@example.com"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="paymentDetails">
                  Payment Details
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-info-circle"></i>
                  </span>
                  <input
                    type="text"
                    name="paymentDetails"
                    className="form-control border-0 payment-input"
                    id="paymentDetails"
                    placeholder="Example: Advance Payment for Solar System"
                    value={formData.paymentDetails}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="amount">
                  amount
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-currency-rupee"></i>
                  </span>
                  <input
                    type="number"
                    name="amount"
                    className="form-control border-0 payment-input"
                    id="amount"
                    placeholder="Example: 5000"
                    min="1"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="paymentMode">
                  Payment Mode
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-credit-card"></i>
                  </span>
                  <select
                    className="form-select border-0 payment-input"
                    id="paymentMode"
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose...</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NEFT">NEFT</option>
                    <option value="Cash">Cash</option>
                    <option value="Others">Other</option>
                  </select>
                </div>
                {formData.paymentMode === 'Others' && (
                  <input
                    type="text"
                    className="form-control mt-2 border-0 payment-input"
                    name="PaymentModeOther"
                    placeholder="Payment Details Amount, Ac Number, etc."
                    value={formData.PaymentModeOther}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>
            </div>

            {/* NEW TRANSACTION DETAILS FIELD */}
            <div className="row">
              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="transactionDetails">
                  Transaction Details
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-receipt"></i>
                  </span>
                  <input
                    type="text"
                    name="transactionDetails"
                    className="form-control border-0 payment-input"
                    id="transactionDetails"
                    placeholder="Tnx Id, Acc No, Chq No etc"
                    value={formData.transactionDetails}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Conditional To Account Dropdown */}
              {formData.paymentMode && (
                <div className="col-sm-6 col-md-4 mb-3">
                  <label className="form-label fw-semibold text-primary" htmlFor="toAccount">
                    To Account
                  </label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-bank"></i>
                    </span>
                    <select
                      className="form-select border-0 payment-input"
                      id="toAccount"
                      name="toAccount"
                      value={formData.toAccount}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose...</option>
                      <option value="NA">NA</option>
                      <option value="HDFC CREDIT CARD">HDFC CREDIT CARD</option>
                      <option value="INDUSLND BANK CREDIT CARD">INDUSLND BANK CREDIT CARD</option>
                      <option value="PAYTM">PAYTM</option>
                      <option value="CASH FOR TD">CASH FOR TD</option>
                      <option value="SBI SA">SBI SA</option>
                      <option value="SBI SA PPF">SBI SA PPF</option>
                      <option value="SBI SA CREDIT CARD">SBI SA CREDIT CARD</option>
                      <option value="HDFC HOME LOAN">HDFC HOME LOAN</option>
                      <option value="HDFC HOME LOAN INSURANCE">HDFC HOME LOAN INSURANCE</option>
                      <option value="SBI CA">SBI CA</option>
                      <option value="PNB SA">PNB SA</option>
                      <option value="PNB APY">PNB APY</option>
                      <option value="PNB SSA">PNB SSA</option>
                      <option value="LIC 3215">LIC 3215</option>
                      <option value="LIC 7000">LIC 7000</option>
                      <option value="ICICI SA">ICICI SA</option>
                      <option value="RUPA CA">RUPA CA</option>
                      <option value="C/A FD-250000">C/A FD-250000</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional Main Header Dropdown */}
              {formData.paymentMode && (
                <div className="col-sm-6 col-md-4 mb-3">
                  <label className="form-label fw-semibold text-primary" htmlFor="mainHeader">
                    Main Header
                  </label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-folder"></i>
                    </span>
                    <select
                      className="form-select border-0 payment-input"
                      id="mainHeader"
                      name="mainHeader"
                      value={formData.mainHeader}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose...</option>
                      <option value="PAYMENT AGAINST SOLAR INSTALLATION">PAYMENT AGAINST SOLAR INSTALLATION</option>
                      <option value="PAYMENT AGAINST CONSULTANCY">PAYMENT AGAINST CONSULTANCY</option>
                      <option value="PAYMENT AGAINST CIVIL MATTERS">PAYMENT AGAINST CIVIL MATTERS</option>
                      <option value="CASH DEPOSIT">CASH DEPOSIT</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="col-sm-6 col-md-4 mb-3">
                <label className="form-label fw-semibold text-primary" htmlFor="receiptGeneratedBy">
                  Receipt Generated By
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-person-check"></i>
                  </span>
                  <select
                    className="form-select border-0 payment-input"
                    id="receiptGeneratedBy"
                    name="receiptGeneratedBy"
                    value={formData.receiptGeneratedBy}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose...</option>
                    <option value="Dwipayan">Dwipayan</option>
                    <option value="Sourav">Sourav</option>
                    <option value="Web Admin">Web Admin</option>
                    <option value="Others">Other</option>
                  </select>
                </div>
                {formData.receiptGeneratedBy === 'Others' && (
                  <input
                    type="text"
                    className="form-control mt-2 border-0 payment-input"
                    name="ReceiptGeneratedByOther"
                    placeholder="Enter name"
                    value={formData.ReceiptGeneratedByOther}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">OTP</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-shield-lock"></i>
                    </span>
                    <Form.Control
                      id="otp"
                      type="password"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      className="border-0"
                      required
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-sm-6 col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Send Mail to Client</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <Form.Select
                      id="sendMailToClient"
                      name="sendMailToClient"
                      value={formData.sendMailToClient || ''}
                      onChange={handleChange}
                      className="border-0"
                      required
                    >
                      <option value="">Choose...</option>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  resetForm();
                  handleClose();
                }}
              >
                Close
              </Button>
              <Button type="submit" className="btn btn-primary">
                Generate Payment Receipt
              </Button>
            </div>
          </Form>
        )}
        {status && (
          <div className="text-center mt-3">
            <p className={status.startsWith('✅') || status.startsWith('⚠️') ? 'text-success' : 'text-danger'}>{status}</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentReceipt;