import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CSS/Calender.css';
import Dashboard from '../Components/Dashboard';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';  // Import the spinner component
import { useNavigate } from 'react-router-dom';

const LeadCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [followupsByDate, setFollowupsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateFollowups, setSelectedDateFollowups] = useState([]);
  const [visible, setVisible] = useState(false); // State to control dialog visibility
  const navigate = useNavigate();
  const APi_Url = import.meta.env.VITE_API_URL
  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const addedBy = localStorage.getItem('employeeId');
        const response = await fetch(
          `${APi_Url}/digicoder/crm/api/v1/followup/getnext/${addedBy}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch followups');
        }

        const data = await response.json();

        const groupedFollowups = data.followups.reduce((acc, followup) => {
          const followupDate = new Date(followup.nextFollowupDate);
          const dateString = followupDate.toLocaleDateString('en-CA');

          if (!acc[dateString]) {
            acc[dateString] = [];
          }
          acc[dateString].push(followup);
          return acc;
        }, {});   

        setFollowupsByDate(groupedFollowups);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFollowups();
  }, []);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('en-CA');
      const followupsOnDate = followupsByDate[dateString] || [];

      if (followupsOnDate.length > 0) {
        return (
          <div className="lead-count">
            <i className="ri-bard-fill"></i>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('en-CA');
      return followupsByDate[dateString] ? 'highlight-date' : null;
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    const dateString = newDate.toLocaleDateString('en-CA');
    const followupsOnSelectedDate = followupsByDate[dateString] || [];
    setSelectedDateFollowups(followupsOnSelectedDate);
    setVisible(true); 
  };

  const srNoTemplate = (rowData, { rowIndex }) => {
    return <span>{rowIndex + 1}</span>;
  };

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Loader component display
  if (loading) return (
    <Dashboard>
      <div className="loading-container">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        <p>Loading...</p>
      </div>
    </Dashboard>
  );

  if (error) return <Dashboard><div>Error: {error}</div></Dashboard>;
  const handleView = (rowData) => {
    const viewdata = rowData.leadId;
    const TableTitle='calender'
    navigate('fullLeads', { state: { viewdata, TableTitle} });
};
  return (
    <Dashboard active={'calender'}>
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}  
          value={date}
          className="calendar"
          tileContent={tileContent}
          tileClassName={tileClassName}
        />
      </div>

      <Dialog 
        header={`Follow-ups on ${date.toDateString()}`} 
        visible={visible} 
        className='dialog-calaneder'
        onHide={() => setVisible(false)}
      >
        {selectedDateFollowups.length > 0 ? (
          <DataTable value={selectedDateFollowups} stripedRows paginator rows={10} responsive>
            <Column body={srNoTemplate} header="Sr. No." style={{ textAlign: 'center' }} />
            <Column field="leadId.name" header="Name" sortable />
            <Column field="leadId.phone" header="Mobile Number" sortable />
            <Column 
              header="Action" 
              body={(rowData) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button 
                    label="View" 
                    onClick={() => handleView(rowData)} 
                    className="p-button-success p-mr-2"
                  />
                  <Button 
                    label="Call" 
                    onClick={() => handleCall(rowData.leadId.phone)} 
                    className="p-button-info"
                  />
                </div>
              )} 
            />
          </DataTable>
        ) : (
          <p>No follow-ups on this date</p>
        )}
      </Dialog>
    </Dashboard>
  );
};

export default LeadCalendar;
