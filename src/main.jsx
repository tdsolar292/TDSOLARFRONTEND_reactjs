import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import CreditDetails from './components/CreditDetails/CreditDetails';
import Header from './components/common/header/Header';
import './index.css';
import ActiveClients from './components/ActiveClients/ActiveClients';

// Define routes
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <App />
      </>
    ),
  },
  {
    path: "/credit-details",
    element: (
      <>
        <Header />
        <CreditDetails />
      </>
    ),
  },
  {
    path: "/active-clients",
    element: (
      <>
        <Header />
        <ActiveClients />
      </>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);