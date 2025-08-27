import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import Spinner from 'react-bootstrap/Spinner';
import './RoleProtectedRoute.css';

const RoleProtectedRoute = ({ children, requiredPermission = 'canAccessFinancialReports' }) => {
  const { isAuthenticated, loading, user, canAccessFinancialReports } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has permission to access Financial Reports
  if (requiredPermission === 'canAccessFinancialReports' && !canAccessFinancialReports()) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <div className="access-denied-icon">
            <i className="bi bi-lock-fill"></i>
          </div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access Financial Reports.</p>
          <p className="user-info">
            Logged in as: <strong>{user?.name || user?.username}</strong> ({user?.role})
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            <i className="bi bi-arrow-left"></i> Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleProtectedRoute;
