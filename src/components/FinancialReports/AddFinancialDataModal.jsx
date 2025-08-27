import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../../config';
import axios from 'axios';
import { useAuth } from '../../auth';
import './AddFinancialDataModal.css';
import financialReportConfig from './financialReportConfig';

const AddFinancialDataModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    transactionType: '',
    accountMode: '',
    headOfAccount: '',
    codePrefix: 'Sc',
    codeValue: '',
    description: '',
    amount: ''
  });

  const transactionTypes = (financialReportConfig?.transactionTypes?.length ? financialReportConfig.transactionTypes : []);

  const accountModes = (financialReportConfig?.baseAccountNames?.length ? financialReportConfig.baseAccountNames : []);

  const headOfAccountOptions = (financialReportConfig?.heads?.length ? financialReportConfig.heads : []);

  const codePrefixes = (financialReportConfig?.codePrefixes?.length ? financialReportConfig.codePrefixes : []);

  // Prefixes that accept free text and are saved as PREFIX-<text>
  const freeTextPrefixes = ['PER', 'COM'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'codeValue') {
      if (freeTextPrefixes.includes(formData.codePrefix)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      } else {
        const numericValue = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePrefixChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      codePrefix: e.target.value,
      codeValue: '' 
    }));
  };

  const buildCodeValue = () => {
    if (!formData.codeValue) return '';
    if (freeTextPrefixes.includes(formData.codePrefix)) {
      return `${formData.codePrefix}-${formData.codeValue}`;
    }
    return `${formData.codePrefix}${formData.codeValue}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        date: formData.date,
        transactionType: formData.transactionType,
        accountMode: formData.accountMode,
        headOfAccount: formData.headOfAccount,
        code: buildCodeValue(),
        description: formData.description,
        amount: parseFloat(formData.amount),
        generatedBy: user?.username
      };

      const url = `${config.MernBaseURL}/financialData/add`;
      const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
      if (res?.data) {
        if (onSuccess) onSuccess(payload);
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit. Please try again.");
      console.error("AddFinancialData submit error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Financial Data</Modal.Title>
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
              <Form.Label className="fw-semibold text-primary">Trans. Type</Form.Label>
              <Form.Select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {transactionTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Base Acc Name</Form.Label>
              <Form.Select
                name="accountMode"
                value={formData.accountMode}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {accountModes.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Head of Account</Form.Label>
              <Form.Select
                name="headOfAccount"
                value={formData.headOfAccount}
                onChange={handleChange}
                required
              >
                <option value="">Choose...</option>
                {headOfAccountOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            </div>
            
            <div className="col-sm-6 col-md-4 mb-3">
              <Form.Label className="fw-semibold text-primary">Code / Party</Form.Label>
              <div className="input-group">
                <Form.Select
                  name="codePrefix"
                  value={formData.codePrefix}
                  onChange={handlePrefixChange}
                  style={{ maxWidth: '80px' }}
                >
                  {codePrefixes.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="text"
                  name="codeValue"
                  placeholder={freeTextPrefixes.includes(formData.codePrefix) ? 'Enter name (e.g., Dwipayan)' : 'Only numbers allowed'}
                  value={formData.codeValue}
                  onChange={handleChange}
                />
              </div>
              <small className="text-muted">
                {freeTextPrefixes.includes(formData.codePrefix)
                  ? `Saved as ${formData.codePrefix}-<text>`
                  : `Example: ${formData.codePrefix}100023`}
              </small>
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
              <Form.Label className="fw-semibold text-primary">Description for Transaction</Form.Label>
              <Form.Control
                type="text"
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                required
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
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFinancialDataModal;
