import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../../config';

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
                <option value="HDFC CREDIT CARD">HDFC CREDIT CARD</option>
                <option value="INDUSLND BANK CREDIT CARD">INDUSLND BANK CREDIT CARD</option>
                <option value="PAYTM">PAYTM</option>
                <option value="CASH">CASH</option>
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
                <option value="BLANK">BLANK</option>
                <option value="CASH">CASH</option>
                <option value="Credit">Credit</option>
                <option value="D/C">D/C</option>
                <option value="DEPOSIT BY ME">DEPOSIT BY ME</option>
                <option value="INTEREST">INTEREST</option>
                <option value="INVESTMENT">INVESTMENT</option>
                <option value="RECEIVED">RECEIVED</option>
                <option value="RECEIVED+G1370">RECEIVED+G1370</option>
                <option value="OTHERS">OTHERS</option>
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
              <Form.Control
                type="text"
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                placeholder="Enter transaction type (e.g., Bank Transfer)"
                required
              />
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