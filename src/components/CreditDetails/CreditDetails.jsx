import React, { useState, useEffect } from "react";
import { Table, Button, Pagination } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import './CreditDetails.css';
import config from "../../config";
import AddCreditModal from './AddCreditModal';
import EditCreditModal from './EditCreditModal';
import DeleteCreditModal from './DeleteCreditModal'; // Import DeleteCreditModal

const CreditDetails = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [showEditCreditModal, setShowEditCreditModal] = useState(false);
  const [showDeleteCreditModal, setShowDeleteCreditModal] = useState(false); // State for DeleteCreditModal
  const [selectedCreditData, setSelectedCreditData] = useState(null);
  const [selectedCreditId, setSelectedCreditId] = useState(null); // State for selected credit ID

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        config.creditTransactionsGoogleURL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ action: "getData" }),
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        setData(result.data);
        setTotalItems(result.data.length); // Update total items based on response
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Action handlers
  const handleEdit = (id) => {
    const creditToEdit = data.find((item) => item.Id === id);
    setSelectedCreditData(creditToEdit);
    setShowEditCreditModal(true);
  };

  const handleDelete = (id) => {
    setSelectedCreditId(id); // Set the selected credit ID
    setShowDeleteCreditModal(true); // Open the DeleteCreditModal
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Credit Details</h4>
        <Button variant="primary" onClick={() => setShowAddCreditModal(true)}>Add Credit</Button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Account Name</th>
                <th>Credit Code</th>
                <th>Head</th>
                <th>Amount</th>
                <th>Credited On</th>
                <th>Details</th>
                <th>Transaction Type</th>
                <th>Attachment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{item.acName}</td>
                  <td>{item.creditCode}</td>
                  <td>{item.head || "N/A"}</td>
                  <td style={{ fontWeight: "bold", fontSize: "1.2rem" }} className="td-pink">{item.amount}</td>
                  <td>{item.crediteOn}</td>
                  <td>{item.details}</td>
                  <td>{item.transactionType}</td>
                  <td>
                    <a href={item.attachment} target="_blank" rel="noopener noreferrer" className="td-pink" style={{ fontWeight: "bold" }}>
                      View
                    </a>
                  </td>
                  <td>
                    <FaEdit
                      className="text-primary me-4"
                      style={{ cursor: "pointer", fontSize: "1.4rem" }}
                      onClick={() => handleEdit(item.Id)}
                    />
                    <FaTrash
                      className="text-danger"
                      style={{ cursor: "pointer", fontSize: "1.4rem" }}
                      onClick={() => handleDelete(item.Id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      {/* Pagination */}
      <Pagination className="justify-content-center">
        {Array.from({ length: Math.ceil(totalItems / itemsPerPage) || 1 }, (_, i) => (
          <Pagination.Item
            key={`page-${i + 1}`}
            active={i + 1 === currentPage}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
      <AddCreditModal
        show={showAddCreditModal}
        handleClose={() => setShowAddCreditModal(false)}
      />
      <EditCreditModal
        show={showEditCreditModal}
        handleClose={() => setShowEditCreditModal(false)}
        creditData={selectedCreditData}
        fetchData={fetchData} // Pass fetchData to EditCreditModal
      />
      <DeleteCreditModal
        show={showDeleteCreditModal}
        handleClose={() => setShowDeleteCreditModal(false)}
        creditId={selectedCreditId} // Pass the selected credit ID
        fetchData={fetchData} // Pass fetchData to refresh the data
      />
    </div>
  );
};

export default CreditDetails;