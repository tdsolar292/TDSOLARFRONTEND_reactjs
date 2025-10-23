import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../../config';
import axios from 'axios';
import { useAuth } from '../../auth';
import './AddFinancialDataModal.css';
import financialReportConfig from './financialReportConfig';

const AddFinancialDataModal = ({ editData, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = !!editData;
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    codeType: '',
    codeNumber: '',
    fromAccount: '',
    toAccount: '',
    cd: '',
    mainHeader: '',
    subHeader: '',
    amount: ''
  });

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      // Split code into type and number if exists
      const codeMatch = editData.code?.match(/^([A-Z\s]+)(\d*)$/);
      setFormData({
        date: editData.date || new Date().toISOString().split('T')[0],
        codeType: codeMatch?.[1]?.trim() || '',
        codeNumber: codeMatch?.[2] || '',
        fromAccount: editData.fromAccount || '',
        toAccount: editData.toAccount || '',
        cd: editData.cd || '',
        mainHeader: editData.mainHeader || '',
        subHeader: editData.subHeader || '',
        amount: editData.amount || ''
      });
    }
  }, [editData]);

  const codeTypes = (financialReportConfig?.codeTypes?.length ? financialReportConfig.codeTypes : []);

  const accountNames = (financialReportConfig?.accountNames?.length ? financialReportConfig.accountNames : []);

  const cdOptions = (financialReportConfig?.creditDebitOptions?.length ? financialReportConfig.creditDebitOptions : []);

  // Dynamic main header options based on cd selection
  const getMainHeaderOptions = () => {
    if (!formData.cd) return [];
    if (formData.cd === 'D') return financialReportConfig?.mainHeadersDebit || [];
    if (formData.cd === 'C') return financialReportConfig?.mainHeadersCredit || [];
    return [];
  };

  const mainHeaderOptions = getMainHeaderOptions();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        code: formData.codeType || formData.codeNumber ? `${formData.codeType}${formData.codeNumber}` : '',
        date: formData.date,
        fromAccount: formData.fromAccount,
        toAccount: formData.toAccount,
        cd: formData.cd,
        mainHeader: formData.mainHeader,
        subHeader: formData.subHeader,
        amount: parseFloat(formData.amount)
      };

      let url, res;
      
      if (isEditMode) {
        // Update existing record with tracking
        url = `${config.MernBaseURL}/financialData/update/${editData._id}`;
        payload.updatedBy = user?.username;
        payload.updatedAt = new Date().toISOString().split('T')[0];
        payload.isUpdated = true;
        res = await axios.put(url, payload, { headers: { "Content-Type": "application/json" } });
      } else {
        // Add new record
        url = `${config.MernBaseURL}/financialData/add`;
        payload.generatedBy = user?.username;
        payload.generatedAt = new Date().toISOString().split('T')[0];
        res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
      }

      if (res?.data) {
        if (onSuccess) onSuccess(payload);
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'}. Please try again.`);
      console.error(`${isEditMode ? 'Update' : 'Add'} FinancialData submit error`, err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Financial Data' : 'Add Financial Data'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Code Type</Form.Label>
              <Form.Select
                name="codeType"
                value={formData.codeType}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {codeTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Code Number</Form.Label>
              <Form.Control
                type="text"
                name="codeNumber"
                placeholder="Enter code number"
                value={formData.codeNumber}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">From Account</Form.Label>
              <Form.Select
                name="fromAccount"
                value={formData.fromAccount}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {accountNames.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">To Account</Form.Label>
              <Form.Select
                name="toAccount"
                value={formData.toAccount}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {accountNames.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Credit/Debit</Form.Label>
              <Form.Select
                name="cd"
                value={formData.cd}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {cdOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Main Header</Form.Label>
              <Form.Select
                name="mainHeader"
                value={formData.mainHeader}
                onChange={handleChange}
                required
                disabled={!formData.cd}
              >
                <option value="">
                  {!formData.cd ? 'Select C/D first...' : 'Choose...'}
                </option>
                {mainHeaderOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
              {!formData.cd && (
                <small className="text-muted">
                  Please select Credit/Debit first to see main header options
                </small>
              )}
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Amount</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                name="amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="col-12 mb-3">
              <Form.Label className="fw-semibold text-primary">Sub Header (Description)</Form.Label>
              <Form.Control
                type="text"
                name="subHeader"
                placeholder="Enter sub header description"
                value={formData.subHeader}
                onChange={handleChange}
              />
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {isEditMode ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            isEditMode ? 'Update' : 'Submit'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFinancialDataModal;
