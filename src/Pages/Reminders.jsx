import React, { useState, useEffect } from 'react'
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import DynamicCard from '../Components/DynamicCard';
import Modal from '../Components/LeadForm';
import './CSS/Reminders.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Reminders() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [title, setTitle] = useState('');
  const [leadData, setLeadData] = useState([]);
  const [tableTitle] = useState('Today Reminders');
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔐 CHECK LOGIN
  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) navigate('/');
  }, [navigate]);

  
  useEffect(() => {
    const fetchTodayReminders = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const employeeId = localStorage.getItem('employeeId');

        const res = await axios.get(
          `${API_URL}/digicoder/crm/api/v1/lead/today-reminders/${employeeId}`
        );

        setReminders(res.data.reminders || []);
      } catch (error) {
        console.error("Reminder fetch error:", error);
        setReminders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayReminders();
  }, []);

  const openModal = () => {
    setTitle("Update Leads");
    setButtonTitle("Update Leads");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 🔄 LOADING UI
  if (loading) {
    return (
      <Dashboard active={'reminder'}>
        <div className="content">
          <div className="loader-container">Loading reminders...</div>
        </div>
      </Dashboard>
    );
  }

  return (
    <div>
      <Dashboard active={'reminder'}>
        <div className="content">

          {/* TABLE */}
          <div className="reminder-table-container">
            <DynamicTable lead={reminders} TableTitle={tableTitle} />
          </div>

          {/* CARD */}
          <div className='reminder-card-container'>
            <DynamicCard leadCard={reminders} TableTitle={tableTitle} />
          </div>

          {/* MODAL */}
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={title}
            buttonTitle={buttonTitle}
            leadData={leadData}
          />

        </div>
      </Dashboard>
    </div>
  );
}

export default Reminders;
