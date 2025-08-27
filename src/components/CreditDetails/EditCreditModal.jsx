import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../../config';
import creditDetailsConfig from './creditDetailsConfig';

const EditCreditModal = ({ show, handleClose, creditData, fetchData }) => {
  const [formData, setFormData] = useState({
    action: 'edit',
    Id: '', // Include ID in the formData
    acName: '',
    creditCode: '',
    head: '',
    amount: '',
    creditOn: '',
    details: '',
    transactionType: '',
    fileData: null,
    fileName: '',
  });
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Config-driven dropdowns with fallbacks
  const accountNames = (creditDetailsConfig?.accountNames?.length
    ? creditDetailsConfig.accountNames
    : [
        'HDFC CREDIT CARD',
        'INDUSLND BANK CREDIT CARD',
        'PAYTM',
        'CASH',
        'SBI SA',
        'SBI SA PPF',
        'SBI SA CREDIT CARD',
        'HDFC HOME LOAN',
        'HDFC HOME LOAN INSURANCE',
        'SBI CA',
        'PNB SA',
        'PNB APY',
        'PNB SSA',
        'LIC 3215',
        'LIC 7000',
        'ICICI SA',
        'RUPA CA',
        'C/A FD-250000',
      ]);

  const creditHeads = (creditDetailsConfig?.creditHeads?.length
    ? creditDetailsConfig.creditHeads
    : [
        'BLANK',
        'CASH',
        'Credit',
        'D/C',
        'DEPOSIT BY ME',
        'INTEREST',
        'INVESTMENT',
        'RECEIVED',
        'RECEIVED+G1370',
        'OTHERS',
      ]);

  useEffect(() => {
    if (creditData) {
      setFormData({
        action: 'edit',
        Id: creditData.Id || '', // Set the ID from creditData
        acName: creditData.acName || '',
        creditCode: creditData.creditCode || '',
        head: creditData.head || '',
        amount: creditData.amount || '',
        creditOn: creditData.crediteOn || '',
        details: creditData.details || '',
        transactionType: creditData.transactionType || '',
        fileData: null,
        fileName: creditData.attachment || ''
      });
    }
  }, [creditData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertFileToBase64(file);
      setFormData((prev) => ({
        ...prev,
        fileData: base64,
        fileName: file.name,
      }));
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');

    const formDataToSubmit = new URLSearchParams({
      ...formData,
      head: showOtherInput ? formData.head : formData.head,
    });

    try {
      const response = await fetch(
        config.creditTransactionsGoogleURL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: formDataToSubmit.toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setStatus(`✅ Success: ${result}`);
      setTimeout(() => {
        resetForm();
        handleClose();
        fetchData(); // Call fetchData to reload the data
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      action: 'edit',
      Id: '',
      acName: '',
      creditCode: '',
      head: '',
      amount: '',
      creditOn: '',
      details: '',
      transactionType: '',
      fileData: null,
      fileName: '',
    });
    setShowOtherInput(false);
    setStatus('');
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Edit Credit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading && (
          <div id="loader" className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {!isLoading && !status && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Account Name</Form.Label>
              <Form.Control
                as="select"
                name="acName"
                value={formData.acName}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Account Name</option>
                {accountNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Credit Code</Form.Label>
              <Form.Control
                type="text"
                name="creditCode"
                value={formData.creditCode}
                onChange={handleChange}
                placeholder="Enter credit code"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Head</Form.Label>
              <Form.Control
                as="select"
                name="head"
                value={formData.head}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value === "OTHERS") {
                    setShowOtherInput(true);
                  } else {
                    setShowOtherInput(false);
                  }
                }}
                required
              >
                <option value="" disabled>Credit Head</option>
                {creditHeads.map((head) => (
                  <option key={head} value={head}>{head}</option>
                ))}
              </Form.Control>
              {showOtherInput && (
                <Form.Control
                  type="text"
                  name="head"
                  value={formData.head === "OTHERS" ? "" : formData.head}
                  onChange={handleChange}
                  placeholder="Specify other head"
                  className="mt-2"
                  required
                />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Credit Date</Form.Label>
              <Form.Control
                type="date"
                name="creditOn"
                value={formData.creditOn}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Details</Form.Label>
              <Form.Control
                as="textarea"
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Enter details"
                rows={3}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Transaction Type</Form.Label>
              {Array.isArray(creditDetailsConfig?.transactionTypes) && creditDetailsConfig.transactionTypes.length > 0 ? (
                <Form.Select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Choose...</option>
                  {creditDetailsConfig.transactionTypes.map((t) => (
                    <option key={t.value || t} value={t.value || t}>{t.label || t}</option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="text"
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  placeholder="Enter transaction type (e.g., Bank Transfer)"
                  required
                />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Attachment</Form.Label>
              <Form.Control
                type="file"
                name="fileData"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.png"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        )}
        {status && (
          <div className="text-center mt-3">
            <p className={status.startsWith('✅') ? 'text-success' : 'text-danger'}>{status}</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditCreditModal;