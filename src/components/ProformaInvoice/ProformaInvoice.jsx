// src/components/ProformaInvoice.js
import React, { useState, useEffect } from 'react'; // Added useState import
import { Modal, Button, Form } from 'react-bootstrap';
import axios from "axios";
import config from '../../config';
import { formatDateDDMMYYYY } from '../common/common.jsx';

import './ProformaInvoice.css';

const ProformaInvoice = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
      clientId: '',
      clientEmail: '',
      clientMobile:'',
      clientName:'',
      clientAddress:'',
      clientState:'',
      clientPinCode:'',
      proposalDate: '', // Default to today's date
      systemType: '',
      systemConnection: '',
      gridType: '',
      brand: '',
      type: '',
      moduleTechnology: '',
      moduleWatt: Number,
      quantity: Number,
      freeMaterial: '',
      inverterBrand: '',
      inverterPower: '',
      inverterQuantity: 1,
      totalProjectValue: Number,
      supplyPercentage: Number,
      applicationCost: 590,
      meterCost: Number,
      caCertificate: 2000,
      fitnessCertificate: 2832,
      extraHeightTotalCost: Number,
      transportationCost: Number,
      miscellaneousExpenses: Number,
      electricSupply: '',
      batteryBrand: '',
      batteryType: '',
      batteryCapacity:'' ,
      batteryQuantity: '',
      materialDiscount: Number,
      installationDiscount: Number,
      erectionDiscount: Number,
      netMeteringDiscount : Number,
      liaisonCost: Number,
      clientIdType: 'existing', // Default set to "existing"
      invoiceGeneratedBy: '',
      otp: "9064",
      status: "",
      formType: 'dpi',// 'dpi' Domestric Proforma Invoice
      invoiceNumber: '', // Added invoiceNumber to formData
    });
  const [clientData, setClientData] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // setDummyData function is not used in the code, but if you want to keep it for future use, you can uncomment it.
  const setDummyData = () => {
    setFormData({
      clientId: 'ScTEST1234',
      clientEmail: 'tdsolar9@gmail.com',
      clientMobile:'9999966666',
      clientName:'TEST TEST Client Name',
      clientAddress:'TEST Address 26 Park Street',
      clientState:'West Bengal',
      clientPinCode:'700016',
      proposalDate: formatDateDDMMYYYY(new Date()), // Default to today's date
      systemType: 'Ongrid Solar System',
      systemConnection: 'With Net Metering',
      gridType: 'On-Grid',
      brand: 'UTL',
      type: 'DCR',
      moduleTechnology: 'MONO-PERC Half-Cut',
      moduleWatt: 535,
      quantity: 6,
      freeMaterial: 'Full Setup Free with Installation Approx Value Rs. 5000',
      inverterBrand: 'LUMINOUS',
      inverterPower: 5,
      totalProjectValue: 250000,
      supplyPercentage: 80,
      applicationCost: 590,
      meterCost: 15340,
      caCertificate: 2000,
      fitnessCertificate: 2832,
      extraHeightTotalCost: 800,
      transportationCost: 3000,
      miscellaneousExpenses: 1000,
      electricSupply: 'CESC',
      batteryBrand: 'LUMINOUS',
      batteryType: 'C10 Lead Acid Battery - 12V',
      batteryCapacity: '100 AH',
      batteryQuantity: 2,
      materialDiscount: 1000,
      installationDiscount: 1500,
      erectionDiscount: 2000,
      netMeteringDiscount : 500,
      liaisonCost: 8400,
      clientIdType: 'existing', // Default set to "existing"
      invoiceGeneratedBy: 'WEB-ADMIN',
      otp: "9064",
      status: "",
      formType: 'dpi',// 'dpi' Domestric Proforma Invoice
      invoiceNumber: '',
      inverterQuantity: 1,
    });
  };

  // Call setDummyData when the component is mounted
  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      setDummyData();
    } 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // Check if systemType is being changed to "Ongrid Solar System"
      if (name === "systemType" && value === "Ongrid Solar System") {
        return {
          ...prev,
          [name]: value,
          batteryBrand: "NA", // Auto-select NA
          batteryType: "NA",  // Auto-select NA
          batteryCapacity: "NA", // Auto-select NA
          batteryQuantity: "NA", // Auto-select NA
        };
      }

      // Default behavior for other fields
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  // Removed duplicate ProformaInvoice declaration and navigate initialization
  const handleRedirect = () => {
    navigate('/some-route'); // Example usage of navigate
  };
  const handleClientIdChange = (e) => {
    let val = e.target.value.replace(/^Sc/, "");
    val = val.replace(/\D/g, "");
    val = val ? `Sc${val}` : "";
    setFormData(prev => ({
      ...prev,
      clientId: val
    }));
  };

  

const handleSubmit_MERN = async (e) => {
   e.preventDefault();
   setIsLoading(true); // Show loader
   setStatus(""); // Clear previous status
  
   await axios
     .post(
       `${config.MernBaseURL}/proformainvoice/create`,
       { ...formData, formType: 'dpi' },
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
       setStatus(`✅ Success: Comercial Proforma Invoice Created`);
     })
     .catch((error) => {
       console.error("Error:", error);
       setStatus(
         `❌ Error: ${error.message} - Cannot submit formData to database`
       ); // Update status with error message
     })
     .finally(() => {
       setIsLoading(false);
       setTimeout(() => {
         resetForm(); // Reset form after 3 seconds
         handleClose(); // Close the modal after 3 seconds
       }, 2200); // Hide loader
     });
 };



  const resetForm = () => {
    setFormData({
      clientId: '',
      clientEmail: '',
      clientMobile:'',
      clientName:'',
      clientAddress:'',
      clientState:'',
      clientPinCode:'',
      systemType: '',
      systemConnection: '',
      gridType: '',
      brand: '',
      type: '',
      moduleTechnology: '',
      moduleWatt: '',
      quantity: '',
      freeMaterial: '',
      inverterBrand: '',
      inverterPower: '',
      totalProjectValue: '',
      supplyPercentage: '',
      applicationCost: 590,
      meterCost: 2000,
      caCertificate: 2000,
      fitnessCertificate: 2832,
      extraHeightTotalCost: '',
      transportationCost: '',
      miscellaneousExpenses: '',
      electricSupply: '',
      batteryBrand: '',
      batteryType: '',
      batteryCapacity: '',
      batteryQuantity: '',
      materialDiscount: '',
      installationDiscount: '',
      erectionDiscount: '',
      netMeteringDiscount : '',
      liaisonCost: '',
      clientIdType: 'existing', // Default set to "existing"
      invoiceGeneratedBy: '',
      inverterQuantity:1,
      otp: '',
    });
    setClientData('');
    setStatus('');
  };

 

    const handleClientIdTypeChange = (e) => {
      const { value } = e.target;

      if (value === 'temporary') {
        const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
        const temporaryId = `Sc5${randomNum}`;
        setFormData((prev) => ({
          ...prev,
          clientId: temporaryId,
        }));
      } else if (value === 'existing') {
        setFormData((prev) => ({
          ...prev,
          clientId: '',
        }));
      }
    };

    // Add this function to handle electric supply changes
    const handleElectricSupplyChange = (e) => {
      const electricSupply = e.target.value;

      setFormData((prev) => ({
        ...prev,
        electricSupply, // Update the electricSupply field
        meterCost: electricSupply === 'CESC' 
          ? 15340
          : electricSupply === 'WBSEDCL' 
          ? 11600 
          : '', // Clear if "NA" or default
      }));
    };

    useEffect(() => {
      // Only auto-update if both values are present and are numbers
      const moduleWatt = parseFloat(formData.moduleWatt);
      const quantity = parseFloat(formData.quantity);
      if (!isNaN(moduleWatt) && !isNaN(quantity)) {
        let autoValue = (moduleWatt * quantity * 0.001).toFixed(3);
        // Remove trailing zeros after decimal (e.g., 3.000 -> 3, 3.100 -> 3.1)
        autoValue = parseFloat(autoValue).toString();
        if (formData.PVTotalRatingKW !== autoValue) {
          setFormData(prev => ({
            ...prev,
            PVTotalRatingKW: autoValue
          }));
        }
      } else if (formData.PVTotalRatingKW !== "") {
        setFormData(prev => ({
          ...prev,
          PVTotalRatingKW: ""
        }));
      }
    }, [formData.moduleWatt, formData.quantity]);

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Domestic Proforma Invoice Generation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {isLoading && (
        <div id="loader" className="text-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {!isLoading && !status && (
        <form className="gx-3 gy-2 align-items-center proforma-form" id="proforma-form" onSubmit={handleSubmit_MERN}>
                    <div className="row">
                    <div className="col-sm-4 mb-2">
                        <label className="form-label" htmlFor="clientName">Client Name:</label>
                        <input
                          type="text"
                          name="clientName"
                          className="form-control"
                          id="clientName"
                          placeholder="Example:Client Name"
                          value={formData.clientName}
                          onChange={handleChange}
                        />
                      </div>
                    <div className="col-sm-4 mb-2">
                        <label className="form-label" htmlFor="clientMobile">Client Mobile Number:</label>
                        <input
                          type="number"
                          name="clientMobile"
                          className="form-control"
                          id="clientMobile"
                          placeholder="Example:9999966666"
                          required
                          value={formData.clientMobile}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="clientEmail">Client Email ID: </label>
                        <input 
                          type="email" 
                          name="clientEmail" 
                          className="form-control" 
                          id="clientEmail" 
                          placeholder="Invoice will send here" 
                          required 
                          autoComplete="off"
                          value={formData.clientEmail}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="clientAddress">Client Address: </label>
                        <input 
                          type="test" 
                          name="clientAddress" 
                          className="form-control" 
                          id="clientAddress" 
                          placeholder="Client Address with Landmark" 
                          required 
                          autoComplete="off"
                          value={formData.clientAddress}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="clientState">Client State: </label>
                        <input 
                          type="test" 
                          name="clientState" 
                          className="form-control" 
                          id="clientState" 
                          placeholder="Client State" 
                          required 
                          autoComplete="off"
                          value={formData.clientState}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="clientPinCode">Client PIN Code: </label>
                        <input 
                          type="number" 
                          name="clientPinCode" 
                          className="form-control" 
                          id="clientPinCode" 
                          placeholder="PIN Code" 
                          required 
                          autoComplete="off"
                          value={formData.clientPinCode}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="row">
                    <div className="col-sm-4 mb-2">
                          <label htmlFor="clientIdType">Client ID Type:</label>
                          <div className="form-check">
                              <input
                                  className="form-check-input"
                                  type="radio"
                                  name="clientIdType"
                                  id="existingClientId"
                                  value="existing"
                                  checked={formData.clientIdType === 'existing'}
                                  onChange={(e) => {
                                    handleClientIdTypeChange(e);
                                    setFormData((prev) => ({
                                      ...prev,
                                      clientIdType: 'existing',
                                    }));
                                  }}
                              />
                              <label className="form-check-label" htmlFor="existingClientId">
                                  Existing Client ID
                              </label>
                          </div>
                          <div className="form-check">
                              <input
                                  className="form-check-input"
                                  type="radio"
                                  name="clientIdType"
                                  id="temporaryClientId"
                                  value="temporary"
                                  checked={formData.clientIdType === 'temporary'}
                                  onChange={(e) => {
                                    handleClientIdTypeChange(e);
                                    setFormData((prev) => ({
                                      ...prev,
                                      clientIdType: 'temporary',
                                    }));
                                  }}
                              />
                              <label className="form-check-label" htmlFor="temporaryClientId">
                                  Temporary Client ID
                              </label>
                          </div>
                          
                          <label className="mt-2" htmlFor="clientId">Client ID: </label>
                          <input
                              type="text"
                              name="clientId"
                              className="form-control"
                              id="clientId"
                              placeholder="Without 'SC-' ; Example:1044"
                              pattern="^Sc.*"
                              required
                              autoComplete="off"
                              readOnly={formData.clientIdType === 'temporary'}
                              style={{
                                backgroundColor: formData.clientIdType === 'temporary' ? '#f8f9fa' : '',
                              }}
                              value={formData.clientId}
                              onChange={handleClientIdChange}
                          />
                      </div>
                      
                      <div className="col-sm-4 mb-2">
                        <pre id="output" className="client-output">{clientData}</pre>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="systemType">System Type</label>
                        <select 
                          className="form-select" 
                          id="systemType" 
                          name="systemType" 
                          required
                          value={formData.systemType}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="Ongrid Solar System">Ongrid Solar System</option>
                          <option value="Offgrid Solar System">Offgrid Solar System</option>
                          <option value="Hybrid Solar System">Hybrid Solar System</option>
                          <option value="NA">NA</option>
                        </select>
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="systemConnection">System Connection</label>
                        <select 
                          className="form-select" 
                          id="systemConnection" 
                          name="systemConnection"
                          value={formData.systemConnection}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="With Net Metering">With Net Metering</option>
                          <option value="With Net Billing">With Net Billing</option>
                          <option value="NA">NA</option>
                        </select>
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label htmlFor="electricSupply">Electric Supply</label>
                        <select
                          className="form-select"
                          id="electricSupply"
                          name="electricSupply"
                          value={formData.electricSupply || ''}
                          onChange={handleElectricSupplyChange}
                        >
                          <option value="">Choose...</option>
                          <option value="CESC">CESC</option>
                          <option value="WBSEDCL">WBSEDCL</option>
                          <option value="NA">NA</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="brand">Brand Name</label>
                        <select 
                          className="form-select" 
                          id="brand" 
                          name="brand" 
                          required
                          value={formData.brand}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="UTL/LOOM/WEBSOL">UTL/LOOM/WEBSOL</option>
                          <option value="LUMINOUS/VIKRAM">LUMINOUS/VIKRAM</option>
                          <option value="UTL">UTL</option>
                          <option value="LOOM">LOOM</option>
                          <option value="LUMINOUS">LUMINOUS</option>
                          <option value="WAAREE">WAAREE</option>
                          <option value="Vikram Solar">Vikram Solar</option>
                          <option value="WEBSOL">WEBSOL</option>
                          <option value="NA">NA</option>
                        </select>
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="type">Module Type</label>
                        <select 
                          className="form-select" 
                          id="type" 
                          name="type" 
                          required
                          value={formData.type}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="DCR">DCR</option>
                          <option value="NON-DCR">NON-DCR</option>
                        </select>
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="moduleTechnology">Module Technology</label>
                        <select 
                          className="form-select" 
                          id="moduleTechnology" 
                          name="moduleTechnology" 
                          required
                          value={formData.moduleTechnology}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="MONO-PERC Half-Cut">MONO-PERC Half-Cut</option>
                          <option value="Half-Cut Bi-facial">Half-Cut Bi-facial</option>
                          <option value="TOP CON">TOP CON</option>
                          <option value="NA">NA</option>
                        </select>
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="moduleWatt">Watt (Per Module):</label>
                        <input 
                          type="number" 
                          name="moduleWatt" 
                          className="form-control" 
                          id="moduleWatt" 
                          placeholder="Example:535" 
                          required 
                          min="1"
                          value={formData.moduleWatt}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="quantity">Quantity (Total Modules):</label>
                        <input 
                          type="number" 
                          name="quantity" 
                          className="form-control" 
                          id="quantity" 
                          placeholder="Example:6" 
                          min="1" 
                          required
                          value={formData.quantity}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="PVTotalRatingKW">PV Total Rating(KW)</label>
                        <input
                          type="number"
                          name="PVTotalRatingKW"
                          className="form-control"
                          id="PVTotalRatingKW"
                          placeholder="Auto-calculated"
                          value={formData.PVTotalRatingKW || ''}
                          onChange={handleChange}
                          step="any"
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="freeMaterial">Free Material & Setup For net M:</label>
                        <select 
                          className="form-select" 
                          id="freeMaterial" 
                          name="freeMaterial" 
                          required
                          value={formData.freeMaterial}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="Full Setup Free with Installation Approx Value Rs. 5000">Full Setup Free with Installation</option>
                          <option value="Not Applicable">Not Applicable</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="inverterBrand">Inverter Brand</label>
                        <select 
                          className="form-select" 
                          id="inverterBrand" 
                          name="inverterBrand" 
                          required
                          value={formData.inverterBrand}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="UTL/DEYE/GROWATT">UTL/DEYE/GROWATT</option>
                          <option value="LUMINOUS/HAVELS/MIRCROTECK/LOOM">LUMINOUS/HAVELS/MIRCROTECK/LOOM</option>
                          <option value="WAREE/HAVELS/MIRCROTECK">WAREE/HAVELS/MIRCROTECK</option>
                          <option value="WAREE">WAREE</option>
                          <option value="UTL">UTL</option>
                          <option value="LOOM">LOOM</option>
                          <option value="LUMINOUS">LUMINOUS</option>
                          <option value="HAVELLS">HAVELLS</option>
                          <option value="MICROTECK">MICROTECK</option>
                          <option value="DEYE">DEYE</option>
                          <option value="GROWATT">GROWATT</option>
                          <option value="NA">NA</option>
                        </select>
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="inverterPower">Inverter Power in KW</label>
                        <select 
                          className="form-select" 
                          id="inverterPower" 
                          name="inverterPower" 
                          required
                          value={formData.inverterPower}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="1">1 KW</option>
                          <option value="1.5">1.5 KW</option>
                          <option value="2">2 KW</option>
                          <option value="3">3 KW</option>
                          <option value="3.3">3.3 KW</option>
                          <option value="4">4 KW</option>
                          <option value="4.6">4.6 KW</option>
                          <option value="5">5 KW</option>
                          <option value="5.3">5.3 KW</option>
                          {/* Add options from 6 to 100 */}
                          {[...Array(95)].map((_, i) => {
                            const val = i + 6;
                            return (
                              <option key={val} value={val}>{val} KW</option>
                            );
                          })}
                          <option value="NA">NA</option>
                        </select>
                      </div>
                    </div>
                    {/* SOLAR BATTERY STARTS */}
                    <div className="row">
                        <div className="col-sm-4 mb-2">
                          <label className="" htmlFor="batteryBrand">Solar Battery Brand</label>
                          <select 
                            className="form-select" 
                            id="batteryBrand" 
                            name="batteryBrand" 
                            required
                            value={formData.batteryBrand}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            <option value="LUMINOUS">LUMINOUS</option>
                            <option value="UTL">UTL</option>
                            <option value="EXCIDE">EXCIDE</option>
                            <option value="Any BRAND">Any BRAND</option>
                            <option value="NA">NA</option>
                          </select>
                        </div>

                        <div className="col-sm-4 mb-2">
                          <label className="" htmlFor="batteryType">Solar Battery Type</label>
                          <select 
                            className="form-select" 
                            id="batteryType" 
                            name="batteryType" 
                            required
                            value={formData.batteryType}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            <option value="C10 Lead Acid Battery - 12V">C10 Lead Acid Battery - 12V</option>
                            <option value="Li-Battery - 24V">Li-Battery - 24V</option>
                            <option value="Li-Battery - 48V">Li-Battery - 48V</option>
                            <option value="Any Type">Any Type</option>
                            <option value="NA">NA</option>
                          </select>
                        </div>

                        <div className="col-sm-4 mb-2">
                          <label className="" htmlFor="batteryCapacity">Solar Battery Capacity</label>
                          <select 
                            className="form-select" 
                            id="batteryCapacity" 
                            name="batteryCapacity" 
                            required
                            value={formData.batteryCapacity}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            <option value="40 AH">40 AH</option>
                            <option value="100 AH">100 AH</option>
                            <option value="150 AH">150 AH</option>
                            <option value="200 AH">200 AH</option>
                            <option value="Any AH">Any AH</option>
                            <option value="NA">NA</option>
                          </select>
                        </div>
                        <div className="col-sm-4 mb-2">
                          <label className="" htmlFor="batteryQuantity">Solar Battery Quantity</label>
                          <select 
                            className="form-select" 
                            id="batteryQuantity" 
                            name="batteryQuantity" 
                            required
                            value={formData.batteryQuantity}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="NA">NA</option>
                          </select>
                        </div>
                      </div>
                    
                    {/* SOLAR BATTERY ENDS */}
                    {/* Amount Section 1 fields start here */}
                    <div className="row">
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="totalProjectValue">Total Project Value Rs. (100%)</label>
                        <input 
                          type="number" 
                          name="totalProjectValue" 
                          className="form-control" 
                          id="totalProjectValue" 
                          placeholder="Example:250000" 
                          min="1" 
                          required
                          value={formData.totalProjectValue}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="supplyPercentage">Supply Percentage</label>
                        <input 
                          type="number" 
                          name="supplyPercentage" 
                          className="form-control" 
                          id="supplyPercentage" 
                          placeholder="Example:80" 
                          max="100" 
                          required
                          value={formData.supplyPercentage}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="BasePrice">Price Details</label>
                        <div className="price-box">
                        <span style={{ fontSize: '12px' }}>
                            Material Base Price: &nbsp;
                            <span className="price" style={{ fontSize: '16px' }}>
                              {(
                                formData.totalProjectValue *
                                formData.supplyPercentage *
                                0.01 / 1.12
                              ).toFixed(2)}
                            </span>&nbsp;
                             GST (12%): &nbsp;
                            <span className="price" style={{ fontSize: '16px' }}>
                            {(
                              formData.totalProjectValue *
                              formData.supplyPercentage *
                              0.01 *
                              (12 / 112)
                            ).toFixed(2)}
                            </span>
                          </span>
                          <br />
                          <span style={{ fontSize: '12px' }}>
                            Instl Base Price: &nbsp;
                            <span className="price" style={{ fontSize: '16px' }}>
                              {(
                                formData.totalProjectValue *
                                (100 - formData.supplyPercentage) *
                                0.01 *
                                (100 / 118)
                              ).toFixed(2)}
                            </span> &nbsp;
                             GST (18%): &nbsp;
                            <span className="price" style={{ fontSize: '16px' }}>
                            {(
                               formData.totalProjectValue *
                               (100 - formData.supplyPercentage) *
                              0.01 *
                              (18 / 118)
                            ).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="applicationCost">Total Application Cost</label>
                        <input 
                          type="number" 
                          name="applicationCost" 
                          className="form-control" 
                          id="applicationCost" 
                          placeholder="Example:15340"
                          value={formData.applicationCost}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="meterCost">Meter Cost</label>
                        <input 
                          type="number" 
                          name="meterCost" 
                          className="form-control" 
                          id="meterCost" 
                          placeholder="Example:15340"
                          value={formData.meterCost}
                          onChange={handleChange} // Allow manual updates if needed
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="caCertificate">CA Certificate Fee</label>
                        <input 
                          type="number" 
                          name="caCertificate" 
                          className="form-control" 
                          id="caCertificate" 
                          placeholder="Example:15340"
                          value={formData.caCertificate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="fitnessCertificate">Fitness Certificate Fee</label>
                        <input 
                          type="number" 
                          name="fitnessCertificate" 
                          className="form-control" 
                          id="fitnessCertificate" 
                          placeholder="Example:15340"
                          value={formData.fitnessCertificate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    {/* Amount Section 1 fields ends here */}
                    {/* Amount Section 2 fields start here */}
                    <div className="row">
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="extraHeightTotalCost">Extra Height Cost</label>
                        <input 
                          type="number" 
                          name="extraHeightTotalCost" 
                          className="form-control" 
                          id="extraHeightTotalCost" 
                          placeholder="Example:Total Cost for Extra Height 800"
                          value={formData.extraHeightTotalCost}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="transportationCost">Transportation Cost</label>
                        <input 
                          type="number" 
                          name="transportationCost" 
                          className="form-control" 
                          id="transportationCost" 
                          placeholder="Example:15340"
                          value={formData.transportationCost}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="miscellaneousExpenses">Other Miscellaneous Expenses</label>
                        <input 
                          type="number" 
                          name="miscellaneousExpenses" 
                          className="form-control" 
                          id="miscellaneousExpenses" 
                          placeholder="Example:15340"
                          value={formData.miscellaneousExpenses}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="liaisonCost">Liaison Cost</label>
                        <input 
                          type="number" 
                          name="liaisonCost" 
                          className="form-control" 
                          id="liaisonCost" 
                          placeholder="Example:8400"
                          value={formData.liaisonCost}
                          onChange={handleChange}
                        />
                      </div>
                      </div>
                      {/* Amount Section 2 fields ends here */}
                      <div className="row">
                        <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="materialDiscount">Material Discount</label>
                        <input 
                          type="number" 
                          name="materialDiscount" 
                          className="form-control" 
                          id="materialDiscount" 
                          placeholder="Example:1000"
                          value={formData.materialDiscount}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="installationDiscount">Installation Discount</label>
                        <input 
                          type="number" 
                          name="installationDiscount" 
                          className="form-control" 
                          id="installationDiscount" 
                          placeholder="Example:1500"
                          value={formData.installationDiscount}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="erectionDiscount">Erection Discount</label>
                        <input 
                          type="number" 
                          name="erectionDiscount" 
                          className="form-control" 
                          id="erectionDiscount" 
                          placeholder="Example:2000"
                          value={formData.erectionDiscount}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-sm-4 mb-2">
                        <label className="" htmlFor="netMeteringDiscount">Net Metering Discount</label>
                        <input 
                          type="number" 
                          name="netMeteringDiscount" 
                          className="form-control" 
                          id="netMeteringDiscount" 
                          placeholder="Example:500"
                          value={formData.netMeteringDiscount}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-4 mb-2">
                        <label className="form-label" htmlFor="invoiceGeneratedBy">Invoice Generated By</label>
                        <select
                          className="form-select"
                          id="invoiceGeneratedBy"
                          name="invoiceGeneratedBy"
                          value={formData.invoiceGeneratedBy || ''}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choose...</option>
                          <option value="Dwipayan">Dwipayan</option>
                          <option value="Sourav">Sourav</option>
                          <option value="WEB-ADMIN">WEB-ADMIN</option>
                        </select>
                      </div>
                       {/* OTP input field - right side of Invoice Generated By */}
                      <div className="col-sm-4 mb-2">
                        <label className="form-label" htmlFor="otp">OTP</label>
                        <input
                          type="password"
                          name="otp"
                          className="form-control"
                          id="otp"
                          placeholder="Enter OTP"
                          required
                          value={formData.otp}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>Close</button>
                      <button type="submit" className="btn btn-primary">Generate Proforma Invoice</button>
                    </div>
        </form>
      )}
      {/* Display status message */}
      {status && (
        <div className="text-center mt-3">
          <p className={status.startsWith('✅') ? 'text-success' : 'text-danger'}>{status}</p>
        </div>
      )}
      </Modal.Body>
    </Modal>
  );
};

export default ProformaInvoice;