import React, { useState, useEffect } from 'react';
import './CSS/LeadForm.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressSpinner } from 'primereact/progressspinner'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchPriority, fetchSources, fetchTags } from '../Features/LeadSlice';

const LeadForm = ({ isOpen, onClose, title, buttonTitle }) => {
  // Environment and session data
  const APi_Url = import.meta.env.VITE_API_URL;
  const employeeId = localStorage.getItem("employeeId");
  const AdminId = localStorage.getItem("addedBy");

  // Redux
  const dispatch = useDispatch();
  const priorityData = useSelector((state) => state.leads.Priority);
  const sourcesData = useSelector((state) => state.leads.leadSources);
  const tagData = useSelector((state) => state.leads.tag);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    priority: '',
    sources: ''
  });

  // Tags state
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTagValues, setSelectedTagValues] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Options state
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [sourcesOptions, setSourcesOptions] = useState([]);
  const [tagsOptions, setTagsOptions] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Fetch data when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Reset loading states
      setPriorityLoading(true);
      setSourcesLoading(true);
      setTagsLoading(true);
      
      // Dispatch API calls
      dispatch(fetchPriority());
      dispatch(fetchSources());
      dispatch(fetchTags());
    }
  }, [dispatch, isOpen]);

  // Handle priority data
  useEffect(() => {
    if (priorityData && Array.isArray(priorityData) && priorityData.length > 0) {
      setPriorityOptions(
        priorityData.map((priority) => ({
          label: priority.priorityText,
          value: priority._id
        }))
      );
    }
    setPriorityLoading(false);
  }, [priorityData]);

  // Handle sources data
  useEffect(() => {
    if (sourcesData && Array.isArray(sourcesData) && sourcesData.length > 0) {
      setSourcesOptions(
        sourcesData.map((source) => ({
          label: source.leadSourcesText,
          value: source._id
        }))
      );
    }
    setSourcesLoading(false);
  }, [sourcesData]);

  // Handle tags data
  useEffect(() => {
    if (tagData && Array.isArray(tagData) && tagData.length > 0) {
      setTagsOptions(
        tagData.map((tag) => ({
          label: tag.tagName,
          value: tag._id 
        }))
      );
    }
    setTagsLoading(false);
  }, [tagData]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        phone: '',
        priority: '',
        sources: ''
      });
      setSelectedTagValues([]);
      setSelectedTags([]);
      setSelectAll(false);
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter lead name');
      return false;
    }
    
    if (!formData.phone.trim()) {
      toast.error('Please enter phone number');
      return false;
    }
    
    if (!validatePhoneNumber(formData.phone)) {
      toast.error('Please enter a valid mobile number');
      return false;
    }
    
    if (!formData.priority) {
      toast.error('Please select priority');
      return false;
    }
    
    if (!formData.sources) {
      toast.error('Please select source');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        tags: selectedTagValues,
        userType: "Employee",
        leadAssignedTo: employeeId
      };
      
      const response = await axios.post(
        `${APi_Url}/digicoder/crm/api/v1/lead/add/${AdminId}`, 
        dataToSubmit, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast.success('Lead added successfully!');
        onClose();
        window.location.reload();
      } else {
        toast.error('Failed to add lead');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add lead. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Custom dropdown with loader component
  const DropdownWithLoader = ({ loading, children, label, required = false }) => (
    <div className="dropdown-container" style={{ position: 'relative' }}>
      <label htmlFor={label?.toLowerCase()}>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}:
      </label>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px', 
          border: '1px solid #ced4da', 
          borderRadius: '6px',
          backgroundColor: '#f8f9fa',
          minHeight: '42px'
        }}>
          <ProgressSpinner 
            style={{ width: '16px', height: '16px', marginRight: '8px' }} 
            strokeWidth="4"
          />
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Loading {label?.toLowerCase()}...</span>
        </div>
      ) : (
        children
      )}
    </div>
  );

  return (
    <Dialog
      header={title}
      visible={isOpen}
      onHide={onClose}
      className='leadFormOuter'
      style={{ width: '50vw' }}
      breakpoints={{ '960px': '75vw', '641px': '100vw' }}
      modal
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={onClose}
            className="p-button-text p-button-rounded"
            disabled={loading}
          />
          <Button
            label={loading ? 'Adding...' : buttonTitle}
            icon="pi pi-check"
            onClick={handleSubmit}
            className="p-button-rounded p-button-success"
            loading={loading}
            disabled={loading}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ padding: '10px 0' }}>
        <div className="p-grid p-fluid">
          {/* Lead Name Field */}
          <div className="p-field p-col-12 p-md-6" style={{ marginBottom: '20px' }}>
            <label htmlFor="name">
              Lead Name:
            </label>
            <InputText
              id="name"
              name="name"
              placeholder="Enter lead name"
              value={formData.name}
              onChange={handleInputChange}
              className="p-inputtext p-component"
            />
          </div>

          {/* Lead Phone Field */}
          <div className="p-field p-col-12 p-md-6" style={{ marginBottom: '20px' }}>
            <label htmlFor="phone">
              Lead Phone<span style={{ color: 'red' }}>*</span>:
            </label>
            <InputText
              id="phone"
              name="phone"
              placeholder="Enter 10-digit mobile number"
              value={formData.phone}
              onChange={handleInputChange}
              className="p-inputtext p-component"
              maxLength={10}
              required
            />
          </div>

          {/* Priority Dropdown */}
          <div className="p-field p-col-12 p-md-6" style={{ marginBottom: '20px' }}>
            <DropdownWithLoader loading={priorityLoading} label="Priority" required>
              <Dropdown
                id="priority"
                name="priority"
                value={formData.priority}
                options={priorityOptions}
                onChange={handleInputChange}
                optionLabel="label"
                optionValue="value"
                placeholder="Select priority"
                className="p-dropdown p-component"
                disabled={priorityLoading}
              />
            </DropdownWithLoader>
          </div>

          {/* Sources Dropdown */}
          <div className="p-field p-col-12 p-md-6" style={{ marginBottom: '20px' }}>
            <DropdownWithLoader loading={sourcesLoading} label="Sources" required>
              <Dropdown
                id="sources"
                name="sources"
                value={formData.sources}
                options={sourcesOptions}
                onChange={handleInputChange}
                optionLabel="label" 
                optionValue="value" 
                placeholder="Select source"
                className="p-dropdown p-component"
                disabled={sourcesLoading}
              />
            </DropdownWithLoader>
          </div>
          
          {/* Tags MultiSelect */}
          <div className="p-field p-col-12" style={{ marginBottom: '20px' }}>
            <DropdownWithLoader loading={tagsLoading} label="Tags"><span style={{ color: 'red' }}>*</span>
              <MultiSelect
                id="tags"
                value={selectedTagValues}
                options={tagsOptions}
                onChange={(e) => {  
                  setSelectedTagValues(e.value);
                  setSelectAll(false);
                }}
                optionLabel="label"
                optionValue="value"
                filter
                placeholder="Select tags"
                className="p-multiselect p-component"
                disabled={tagsLoading}
                display="chip"
                maxSelectedLabels={3}
              />
            </DropdownWithLoader>
          </div>
        </div>
      </form>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Dialog>
  );
};

export default LeadForm;