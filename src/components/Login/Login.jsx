import React, { useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { login, authenticateUser } = useAuth();

  // Digital clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time in IST
  const formatISTTime = (date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Authenticate user using the new system
    const userData = authenticateUser(username, password);
    
    if (userData) {
      // Call the login function from auth context
      login(userData);
      
      // Navigate to home page
      navigate("/");
    } else {
      setError("Invalid username or password");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const usersToShow = [
    {
      username: import.meta.env.VITE_DWIPAYAN_USERNAME,
      password: import.meta.env.VITE_DWIPAYAN_PASSWORD,
      role: import.meta.env.VITE_DWIPAYAN_ROLE
    },
    {
      username: import.meta.env.VITE_SOURAV_USERNAME,
      password: import.meta.env.VITE_SOURAV_PASSWORD,
      role: import.meta.env.VITE_SOURAV_ROLE
    },
    {
      username: import.meta.env.VITE_WEBADMIN_USERNAME,
      password: import.meta.env.VITE_WEBADMIN_PASSWORD,
      role: import.meta.env.VITE_WEBADMIN_ROLE
    }
  ].filter(u => u.username && u.password);

  return (
    <div>
    <div className="login-container">
      {/* Digital Clock */}
      <div className="login-digital-clock">
        <div className="clock-time">{formatISTTime(currentTime)}</div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="assets/tslogo.png" alt="Logo" className="logo-image active-clients-logo-spin" />
          </div>
          <h1 className="login-title">TD SOLAR CRM</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <i className="bi bi-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="input-group">
              <i className="bi bi-person input-icon"></i>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <i className="bi bi-lock input-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        {usersToShow.length > 0 && (
          <div className="login-footer">
            <p className="demo-credentials">
              <strong>Available Users (from .env):</strong><br />
              {usersToShow.map((u, idx) => (
                <span key={idx}>
                  • {u.username} / {u.password}{u.role ? ` (${u.role})` : ''}<br />
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
     {/* Copy Right */}
     <div className="login-copyright">
        © TD Solar 2025 · Designed & Maintained by emd.developer
      </div>
    </div>
    
  );
};

export default Login;
