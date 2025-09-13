// src/components/ProformaInvoice.js
import { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import "./CommercialProformaInvoice.css";
import axios from "axios";
import config from "../../config";
import { formatDateDDMMYYYY } from '../common/common.jsx';


const CommercialPerforma = ({ show, handleClose }) => {
 const [invRequired4, setShowInverterInfo] = useState(true);
 const [showSolarInfo, setShowSolarInfo] = useState(true);
 const [submitSuccess, setSubmitSuccess] = useState("");



 const handleToggleInverter = () => {
   setShowInverterInfo(!invRequired4);
   if( invRequired4 ) {
     setFormData((prev) => ({
       ...prev,
      invRequired4 : false,
      inverterBrand: "",
      inverterPower: 0,
      inverterQuantity: 0,
      hsnsacCode2Inverter: "",
     }));
   }
 };


 const handleToggleSolar = () => {
   setShowSolarInfo(!showSolarInfo);
   if( showSolarInfo ) {
     setFormData((prev) => ({
       ...prev,
       batteryRequired9: false,
       batteryBrand: "",
      batteryType: "",
      batteryCapacity: "",
      batteryQuantity: 0,
      hsnsacCode2Solar:""
     }));
   }
 };




 const [formData, setFormData] = useState({
   clientId: "",
   invoiceNumber: "",
   clientEmail: "",
   clientAddress: "",
   clientState: "West Bengal", // Default set to West Bengal
   clientPinCode: "",
   clientIdType: "existing", // Default set to "existing"
   clientMobile: "",
   clientName: "",
   proposalDate: formatDateDDMMYYYY(new Date()), // Default to today's date
   hsnsacCode2: "",
   systemType: "",
   systemConnection: "",
   gridType: "",
   modRequired1 : true,
 
   brand: "",
   type: "",
   moduleTechnology: "",
   moduleWatt: 0,
   quantity: 0,
   //Inverter
   invRequired4 : true,
   inverterBrand: "",
   inverterPower: 0,
   inverterQuantity: 0,
   hsnsacCode2Inverter: "",
   supplyPercentage: "",
   electricSupply: "",
   //Batteries
   batteryRequired9: false,
   batteryBrand: "",
   batteryType: "",
   batteryCapacity: "",
   batteryQuantity: 0,
   hsnsacCode2Solar: "",
   invoiceGeneratedBy: "",
   sendMailToClient: "",
   pricePerWattIncGst: 0,
   mat1Required3: true,
   mat2Required5: true,
   busMcbRequired6: true,
   fireERequired7: true,
   autoCleanRequired8: true,
   stRoofRequired2: true,
   stTinRequired2: false,
   otp: "",
   mat1DCCableMaterial:"Copper" //Dropdown Field "Copper","Aluminium"
 });


 const [status, setStatus] = useState("");
 const [isLoading, setIsLoading] = useState(false);


 const handleChange = (e) => {
   const { name, value } = e.target;


   // List of boolean fields
   const booleanFields = [
     "mat1Required3",
     "mat2Required5",
     "busMcbRequired6",
     "fireERequired7",
     "autoCleanRequired8",
     "stRoofRequired2",
     "stTinRequired2"
   ];


   setFormData((prev) => {
    const newValue = booleanFields.includes(name) ? value === "true" : value;
    
    const newFormData = {
      ...prev,
      [name]: newValue,
    };

    // Handle the roof/tin structure toggle
    if (name === "stRoofRequired2") {
      // Only set tin to false if roof is being set to true
      if (newValue === true) {
        newFormData.stTinRequired2 = false;
      }
      // If roof is being set to false, leave tin as-is (could be true or false)
    } else if (name === "stTinRequired2") {
      // Only set roof to false if tin is being set to true
      if (newValue === true) {
        newFormData.stRoofRequired2 = false;
      }
      // If tin is being set to false, leave roof as-is (could be true or false)
    }

    // Check if systemType is being changed to "Ongrid Solar System"
    if (name === "systemType" && value === "Ongrid Solar System") {
      setShowSolarInfo(false);
    }
    
    return newFormData;
    });
  };


 const handleClientIdChange = (e) => {
   let val = e.target.value.replace(/^Sc/, "");
   val = val.replace(/\D/g, "");
   val = val ? `Sc${val}` : "";
   setFormData((prev) => ({
     ...prev,
     clientId: val,
   }));
 };


 const handleSubmit = async (e) => {
   e.preventDefault();
   setIsLoading(true); // Show loader
   setStatus(""); // Clear previous status
   setSubmitSuccess("");
  


   await axios
     .post(
       `${config.MernBaseURL}/proformainvoice/create`,
       {
         ...formData,
         formType: "cpi",
       },
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
    clientId: "",
    invoiceNumber: "",
    clientEmail: "",
    clientAddress: "",
    clientState: "West Bengal", // Default set to West Bengal
    clientPinCode: "",
    clientIdType: "existing", // Default set to "existing"
    clientMobile: "",
    clientName: "",
    proposalDate: formatDateDDMMYYYY(new Date()), // Default to today's date
    hsnsacCode2: "",
    systemType: "",
    systemConnection: "",
    gridType: "",
    modRequired1 : true,
  
    brand: "",
    type: "",
    moduleTechnology: "",
    moduleWatt: 0,
    quantity: 0,
    //Inverter
    invRequired4 : true,
    inverterBrand: "",
    inverterPower: 0,
    inverterQuantity: 0,
    hsnsacCode2Inverter: "",
    supplyPercentage: "",
    electricSupply: "",
    //Batteries
    batteryRequired9: false,
    batteryBrand: "",
    batteryType: "",
    batteryCapacity: "",
    batteryQuantity: 0,
    hsnsacCode2Solar: "",
    invoiceGeneratedBy: "",
    sendMailToClient: "",
    
    pricePerWattIncGst: 0,
    mat1Required3: true,
    mat2Required5: true,
    busMcbRequired6: true,
    fireERequired7: true,
    autoCleanRequired8: true,
    stRoofRequired2: true,
    stTinRequired2: false,
    otp: "",
    mat1DCCableMaterial:"Copper" //Dropdown Field "Copper","Aluminium"
   });


   setStatus("");
   handleClose();
 };


 const handleClientIdTypeChange = (e) => {
   const { value } = e.target;


   if (value === "temporary") {
     const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
     const temporaryId = `Sc5${randomNum}`;
     setFormData((prev) => ({
       ...prev,
       clientId: temporaryId,
     }));
   } else if (value === "existing") {
     setFormData((prev) => ({
       ...prev,
       clientId: "",
     }));
   }
 };


 useEffect(() => {
   // Only auto-update if both values are present and are numbers
   const moduleWatt = parseFloat(formData.moduleWatt);
   const quantity = parseFloat(formData.quantity);
   if (!isNaN(moduleWatt) && !isNaN(quantity)) {
     let autoValue = (moduleWatt * quantity * 0.001).toFixed(3);
     // Remove trailing zeros after decimal (e.g., 3.000 -> 3, 3.100 -> 3.1)
     autoValue = parseFloat(autoValue).toString();
     if (formData.totalKW !== autoValue) {
       setFormData((prev) => ({
         ...prev,
         totalKW: autoValue,
       }));
     }
   } else if (formData.totalKW !== "") {
     setFormData((prev) => ({
       ...prev,
       totalKW: "",
     }));
   }
 }, [formData.moduleWatt, formData.quantity]);




  // Dummy data setup for localhost (like ProformaInvoice.jsx)
  const setDummyData = () => {
    setFormData({
      clientId: "Sc9999999",
      invoiceNumber: "CPI-2025-001",
      clientEmail: "tdsolar9@gmail.com",
      clientAddress: "123, Commercial Street, Kolkata",
      clientState: "West Bengal",
      clientPinCode: "700001",
      clientIdType: "existing",
      clientMobile: "9999999999",
      clientName: "COM TEST TEST Client Name",
      proposalDate: "2025-07-10",
      hsnsacCode2: "85414011",
      hsnsacCode2Inverter: "85044030",
      hsnsacCode2Solar: "85078000",
      systemType: "Ongrid Solar System",
      systemConnection: "With Net Metering",
      gridType: "On-Grid",
      invRequired4: true,
      brand: "UTL",
      type: "DCR",
      moduleTechnology: "MONO-PERC Half-Cut",
      moduleWatt: 540,
      quantity: 20,
      inverterBrand: "LUMINOUS",
      inverterPower: 10,
      supplyPercentage: 80,
      electricSupply: "CESC",
      batteryBrand: "LUMINOUS",
      batteryType: "C10 Lead Acid Battery - 12V",
      batteryCapacity: "200 AH",
      batteryQuantity: "4",
      invoiceGeneratedBy: "WEB-ADMIN",
      inverterQuantity: "2",
      pricePerWattIncGst: 38,
      mat1Required3: true,
      mat2Required5: true,
      busMcbRequired6: true,
      fireERequired7: true,
      autoCleanRequired8: true,
      stRoofRequired2: true,
      stTinRequired2: false,
      otp: "9064",
    });
  };


 useEffect(() => {
   if (window.location.hostname === "localhost") {
     //setDummyData();
   }
 }, []);


 return (
   <Modal show={show} onHide={handleClose} size="xl">
     <Modal.Header closeButton className="bg-primary text-white">
       <Modal.Title>Commercial Proforma Invoice Form</Modal.Title>
     </Modal.Header>
     <Modal.Body
      className="proforma-modal-body"
     >
       {isLoading && (
         <div id="loader" className="text-center my-3">
           <div className="spinner-border text-primary" role="status">
             <span className="visually-hidden">Loading...</span>
           </div>
         </div>
       )}
       {!isLoading && !status && (
         <form
           className="gx-3 gy-2 align-items-center proforma-form"
           id="proforma-form"
           onSubmit={handleSubmit}
         >
           <div
             className="row py-2"
           >
             <span className="section-title"
             >
               Client Information
             </span>
             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="clientName">
                 Client Name:
               </label>
               <input
                 type="text"
                 name="clientName"
                 className="form-control"
                 id="clientName"
                 placeholder="Example:Client Name"
                 value={formData.clientName}
                 required
                 onChange={handleChange}
               />
             </div>
             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="clientMobile">
                 Client Mobile Number:
               </label>
               <input
                 type="number"
                 name="clientMobile"
                 className="form-control"
                 id="clientMobile"
                 placeholder="Example:9999966666"
                 value={formData.clientMobile}
                 required
                 onChange={handleChange}
               />
             </div>


             <div className="col-sm-4 mb-2">
               <label className="" htmlFor="clientEmail">
                 Client Email ID:{" "}
               </label>
               <input
                 type="email"
                 name="clientEmail"
                 className="form-control"
                 id="clientEmail"
                 placeholder="Invoice will send here"
                 autoComplete="off"
                 value={formData.clientEmail}
                 required
                 onChange={handleChange}
               />
             </div>
             <div className="col-sm-4 mb-2">
               <label className="" htmlFor="clientAddress">
                 Client Address:{" "}
               </label>
               <input
                 type="address"
                 name="clientAddress"
                 className="form-control"
                 id="clientAddress"
                 placeholder="Invoice will send here"
                 autoComplete="off"
                 value={formData.clientAddress}
                 required
                 onChange={handleChange}
               />
             </div>
             <div className="col-sm-4 mb-2">
               <label className="" htmlFor="clientState">
                 Client State:{" "}
               </label>
               <input
                 type="address"
                 name="clientState"
                 className="form-control"
                 id="clientState"
                 placeholder="Invoice will send here"
                 autoComplete="off"
                 value={formData.clientState}
                 required
                 onChange={handleChange}
               />
             </div>
             <div className="col-sm-4 mb-2">
               <label className="" htmlFor="clientPinCode">
                 Client Pin Code:{" "}
               </label>
               <input
                 type="address"
                 name="clientPinCode"
                 className="form-control"
                 id="clientPinCode"
                 placeholder="Invoice will send here"
                 autoComplete="off"
                 value={formData.clientPinCode}
                 required
                 onChange={handleChange}
               />
             </div>
             <div
               className="row py-2"
             >
               <div className="col-sm-4 mb-2">
                 <label htmlFor="clientIdType">Client ID Type:</label>
                 <div className="form-check">
                   <input
                     className="form-check-input"
                     type="radio"
                     name="clientIdType"
                     id="existingClientId"
                     value="existing"
                     checked={formData.clientIdType === "existing"}
                     onChange={(e) => {
                       handleClientIdTypeChange(e);
                       setFormData((prev) => ({
                         ...prev,
                         clientIdType: "existing",
                       }));
                     }}
                   />
                   <label
                     className="form-check-label"
                     htmlFor="existingClientId"
                   >
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
                     checked={formData.clientIdType === "temporary"}
                     onChange={(e) => {
                       handleClientIdTypeChange(e);
                       setFormData((prev) => ({
                         ...prev,
                         clientIdType: "temporary",
                       }));
                     }}
                   />
                   <label
                     className="form-check-label"
                     htmlFor="temporaryClientId"
                   >
                     Temporary Client ID
                   </label>
                 </div>


                 <label className="mt-2" htmlFor="clientId">
                   Client ID:{" "}
                 </label>
                 <input
                   type="text"
                   name="clientId"
                   className="form-control"
                   id="clientId"
                   placeholder="Without 'SC-' ; Example:1044"
                   pattern="^Sc.*"
                   autoComplete="off"
                   readOnly={formData.clientIdType === "temporary"}
                   style={{
                     backgroundColor:
                       formData.clientIdType === "temporary" ? "#f8f9fa" : "",
                   }}
                   value={formData.clientId}
                   onChange={handleClientIdChange}
                   required
                 />
               </div>
             </div>
           </div>


           <div className="">
             <span className="section-title text-center"
             >
               System Information
             </span>


             <div
               className="row py-3"
             >
               <div className="col-sm-4 mb-2">
                 <label htmlFor="systemType">System Type</label>
                 <select
                   className="form-select"
                   id="systemType"
                   name="systemType"
                   value={formData.systemType}
                   onChange={handleChange}
                   required
                 >
                   <option value="">Choose...</option>
                   <option value="Ongrid Solar System">
                     Ongrid Solar System
                   </option>
                   <option value="Offgrid Solar System">
                     Offgrid Solar System
                   </option>
                   <option value="Hybrid Solar System">
                     Hybrid Solar System
                   </option>
                   <option value="NA">NA</option>
                 </select>
               </div>


               <div className="col-sm-4 mb-2">
                 <label htmlFor="systemConnection">System Connection</label>
                 <select
                   className="form-select"
                   id="systemConnection"
                   name="systemConnection"
                   value={formData.systemConnection}
                   onChange={handleChange}
                   required
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
                   value={formData.electricSupply || ""}
                  onChange={handleChange}
                  required
                 >
                   <option value="">Choose...</option>
                   <option value="CESC">CESC</option>
                   <option value="WBSEDCL">WBSEDCL</option>
                   <option value="NA">NA</option>
                 </select>
               </div>
             </div>
           </div>


           <div>
             <div className="d-flex align-items-center justify-content-center mb-3 gap-5">
               <span className="section-title"
               >
                 Module Information
               </span>
               
             </div>


               <div
                 className="row py-2"
               >
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="brand">
                     Brand Name
                   </label>
                   <select
                     className="form-select"
                     id="brand"
                     name="brand"
                     value={formData.brand}
                     onChange={handleChange}
                     required
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
                   <label className="" htmlFor="type">
                     Module Type
                   </label>
                   <select
                     className="form-select"
                     id="type"
                     name="type"
                     value={formData.type}
                     onChange={handleChange}
                     required
                   >
                     <option value="">Choose...</option>
                     <option value="DCR">DCR</option>
                     <option value="NON-DCR">NON-DCR</option>
                   </select>
                 </div>
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="moduleTechnology">
                     Module Technology
                   </label>
                   <select
                     className="form-select"
                     id="moduleTechnology"
                     name="moduleTechnology"
                     value={formData.moduleTechnology}
                     onChange={handleChange}
                     required
                   >
                     <option value="">Choose...</option>
                     <option value="MONO-PERC Half-Cut">
                       MONO-PERC Half-Cut
                     </option>
                     <option value="Half-Cut Bi-facial">
                       Half-Cut Bi-facial
                     </option>
                     <option value="TOP CON">TOP CON</option>
                     <option value="NA">NA</option>
                   </select>
                 </div>
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="moduleWatt">
                     Watt (Per Module):
                   </label>
                   <input
                     type="number"
                     name="moduleWatt"
                     className="form-control"
                     id="moduleWatt"
                     placeholder="Example:535"
                     min="1"
                     value={formData.moduleWatt}
                     onChange={handleChange}
                   />
                 </div>
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="quantity">
                     Quantity (Total Modules):
                   </label>
                   <input
                     type="number"
                     name="quantity"
                     className="form-control"
                     id="quantity"
                     placeholder="Example:6"
                     min="1"
                     value={formData.quantity}
                     onChange={handleChange}
                   />
                 </div>
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="totalKW">
                     PV Total Rating(KW)
                   </label>
                   <input
                     type="number"
                     name="totalKW"
                     className="form-control"
                     id="totalKW"
                     placeholder="Auto-calculated"
                     value={formData.totalKW || ""}
                     onChange={handleChange}
                     step="any"
                   />
                 </div>
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="hsnsacCode2">
                     HSN/SAC Code:
                   </label>
                   <input
                     type="number"
                     className="form-control"
                     id="hsnsacCode2"
                     name="hsnsacCode2"
                     value={formData.hsnsacCode2}
                     onChange={handleChange}
                   />
                 </div>
               </div>
           </div>


           <div>
             <div className="d-flex align-items-center justify-content-center mb-3 gap-5">
               <span className="section-title"
               >
                 Inverter Information
               </span>
               <div
                 className="form-check form-switch d-flex align-items-center gap-2 section-switch"
               >
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="invRequired4"
                   checked={invRequired4}
                   onChange={handleToggleInverter}
                 />
                 <label
                   className="form-check-label fw-semibold"
                   htmlFor="invRequired4"
                 >
                   {invRequired4 ? "Show" : "Hide"}
                 </label>
               </div>
             </div>


             {invRequired4 && (
               <div
                 className="row py-3"
               >
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="inverterBrand">
                     Inverter Brand
                   </label>
                   <select
                     className="form-select"
                     id="inverterBrand"
                     name="inverterBrand"
                     value={formData.inverterBrand}
                     onChange={handleChange}
                     required
                   >
                     <option value="">Choose...</option>
                     <option value="UTL/DEYE/GROWATT">UTL/DEYE/GROWATT</option>
                     <option value="LUMINOUS/HAVELS/MIRCROTECK/LOOM">
                       LUMINOUS/HAVELS/MIRCROTECK/LOOM
                     </option>
                     <option value="WAREE/HAVELS/MIRCROTECK">
                       WAREE/HAVELS/MIRCROTECK
                     </option>
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
                   <label className="" htmlFor="inverterPower">
                     Inverter Power in KW
                   </label>
                   <select
                     className="form-select"
                     id="inverterPower"
                     name="inverterPower"
                     value={formData.inverterPower}
                     onChange={handleChange}
                     required
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
                         <option key={val} value={val}>
                           {val} KW
                         </option>
                       );
                     })}
                     <option value="NA">NA</option>
                   </select>
                 </div>
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="inverterQuantity">
                     Inverter Quantity
                   </label>
                   <select
                     className="form-select"
                     id="inverterQuantity"
                     name="inverterQuantity"
                     value={formData.inverterQuantity}
                     onChange={handleChange}
                     required
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


                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="hsnsacCode2Inverter">
                     HSN/SAC Code:
                   </label>
                   <input
                     type="number"
                     className="form-control"
                     id="hsnsacCode2Inverter"
                     name="hsnsacCode2Inverter"
                     value={formData.hsnsacCode2Inverter}
                     onChange={handleChange}
                   />
                 </div>
                 
               </div>
             )}
           </div>
           {/* SOLAR BATTERY STARTS */}


           <div>
             <div className="d-flex align-items-center justify-content-center mb-3 gap-5">
               <span className="section-title"
               >
                 Solar Battery
               </span>
               <div
                 className="form-check form-switch d-flex align-items-center gap-2 section-switch"
               >
                 <input
                   className="form-check-input"
                   type="checkbox"
                   id="toggleSystemInfo"
                   checked={showSolarInfo}
                   onChange={handleToggleSolar}
                 />
                 <label
                   className="form-check-label fw-semibold"
                   htmlFor="toggleSystemInfo"
                 >
                   {showSolarInfo ? "Show" : "Hide"}
                 </label>
               </div>
             </div>


             {showSolarInfo && (
               <div
                 className="row py-2"
               >
                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="batteryBrand">
                     Solar Battery Brand
                   </label>
                   <select
                     className="form-select"
                     id="batteryBrand"
                     name="batteryBrand"
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
                   <label className="" htmlFor="batteryType">
                     Solar Battery Type
                   </label>
                   <select
                     className="form-select"
                     id="batteryType"
                     name="batteryType"
                     value={formData.batteryType}
                     onChange={handleChange}
                   >
                     <option value="">Choose...</option>
                     <option value="C10 Lead Acid Battery - 12V">
                       C10 Lead Acid Battery - 12V
                     </option>
                     <option value="Li-Battery - 24V">Li-Battery - 24V</option>
                     <option value="Li-Battery - 48V">Li-Battery - 48V</option>
                     <option value="Any Type">Any Type</option>
                     <option value="NA">NA</option>
                   </select>
                 </div>


                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="batteryCapacity">
                     Solar Battery Capacity
                   </label>
                   <select
                     className="form-select"
                     id="batteryCapacity"
                     name="batteryCapacity"
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
                   <label className="" htmlFor="batteryQuantity">
                     Solar Battery Quantity
                   </label>
                   <select
                     className="form-select"
                     id="batteryQuantity"
                     name="batteryQuantity"
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


                 <div className="col-sm-4 mb-2">
                   <label className="" htmlFor="hsnsacCode2Solar">
                     HSN/SAC Code:
                   </label>
                   <input
                     type="number"
                     className="form-control"
                     id="hsnsacCode2Solar"
                     name="hsnsacCode2Solar"
                     value={formData.hsnsacCode2Solar}
                     onChange={handleChange}
                   />
                 </div>
               </div>
             )}
           </div>


           {/* SOLAR BATTERY ENDS */}
           {/* Amount Section 1 fields start here */}
           <div
             className="row py-3"
           >
             
             <div className="col-sm-4 mb-2">
               <label className="" htmlFor="supplyPercentage">
                 Supply Percentage
               </label>
               <input
                 type="number"
                 name="supplyPercentage"
                 className="form-control"
                 id="supplyPercentage"
                 placeholder="Example:80"
                 max="100"
                 min="1"
                 value={formData.supplyPercentage}
                 onChange={handleChange}
               />
             </div>
             
             <div className="col-sm-4 mb-2">
               <Form.Group>
                 <Form.Label htmlFor="pricePerWattIncGst">
                   Price Per Watt (Inc. GST):
                 </Form.Label>
                 <Form.Control
                   type="number"
                   name="pricePerWattIncGst"
                   id="pricePerWattIncGst"
                   placeholder="Price Per Watt (Inc. GST)"
                   value={formData.pricePerWattIncGst }
                   min="1"
                   onChange={handleChange}
                 />
               </Form.Group>
             </div>
             <div className="col-sm-4 mb-2">
               <label className="" htmlFor="BasePrice">
                 Total Amount
               </label>
               <p>{formData.moduleWatt*formData.quantity*formData.pricePerWattIncGst}</p>
             </div>
           </div>


           {/* Choose Section If Needed part 2*/}
           <div>
               <div
                 className="row py-3"
               >
                 <div className="col-sm-4 mb-2">
                   <label className="form-label" htmlFor="stRoofRequired2">
                     Structure For Roof Required?
                   </label>
                   <select
                     className="form-select"
                     id="stRoofRequired2"
                     name="stRoofRequired2"
                     value={formData.stRoofRequired2 || false}
                     onChange={handleChange}
                     required
                   >
                     <option value="true">Yes</option>
                     <option value="false">No</option>
                   </select>
                 </div>
                 <div className="col-sm-4 mb-2">
                   <label className="form-label" htmlFor="stTinRequired2">
                     Structure For Tin Required?
                   </label>
                   <select
                     className="form-select"
                     id="stTinRequired2"
                     name="stTinRequired2"
                     value={formData.stTinRequired2 || false}
                     onChange={handleChange}
                     required
                   >
                     <option value="">Choose...</option>
                     <option value="true">Yes</option>
                     <option value="false">No</option>
                   </select>
                 </div>
               </div>
           </div>


           {/* Choose Section If Needed paert 35678*/}
           <div
             className="row py-2"
           >
             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="mat1Required3">
                 DC cabel, JB, LA, Earth.. Required ?
               </label>
               <select
                 className="form-select"
                 id="mat1Required3"
                 name="mat1Required3"
                 value={formData.mat1Required3}
                 onChange={handleChange}
                 required
               >
                 <option value="">Choose...</option>
                 <option value="true">Yes</option>
                 <option value="false">No</option>
               </select>
             </div>


             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="mat2Required5">
                 AC cabel, ACDB, PIPE.. Required ?
               </label>
               <select
                 className="form-select"
                 id="mat2Required5"
                 name="mat2Required5"
                 value={formData.mat2Required5}
                 onChange={handleChange}
                 required
               >
                 <option value="">Choose...</option>
                 <option value="true">Yes</option>
                 <option value="false">No</option>
               </select>
             </div>


             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="busMcbRequired6">
                 Bus MCB Required ?
               </label>
               <select
                 className="form-select"
                 id="busMcbRequired6"
                 name="busMcbRequired6"
                 value={formData.busMcbRequired6}
                 onChange={handleChange}
                 required
               >
                 <option value="">Choose...</option>
                 <option value="true">Yes</option>
                 <option value="false">No</option>
               </select>
             </div>


             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="fireERequired7">
                 Fire Extinguisher Required ?
               </label>
               <select
                 className="form-select"
                 id="fireERequired7"
                 name="fireERequired7"
                 value={formData.fireERequired7}
                 onChange={handleChange}
                 required
               >
                 <option value="">Choose...</option>
                 <option value="true">Yes</option>
                 <option value="false">No</option>
               </select>
             </div>


             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="autoCleanRequired8">
                 Auto Cleaning System Required ?
               </label>
               <select
                 className="form-select"
                 id="autoCleanRequired8"
                 name="autoCleanRequired8"
                 value={formData.autoCleanRequired8}
                 onChange={handleChange}
                 required
               >
                 <option value="">Choose...</option>
                 <option value="true">Yes</option>
                 <option value="false">No</option>
               </select>
             </div>
           </div>


           {/* Amount Section 2 fields start here */}


           {/* Amount Section 2 fields ends here */}


           <div
             className="row py-2"
           >
             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="invoiceGeneratedBy">
                 Invoice Generated By
               </label>
               <select
                 className="form-select"
                 id="invoiceGeneratedBy"
                 name="invoiceGeneratedBy"
                 value={formData.invoiceGeneratedBy || ""}
                 onChange={handleChange}
                 required
               >
                 <option value="">Choose...</option>
                 <option value="Dwipayan">Dwipayan</option>
                 <option value="Sourav">Sourav</option>
                 <option value="WEB-ADMIN">WEB-ADMIN</option>
               </select>
             </div>
             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="otp">
                 OTP:
               </label>
               <input
                 type="password"
                 name="otp"
                 className="form-control"
                 id="otp"
                 placeholder="Example:8756"
                 value={formData.otp}
                 onChange={handleChange}
                 required
               />
             </div>
             <div className="col-sm-4 mb-2">
               <label className="form-label" htmlFor="sendMailToClient">
                 Send Mail to Client
               </label>
               <select
                 className="form-select"
                 id="sendMailToClient"
                 name="sendMailToClient"
                 value={formData.sendMailToClient || ""}
                 onChange={handleChange}
                 required
               >
                 <option value="">Choose...</option>
                 <option value="No">No</option>
                 <option value="Yes">Yes</option>
               </select>
             </div>
           </div>
           <div className="modal-footer">
             <button
               type="button"
               className="btn btn-secondary"
               data-bs-dismiss="modal"
               onClick={resetForm}
             >
               Close
             </button>
             <button type="submit" className="btn btn-primary">
               Generate Proforma Invoice
             </button>
           </div>
         </form>
       )}
       {/* Display status message */}
       {status && (
         <div className="text-center mt-3">
           <p
             className={
               status.startsWith("✅") ? "text-success" : "text-danger"
             }
           >
             {status}
           </p>
         </div>
       )}
     </Modal.Body>
   </Modal>
 );
};


export default CommercialPerforma;



