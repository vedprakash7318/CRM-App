import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Modal from 'react-bootstrap/Modal';
import Dashboard from '../../Components/Dashboard';
import { fetchPriority } from '../../Features/LeadSlice'; // Assuming the action is defined in LeadSlice
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

function Priority() {  
  const APi_Url=import.meta.env.VITE_API_URL
  const [show, setShow] = useState(false);
  const [priorityText, setPriorityText] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const priorityData = useSelector((state) => state.leads.Priority); // Assuming this is an array of priority objects
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Redirect if no token is present
  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch priority data when the component mounts
  useEffect(() => {
    dispatch(fetchPriority());
  }, [dispatch]);

  const srNoTemplate = (rowData, { rowIndex }) => {
    return <span>{rowIndex + 1}</span>;
  };

  const handleSavePriority = async () => {
    try {
      const AdminId = localStorage.getItem('AdminId');
      const userType = "Admin";
      const apiUrl = `${APi_Url}/digicoder/crm/api/v1/priority/add/${AdminId}`;
      
      const response = await axios.post(apiUrl, { priorityText, userType });

      toast.success('Priority saved successfully');
      setPriorityText('');
      setShow(false);
      dispatch(fetchPriority()); // Refetch after saving the new priority

    } catch (error) {
      toast.error('Error saving priority');
      console.error("Error details: ", error);
    }
  };

  const handleDelete = (rowData) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const apiUrl = `${APi_Url}/digicoder/crm/api/v1/priority/delete/${rowData._id}`;
        
        await axios.delete(apiUrl)
          .then(() => {
            toast.success('Data deleted successfully');
            dispatch(fetchPriority()); // Refetch after deletion
          })
          .catch((error) => {
            console.error("Error deleting data", error);
            toast.error('Error deleting data');
          });
      }
    });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div>
        <button
          style={{
            color: "red", backgroundColor: "transparent", border: "none", fontSize: "20px", cursor: "pointer"
          }}
          onClick={() => handleDelete(rowData)}
        >
          <i className="ri-delete-bin-5-fill"></i>
        </button>
      </div>
    );
  };

  return (
    <div>
      <Dashboard active={'priority'}>
        <div className="content-wrapper">
          <div className="content">
            <div className="card">
              {/* <div className="flex justify-content-between p-4">
                <h1>Priority</h1>
                <button
                  style={{
                    border: "none", backgroundColor: "#3454D1", color: "white", fontSize: "18px", borderRadius: "10px", cursor: "pointer", padding: "0px 20px"
                  }}
                  onClick={handleShow}
                >
                  Add New
                </button>
              </div> */}

              {Array.isArray(priorityData) && priorityData.length > 0 ? (
                <DataTable value={priorityData} stripedRows bordered>
                  <Column body={srNoTemplate} header="Sr. No." sortable></Column>
                  <Column field="priorityText" header="Priority" sortable></Column>
                  <Column header="Action" body={actionBodyTemplate}></Column>
                </DataTable>
              ) : (
                <div>No priority data available</div>
              )}

              {/* Modal for Add New Priority */}
              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Add New Priority</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <input
                      type="text"
                      placeholder="Enter priority"
                      value={priorityText}
                      onChange={(e) => setPriorityText(e.target.value)}
                      style={{ outline: "none", padding: "8px", width: "100%" }}
                    />
                    <button
                      style={{
                        marginLeft: "10px", padding: "10px 26px", border: "none", backgroundColor: "#3454D1", color: "white", fontSize: "20px"
                      }}
                      onClick={handleSavePriority}
                    >
                      Save
                    </button>
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          </div>
        </div>
      </Dashboard>
    </div>
  );
}

export default Priority;
