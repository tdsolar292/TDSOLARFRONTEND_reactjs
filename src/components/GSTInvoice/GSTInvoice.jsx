import React, { useEffect, useState } from "react";
import { Modal, Form, Alert, Button } from "react-bootstrap";
import axios from "axios";
import config from "../../config";
import "./GSTInvoice.css";
import { updateInvoiceStatus } from '../common/common.jsx';

const GSTInvoice = ({ show, handleClose, rowData }) => {
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [paymentSummary, setPaymentSummary] = useState({
    message: '',
    totalAmount: 0,
    data: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [SupplyCostIncGST_, setSupplyCostIncGST_] = useState("");
  const [InstallationCostIncGST_, setInstallationCostIncGST_] = useState("");
  const [AdditionalChargesIncGST_, setAdditionalChargesIncGST_] = useState("");
  const [NetMeterNetBillIncGST_, setNetMeterNetBillIncGST_] = useState("");
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cleaned formData state
  const [formData, setFormData] = useState({
    otp: "", // <-- Default OTP value TODO
    invoiceNumber: "",
    clientId: "",
    InvoiceDate: new Date().toISOString().split('T')[0],
    clientName: "",
    clientAddress: "",
    clientMobile: "",
    clientGST: "",
    clientPAN: "",
    clientState: "West Bengal",      // <-- Default value
    clientStateCode: "19",           // <-- Default value
    TotalProjectValue: 0,
    clientEmail: "",
    PVModules_SL: [],
    Inverters_SL: [],
    Batteries_SL: [],
    Extra_SL: [],
    discount: 0,
    lessOnNetMetering: 0,
    refundedAmount: 0,
    refundDate: "",
    refundDescription: "",
    PVModules_ModelName: "",
    Inverters_ModelName: "",
    Batteries_ModelName: "",
    Extra_ModelName: "", // <-- Add this line
    invoiceGeneratedBy:"",
    materialDetails:"",
    TotalPaymentDone:0,
    PVTotalRatingKW:0,
    proformaInvoiceDB_id:""
  });

  const resetForm = () => {
    setFormData({
    otp: "", // <-- Default OTP value TODO
    invoiceNumber: "",
    clientId: "",
    InvoiceDate: new Date().toISOString().split('T')[0],
    clientName: "",
    clientAddress: "",
    clientMobile: "",
    clientGST: "",
    clientPAN: "",
    clientState: "West Bengal",      // <-- Default value
    clientStateCode: "19",           // <-- Default value
    TotalProjectValue: 0,
    clientEmail: "",
    PVModules_SL: [],
    Inverters_SL: [],
    Batteries_SL: [],
    Extra_SL: [],
    discount: 0,
    lessOnNetMetering: 0,
    refundedAmount: 0,
    refundDate: "",
    refundDescription: "",
    PVModules_ModelName: "",
    Inverters_ModelName: "",
    Batteries_ModelName: "",
    Extra_ModelName: "", // <-- Add this line
    invoiceGeneratedBy:"",
    materialDetails:"",
    TotalPaymentDone:0,
    PVTotalRatingKW:0
    });
    setStatus('');
    proformaInvoiceDB_id:""
  };

  useEffect(() => {
    if (rowData && paymentSummary) { 
      console.log("Row Data:", rowData);
      
      // Helper to replace "NA" with ""
      const clean = (val) => (val === "NA" ? "" : val);
      // Helper function to round to 2 decimal places
      function round2(value) {
        // Convert input to number (handles both strings and numbers)
        const num = Number(value);
        if (isNaN(num)) {
            throw new Error(`Cannot convert '${value}' to a number`);
        }

        // Round to 2 decimal places (instead of truncating)
        const roundedNum = Math.round(num * 100) / 100;

        // Force 2 decimal places (e.g., 100 → "100.00", 12.8 → "12.80")
        const formattedNum = roundedNum.toFixed(2);

        // Return as number (or string if preferred)
        return Number(formattedNum);
    }

      // Extract all needed values from rowData with defaults
    const paymentReceipt = paymentSummary?.totalAmount || 0;
    const supplyPercentage = Number(rowData?.supplyPercentage) || 0;
    const totalProjectValue = Number(rowData?.TotalInvoiceAmoutCalculated) || 0;// Invoice Amount
    const materialDiscount = Number(rowData?.materialDiscount) || 0;
    const installationDiscount = Number(rowData?.installationDiscount) || 0;
    const extraHeightTotalCost = Number(rowData?.["Extra Height Total Cost"]) || 0;
    const transportationCost = Number(rowData?.["Transportation Cost"]) || 0;
    const miscellaneousExpenses = Number(rowData?.["Miscellaneous Expenses"]) || 0;
    const liaisonCost = Number(rowData?.["liaisonCost"]) || 0;
    const erectionDiscount = Number(rowData?.["erectionDiscount"]) || 0;
    const applicationCost = Number(rowData?.["Application Cost"]) || 0;
    const meterCost = Number(rowData?.["Meter Cost"]) || 0;
    const caCertificate = Number(rowData?.["CA Certificate"]) || 0;
    const fitnessCertificate = Number(rowData?.["Fitness Certificate"]) || 0;
    const netMeteringDiscount = Number(rowData?.["netMeteringDiscount"]) || 0;

    // Calculate supply value and GST
    const supplyValue = round2(totalProjectValue * supplyPercentage * 0.01);
    const supplyBasePrice_EXGST = round2(supplyValue * (100 / 112));
    const supplyBasePriceAfterDiscount_EXGST = round2(supplyBasePrice_EXGST - materialDiscount);
    const supplyAfterDiscount_GSTAmount = round2(supplyBasePriceAfterDiscount_EXGST * 0.12);
    const supplyAfterDiscount_IncGST = round2(supplyBasePriceAfterDiscount_EXGST + supplyAfterDiscount_GSTAmount);
    setSupplyCostIncGST_(supplyAfterDiscount_IncGST);

    // Calculate Installation value and GST
    const installationValue = round2(totalProjectValue * (100 - supplyPercentage) * 0.01);
    const installationBasePrice_EXGST = round2(installationValue * (100 / 118));
    const installationBasePriceAfterDiscount_EXGST = round2(installationBasePrice_EXGST - installationDiscount);
    const installationAfterDiscount_GSTAmount = round2(installationBasePriceAfterDiscount_EXGST * 0.18);
    const installationAfterDiscount_IncGST = round2(installationBasePriceAfterDiscount_EXGST + installationAfterDiscount_GSTAmount);
    setInstallationCostIncGST_(installationAfterDiscount_IncGST);

    // calculation of total Supply + Installation
    const totalBasePrice_EXGST = round2(supplyBasePrice_EXGST + installationBasePrice_EXGST);
    const totalDiscount = round2(materialDiscount + installationDiscount);
    const totalPriceAfterDiscount_EXGST = round2(totalBasePrice_EXGST - totalDiscount);
    const totalGST = round2(supplyAfterDiscount_GSTAmount + installationAfterDiscount_GSTAmount);
    const totalPriceIncGST = round2(totalPriceAfterDiscount_EXGST + totalGST);

    //Base Rate of Additional Works of Erection Parts
    const aditionalWorksBasePrice_EXGST = round2(extraHeightTotalCost) + round2(transportationCost) + round2(miscellaneousExpenses) + round2(liaisonCost);
    const aditionalWorksAfterDiscount_EXGST = round2(aditionalWorksBasePrice_EXGST) - round2(erectionDiscount);
    const aditionalWorksAfterDiscount_GSTAmount = round2(aditionalWorksAfterDiscount_EXGST * 0.18);
    const aditionalWorksAfterDiscount_IncGST = round2(aditionalWorksAfterDiscount_EXGST + aditionalWorksAfterDiscount_GSTAmount);
    setAdditionalChargesIncGST_(aditionalWorksAfterDiscount_IncGST);

    // Net Metering / Net Billing Cost
    const netMeteringNetBillingPrice_IncGST = round2(applicationCost) + round2(meterCost) + round2(caCertificate) + round2(fitnessCertificate);
    const netMeteringNetBillingPrice_AfterDiscount_IncGST = round2(netMeteringNetBillingPrice_IncGST) - round2(netMeteringDiscount);
    setNetMeterNetBillIncGST_(netMeteringNetBillingPrice_AfterDiscount_IncGST);

    //Final Amount Calculation
    const finalInvoiceAmount = round2(totalPriceIncGST + aditionalWorksAfterDiscount_IncGST + netMeteringNetBillingPrice_AfterDiscount_IncGST);

      setFormData(prev => ({
        ...prev,
        proformaInvoiceDB_id:rowData?._id,
        clientId: rowData?.["clientId"] || "",
        invoiceNumber: rowData?.["invoiceNumber"] || "",
        clientName: rowData?.clientName || "",
        clientMobile: rowData?.clientMobile?.toString() || "",
        clientEmail: rowData?.["clientEmail"] || "",
        clientAddress: paymentSummary?.data?.[0]?.clientAddress || rowData?.clientAddress || "",
        TotalProjectValue: Number(rowData?.TotalInvoiceAmoutCalculated).toFixed(2) || 0,
        TotalPaymentDone: Number(paymentSummary?.totalAmount).toFixed(2) || 0, // <-- as number
        supplyPercentage: Number(rowData?.["supplyPercentage"]) || 0, // <-- as number
       materialDetails: 
        [clean(rowData?.["brand"]), clean(rowData?.["type"]), clean(rowData?.["moduleTechnology"]), clean(rowData?.["moduleWatt"]) + "W", clean(rowData?.["quantity"]) + "Nos"]
          .filter(Boolean).join(" ") || "",
      inverterDetails: 
        [clean(rowData?.["inverterBrand"]), clean(rowData?.["inverterPower"]) ? clean(rowData?.["inverterPower"]) + "KW" : ""]
          .filter(Boolean).join(" ") || "",
      batteryDetails: 
        [clean(rowData?.["batteryBrand"]), clean(rowData?.["batteryType"]), clean(rowData?.["batteryCapacity"]), clean(rowData?.["batteryQuantity"]) ? clean(rowData?.["batteryQuantity"]) + "Nos" : ""]
          .filter(Boolean).join(" ") || "",
      PVTotalRatingKW: clean(rowData?.["PVTotalRatingKW"]) ? clean(rowData?.["PVTotalRatingKW"]) : (clean(rowData?.["moduleWatt"]) && clean(rowData?.["quantity"])) ? ((rowData?.["moduleWatt"]*rowData?.["quantity"] )*0.001): '',
      }));
    }
  }, [rowData, paymentSummary]);

  useEffect(() => {
    if (show) {
      const proformaInvoiceNo = rowData?.["invoiceNumber"] ||"";
      if (proformaInvoiceNo) {
        setSummaryLoading(true);
        setSummaryError("");
        fetch(
          `${config.MernBaseURL}/paymentReceipt/getAllByInvoiceNumber?invoiceNumber=${proformaInvoiceNo}`
        )
          .then((res) => res.json())
          .then((data) => {
            setPaymentSummary(data);
            console.log("Payment Summary Data:", data);
            setSummaryLoading(false);
          })
          .catch(() => {
            setSummaryError("Failed to load payment summary");
            setSummaryLoading(false);
          });
      } else {
        setPaymentSummary(null);
      }
    }
  }, [show, rowData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitError("");
  setSubmitSuccess("");

  await axios
  .post(
    `${config.MernBaseURL}/gstinvoice/create`,
    { ...formData, formType: 'gsti' },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      },
      responseType: 'blob'
    }
  )
  .then((response) => {
    updateInvoiceStatus(formData?.proformaInvoiceDB_id,'completed');//Status Update proforma Invoice DB id completed means full payment done
    const blob = response.data;
    const fileURL = window.URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
    setStatus(`✅ Success: GST Invoice Created`);
  })
  .catch((error) => {
    console.error("Error:", error);
    setStatus(`❌ Error: Failed to create GST Invoice. Please try again.`);
  })
  .finally(() => {
    setIsLoading(false);
    setTimeout(() => {
      resetForm();
      handleClose();
    }, 2200);
  });
}


  const formatAmount = (amount) => {
    return Number(amount || 0).toFixed(2);
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>GST Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Data Validation Summary */}
        <div className="mb-4">
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0 text-primary">Source Data Summary</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="border-bottom pb-2">
                    <div><strong>Client ID:</strong> {rowData?.["clientId"]}</div>
                    <div><strong>Name:</strong> {rowData?.clientName}</div>
                    <div><strong>Mobile:</strong> {rowData?.clientMobile}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border-bottom pb-2">
                    <div><strong>Proforma Invoice:</strong> {rowData?.["invoiceNumber"]}</div>
                    <div><strong>Total Invoice Value:</strong> ₹{formatAmount(rowData?.TotalInvoiceAmoutCalculated)}</div>
                  </div>
                </div>
                {/* Calculated Values Display */}
                <div className="col-12 mt-4">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-3">
                          <p className="mb-1 text-primary fw-bold">Supply Materials Total: </p>
                          <p> ₹{formatAmount(SupplyCostIncGST_)}</p>
                        </div>
                        <div className="col-md-3">
                          <p className="mb-1 text-primary fw-bold">Installations Total: </p>
                          <p>₹{formatAmount(InstallationCostIncGST_)}</p>
                        </div>
                        <div className="col-md-3">
                          <p className="mb-1 text-primary fw-bold">Aditional Charges: </p>
                          <p>₹{formatAmount(AdditionalChargesIncGST_)}</p>
                        </div>
                        <div className="col-md-3">
                          <p className="mb-1 text-primary fw-bold">Net Metering / Net Billing:</p>
                          <p>₹{formatAmount(NetMeterNetBillIncGST_)}</p>
                        </div>
                        <div className="col-md-3">
                          <p className="mb-1 text-primary fw-bold text-warning">Total Project Value: </p>
                          <p>₹{formatAmount(formData.TotalProjectValue)}</p>
                        </div>
                        <div className="col-md-3">
                          <p className="mb-1 text-primary fw-bold text-danger">Final Discount: </p>
                          <p>₹{formatAmount(formData.discount)}</p>
                        </div>
                        <div className="col-md-3">
                          <p className="mb-1 text-primary fw-bold text-danger">Less On Net Metering: </p>
                          <p>₹{formatAmount(formData.lessOnNetMetering)}</p>
                        </div>
                        <div className="col-md-3">
                          <p className="mb-1 text-primary fw-bold text-success">Final Project Value: </p>
                          <p>₹{formatAmount(formData.TotalProjectValue) - formatAmount(formData.discount) - formatAmount(formData.lessOnNetMetering)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="alert alert-info mb-0">
                    Please verify the above details before proceeding with GST Invoice generation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary Table */}
        <div className="mb-4">
          <h5 className="text-primary">Previous Payment Details</h5>
          {summaryLoading && <div>Loading payment summary...</div>}
          {summaryError && <div className="text-danger">{summaryError}</div>}
          {paymentSummary && paymentSummary?.data && paymentSummary?.data.length > 0 ? (
            
            <div>
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Receipt No</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Payment Details</th>
                  </tr>
                </thead>
                <tbody>
                 {paymentSummary?.data.map((row, idx) => (
                    <tr key={row._id}>
                        <td>{row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : ""}</td>
                        <td>{row.receiptNo}</td>
                        <td>{row.amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                        <td>{row.paymentMode}</td>
                        <td>{row.paymentDetails}</td>
                    </tr>
                ))}
                </tbody>
              </table>
              <div className="fw-bold text-end">
                Total Invoice Amount: <span className="text-primary">
                  ₹{formatAmount(formData.TotalProjectValue)}
                </span>
              </div>
              <div className="fw-bold text-end">
                Total Payment Done: <span className="text-success">₹{Number(paymentSummary?.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="fw-bold text-end">
                Total Discount During GST Invoice: <span className="text-primary">
                  ₹{(Number(formData.discount) + Number(formData.lessOnNetMetering)).toFixed(2)}
                </span>
              </div>
              <div className="fw-bold text-end">
                Total Amount Due: <span className="text-danger">
                  ₹{(Number(formData.TotalProjectValue) - Number(paymentSummary?.totalAmount || 0) - (Number(formData.discount) + Number(formData.lessOnNetMetering))).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            !summaryLoading && <div className="text-muted">No previous payments found.</div>
          )}
        </div>
       
        {/* GST Invoice Form */}
        <div className="gst-invoice-form">
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}
          <Form onSubmit={handleSubmit} className="gx-3 gy-2 align-items-center">
            <div className="row">
              {/* Basic Info Section */}
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Client ID</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <Form.Control
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
                      className="border-0"
                      required
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Invoice Date</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-calendar"></i>
                    </span>
                    <Form.Control
                      type="date"
                      name="InvoiceDate"
                      value={formData.InvoiceDate}
                      onChange={handleInputChange}
                      className="border-0"
                      placeholder="DD/MM/YYYY"
                      pattern="\d{2}/\d{2}/\d{4}"
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Proforma Invoice</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-file-text"></i>
                    </span>
                    <Form.Control
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleInputChange}
                      className="border-0"
                    />
                  </div>
                </Form.Group>
              </div>
              {/* Client Details Section */}
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Client Name</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-person"></i>
                    </span>
                    <Form.Control
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="border-0"
                      required
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Address</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-geo-alt"></i>
                    </span>
                    <Form.Control
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleInputChange}
                      className="border-0"
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Mobile</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <Form.Control
                      name="clientMobile"
                      value={formData.clientMobile}
                      onChange={handleInputChange}
                      className="border-0"
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">GST Number</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-receipt"></i>
                    </span>
                    <Form.Control
                      name="clientGST"
                      value={formData.clientGST}
                      onChange={handleInputChange}
                      className="border-0"
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">PAN Number</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-card-text"></i>
                    </span>
                    <Form.Control
                      name="clientPAN"
                      value={formData.clientPAN}
                      onChange={handleInputChange}
                      className="border-0"
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">State</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-geo-alt"></i>
                    </span>
                    <Form.Control
                      name="clientState"
                      value={formData.clientState}
                      onChange={handleInputChange}
                      className="border-0"
                      required
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">State Code</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-code-slash"></i>
                    </span>
                    <Form.Control
                      name="clientStateCode"
                      value={formData.clientStateCode}
                      onChange={handleInputChange}
                      className="border-0"
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-5">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Client Email</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <Form.Control
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      className="border-0"
                      required
                    />
                  </div>
                </Form.Group>
              </div>
              <hr></hr>
              {/* Discount and Net Metering - MOVED TO TOP OF SERIAL NUMBER SECTION */}
              <div className="row mt-4 mb-4">
                <div className="col-sm-4 mb-2">
                  <Form.Group>
                    <Form.Label htmlFor="discount" className="text-danger">Discount</Form.Label>
                    <div className="input-group shadow-sm">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-cash-coin"></i>
                      </span>
                      <Form.Control
                        type="number"
                        name="discount"
                        id="discount"
                        placeholder="Example:1000"
                        value={formData.discount || ""}
                        onChange={handleInputChange}
                        className="border-0"
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-sm-4 mb-2">
                  <Form.Group>
                    <Form.Label htmlFor="lessOnNetMetering" className="text-danger">Less On Net Metering</Form.Label>
                    <div className="input-group shadow-sm">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-lightning-charge"></i>
                      </span>
                      <Form.Control
                        type="number"
                        name="lessOnNetMetering"
                        id="lessOnNetMetering"
                        placeholder="Example:500"
                        value={formData.lessOnNetMetering || ""}
                        onChange={handleInputChange}
                        className="border-0"
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-sm-4 mb-2">
                  <Form.Group>
                    <Form.Label htmlFor="refundedAmount" className="text-danger">Refunded Amount</Form.Label>
                    <div className="input-group shadow-sm">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </span>
                      <Form.Control
                        type="number"
                        name="refundedAmount"
                        id="refundedAmount"
                        placeholder="Example:500"
                        value={formData.refundedAmount || ""}
                        onChange={handleInputChange}
                        className="border-0"
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-sm-4 mb-2">
                  <Form.Group>
                    <Form.Label htmlFor="refundDate" className="text-danger">Refund Date</Form.Label>
                    <div className="input-group shadow-sm">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-calendar-event"></i>
                      </span>
                      <Form.Control
                        type="date"
                        name="refundDate"
                        id="refundDate"
                        value={formData.refundDate || ""}
                        onChange={handleInputChange}
                        className="border-0"
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-sm-4 mb-2">
                  <Form.Group>
                    <Form.Label htmlFor="refundDescription" className="text-danger">Refund Description</Form.Label>
                    <div className="input-group shadow-sm">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-info-circle"></i>
                      </span>
                      <Form.Control
                        type="text"
                        name="refundDescription"
                        id="refundDescription"
                        placeholder="Refund details"
                        value={formData.refundDescription || ""}
                        onChange={handleInputChange}
                        className="border-0"
                      />
                    </div>
                  </Form.Group>
                </div>
              </div>
              <hr></hr>
              
              {/* PVModules_SL */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">PV Modules Serial Numbers</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="PVModules_SL"
                    value={Array.isArray(formData.PVModules_SL) ? formData.PVModules_SL.join("\n") : formData.PVModules_SL}
                    onChange={e => setFormData(prev => ({ ...prev, PVModules_SL: e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) }))}
                    placeholder="Enter one serial number per line"
                    className="shadow-sm border-0"
                  />
                </Form.Group>
              </div>
              {/* PV Modules Model Name (after PVModules_SL) */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">PV Model Name</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="PVModules_ModelName"
                    value={formData.PVModules_ModelName || ""}
                    onChange={e => setFormData(prev => ({ ...prev, PVModules_ModelName: e.target.value }))}
                    placeholder="Enter PV model names, one per line"
                    className="shadow-sm border-0"
                  />
                </Form.Group>
              </div>
              {/* Inverters_SL */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Inverters Serial Numbers</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="Inverters_SL"
                    value={Array.isArray(formData.Inverters_SL) ? formData.Inverters_SL.join("\n") : formData.Inverters_SL}
                    onChange={e => setFormData(prev => ({ ...prev, Inverters_SL: e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) }))}
                    placeholder="Enter one serial number per line"
                    className="shadow-sm border-0"
                  />
                </Form.Group>
              </div>
              {/* Inverters Model Name (after Inverters_SL) */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Inverters Model Name</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="Inverters_ModelName"
                    value={formData.Inverters_ModelName || ""}
                    onChange={e => setFormData(prev => ({ ...prev, Inverters_ModelName: e.target.value }))}
                    placeholder="Enter inverter model names, one per line"
                    className="shadow-sm border-0"
                  />
                </Form.Group>
              </div>
              {/* Batteries_SL */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Batteries Serial Numbers</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="Batteries_SL"
                    value={Array.isArray(formData.Batteries_SL) ? formData.Batteries_SL.join("\n") : formData.Batteries_SL}
                    onChange={e => setFormData(prev => ({ ...prev, Batteries_SL: e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) }))}
                    placeholder="Enter one serial number per line"
                    className="shadow-sm border-0"
                  />
                </Form.Group>
              </div>
              {/* Batteries Model Name (after Batteries_SL) */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Batteries Model Name</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="Batteries_ModelName"
                    value={formData.Batteries_ModelName || ""}
                    onChange={e => setFormData(prev => ({ ...prev, Batteries_ModelName: e.target.value }))}
                    placeholder="Enter battery model names, one per line"
                    className="shadow-sm border-0"
                  />
                </Form.Group>
              </div>
              {/* Extra_SL */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Extra Serial Numbers</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="Extra_SL"
                    value={Array.isArray(formData.Extra_SL) ? formData.Extra_SL.join("\n") : formData.Extra_SL}
                    onChange={e => setFormData(prev => ({ ...prev, Extra_SL: e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) }))}
                    placeholder="Enter one serial number per line"
                    className="shadow-sm border-0"
                  />
                </Form.Group>
              </div>
              {/* Extra Model Name (after Extra_SL) */}
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Extra Model Name</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="Extra_ModelName"
                    value={formData.Extra_ModelName || ""}
                    onChange={e => setFormData(prev => ({ ...prev, Extra_ModelName: e.target.value }))}
                    placeholder="Enter extra model names, one per line"
                    className="shadow-sm border-0"
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row">
              {/* Add these fields at the bottom of the form, before the submit/cancel buttons */}
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">OTP</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-shield-lock"></i>
                    </span>
                    <Form.Control
                      type="password"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      className="border-0"
                      required
                    />
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-primary">Invoice Generated By</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-person-check"></i>
                    </span>
                    <Form.Select
                      name="invoiceGeneratedBy"
                      value={formData.invoiceGeneratedBy}
                      onChange={handleInputChange}
                      className="border-0"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Dwipayan">Dwipayan</option>
                      <option value="Sourav">Sourav</option>
                      <option value="WebAdmin">WebAdmin</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="me-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary">
                {isSubmitting ? 'Creating Invoice...' : 'Create GST Invoice'}
              </Button>
              {/* <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || ((Number(formData.TotalProjectValue) - Number(paymentSummary?.totalAmount || 0) - (Number(formData.discount) + Number(formData.lessOnNetMetering))).toFixed(2)) > 0.99}
              >
                {isSubmitting ? 'Creating Invoice...' : 'Create GST Invoice'}
              </Button> */}
            </div>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default GSTInvoice;