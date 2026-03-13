import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DynamicTable from '../Components/DynmicTables';
import Modal from '../Components/LeadForm';
import Dashboard from '../Components/Dashboard';
import EmployeeLeadsTable from './LeadsPage';
import './CSS/Lead.css';
import DynamicCard from '../Components/DynamicCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';
import LeadPageCard from './LeadPageCard';

function Leads() {
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [title, setTitle] = useState('');  
  const [buttonTitle, setButtonTitle] = useState('');
  const navigate = useNavigate();
  const [tableTitle, setTableTitle] = useState('Total Leads');
  const dispatch = useDispatch();
  const leads = useSelector((state) => state.leads.leads);
  const filteredData=leads.filter((item)=>item.closed===false && item.deleted===false && item.negative===false)

  
  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);



    // Fetch lead data on component mount
    useEffect(() => {
      dispatch(fetchLeads()); 
    }, [dispatch,refreshTrigger]);
     const refreshLeads = () => {
    setRefreshTrigger(prev => !prev); // Toggle to trigger refresh
  };

  const openModal = (isEdit) => {
    setEditMode(isEdit);
    setTitle(isEdit ? "Update Leads" : "Add New Lead");
    setButtonTitle(isEdit ? "Update Lead" : "Add Lead");
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div>
      <Dashboard active={'lead'}>
        <div className="content">

          {/* Table Section */}
          <div className="lead-table-container">
            <EmployeeLeadsTable className='dynamicTable'  TableTitle={tableTitle} />
          </div> 
          <div className='lead-card-container'>
            <LeadPageCard  TableTitle={tableTitle}  onFollowupAdded={refreshLeads}/>
          </div>

          {/* Modal component */}
          <Modal isOpen={isModalOpen} onClose={closeModal} title={title} buttonTitle={buttonTitle} leadData={filteredData} />

          {/* Conditional rendering for sticky note */}
        
        </div>
      </Dashboard>
    </div>
  ); 
}

export default Leads;
