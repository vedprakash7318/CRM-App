import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
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

  const handleTagChange = (event) => {
    const { value } = event.target;
    setSelectedTags(value);
    setFormData(prevData => ({
      ...prevData,
      tags: value
    }));
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { viewdata } = location.state || [];
// console.log("duic",viewdata);

  const { TableTitle } = location.state || [];
  const { fromEdit } = location.state || [];
  const [selectedTags, setSelectedTags] = useState(viewdata?.tags || []);
  const [formData, setFormData] = useState({
    Name: viewdata.name || "",
    Email: viewdata.email || "",
    Phone: viewdata.phone,
    Gender: viewdata.gender || "",
    DateOfBirth: viewdata.dob || "",
    Priority: viewdata.priority || "",
    Source: viewdata.sources || "",
    City: viewdata.city || "",
    ZipCode: viewdata.zipCode || "",
    State: viewdata.state || "",
    Country: viewdata.country || "",
    CreatedDate: viewdata.createdAt || "",
    tags: viewdata?.tags || [],
    LeadStatus: viewdata.leadStatus?._id || "",
  });
  const FormApiData = {
    name: formData.Name,
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
    tags: selectedTags
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
          value: priority.priorityText
        }))
      );
    }
  }, [priorityData]);

  useEffect(() => {
    if (sourcesData && Array.isArray(sourcesData)) {
      setSourcesOptions(
        sourcesData.map((sources) => ({
          label: sources.leadSourcesText,
          value: sources.leadSourcesText
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

  const [isDisabled, setIsDisabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = () => {
    setIsEditing(true);
    setIsDisabled(false);
  };

  const handleSave = async () => {
    setIsLoading(true);  // Start loader (set isLoading to true)

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
      setIsLoading(false);  // Stop loader (set isLoading to false)
    }
  };

  const [followUps, setFollowUps] = useState([]);
  const fetchFollowUps = async () => {
    try {
      const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/followup/getall/${viewdata._id}`);
      if (response.status === 200) {
        setFollowUps(Array.isArray(response.data.followups) ? response.data.followups : []);
      }
    } catch (error) {
      console.error("Error fetching follow-up data:", error);
      toast.error("Error fetching follow-up data. Please try again.");
    }
  };

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

  const handleStickyNote = (viewdata) => {
    setNoteOpen(true);
  }

  const closeNote = () => {
    setNoteOpen(false)
    fetchFollowUps();
  }

  const [activeData, setActiveData] = useState()

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
  })

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
        // Make the API request to mark as negative
        const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/negative/${viewdata._id}`);

        // Handle successful response
        if (response.status === 200) {
          Swal.fire({
            title: 'Marked as Negative!',
            icon: 'success',
          }).then(() => {
            // Navigate to the leads page
            navigate('/leads');
          });
        } else {
          // If the response isn't successful, you can show an error message
          Swal.fire({
            title: 'Failed to Mark as Negative',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
          });
        }
      } catch (error) {
        // Handle any errors during the request
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

  //mark as close
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
        // Make the API request to mark as negative
        const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/closed/${viewdata._id}`);

        // Handle successful response
        if (response.status === 200) {
          Swal.fire({
            title: 'Marked as Closed!',
            icon: 'success',
          }).then(() => {
            // Navigate to the leads page
            navigate('/leads');
          });
        } else {
          // If the response isn't successful, you can show an error message
          Swal.fire({
            title: 'Failed to Mark as Closed',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
          });
        }
      } catch (error) {
        // Handle any errors during the request
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
        // Make the API request to mark as negative
        const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/unclosed/${viewdata._id}`);

        // Handle successful response
        if (response.status === 200) {
          Swal.fire({
            title: 'Lead UnClosed!',
            icon: 'success',
          }).then(() => {
            // Navigate to the leads page
            navigate('/leads');
          });
        } else {
          // If the response isn't successful, you can show an error message
          Swal.fire({
            title: 'Failed to UnClosed',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
          });
        }
      } catch (error) {
        // Handle any errors during the request
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
        // Make the API request to mark as negative
        const response = await axios.put(`${APi_Url}/digicoder/crm/api/v1/lead/UnnegativedLead/${viewdata._id}`);

        // Handle successful response
        if (response.status === 200) {
          Swal.fire({
            title: 'Lead Moved!',
            icon: 'success',
          }).then(() => {
            // Navigate to the leads page
            navigate('/leads');
          });
        } else {
          // If the response isn't successful, you can show an error message
          Swal.fire({
            title: 'Failed to Moving Lead',
            text: 'Something went wrong. Please try again.',
            icon: 'error',
          });
        }
      } catch (error) {
        // Handle any errors during the request
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
    <div >
      <Dashboard active={activeData}>
        <div className="content fullLead-outer">
          <>
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
                        type="number"
                        className="input-field"
                        name="Phone"
                        value={formData.Phone}
                        onChange={handleChange}
                        disabled
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
                        name="priority"
                        value={formData.Priority}
                        options={priorityOptions}
                        onChange={(e) => handleChange({ target: { name: 'Priority', value: e.value } })}
                        optionLabel="label"
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
                        onChange={(e) => handleChange({ target: { name: 'Source', value: e.value } })}
                        optionLabel="label"
                        disabled={isDisabled}
                        placeholder="Select source"
                        className="p-dropdown"
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
                          value={selectedTags}
                          onChange={handleTagChange}
                          input={<OutlinedInput label="Tags" />}
                          renderValue={(selected) => selected.join(', ')}
                          MenuProps={MenuProps}
                          disabled={isDisabled}
                        >
                          {tagData.map((item) => (
                            <MenuItem key={item.tagName} value={item.tagName}>
                              <Checkbox checked={selectedTags.indexOf(item.tagName) > -1} />
                              <ListItemText primary={item.tagName} />
                            </MenuItem>
                          ))}
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
                        <span>Loading...</span>  // Show loading text or you could use a spinner here
                      ) : isEditing ? (
                        "Save"
                      ) : (
                        "Update"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Follow-ups Section */}
              <div className="follow-ups">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="view-data-titlee">
                    <span>FOLLOW UP</span>
                    <button className="view-data-button" onClick={() => handleStickyNote(viewdata)}>Add New</button>
                  </div>
                </div>

                <div className="follow-ups">
                  {/* Follow-ups list */}
                  {followUps.map((followUp, index) => (
                    <div key={followUp.id} className="follow-outer">
                      <div className="follow-body">
                        <div className="follow-body-header">
                          <div className="followup-srNo">{index + 1}</div>
                          <div >
                            <span className="cratedBy">Created Date-</span> <span className="cratedBy">{followUp.createdAt.split("T")[0]}</span>
                            <div style={{ marginTop: "5px" }}><span className="cratedBy">Created By-</span> <span className="cratedBy">{followUp.followedBy.empName}</span></div>
                          </div>
                        </div>
                        <div className="follow-ups-txt">
                          <p>{followUp.followupMessage}</p>
                        </div>
                      </div>
                      <hr />
                    </div>
                  ))}
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
          </>
        </div>
      </Dashboard>
    </div>
  )
}

export default FullLeads