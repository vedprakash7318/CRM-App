import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Modal from 'react-bootstrap/Modal';
import Dashboard from '../../Components/Dashboard';
import { fetchLeadStatus } from '../../Features/LeadSlice';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

function LeadStatus() {  
  const APi_Url=import.meta.env.VITE_API_URL
  const [show, setShow] = useState(false);
  const [statusText,setStatusText]=useState();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const LeadStatusData = useSelector((state) => state.leads.LeadStatus); 
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Redirect if no token is present  
  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch data from the API when the component mounts
  useEffect(() => {
     dispatch(fetchLeadStatus());
  }, [dispatch]);
  const srNoTemplate = (rowData, { rowIndex }) => {
    return <span>{rowIndex + 1}</span>;
  };



  const handleSaveStatus=async()=>{
    try {
      const AdminId = localStorage.getItem('AdminId');
      console.log(AdminId);
      const userType = "Admin";
      const apiUrl = `${APi_Url}/digicoder/crm/api/v1/leadstatus/add/${AdminId}`;
      // Sending POST request with priorityText
      const response = await axios.post(apiUrl, { statusText, userType });
      console.log(response);

      toast.success('LeadStatus saved successfully');
      setStatusText('');
      setShow(false);
      dispatch(fetchLeadStatus()); // Refetch the priority data

    } catch (error) {
      toast.error('Error saving priority');
      console.error("Error details: ", error);
    }
  }



  
  const handleDelete = (rowData) => {
    console.log(rowData);
    
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async(result) => {
      if (result.isConfirmed) {
        const apiUrl = `${APi_Url}/digicoder/crm/api/v1/leadstatus/delete/${rowData._id}`;
        await axios.delete(apiUrl)
          .then(() => {
            
            
            toast.success('Data deleted successfully');
            dispatch(fetchLeadStatus()); // Refetch after deletion
          })
          .catch((error) => {
            console.log(error);
            
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
      <Dashboard active={'status'}>
        <div className="content-wrapper">
          <div className="content">
            <div className="card">
              {Array.isArray(LeadStatusData) && LeadStatusData.length > 0 ? (
              <DataTable value={LeadStatusData} stripedRows bordered>
                <Column body={srNoTemplate} header="Sr. No." sortable></Column> 
                <Column field="leadStatusText" header="Status" sortable></Column>
                <Column header="Action" body={actionBodyTemplate}></Column>
              </DataTable>
              ) : (
                <div>No priority data available</div>
              )}

              {/* Modal for Add New Lead Status */}
              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Add New Lead Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <input
                      type="text"
                      placeholder="Enter status"
                      value={statusText}
                      onChange={(e)=>setStatusText(e.target.value)}
                      style={{ outline: "none", padding: "8px", width: "100%" }}
                    />
                    <button
                      style={{
                        marginLeft: "10px", padding: "10px 26px", border: "none", backgroundColor: "#3454D1", color: "white", fontSize: "20px"
                      }}
                      onClick={()=>handleSaveStatus()}
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

export default LeadStatus;
