import axios from "axios";
import config from '../../config';
export const formatDateDDMMYYYY = (inputDate = new Date()) => {
  if (!(inputDate instanceof Date)) inputDate = new Date(inputDate);

  // IST offset in milliseconds
  const ISTOffsetMs = 5.5 * 60 * 60 * 1000;

  // Create adjusted date for IST
  const istDate = new Date(inputDate.getTime() + ISTOffsetMs);

  const [year, month, day] = istDate.toISOString().split('T')[0].split('-');
  return `${day}-${month}-${year}`;
};


//Update status to active in proforma invoice DB
  export const updateInvoiceStatus = async (id, status) => {
  try {
    const response = await axios.post(
      `${config.MernBaseURL}/proformainvoice/updateInvoiceStatus`,
      { id, status },  // Object shorthand syntax
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;  // Return the response data for further processing
  } catch (error) {
    console.error('Update status error:', error.response?.data || error.message);
    throw error;  // Re-throw to let calling function handle it
  }
};