import React, { useState, useEffect } from "react";
import "./ActiveClients.css";
import Spinner from "react-bootstrap/Spinner";
import config from "../../config";
import PaymentReceipt from "../PaymentReceipt/PaymentReceipt";
import GSTInvoice from "../GSTInvoice/GSTInvoice";
import axios from "axios";

const searchOptions = [
  { value: "clientId", label: "Client ID" },
  { value: "invoiceNumber", label: "Proforma Invoice Number" },
  { value: "clientName", label: "Client Name" },
  { value: "clientEmail", label: "Client Email" },
  { value: "clientMobile", label: "Client Mobile" },
  { value: "id", label: "DB_ID" }
];

const cardDataTemplate = [
  {
    value: 0,
    label: "Total Proforma Generated",
    icon: "bi-archive",
    color: "var(--warning)",
    footerBg: "var(--warning)",
    footerText: "X Total Proforma Generated",
    footerIcon: "bi-graph-up"
  },
  {
    value: 0,
    label: "Active Clients",
    icon: "bi-calendar2-week",
    color: "var(--primary)",
    footerBg: "var(--primary)",
    footerText: "X Active Clients In Dashboard",
    footerIcon: "bi-graph-up"
  },
  {
    value: 0,
    label: "Projects Completed",
    icon: "bi-file-earmark-text",
    color: "var(--warning)",
    footerBg: "#f8a3a5",
    footerText: "X Total Projects Completed",
    footerIcon: "bi-graph-up"
  },
  {
    value: 0,
    label: "Total Proforma Amount",
    icon: "bi-currency-rupee",
    color: "var(--info)",
    footerBg: "var(--info)",
    footerText: "Total Proforma Amount",
    footerIcon: "bi-graph-up"
  },
  {
    value: 0,
    label: "Total Payment Received",
    icon: "bi-currency-rupee",
    color: "var(--success)",
    footerBg: "var(--success)",
    footerText: "X Total Payment Received",
    footerIcon: "bi-graph-up"
  }
];

const tableHeaders = [
  "invoiceNumber",
  "clientId",
  "clientName",
  "clientMobile",
  "clientEmail",
  "TotalInvoiceAmoutCalculated",
  "createdAt",
  "Download",
  "Payment"
];

// You can change these display names as needed for the table columns
const tableDisplayHeaders = [
  "Invoice No.",
  "Client ID",
  "Name",
  "Mobile",
  "Email",
  "Total Amount",
  "Date",
  "Download",
  "Payment"
];

const ActiveClientsPage = () => {
  const [searchBy, setSearchBy] = useState("clientId");
  const [searchText, setSearchText] = useState("");
  const [filterBy, setfilterBy] = useState("");
  const [cardData, setCardData] = useState(cardDataTemplate);
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPaymentReceipt, setShowPaymentReceipt] = useState(false);
  const [paymentRowData, setPaymentRowData] = useState(null);
  const [showGSTInvoice, setShowGSTInvoice] = useState(false);
  const [gstInvoiceRowData, setGstInvoiceRowData] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [showAmounts, setShowAmounts] = useState(false); // NEW

  // Digital clock state
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data from API
  const fetchData = async (pageNum = 1, searchByParam = searchBy, searchTextParam = searchText, filterBy) => {
    setLoading(true);
    let url =`${config.MernBaseURL}/proformainvoice/getAll?page=${pageNum}&pageSize=${pageSize}`;
    if (searchTextParam && searchByParam) {
      url = `${config.MernBaseURL}/proformainvoice/search?page=${pageNum}&pageSize=${pageSize}&${searchByParam}=${searchTextParam}`;
    }
    else if (filterBy) {
      url = `${config.MernBaseURL}/proformainvoice/getAll?page=${pageNum}&pageSize=${pageSize}&status=${filterBy}`;
    }else{
      url = `${config.MernBaseURL}/proformainvoice/getAll?page=${pageNum}&pageSize=${pageSize}`;
    }
    try {
      const res = await fetch(url);
      const json = await res.json();
      setClients(json.data || []);
      setTotal(json.total || 0);
      setPage(json.page || 1);
      setTotalPages(json.totalPages || 1);

      // Update card data
      setCardData([
        { 
          ...cardDataTemplate[0], 
          value: json.totalProformaRecords || 0,
          footerText: `${json.totalProformaRecords || 0} Total Proforma Generated`
        },
        { 
          ...cardDataTemplate[1], 
          value: json.activeClient || 0,
          footerText: `${json.activeClient || 0} Total Active Clients In Dashboard`
        },
        ,
        { ...cardDataTemplate[2], 
          value: json.completedClientRecords || 0,
          footerText: `${json.completedClientRecords || 0} Total Projects Completed`
        },
        { ...cardDataTemplate[3], 
          value: json.totalProformaInvoicesAmount || 0,
          footerText: ` Total Proforma Amount`
        },
        { ...cardDataTemplate[4], 
          value: json.totalPaymentsReceieved || 0,
          footerText: ` Total Payment Received`
        }
      ]);
    } catch (err) {
      setClients([]);
      setTotal(0);
      setPage(1);
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1, searchBy, searchText, filterBy);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchData(newPage, searchBy, searchText, filterBy);
  };

  // Function handlers
  const handleDownload = async (id) => {
    setLoadingId(id);
    // Call the API to get proforma invoice details
     await axios
     .post(
       `${config.MernBaseURL}/proformainvoice/downloadDuplicateProformaInvoicePDF`,
       { id: id },
       {
         headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
         },
         responseType: 'blob' // <-- Add this line!
       }
     )
     .then((response) => {
        const blob = response.data; // response.data is already a Blob
        const fileURL = window.URL.createObjectURL(blob);

        // ✅ Open PDF in a new browser tab
        window.open(fileURL, '_blank');
     })
     .catch((error) => {
       console.error("Error:", error);
     })
     .finally(() => {
       setLoadingId(null);
     });
  };

  const handleOpenPaymentReceipt = (rowData) => {
    setPaymentRowData(rowData);
    setShowPaymentReceipt(true);
  };

  const handleOpenGSTInvoice = (rowData) => {
    setGstInvoiceRowData(rowData);
    setShowGSTInvoice(true);
  };

  // Handler for card click
  const handleCardClick = (card) => {
    if (
      card.label === "Total Proforma Amount" ||
      card.label === "Total Payment Received"
    ) {
      if (!showAmounts) {
        const code = window.prompt("Enter 4-digit code to view amount:");
        if (code === "9064") {
          setShowAmounts(true);
        } else {
          alert("Incorrect code.");
        }
      }
    } else if (card.label === "Total Proforma Generated") {
      setfilterBy("");
      fetchData(1, "", "", "");
    } else if (card.label === "Active Clients") {
      setfilterBy("active");
      fetchData(1, "", "", "active");
    } else if (card.label === "Projects Completed") {
      setfilterBy("completed");
      fetchData(1, "", "", "completed");
    }
  };

  return (
    
    <div className="container-fluid active-client-box active-clients-bg position-relative">
      {/* Digital Clock */}
      <div style={{position: 'absolute', top: 0, right: 30, marginTop: 6, marginRight: 16, fontSize: 14, color: '#2460e3', zIndex: 10, letterSpacing: 1}}>
        {now.toLocaleDateString()} {now.toLocaleTimeString()}
      </div>
      {/* Loader Overlay */}
      {loading && (
        <div className="loading-overlay position-fixed top-0 start-0 w-100 h-100" style={{zIndex: 9999}}>
          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            <div className="p-4 bg-white rounded-4 shadow-sm">
              <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
              <div className="mt-3 text-primary fw-semibold">Processing...</div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12 px-2 pt-sm-3 pt-md-1 px-md-4">
          {/* Top Bar */}
          <div className="active-clients-topbar">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
              {/* Title section */}
              <div className="d-flex align-items-center text-center text-md-start w-100 w-md-25 gap-3">
                <div className="position-relative">
                  <img
                    src="/tslogo.png"
                    alt="Logo"
                    className="active-clients-logo-spin"
                    style={{ width: 45, height: 45 }}
                  />
                  <div className="position-absolute top-0 start-100 translate-middle">
                  </div>
                </div>
                <div>
                  <h4 className="active-clients-title">TD Solar Clients Management</h4>
                  <div className="active-clients-subtitle">
                    Manage your active solar clients and track performance
                  </div>
                </div>
              </div>

              {/* Search section - 75% on desktop, 100% on mobile */}
              <div className="w-100 w-md-75">
                <form className="active-clients-search-row" onSubmit={handleSearch}>
                  <div className="active-clients-search-box">
                    <select
                      className="active-clients-select"
                      value={searchBy}
                      onChange={e => setSearchBy(e.target.value)}
                    >
                      {searchOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      className="active-clients-input"
                      placeholder={`🔍 Search by ${searchOptions.find(opt => opt.value === searchBy).label}...`}
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                    />
                    <button className="active-clients-search-btn" type="submit">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Cards Row */}
          <div className="active-clients-cards-scroll mb-4">
            <div className="d-flex flex-row flex-nowrap gap-3">
              {cardData.map((card, idx) => (
                <div
                  className="card shadow-sm border-0 h-100 d-sm-flex flex-column justify-content-between active-clients-card"
                  style={{
                    background: card.bg,
                    borderRadius: "14px",
                    overflow: "hidden"
                  }}
                  key={idx}
                  onClick={() => handleCardClick(card)} // CHANGED
                >
                  <div className="card-body pb-2">
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <div className="stat-value" style={{ color: card.color }}>
                          {(card.label === "Total Proforma Amount" || card.label === "Total Payment Received")
                            ? (showAmounts ? card.value : "****")
                            : card.value}
                        </div>
                        <div className="stat-label">{card.label}</div>
                      </div>
                      <i className={`bi ${card.icon} fs-2`} style={{ color: card.color }}></i>
                    </div>
                  </div>
                  <div
                    className="d-flex align-items-center justify-content-between px-3 py-2"
                    style={{
                      background: card.footerBg,
                      color: "#fff",
                      fontSize: 15,
                      borderBottomLeftRadius: "14px",
                      borderBottomRightRadius: "14px"
                    }}
                  >
                    <span>{card.footerText}</span>
                    <i className={`bi ${card.footerIcon}`}></i>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="active-clients-table table table-hover align-middle">
              <thead>
                <tr>
                  {tableDisplayHeaders.map((header, idx) => (
                    <th key={idx} className="text-nowrap text-center">
                      {header}
                    </th>
                  ))}
                  <th className="text-nowrap text-center">GST Invoice</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={tableHeaders.length + 1} className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length + 1} className="text-center">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  clients.map((client, idx) => {
                    let statusClass = "";
                    if (client.status === "active") {
                      statusClass = "row-status-active";
                    } else if (client.status === "completed") {
                      statusClass = "row-status-completed";
                    } else if (client.formType === "cpi") {
                      statusClass = "row-status-comercial";
                    }
                    return (
                      <tr key={idx} className={statusClass}>
                        {tableHeaders.map((header) => {
                          if (header === "Download") {
                            return (
                              <td key="download" className="text-center text-nowrap">
                                <button
                                  className="action-btn download"
                                  onClick={() =>
                                    handleDownload(
                                      client["_id"]
                                    )
                                  }
                                  disabled={loadingId === client._id}
                                  title={loadingId === client._id ? "Downloading..." : "Download Invoice"}
                                >
                                   {loadingId === client._id ? (
                                   <i className="bi bi-arrow-clockwise fs-5 spin"></i>
                                  ) : (
                                    <i className="bi bi-download fs-5"></i>
                                  )}
                                </button>
                              </td>
                            );
                          } else if (header === "Payment") {
                            return (
                              <td key="payment" className="text-center">
                                <button
                                  className="action-btn payment"
                                  title="Payment Receipt"
                                  onClick={() => handleOpenPaymentReceipt(client)}
                                >
                                  <i className="bi bi-cash-coin fs-5"></i>
                                </button>
                              </td>
                            );
                          } else if (header === "TotalInvoiceAmoutCalculated") {
                            // Display with 2 decimals
                            const amount = client[header] || 0;
                            return (
                              <td key={header} className="text-nowrap">
                                {amount !== "" && !isNaN(amount)
                                  ? Number(amount).toFixed(2)
                                  : amount}
                              </td>
                            );
                          } else {
                            return (
                              <td key={header} className="text-nowrap">
                                {client[header] || client[header.replace(/\s+/g, "_")] || ""}
                              </td>
                            );
                          }
                        })}
                        {/* GST Invoice icon column */}
                        <td key="gst-invoice" className="text-center">
                          <button
                            className="action-btn invoice"
                            title="GST Invoice"
                            onClick={() => handleOpenGSTInvoice(client)}
                          >
                            <i className="bi bi-file-earmark-spreadsheet fs-5"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center my-3 gap-2">
            <span className="small">
              Showing page <b>{page}</b> of <b>{totalPages}</b> (<b>{total}</b> records)
            </span>
            <div>
              <button
                className="btn btn-outline-primary btn-sm mx-1"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <i className="bi bi-chevron-left"></i> Previous
              </button>
              <button
                className="btn btn-outline-primary btn-sm mx-1"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPaymentReceipt && (
        <PaymentReceipt
          show={showPaymentReceipt}
          handleClose={() => setShowPaymentReceipt(false)}
          rowData={paymentRowData}
        />
      )}
      {showGSTInvoice && (
        <GSTInvoice
          show={showGSTInvoice}
          handleClose={() => setShowGSTInvoice(false)}
          rowData={gstInvoiceRowData}
        />
      )}
    </div>
  );
};

export default ActiveClientsPage;