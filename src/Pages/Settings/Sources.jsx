import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Modal from 'react-bootstrap/Modal';
import Dashboard from '../../Components/Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { fetchSources } from '../../Features/LeadSlice';
import axios from 'axios';

function Sources() {
  const [show, setShow] = useState(false);
  const [SourcesText, setSourcesText] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sourcesData = useSelector((state) => state.leads.leadSources);
 const APi_Url=import.meta.env.VITE_API_URL
  const handleClose = () => {
    setShow(false);
    setSourcesText('');
  };
  const handleShow = () => setShow(true);

  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchSources());
  }, [dispatch]);

  const srNoTemplate = (rowData, { rowIndex }) => {
    return <span>{rowIndex + 1}</span>;
  };

  const handleSaveSource = async () => {
    if (SourcesText.trim() === '') {
      toast.error('Source text cannot be empty');
      return;
    }

    try {
      const AdminId = localStorage.getItem('AdminId');
      const userType = 'Admin';
      const apiUrl = `${APi_Url}/digicoder/crm/api/v1/leadSources/add/${AdminId}`;
      await axios.post(apiUrl, { SourcesText, userType });
      toast.success('Source added successfully');
      
      setSourcesText('');
      setShow(false);
      dispatch(fetchSources());
    } catch (error) {
      toast.error('Error saving source');
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
        try {
          const apiUrl = `${APi_Url}/digicoder/crm/api/v1/leadSources/delete/${rowData._id}`;
          await axios.delete(apiUrl);
          toast.success('Source deleted successfully');
          dispatch(fetchSources());
        } catch (error) {
          toast.error('Error deleting source');
        }
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
      <Dashboard active={'source'}>
        <div className="content-wrapper">
          <div className="content">
            <div className="card">
              {Array.isArray(sourcesData) && sourcesData.length > 0 ? (
                <DataTable value={sourcesData} stripedRows bordered>
                  <Column body={srNoTemplate} header="Sr. No." sortable></Column>
                  <Column field="leadSourcesText" header="Source" sortable></Column>
                  <Column header="Action" body={actionBodyTemplate}></Column>
                </DataTable>
              ) : (
                <div>No source data available</div>
              )}

              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Add New Source</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <input
                      type="text"
                      value={SourcesText}
                      onChange={(e) => setSourcesText(e.target.value)}
                      placeholder="Enter Source"
                      style={{ outline: "none", padding: "8px", width: "100%" }}
                    />
                    <button
                      style={{
                        marginLeft: "10px", padding: "10px 26px", border: "none", backgroundColor: "#3454D1", color: "white", fontSize: "20px"
                      }}
                      onClick={handleSaveSource}
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

export default Sources;
