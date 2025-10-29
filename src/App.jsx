import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";

import ProformaInvoice from "./components/ProformaInvoice/ProformaInvoice";
import { IoReceiptOutline } from "react-icons/io5";
import { TbFileInvoice } from "react-icons/tb";

import PaymentReceipt from "./components/PaymentReceipt/PaymentReceipt";
import CommercialPerforma from "./components/CommercialProformaInvoice/CommercialProformaInvoice";
import GSTInvoice from "./components/GSTInvoice/GSTInvoice"; // Import the GSTInvoice component

// Helper to get URL param
function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function App() {
  const [showPaymentReceiptModal, setShowPaymentReceiptModal] = useState(false);
  const [commercialPerforma, setCommercialPerforma] = useState(false);
  const [paymentRowData, setPaymentRowData] = useState(null);
  const [showGSTInvoiceModal, setShowGSTInvoiceModal] = useState(false);
  const [gstInvoiceRowData, setGstInvoiceRowData] = useState(null);
  const navigate = useNavigate(); // Initialize the navigate function

  // Define the handleViewFinancialReports function
  const handleViewFinancialReports = () => {
    navigate("/financial-reports");
  };
  const handleViewActiveClients = () => {
    navigate("/active-clients");
  };

  // Handler to open PaymentReceipt modal with row data
  const handleOpenPaymentReceipt = (rowData) => {
    setPaymentRowData(rowData);
    setShowPaymentReceiptModal(true);
  };

  // Handler to open GSTInvoice modal (you can pass rowData as needed)
  const handleOpenGSTInvoice = (rowData = null) => {
    setGstInvoiceRowData(rowData);
    setShowGSTInvoiceModal(true);
  };

  return (
    <div className="App">
      {/* Hero */}
      <div className="py-4">
        <div className="container px-lg-5">
          <div className="home-hero">
            <div>
              <h1 className="home-hero-title">A warm welcome!</h1>
              <p className="home-hero-subtitle">
                TD Solar CRM helps streamline your solar business with fast proformas,
                receipts and insightful financial reports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <section className="pt-2 pb-4">
        <div className="container px-lg-5">
          {/* Page Features */}
          <div className="row gx-lg-5 gy-4">
            <div
              className="col-lg-3 col-xxl-3"
              onClick={(e) => {
                e.preventDefault();
                handleViewActiveClients();
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="home-card h-100">
                <div className="home-card-body text-center">
                  <div className="home-card-icon">
                    <TbFileInvoice />
                  </div>
                  <h2 className="home-card-title">TD Proformas & Invoices</h2>
                </div>
              </div>
            </div>

            {/* Financial Reports card */}
            <div
              className="col-lg-3 col-xxl-3"
              onClick={(e) => {
                e.preventDefault();
                handleViewFinancialReports();
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="home-card h-100">
                <div className="home-card-body text-center">
                  <div className="home-card-icon alt">
                    <TbFileInvoice />
                  </div>
                  <h2 className="home-card-title">Financial Reports</h2>
                </div>
              </div>
            </div>

            {/* Placeholder for future cards */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <p className="m-0 text-center">
            Copyright © TD Solar 2025 · Designed & Maintained by emd.developer
          </p>
        </div>
      </footer>

      <PaymentReceipt
        show={showPaymentReceiptModal}
        handleClose={() => setShowPaymentReceiptModal(false)}
        rowData={paymentRowData}
      />
      <CommercialPerforma
        show={commercialPerforma}
        handleClose={() => setCommercialPerforma(false)}
      />
      <GSTInvoice
        show={showGSTInvoiceModal}
        handleClose={() => setShowGSTInvoiceModal(false)}
        rowData={gstInvoiceRowData}
      />
    </div>
  );
}

export default App;
