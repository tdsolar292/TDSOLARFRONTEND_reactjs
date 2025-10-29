import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../auth';
import './FinancialOverview.css';

const AddPaymentModal = ({ show, onClose, onSuccess, type, editData = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    client: '',
    desc: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        client: editData.clientName || '',
        desc: editData.purpose || '',
        amount: editData.amount || '',
      });
    } else {
      setFormData({
        client: '',
        desc: '',
        amount: '',
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.client.trim()) {
      setError('Client name is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Valid amount is required');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = `${config.MernBaseURL}/financialSummary/add`;
      
      // Prepare the payload according to API structure
      const payload = {
        type: type, // 'in' or 'out'
        [type]: {
          client: formData.client.trim(),
          desc: formData.desc.trim() || '',
          amount: parseFloat(formData.amount),
          generatedBy: user?.username || user?.email || 'UNKNOWN'
        }
      };

      // If editing, include the _id
      if (editData && editData._id) {
        payload[type]._id = editData._id;
      }

      await axios.post(apiUrl, payload);
      
      // Success - close modal and refresh data
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving payment:', err);
      setError(err.response?.data?.message || 'Failed to save payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ client: '', desc: '', amount: '' });
      setError('');
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="payment-modal-overlay" onClick={handleClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h3>
            <i className={`bi ${type === 'in' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'}`}></i>
            {' '}
            {editData ? 'Edit' : 'Add'} Payment {type === 'in' ? 'IN' : 'OUT'}
          </h3>
          <button 
            type="button" 
            className="close-btn" 
            onClick={handleClose}
            disabled={loading}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="payment-modal-body">
          {error && (
            <div className="error-message">
              <i className="bi bi-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="client">
              Client Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              placeholder="Enter client name"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              placeholder="Enter description (optional)"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">
              Amount <span className="required">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              disabled={loading}
              required
            />
          </div>

          <div className="payment-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  {' '}Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i> {editData ? 'Update' : 'Add'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
