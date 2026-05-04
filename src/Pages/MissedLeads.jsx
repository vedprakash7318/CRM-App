import React, { useState, useEffect } from 'react'
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import Modal from '../Components/LeadForm';
import './CSS/MissedLeads.css'
import { useNavigate } from 'react-router-dom';
import DynamicCard from '../Components/DynamicCard';
import axios from 'axios';

function MissedLeads() {
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [stickyNote, setStickyNote] = useState('');
  const [title, setTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [tableTitle, setTableTitle] = useState('Missed Leads');
  const [note, setNote] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [finalData, setFinalData] = useState([]); // ✅ API data
    const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // 🔐 Auth check
  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  // 🔥 FETCH MISSED LEADS FROM API
  useEffect(() => {
    const fetchMissedLeads = async () => {
      try {
        const empId = localStorage.getItem("employeeId");

        const res = await axios.get(
          `${API_URL}/digicoder/crm/api/v1/lead/missed-leads/${empId}`
        );

        if (res.data.success) {
          setFinalData(res.data.data);
        }

      } catch (error) {
        console.error("Error fetching missed leads:", error);
      }
    };

    fetchMissedLeads();
  }, []);

  // 🔘 Switch toggle
  const handleSwitchChange = (event) => {
    setIsScheduled(event.target.checked);
  };

  // 📂 Modal open/close
  const openModal = () => {
    setButtonTitle("Update Leads");
    setTitle("Update Leads");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 📝 Sticky note handlers
  const handleNoteChange = (e) => {
    setStickyNote(e.target.value);
  };

  const saveStickyNote = () => {
    setNote(stickyNote);
    setIsNoteVisible(false);
  };

  const cancelStickyNote = () => {
    setStickyNote('');
    setIsNoteVisible(false);
  };

  return (
    <div>
      <Dashboard active={'missedLead'}>
        <div className="content">

          {/* 🔥 TABLE */}
          <div className="missed-table-container">
            <DynamicTable lead={finalData} TableTitle={tableTitle} />
          </div>

          {/* 🔥 CARD VIEW */}
          <div className='missed-card-container'>
            <DynamicCard leadCard={finalData} TableTitle={tableTitle}/> 
          </div>

          {/* 📂 MODAL */}
          <Modal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            title={title} 
            buttonTitle={buttonTitle} 
            leadData={leadData} 
          />

          {/* 📝 STICKY NOTE */}
          {isNoteVisible && (
            <div className="sticky-note-container">
              <textarea
                value={stickyNote}
                onChange={handleNoteChange}
                placeholder="Add a note..."
                className="sticky-note-textarea"
              />

              <div className="form-row">
                <label>
                  Priority:
                  <select name="priority" className="sticky-note-select">
                    <option>Select</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>

                <label>
                  Sources:
                  <select name="sources" className="sticky-note-select">
                    <option>Select</option>
                    <option>Social Media</option>
                    <option>Posters</option>
                    <option>Adds</option>
                    <option>Referral</option>
                  </select>
                </label>
              </div>

              <div>
                <input 
                  type="checkbox" 
                  onChange={handleSwitchChange} 
                  checked={isScheduled}
                />
                <label>Set Reminder</label>

                {isScheduled && (
                  <input type="date" className="date-input" />
                )}
              </div>

              <div className="sticky-note-actions">
                <button onClick={cancelStickyNote} className="cancel-btn">Cancel</button>
                <button onClick={saveStickyNote} className="save-btn">Save</button>
              </div>
            </div>
          )}

        </div>
      </Dashboard>
    </div>
  );
}

export default MissedLeads;