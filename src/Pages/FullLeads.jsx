import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import './CSS/FullLeads.css'
import FollowUpNotes from '../Components/FollowUpNotes';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Dropdown } from 'primereact/dropdown';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from '@mui/icons-material';
import Dashboard from '../Components/Dashboard'
import Swal from "sweetalert2";
import axios from "axios";
import { fetchLeadStatus, fetchPriority, fetchSources, fetchTags } from "../Features/LeadSlice";
import { useDispatch, useSelector } from "react-redux";

function FullLeads() {
  const APi_Url = import.meta.env.VITE_API_URL
  const [noteOpen, setNoteOpen] = useState(false);
  const [actionBtn, setActionBtn] = useState(true)
  const [unCloseActionBtn, setUnCloseActionBtn] = useState(false)
  const [unNegativeActionBtn, setUnNegativeActionBtn] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(true);
  const [tagSearchTerm, setTagSearchTerm] = useState(''); // New state for tag search
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_BOTTOM = 10;

  const dispatch = useDispatch();
  const priorityData = useSelector((state) => state.leads.Priority);
  const sourcesData = useSelector((state) => state.leads.leadSources);
  const LeadStatusData = useSelector((state) => state.leads.LeadStatus);
  const tagData = useSelector((state) => state.leads.tag);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [sourcesOptions, setSourcesOptions] = useState([]);
  const [leadStatusOptions, setLeadStatusOptions] = useState([]);

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_BOTTOM,
      },
    },
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { viewdata } = location.state || [];
  const { TableTitle } = location.state || [];
  const { fromEdit } = location.state || [];

  const [formData, setFormData] = useState({
    Name: viewdata.name || "",
    Email: viewdata.email || "",
    Phone: viewdata.phone,
    Gender: viewdata.gender || "",
    DateOfBirth: viewdata.dob || "",
    Priority: viewdata?.priority?._id || "",
    Source: viewdata.sources?._id || "",
    City: viewdata.city || "",
    ZipCode: viewdata.zipCode || "",
    State: viewdata.state || "",
    Country: viewdata.country || "",
    CreatedDate: viewdata.createdAt || "",
    tags: Array.isArray(viewdata?.tags)
      ? viewdata.tags.map(tag => tag._id)
      : viewdata?.tags?._id ? [viewdata.tags._id] : [],
    tagNames: Array.isArray(viewdata?.tags)
      ? viewdata.tags.map(tag => tag.tagName)
      : viewdata?.tags?.tagName ? [viewdata.tags.tagName] : [],
    LeadStatus: viewdata.leadStatus?._id || "",
    services: viewdata.services?.servicesText
  });

  const [isDisabled, setIsDisabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [activeData, setActiveData] = useState()

  const FormApiData = {
    name: formData.Name,
    phone: formData.Phone,
    email: formData.Email,
    gender: formData.Gender,
    dob: formData.DateOfBirth,
    priority: formData.Priority,
    sources: formData.Source,
    city: formData.City,
    zipCode: formData.ZipCode,
    state: formData.State,
    country: formData.Country,
    leadStatus: formData.LeadStatus,
    tags: formData.tags,
    
  };

  // Filter tags based on search term
  const filteredTags = tagData.filter(item =>
    item.tagName.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  const handleTagSearchChange = (event) => {
    setTagSearchTerm(event.target.value);
  };

  // Clear search when menu closes
  const handleTagMenuClose = () => {
    setTagSearchTerm('');
  };

  useEffect(() => {
    dispatch(fetchPriority());
    dispatch(fetchSources());
    dispatch(fetchTags());
    dispatch(fetchLeadStatus());
  }, [dispatch]);

  useEffect(() => {
    if (LeadStatusData && Array.isArray(LeadStatusData)) {
      setLeadStatusOptions(
        LeadStatusData.map((leadStatus) => ({
          label: leadStatus.leadStatusText,
          value: leadStatus._id
        }))
      );
    }
  }, [LeadStatusData]);

  useEffect(() => {
    if (priorityData && Array.isArray(priorityData)) {
      setPriorityOptions(
        priorityData.map((priority) => ({
          label: priority.priorityText,
          value: priority._id
        }))
      );
    }
  }, [priorityData]);

  useEffect(() => {
    if (sourcesData && Array.isArray(sourcesData)) {
      setSourcesOptions(
        sourcesData.map((sources) => ({
          label: sources.leadSourcesText,
          value: sources._id
        }))
      );
    }
  }, [sourcesData]);

  useEffect(() => {
    const tokenId = localStorage.getItem('Token');
    if (!tokenId) {
      navigate('/')
    }

    if (fromEdit) {
      setIsEditing(true);
      setIsDisabled(false);
    }
  }, [navigate, fromEdit])

  useEffect(() => {
    if (TableTitle === 'Closed Lead') {
      setActionBtn(false);
      setUnCloseActionBtn(true);
    }
    else if (TableTitle == 'Negative Lead') {
      setActionBtn(false);
      setUnCloseActionBtn(false)
      setUnNegativeActionBtn(true)
    }
    fetchFollowUps();
  }, [viewdata._id]);

  useEffect(() => {
    if (TableTitle == 'Leads') {
      setActiveData("dashboard")
    }
    else if (TableTitle == 'Total Leads') {
      setActiveData("lead")
    }
    else if (TableTitle == 'Today Reminders') {
      setActiveData("reminder")
    }
    else if (TableTitle == 'Missed Leads') {
      setActiveData("missedLead")
    }
    else if (TableTitle == 'Closed Lead') {
      setActiveData("closedLead")
    }
    else if (TableTitle == 'Negative Lead') {
      setActiveData("negative")
    }
    else if (TableTitle == 'Pending Leads') {
      setActiveData("pending")
    }
  }, [TableTitle])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleTagChange = (event) => {
    const { value } = event.target;
    const selectedTagIds = tagData
      .filter(tag => value.includes(tag.tagName))
      .map(tag => tag._id);

    setFormData(prev => ({
      ...prev,
      tagNames: value,
      tags: selectedTagIds
    }));
  };

  const handleUpdate = () => {
    setIsEditing(true);
    setIsDisabled(false);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await axios.put(
        `${APi_Url}/digicoder/crm/api/v1/lead/update/${viewdata._id}`,
        FormApiData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast.success("Updated successfully!");
        setTimeout(() => {
          navigate('/leads');
        }, 500);
      } else {
        toast.error("Failed to update the lead. Please try again.");
      }

      setIsEditing(false);
      setIsDisabled(true);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Error occurred while updating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowUps = async () => {
    setIsLoadingFollowUps(true);
    try {
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/followup/getall/${viewdata._id}`);
      
      if (response.status === 200) {
        setFollowUps(Array.isArray(response.data.followups) ? response?.data?.followups : []);
      }
    } catch (error) {
      console.error("Error fetching follow-up data:", error);
      toast.error("Error fetching follow-up data. Please try again.");
    } finally {
      setIsLoadingFollowUps(false);
    }
  };

  const handleStickyNote = (viewdata) => {
    setNoteOpen(true);
  }

  const closeNote = () => {
    setNoteOpen(false)
    fetchFollowUps();
  }

  const handleBack = () => {
    if (TableTitle == 'Leads') {
      navigate('/Main');
    }
    if (TableTitle == 'calender') {
      navigate('/calender');
    }
    else if (TableTitle == 'Total Leads') {
      navigate("/leads")
    }
    else if (TableTitle == 'Pending Leads') {
      navigate("/pending")
    }
    else if (TableTitle == 'Today Reminders') {
      navigate("/todayRminders")
    }
    else if (TableTitle == 'Missed Leads') {
      navigate("/missedLeads")
    }
    else if (TableTitle == 'Closed Lead') {
      navigate("/closed")
    }
    else if (TableTitle == 'Negative Lead') {
      navigate("/negative")
    }
  };

  const handleMarkNegative = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Mark as Negative',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/negative/${viewdata._id}`);
        if (response.status === 200) {
          Swal.fire({
            title: 'Marked as Negative!',
            icon: 'success',
          }).then(() => {
            navigate('/leads');
          });
        } else {
          Swal.fire({
            title: 'Failed to Mark as Negative',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'Something went wrong. Please try again later.',
          icon: 'error',
        });
      }
    } else {
      Swal.fire({
        title: 'You are Safe',
        icon: 'info',
      });
    }
  };

  const handleCloseForAlways = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Mark as Close',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/closed/${viewdata._id}`);
        if (response.status === 200) {
          Swal.fire({
            title: 'Marked as Closed!',
            icon: 'success',
          }).then(() => {
            navigate('/leads');
          });
        } else {
          Swal.fire({
            title: 'Failed to Mark as Closed',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'Something went wrong. Please try again later.',
          icon: 'error',
        });
      }
    } else {
      Swal.fire({
        title: 'You are Safe',
        icon: 'info',
      });
    }
  };

  const handleUnCloseForAlways = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes,UnClose',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/unclosed/${viewdata._id}`);
        if (response.status === 200) {
          Swal.fire({
            title: 'Lead UnClosed!',
            icon: 'success',
          }).then(() => {
            navigate('/leads');
          });
        } else {
          Swal.fire({
            title: 'Failed to UnClosed',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'Something went wrong. Please try again later.',
          icon: 'error',
        });
      }
    } else {
      Swal.fire({
        title: 'You are Safe',
        icon: 'info',
      });
    }
  };

  const handleUnNegativeForAlways = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes,Move to New Lead',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/UnnegativedLead/${viewdata._id}`);
        if (response.status === 200) {
          Swal.fire({
            title: 'Lead Moved!',
            icon: 'success',
          }).then(() => {
            navigate('/leads');
          });
        } else {
          Swal.fire({
            title: 'Failed to Moving Lead',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'Something went wrong. Please try again later.',
          icon: 'error',
        });
      }
    } else {
      Swal.fire({
        title: 'You are Safe',
        icon: 'info',
      });
    }
  };
  return (
    <div>
      <Dashboard active={activeData}>
        <div className="content fullLead-outer">
          <div className="fullLead-outer">
            <div className="fullLeads-header">
              <div className="back-btn">
                <button onClick={handleBack}><i className="ri-arrow-left-line"></i> Back</button>
              </div>
              <div className="fullLeads-icons">
                <Link to={`http://wa.me/${formData.Phone}`}><button style={{ color: "green" }}><i className="ri-whatsapp-line"></i></button></Link>
                <a href={`tel:${formData.Phone}`} style={{ textDecoration: "none", color: "blue" }}>
                  <button className="ri-phone-fill" style={{ background: "none", border: "none", color: "blue" }}></button>
                </a>
                <Link to={`mailto:${formData.Email}`}><img src="/Images/mail.svg" alt="" style={{ height: "25px", position: "relative", bottom: "8px" }} /></Link>
              </div>
            </div>

            <div className="fullLeads-view-data">
              <div className="view-data-title">
                <span>INFORMATION</span>
              </div>
              <div className="view-info-form">
                <div className="form-row">
                  <div>
                    <div className="label">Name</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Phone Number</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Phone"
                      value={formData.Phone}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Email</div>
                    <input
                      type="email"
                      className="input-field"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Gender</div>
                    <select
                      className="input-field"
                      name="Gender"
                      value={formData.Gender}
                      onChange={handleChange}
                      disabled={isDisabled}
                    >
                      <option value="" disabled>-- Select --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <div className="label">Date of Birth</div>
                    <input
                      type="date"
                      className="input-field"
                      name="DateOfBirth"
                      value={formData.DateOfBirth}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Priority</div>
                    <Dropdown
                      id="priority"
                      name="Priority"
                      value={formData.Priority}
                      options={priorityOptions}
                      onChange={handleChange}
                      optionLabel="label"
                      optionValue="value"
                      disabled={isDisabled}
                      placeholder="Select priority"
                      className="p-dropdown"
                    />
                  </div>
                  <div>
                    <div className="label">Source</div>
                    <Dropdown
                      id="sources"
                      name="sources"
                      value={formData.Source}
                      options={sourcesOptions}
                      onChange={handleChange}
                      optionLabel="label"
                      disabled
                      placeholder="Select source"
                      className="p-dropdown"
                    />
                  </div>
                   <div>
                    <div className="label">Services</div>
                   <input
                      type="text"
                      className="input-field"
                      name="City"
                      value={formData.services}
                      disabled
                    />
                  </div>
                  <div>
                    <div className="label">City</div>
                    <input
                      type="text"
                      className="input-field"
                      name="City"
                      value={formData.City}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Zip Code</div>
                    <input
                      type="number"
                      className="input-field"
                      name="ZipCode"
                      value={formData.ZipCode}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">State</div>
                    <input
                      type="text"
                      className="input-field"
                      name="State"
                      value={formData.State}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Country</div>
                    <input
                      type="text"
                      className="input-field"
                      name="Country"
                      value={formData.Country}
                      onChange={handleChange}
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <div className="label">Created Date</div>
                    <input
                      type="text"
                      className="input-field"
                      name="createdDate"
                      value={formData.CreatedDate}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                  <div>
                    <FormControl sx={{ width: "250px", m: 1 }}>
                      <InputLabel id="tags-label">Tags</InputLabel>
                      <Select
                        labelId="tags-label"
                        id="tags-select"
                        multiple
                        value={formData.tagNames}
                        onChange={handleTagChange}
                        onClose={handleTagMenuClose}
                        input={<OutlinedInput label="Tags" />}
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={{
                          ...MenuProps,
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        }}
                        disabled={isDisabled}
                      >
                        {/* Search TextField inside Menu */}
                        <Box sx={{ p: 1, position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                          <TextField
                            size="small"
                            placeholder="Search tags..."
                            value={tagSearchTerm}
                            onChange={handleTagSearchChange}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Search fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            // Prevent menu from closing when clicking on search
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </Box>
                        
                        {/* Filtered Menu Items */}
                        {filteredTags.length > 0 ? (
                          filteredTags.map((item) => (
                            <MenuItem key={item._id} value={item.tagName}>
                              <Checkbox checked={formData.tagNames.indexOf(item.tagName) > -1} />
                              <ListItemText primary={item.tagName} />
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>
                            <ListItemText primary="No tags found" />
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </div>
                  <div>
                    <div className="label">Lead Status</div>
                    <Dropdown
                      id="LeadStatus"
                      name="LeadStatus"
                      value={formData.LeadStatus}
                      options={leadStatusOptions}
                      onChange={(e) => handleChange({ target: { name: 'LeadStatus', value: e.value } })}
                      optionLabel="label"
                      disabled={isDisabled}
                      placeholder="Select lead status"
                      className="p-dropdown"
                    />
                  </div>
                </div>
                <div className="view-edit-btn">
                  <button onClick={isEditing ? handleSave : handleUpdate}>
                    {isLoading ? (
                      <span>Loading...</span>
                    ) : isEditing ? (
                      "Save"
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="follow-ups">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="view-data-titlee">
                  <span>FOLLOW UP</span>
                  <button className="view-data-button" onClick={() => handleStickyNote(viewdata)}>Add New</button>
                </div>
              </div>

              <div className="follow-ups">
                {isLoadingFollowUps ? (
                  <div className="loader-container" style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="loader" style={{
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #3498db',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      animation: 'spin 2s linear infinite',
                      margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '10px' }}>Loading follow-ups...</p>
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                ) : followUps.length > 0 ? (
                  followUps.map((followUp, index) => (
                    <div key={followUp._id} className="follow-outer">
                      <div className="follow-body">
                        <div className="follow-body-header">
                          <div className="followup-srNo">{followUps.length - index}</div>
                          <div>
                            <span className="cratedBy">Created Date-</span> <span className="cratedBy">{followUp.createdAt.split("T")[0]}</span>
                            <div style={{ marginTop: "5px" }}><span className="cratedBy">Created By-</span> <span className="cratedBy">{followUp.followedBy.empName}</span></div>
                          </div>
                        </div>
                        <div className="follow-ups-txt">
                          <p><b>Message:- </b><span>{followUp.followupMessage}</span></p>
                          <p><b>Service:- </b><span>{followUp?.service?.servicesText}</span></p>
                          <p>
                            <b>Next-FollowUp-Date:- </b>
                            <span>
                              {followUp?.nextFollowupDate
                                ? new Date(followUp.nextFollowupDate).toLocaleDateString('en-GB')
                                : "Not Set"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <hr />
                    </div>
                  ))
                ) : (
                  <div className="no-followups" style={{
                    textAlign: 'center',
                    padding: '30px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    margin: '20px 0'
                  }}>
                    <i className="ri-information-line" style={{ fontSize: '30px', color: '#999', marginBottom: '10px' }}></i>
                    <p style={{ fontSize: '16px', color: '#666' }}>No follow-ups found for this lead.</p>
                    <p style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>Click on "Add New" to create your first follow-up.</p>
                  </div>
                )}
              </div>

              {actionBtn && (
                <div className="lead-action-btn">
                  <button className="negative-btn" onClick={() => handleMarkNegative()}>Mark as Negative</button>
                  <button className="close-btn" onClick={() => handleCloseForAlways()}>Mark as Close</button>
                </div>
              )}
              {unCloseActionBtn && (
                <div className="lead-action-btn">
                  <button className="negative-btn" onClick={() => handleUnCloseForAlways()}>Unclose Lead</button>
                </div>
              )}
              {unNegativeActionBtn && (
                <div className="lead-action-btn">
                  <button className="close-btn" onClick={() => handleUnNegativeForAlways()}>Move to new Lead</button>
                </div>
              )}
            </div>
          </div>
          <FollowUpNotes isOpenNote={noteOpen} oncloseNote={closeNote} leadData={viewdata} />
        </div>
      </Dashboard>
    </div>
  )
}

export default FullLeads