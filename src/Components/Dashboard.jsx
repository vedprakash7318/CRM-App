import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Calendar,
  UserX,
  CheckCircle,
  ThumbsDown,
  LogOut,
  User,
  Info,
  FileText,
  ChevronRight
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import Modal from '../Components/LeadForm';
import { ToastContainer } from "react-toastify";
import "./CSS/Dashboard.css";



// Icon Mapping
const icons = {
  LayoutDashboard,
  Calendar,
  UserX,
  CheckCircle,
  ThumbsDown,
  LogOut,
  User,
  Info,
  FileText
};

const Dashboard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadData, setLeadData] = useState({});
  
  // State for Leads dropdown
  const [isLeadsDropdownOpen, setIsLeadsDropdownOpen] = useState(false);
  
  const userString = localStorage.getItem('Emp');
  const name = userString ? JSON.parse(userString) : null;


  
// useEffect(() => {
//   document.addEventListener(
//     "click",
//     () => {
//       new Audio("/ring1.mp3").play().catch(() => {});
//     },
//     { once: true }
//   );
// }, []);



  // Menu items matching your old navigation
  const menuList = [
    { 
      label: "Dashboard", 
      path: "/Main", 
      icon: "LayoutDashboard",
      exact: true
    },
    { 
      label: "Add Leads", 
      path: null, 
      icon: "Info",
      action: "openModal"
    },
    { 
      label: "Pending Leads", 
      path: "/pending", 
      icon: "Info",
      exact: true
    },
    { 
      label: "Today Reminders", 
      path: "/todayRminders", 
      icon: "Calendar",
      exact: true
    },
    { label: "Request Leads", path: "/request" },
    { 
      label: "Missed Leads", 
      path: "/missedLeads", 
      icon: "UserX",
      exact: true
    },
     { 
      label: "Leads", 
      path: "/leads", 
      icon: "FileText",
      hasDropdown: true,
      submenu: [
        { label: "Total Leads", path: "/leads" },
        { label: "Closed Leads", path: "/closed" },
        { label: "Negative Leads", path: "/negative" },
      ]
    },
    { 
      label: "Calender", 
      path: "/calender", 
      icon: "Calendar",
      exact: true
    },
    { 
      label: "Report", 
      path: "/report", 
      icon: "FileText",
      exact: true
    }
  ];

  // Check authentication
  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/');
    }
  }, [navigate]);

  // Responsive sidebar
  useEffect(() => {
    const detectMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    
    detectMobile();
    window.addEventListener("resize", detectMobile);
    return () => window.removeEventListener("resize", detectMobile);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal handlers
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleAddNew = () => {
    if (isMobile) setIsSidebarOpen(false);
    setLeadData({});
    openModal();
  };

  // Logout handler
  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log me out',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logged out successfully!',
          icon: 'success',
        }).then(() => {
          localStorage.removeItem("Token");
          localStorage.removeItem("employeeId");
          localStorage.removeItem("addedBy");
          localStorage.removeItem("Employee");
          localStorage.removeItem("Emp");
          navigate('/');
        });
      } else {
        Swal.fire({
          title: 'Thanks',
          text: 'You are still logged in.',
          icon: 'info',
        });
      }
    });
  };

  // Profile dropdown handlers
  const handleProfileToggle = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    handleLogout();
  };

  // Toggle Leads dropdown
  const toggleLeadsDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLeadsDropdownOpen(!isLeadsDropdownOpen);
  };

  // Check if current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if any submenu item is active
  const isSubmenuActive = (submenuItems) => {
    return submenuItems?.some(item => isActive(item.path));
  };

  return (
    <div className="dashboard">
      {/* Mobile Overlay */}
      {isSidebarOpen && isMobile && (
        <div className="overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isSidebarOpen ? "open" : "closed"} ${
          isMobile ? "mobile" : ""
        }`}
      >
        <div className="sidebar-content">
          {/* Header */}
          <div className="sidebar-header">
            {isSidebarOpen ? (
              <div className="logo">
                <div className="logo-icon">
                  D
                  {/* <img src="Images/cr.gif" alt="Logo" className="sidebar-logo-img" /> */}
                </div>
                <h2>Dashboard</h2>
              </div>
            ) : (
              <div className="logo-icon">
                {/* <img src="Images/cr.gif" alt="Logo" className="sidebar-logo-img-collapsed" /> */}
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="nav">
            <ul>
              {menuList.map((item) => {
                const IconComponent = icons[item.icon] || Info;
                
                return (
                  <li key={item.label}>
                    {item.action === "openModal" ? (
                      // Add Leads button that opens modal - FIXED ALIGNMENT
                      <button
                        className={`nav-btn ${!isSidebarOpen ? "collapsed" : ""} ${
                          item.action === "openModal" ? "modal-trigger" : ""
                        }`}
                        onClick={handleAddNew}
                      >
                        <IconComponent className="nav-icon" />
                        {isSidebarOpen && <span>{item.label}</span>}
                      </button>
                    ) : item.hasDropdown ? (
                      // Leads with dropdown
                      <div className="dropdown-container">
                        <button
                          className={`nav-btn has-sub ${!isSidebarOpen ? "collapsed" : ""} ${
                            isLeadsDropdownOpen ? "submenu-open" : ""
                          } ${isSubmenuActive(item.submenu) ? "active" : ""}`}
                          onClick={toggleLeadsDropdown}
                        >
                          <IconComponent className="nav-icon" />
                          {isSidebarOpen && (
                            <>
                              <span>{item.label}</span>
                              <ChevronRight className="dropdown-arrow" />
                            </>
                          )}
                        </button>
                        
                        {/* Submenu for Leads */}
                        {isSidebarOpen && isLeadsDropdownOpen && (
                          <ul className="submenu">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.label}>
                                <Link
                                  to={subItem.path}
                                  className={`submenu-item ${isActive(subItem.path) ? 'active' : ''}`}
                                  onClick={() => {
                                    if (isMobile) setIsSidebarOpen(false);
                                  }}
                                >
                                  <span>{subItem.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      // Regular navigation links
                      <Link
                        to={item.path}
                        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => {
                          if (isMobile) setIsSidebarOpen(false);
                        }}
                      >
                        <div className={`nav-btn ${!isSidebarOpen ? "collapsed" : ""}`}>
                          <IconComponent className="nav-icon" />
                          {isSidebarOpen && <span>{item.label}</span>}
                        </div>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer - Logout */}
          {isSidebarOpen && (
            <div className="sidebar-footer">
              <button 
                className="sidebar-logout-btn"
                onClick={handleLogout}
              >
                <LogOut className="logout-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`main ${
          isSidebarOpen && !isMobile
            ? "expanded"
            : isMobile
            ? "mobile"
            : "collapsed"
        }`}
      >
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="header-left">
              <button
                className="menu-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X /> : <Menu />}
              </button>
              <h1 className="title">Welcome Back, {name?.empName || 'User'}!</h1>
            </div>

            {/* Profile Dropdown */}
            <div className="header-right" ref={dropdownRef}>
              <div
                className="user"
                onClick={handleProfileToggle}
              >
                <div className="avatar">AD</div>
                <div className="user-info">
                  <p>{name?.empName || 'User'}</p>
                  <p className="user-role">Employee</p>
                </div>
                <ChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <ul>
                    <li onClick={handleProfileClick}>
                      <User className="dropdown-icon" />
                      <span>Profile</span>
                    </li>
                    <li onClick={handleLogoutClick}>
                      <LogOut className="dropdown-icon" />
                      <span>Logout</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="content">
          {children}
        </main>
      </div>

      {/* Lead Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title="Add New Lead" 
        buttonTitle="Add Lead" 
        leadData={leadData}
      />
      
      <ToastContainer />
    </div>
  );
};

export default Dashboard;