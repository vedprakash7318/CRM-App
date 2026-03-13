import React, { useEffect, useState } from 'react'
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Modal from 'react-bootstrap/Modal';
import Dashboard from '../../Components/Dashboard';
function Tag() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [products, setProducts] = useState([]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
const navigate=useNavigate()
  useEffect(()=>{
    const tokenId=localStorage.getItem('Token');
    if(!tokenId){
      navigate('/')
    }

  },[navigate])
  useEffect(() => {
    const data = [
      { ID: '1', tag: 'VIp',},
      { ID: '2', tag: 'V-VIP',},
      { ID: '3', tag: 'New1',},
      { ID: '4', tag: 'New2',},
    ];
    setProducts(data);
  }, []);

  const actionBodyTemplate = (rowData) => {
    return (
      <div>
        
      </div>
    );
  };
  const handleDelete = (rowData) => {
    console.log("Deleting", rowData);
  };
  const user = 'Ved Prakash';
  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const [dropdownActive, setDropdownActive] = useState(false);
  const toggleDropdown = () => setDropdownActive(!dropdownActive);
  return (
    <div>
      <Dashboard active={'tag'}>
      <div className="content-wrapper">
          <div className="content">
            <div className="card">
            {/* <div className="flex justify-content-between p-4">
                <h1>Tags</h1>
                <button style={{border:"none", backgroundColor:"#3454D1", color:"white", fontSize:"18px", borderRadius:"10px", cursor:"pointer", padding:"0px 20px"}}  onClick={handleShow}>Add New</button>

              </div> */}
              <DataTable value={products} stripedRows bordered>
                <Column field="ID" header="Sr. No." sortable></Column>
                <Column field="tag" header="Tags" sortable  ></Column>
                {/* <Column header="Action" body={actionBodyTemplate}></Column> */}
              </DataTable>




              {/* modal; */}

              <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{display:"flex", justifyContent:"space-around"}}>
            <input type="text" placeholder="Enter tag" style={{outline:"none", padding:"8px", width:"100%"}}/>
            <button style={{marginLeft:"10px", padding:"10px 26px", border:"none", backgroundColor:"#3454D1", color:"white", fontSize:"20px"}}>Save</button>
          </div>
        </Modal.Body>
      </Modal>
            </div>
          </div>
        </div>
      </Dashboard>
    </div>
  )
}

export default Tag
