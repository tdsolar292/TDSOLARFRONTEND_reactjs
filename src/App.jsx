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
  const [showProformaInvoiceModal, setshowProformaInvoiceModal] =
    useState(false);
  const [showPaymentReceiptModal, setShowPaymentReceiptModal] = useState(false);
  const [commercialPerforma, setCommercialPerforma] = useState(false);
  const [paymentRowData, setPaymentRowData] = useState(null);
  const [showGSTInvoiceModal, setShowGSTInvoiceModal] = useState(false);
  const [gstInvoiceRowData, setGstInvoiceRowData] = useState(null);
  const navigate = useNavigate(); // Initialize the navigate function

  // Define the handleViewCreditDetails function
  const handleViewCreditDetails = () => {
    navigate("/credit-details");
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
      {/* Header removed */}
      <div className="py-5">
        <div className="container px-lg-5">
          <div className="p-1 p-lg-1 bg-light rounded-3 td-box-shadow text-center">
            <div className="m-1 m-lg-1">
              <h6 className="display-6 fw-bold">A warm welcome!</h6>
              <p className="fs-6">
                TD Solar CRM can harness these efficient utilities to streamline
                your solar business management?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <section className="pt-4">
        <div className="container px-lg-5">
          {/* Page Features */}
          <div className="row gx-lg-5">
            <div
              className="col-lg-6 col-xxl-4 mb-5"
              onClick={() => setshowProformaInvoiceModal(true)}
              style={{ cursor: "pointer" }}
            >
              <div className="card td-box-shadow bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 td-box-shadow mb-2 mt-n4">
                    <i className="bi bi-cloud-download"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Domestic Proforma Invoice</h2>
                  <p className="mb-0">
                    Domestic Proforma invoice generation in TD Solar CRM creates
                    detailed, customizable quotes instantly.
                  </p>
                </div>
              </div>
            </div>
            {/** 
            <div
              className="col-lg-6 col-xxl-4 mb-5"
              onClick={(e) => {
                e.preventDefault();
                handleViewCreditDetails();
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="card td-box-shadow bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 td-box-shadow mb-2 mt-n4">
                    <i className="bi bi-card-heading"></i>
                  </div>
                  <h2 className="fs-4 fw-bold">Credit Transactions</h2>
                  <p className="mb-0">
                    Financial Transactions details for TD Solar, It helps to
                    track Credit Transactions instantly.
                  </p>
                </div>
              </div>
            </div>
            */}
            {/**
            <div
              className="col-lg-6 col-xxl-4 mb-5"
              onClick={() => setShowPaymentReceiptModal(true)}
              style={{ cursor: "pointer" }}
            >
              <div className="card td-box-shadow bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 td-box-shadow mb-2 mt-n4">
                    <IoReceiptOutline />
                  </div>
                  <h2 className="fs-4 fw-bold">Payment Receipt</h2>
                  <p className="mb-0">
                    Payment Receipt generation in TD Solar CRM creates detailed,
                    customizable receipts instantly.
                  </p>
                </div>
              </div>
            </div>
            */}
            <div
              className="col-lg-6 col-xxl-4 mb-5"
              onClick={() => setCommercialPerforma(true)}
              style={{ cursor: "pointer" }}
            >
              <div className="card td-box-shadow bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 td-box-shadow mb-2 mt-n4">
                     
                    <TbFileInvoice />
                  </div>
                  <h2 className="fs-4 fw-bold">Commercial Proforma Invoice</h2>
                  <p className="mb-0">
                    Commercial Proforma Invoice generation in TD Solar CRM
                    creates detailed, customizable receipts instantly.
                  </p>
                </div>
              </div>
            </div>
            {/** 
            {showTestCards && (
            <div
              className="col-lg-6 col-xxl-4 mb-5"
              onClick={() => handleOpenGSTInvoice()}
              style={{ cursor: "pointer" }}
            >
              <div className="card td-box-shadow bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 td-box-shadow mb-2 mt-n4">
                    <TbFileInvoice />
                  </div>
                  <h2 className="fs-4 fw-bold">Generate GST Invoice</h2>
                  <p className="mb-0">
                    Generate and view GST Invoice for your client.
                  </p>
                </div>
              </div>
            </div>)}
            */}
            <div
              className="col-lg-6 col-xxl-4 mb-5"
               onClick={(e) => {
                e.preventDefault();
                handleViewActiveClients();
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="card td-box-shadow bg-light border-0 h-100">
                <div className="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 td-box-shadow mb-2 mt-n4">
                    <TbFileInvoice />
                  </div>
                  <h2 className="fs-4 fw-bold">Active Clients</h2>
                  <p className="mb-0">
                    Active Clienet Details, Download Proforma Invoices, Generate Payment Receipts, Download GST Invoices.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Other cards */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 td-blue-bg">
        <div className="container">
          <p className="m-0 text-center text-white">
            Copyright &copy; TD Solar 2025 : Designed & Maintained By
            emd.developer
          </p>
        </div>
      </footer>

      
      {/* Proforma Invoice Modal */}
      <ProformaInvoice
        show={showProformaInvoiceModal}
        handleClose={() => setshowProformaInvoiceModal(false)}
      />
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
