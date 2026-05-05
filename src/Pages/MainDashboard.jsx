import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Dashboard from "../Components/Dashboard";
import {
  FaUsers,
  FaClock,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";

import "./CSS/MainDashboard.css";

const MainDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const empId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (!empId) {
      navigate("/");
      return;
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/digicoder/crm/api/v1/dashboard/employee/${empId}`
      );
      setStats(res.data.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dashboard active="dashboard">
        <div className="dashboard-loader">Loading...</div>
      </Dashboard>
    );
  }

  return (
    <Dashboard active="dashboard">
      <div className="dashboard-grid">

        {/* Total Leads */}
        <div className="dashboard-card" onClick={() => navigate("/leads")}>
          <FaUsers />
          <h4>Total Leads</h4>
          <h1>{stats?.totalLeads}</h1>
        </div>

        {/* Pending Leads */}
        <div className="dashboard-card" onClick={() => navigate("/pending")}>
          <FaClock />
          <h4>Pending Leads</h4>
          <h1>{stats?.pendingLeads}</h1>
        </div>

        {/* Missed Leads */}
        <div className="dashboard-card" onClick={() => navigate("/missedLeads")}>
          <FaExclamationTriangle />
          <h4>Missed Leads</h4>
          <h1>{stats?.missedLeads}</h1>
        </div>

        {/* Today's Reminders */}
        <div className="dashboard-card" onClick={() => navigate("/todayReminders")}>
          <FaBell />
          <h4>Today's Reminders</h4>
          <h1>{stats?.todayReminders}</h1>
        </div>

        {/* Today's Followups */}
        <div className="dashboard-card" onClick={() => navigate("/followups/today")}>
          <FaClock />
          <h4>Today's Followups</h4>
          <h1>{stats?.todayFollowups}</h1>
        </div>

        {/* Total Followups */}
        <div className="dashboard-card" onClick={() => navigate("/followups")}>
          <FaUsers />
          <h4>Total Followups</h4>
          <h1>{stats?.totalFollowups}</h1>
        </div>

        {/* Closed Leads */}
        <div className="dashboard-card" onClick={() => navigate("/closed")}>
          <FaCheckCircle />
          <h4>Closed Leads</h4>
          <h1>{stats?.closedLeads}</h1>
          <p>{stats?.completionRate}% completed</p>
        </div>

        {/* Negative Leads */}
        <div className="dashboard-card" onClick={() => navigate("/negative")}>
          <FaExclamationTriangle />
          <h4>Negative Leads</h4>
          <h1>{stats?.negativeLeads}</h1>
        </div>

      </div>
    </Dashboard>
  );
};

export default MainDashboard;
