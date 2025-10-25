import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define users with their credentials and roles from environment variables
const USERS = {
  dwipayan: {
    username: import.meta.env.VITE_DWIPAYAN_USERNAME,
    password: import.meta.env.VITE_DWIPAYAN_PASSWORD,
    role: import.meta.env.VITE_DWIPAYAN_ROLE,
    name: import.meta.env.VITE_DWIPAYAN_NAME,
    canAccessFinancialReports: import.meta.env.VITE_DWIPAYAN_FINANCIAL_ACCESS === 'true'
  },
  sourav: {
    username: import.meta.env.VITE_SOURAV_USERNAME,
    password: import.meta.env.VITE_SOURAV_PASSWORD,
    role: import.meta.env.VITE_SOURAV_ROLE,
    name: import.meta.env.VITE_SOURAV_NAME,
    canAccessFinancialReports: import.meta.env.VITE_SOURAV_FINANCIAL_ACCESS === 'true'
  },
  webadmin: {
    username: import.meta.env.VITE_WEBADMIN_USERNAME,
    password: import.meta.env.VITE_WEBADMIN_PASSWORD,
    role: import.meta.env.VITE_WEBADMIN_ROLE,
    name: import.meta.env.VITE_WEBADMIN_NAME,
    canAccessFinancialReports: import.meta.env.VITE_WEBADMIN_FINANCIAL_ACCESS === 'true'
  },
  sk: {
    username: import.meta.env.VITE_SK_USERNAME,
    password: import.meta.env.VITE_SK_PASSWORD,
    role: import.meta.env.VITE_SK_ROLE,
    name: import.meta.env.VITE_SK_NAME,
    canAccessFinancialReports: import.meta.env.VITE_SK_FINANCIAL_ACCESS === 'true'
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('isAuthenticated');
      const userData = localStorage.getItem('user');
      
      if (authToken === 'true' && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
      
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const authenticateUser = (username, password) => {
    // Find user by matching the actual username value from env variables
    const userEntry = Object.values(USERS).find(
      u => u.username === username && u.password === password
    );
    
    if (userEntry) {
      return {
        username: userEntry.username,
        name: userEntry.name,
        role: userEntry.role,
        canAccessFinancialReports: userEntry.canAccessFinancialReports
      };
    }
    return null;
  };

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  const canAccessFinancialReports = () => {
    return user?.canAccessFinancialReports || false;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    authenticateUser,
    canAccessFinancialReports
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
