import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import CreditDetails from './components/CreditDetails/CreditDetails';
import Header from './components/common/header/Header';
import './index.css';
import ActiveClients from './components/ActiveClients/ActiveClients';
import FinancialReports from './components/FinancialReports/FinancialReports';
import Login from './components/Login/Login';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute/RoleProtectedRoute';
import { AuthProvider } from './auth';

// Define routes
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <>
          <Header />
          <App />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/credit-details",
    element: (
      <ProtectedRoute>
        <>
          <Header />
          <CreditDetails />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/active-clients",
    element: (
      <ProtectedRoute>
        <>
          <Header />
          <ActiveClients />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/financial-reports",
    element: (
      <RoleProtectedRoute>
        <>
          <Header />
          <FinancialReports />
        </>
      </RoleProtectedRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);