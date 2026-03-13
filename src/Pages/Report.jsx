import React, { useEffect, useState, useMemo } from 'react';
import Dashboard from '../Components/Dashboard';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';  // Add this import statement

import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import './CSS/Report.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '../Features/LeadSlice';
import axios from 'axios';

function Report() {
  const navigate = useNavigate();
  const APi_Url = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();

  const [followupData, setFollowUpData] = useState([]);
  const [pendingLeads, setPendingLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [followupsLoading, setFollowupsLoading] = useState(true);
  const [pendingLeadsLoading, setPendingLeadsLoading] = useState(true);

  const leads = useSelector((state) => state.leads.leads);
  const filteredData = leads.filter((item) => item);
  const currentEmployeeId = localStorage.getItem('employeeId');

  // Fetch pending leads from API
  const fetchPendingLeads = async () => {
    try {
      const response = await axios.get(
        `${APi_Url}/digicoder/crm/api/v1/lead/pendingleads/${currentEmployeeId}`
      );
      setPendingLeads(response.data.leads || []);
    } catch (error) {
      console.error('Error fetching pending leads:', error);
    } finally {
      setPendingLeadsLoading(false);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const response = await axios.get(
        `${APi_Url}/digicoder/crm/api/v1/followup/getfollowedby/${currentEmployeeId}`
      );
      setFollowUpData(response.data.followups || []);
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setFollowupsLoading(false);
    }
  };

  // Memoized calculations for better performance
  const closedLeads = useMemo(() =>
    leads.filter((lead) => lead.closed === true && lead.negative === false && lead.deleted === false),
    [leads]
  );

  const NegativeLeads = useMemo(() =>
    leads.filter((lead) => lead.negative === true && lead.deleted === false && lead.closed === false),
    [leads]
  );

  const uniqueTagNames = useMemo(() =>
    [...new Set(
      filteredData
        .map((item) => item.tags || [])
        .flat()
        .map((tag) => tag.tagName)
        .filter((tagName) => tagName)
    )],
    [filteredData]
  );

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const matchedFollowups = useMemo(() => {
    const followups = followupData.map((item) => item.createdAt);
    return followups.filter((createdAt) => {
      const createdDate = new Date(createdAt).toISOString().split('T')[0];
      return createdDate === today;
    });
  }, [followupData, today]);

  const completionPercentage = useMemo(() =>
    filteredData.length > 0
      ? Math.round((closedLeads.length / filteredData.length) * 100)
      : 0,
    [filteredData.length, closedLeads.length]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchLeads()),
          fetchFollowUps(),
          fetchPendingLeads()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLeadsLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  const [visible, setVisible] = useState(false);
  const footerContent = (
    <div>
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={() => setVisible(false)}
        className="p-button-text"
      />
    </div>
  );

  const isLoading = leadsLoading || followupsLoading || pendingLeadsLoading;

  return (
    <div>
      <Dashboard active={'report'}>
        <div className="report-header">
          <h1>Employee Performance Dashboard</h1>
          <Button
            label="View Assigned Tags"
            icon="pi pi-tags"
            onClick={() => setVisible(true)}
            className="tags-button"
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <ProgressSpinner animationDuration=".5s" />
          </div>
        ) : (
          <div className="metrics-grid">
            {/* Assigned Leads Card */}
            <Card className="metric-card" onClick={()=>navigate('/leads')} style={{cursor:"pointer"}}>
              <div className="metric-content">
                <i className="pi pi-users metric-icon"></i>
                <div className="metric-details">
                  <span className="metric-title">Assigned Leads</span>
                  <span className="metric-value">{filteredData.length}</span>
                  <span className="metric-description">
                    Total leads assigned to you
                  </span>
                </div>
              </div>
            </Card>

            {/* Completed Leads Card */}
            <Card className="metric-card success" onClick={()=>navigate('/closed')} style={{cursor:"pointer"}}>
              <div className="metric-content">
                <i className="pi pi-check-circle metric-icon"></i>
                <div className="metric-details">
                  <span className="metric-title">Completed Leads</span>
                  <span className="metric-value">{closedLeads.length}</span>
                  <ProgressBar
                    value={completionPercentage}
                    showValue={false}
                    className="progress-bar"
                  />
                  <span className="metric-description">
                    {completionPercentage}% completion rate
                  </span>
                </div>
              </div>
            </Card>

            {/* Pending Leads Card */}
            <Card className="metric-card warning" onClick={()=>navigate('/pending')} style={{cursor:"pointer"}}>
              <div className="metric-content">
                <i className="pi pi-clock metric-icon"></i>
                <div className="metric-details">
                  <span className="metric-title">Pending Leads</span>
                  <span className="metric-value">{pendingLeads.length}</span>
                  <span className="metric-description">
                    Needs follow-up
                  </span>
                </div>
              </div>
            </Card>

            {/* Negative Leads Card */}
            <Card className="metric-card danger"onClick={()=>navigate('/negative')} style={{cursor:"pointer"}}>
              <div className="metric-content">
                <i className="pi pi-exclamation-triangle metric-icon"></i>
                <div className="metric-details">
                  <span className="metric-title">Negative Leads</span>
                  <span className="metric-value">{NegativeLeads.length}</span>
                  <span className="metric-description">Unsuccessful conversions</span>
                </div>
              </div>
            </Card>

            {/* Today's Work Card */}
            <Card className="metric-card info" >
              <div className="metric-content">
                <i className="pi pi-calendar metric-icon"></i>
                <div className="metric-details">
                  <span className="metric-title">Today's Follow-ups</span>
                  <span className="metric-value">{matchedFollowups.length}</span>
                  <span className="metric-description">Actions completed today</span>
                </div>
              </div>
            </Card>

            {/* Total Follow-ups Card */}
            <Card className="metric-card primary">
              <div className="metric-content">
                <i className="pi pi-chart-line metric-icon"></i>
                <div className="metric-details">
                  <span className="metric-title">Total Follow-ups</span>
                  <span className="metric-value">{followupData.length}</span>
                  <span className="metric-description">All your activities</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tag Viewer Dialog */}
        <Dialog
          header="Your Assigned Tags"
          visible={visible}
          style={{ width: '50vw' }}
          onHide={() => setVisible(false)}
          footer={footerContent}
        >
          <div className="tags-container">
            {uniqueTagNames.map((tag, index) => (
              <Tag
                key={index}
                value={tag}
                className="tag-item"
                severity={getRandomSeverity()}
              />
            ))}
          </div>
        </Dialog>
      </Dashboard>
    </div>
  );
}

// Random tag color utility
function getRandomSeverity() {
  const severities = ['success', 'info', 'warning', 'danger'];
  return severities[Math.floor(Math.random() * severities.length)];
}

export default Report;
