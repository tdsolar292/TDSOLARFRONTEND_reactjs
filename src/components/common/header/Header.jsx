import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Create this CSS file for custom styles

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark td-blue-bg py-0">
      <div className="container px-lg-5">
        <Link className="navbar-brand" to="/">
          <img src="/tslogo.png" alt="logo" width="60" />
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
            <li className="nav-item">
              <a className="nav-link" href="#!">Contact</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;