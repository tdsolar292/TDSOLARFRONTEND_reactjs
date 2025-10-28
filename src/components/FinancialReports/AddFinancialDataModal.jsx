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
    throughBy: '',
    toAccount: '',
    cd: '',
    mainHeader: '',
    subHeader: '',
    amount: ''
  });

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      console.log('Edit Data received:', editData);
      
      // Split code into type and number if exists
      // Match pattern: any characters followed by optional digits at the end
      const codeMatch = editData.code?.match(/^(.+?)(\d*)$/);
      
      let codeType = '';
      let codeNumber = '';
      
      if (codeMatch) {
        const potentialType = codeMatch[1]?.trim() || '';
        codeNumber = codeMatch[2] || '';
        
        // Try to find exact match in config code types
        const matchedCodeType = financialReportConfig?.codeTypes?.find(
          ct => potentialType === ct.value || potentialType.startsWith(ct.value)
        );
        
        if (matchedCodeType) {
          codeType = matchedCodeType.value;
        } else {
          codeType = potentialType;
        }
      }
      
      const populatedFormData = {
        date: editData.date || new Date().toISOString().split('T')[0],
        codeType: codeType,
        codeNumber: codeNumber,
        fromAccount: editData.fromAccount || '',
        throughBy: editData.throughBy || '',
        toAccount: editData.toAccount || '',
        cd: editData.cd || '',
        mainHeader: editData.mainHeader || '',
        subHeader: editData.subHeader || '',
        amount: editData.amount || ''
      };
      
      console.log('Populated Form Data:', populatedFormData);
      setFormData(populatedFormData);
    }
  }, [editData]);

  // Get code types and ensure current value is included if in edit mode
  const codeTypes = React.useMemo(() => {
    const configTypes = financialReportConfig?.codeTypes?.length ? financialReportConfig.codeTypes : [];
    // If editing and codeType not in config, add it
    if (isEditMode && formData.codeType && !configTypes.find(ct => ct.value === formData.codeType)) {
      return [...configTypes, { value: formData.codeType, label: formData.codeType }];
    }
    return configTypes;
  }, [formData.codeType, isEditMode]);

  // Get account names and ensure current values are included if in edit mode
  const accountNames = React.useMemo(() => {
    const configAccounts = financialReportConfig?.accountNames?.length ? financialReportConfig.accountNames : [];
    const additionalAccounts = new Set();
    
    if (isEditMode) {
      if (formData.fromAccount && !configAccounts.includes(formData.fromAccount)) {
        additionalAccounts.add(formData.fromAccount);
      }
      if (formData.toAccount && !configAccounts.includes(formData.toAccount)) {
        additionalAccounts.add(formData.toAccount);
      }
    }
    
    return additionalAccounts.size > 0 
      ? [...configAccounts, ...Array.from(additionalAccounts)].sort()
      : configAccounts;
  }, [formData.fromAccount, formData.toAccount, isEditMode]);

  const cdOptions = (financialReportConfig?.creditDebitOptions?.length ? financialReportConfig.creditDebitOptions : []);

  // Dynamic main header options based on cd selection
  const getMainHeaderOptions = (cdValue) => {
    if (!cdValue) return [];
    let baseOptions = [];
    if (cdValue === 'D') baseOptions = financialReportConfig?.mainHeadersDebit || [];
    if (cdValue === 'C') baseOptions = financialReportConfig?.mainHeadersCredit || [];
    
    // If editing and mainHeader not in config, add it
    if (isEditMode && formData.mainHeader && !baseOptions.includes(formData.mainHeader)) {
      return [...baseOptions, formData.mainHeader].sort();
    }
    
    return baseOptions;
  };

  const mainHeaderOptions = getMainHeaderOptions(formData.cd);

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
        throughBy: formData.throughBy,
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
              <Form.Label className="fw-semibold text-primary">Through/By</Form.Label>
              <Form.Control
                type="text"
                name="throughBy"
                placeholder="Enter through/by"
                value={formData.throughBy}
                onChange={handleChange}
              />
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
