import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import config from '../../config';

const DeleteCreditModal = ({ show, handleClose, creditId, fetchData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleDelete = async () => {
    setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch(config.creditTransactionsGoogleURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({
          action: 'delete',
          Id: creditId,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setStatus(`✅ Success: ${result.message || 'Credit deleted successfully.'}`);
      setTimeout(() => {
        handleClose();
        fetchData(); // Refresh the data after deletion
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="sm">
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>Delete Credit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="text-center my-3">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <p>Are you sure you want to delete this credit entry?</p>
            {status && (
              <div className="text-center mt-3">
                <p className={status.startsWith('✅') ? 'text-success' : 'text-danger'}>{status}</p>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!isLoading && (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCreditModal;