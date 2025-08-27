import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth';
import './Header.css'; // Create this CSS file for custom styles

const Header = () => {
  const { user, logout, canAccessFinancialReports } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark td-blue-bg py-0">
      <div className="container px-lg-5">
        <Link className="navbar-brand" to="/">
          <img src="/tslogo.png" className='active-clients-logo-spin' alt="logo" width="60" />
          CRM TD SOLAR
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarSupportedContent" 
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#!">About</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/credit-details">
                Credit App
              </Link>
            </li>
            {canAccessFinancialReports() && (
              <li className="nav-item">
                <Link className="nav-link" to="/financial-reports">
                  Financial Reports
                </Link>
              </li>
            )}
            <li className="nav-item">
              <a className="nav-link" href="#!">Contact</a>
            </li>
            <li className="nav-item dropdown">
                             <a 
                 className="nav-link dropdown-toggle" 
                 href="#!" 
                 role="button" 
                 data-bs-toggle="dropdown" 
                 aria-expanded="false"
               >
                 <i className="bi bi-person-circle"></i>
                 {user?.name || user?.username || 'User'}
               </a>
                              <ul className="dropdown-menu">
                  <li>
                    <div className="dropdown-item-text">
                      <small className="text-muted">Role: {user?.role}</small>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="#!">
                      <i className="bi bi-person"></i> Profile
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#!">
                      <i className="bi bi-gear"></i> Settings
                    </a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </li>
                </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;