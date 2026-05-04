import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import '../Components/CSS/DynamicCard.css';
import FollowUpNotes from '../Components/FollowUpNotes';
import Modal from '../Components/LeadForm';
import { useNavigate } from 'react-router-dom';
import { MultiSelect } from 'primereact/multiselect';
import { ClipLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTags } from '../Features/LeadSlice';
import { format } from 'timeago.js';
import axios from 'axios';

function PendingLeadCardPage({ TableTitle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tagData = useSelector((state) => state.leads.tag);
  const employeeId = localStorage.getItem("employeeId");
  const STORAGE_KEY = `pending_card_state_${employeeId}`;

  const saveState = (state) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [leadData, setLeadData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.search || ''; } catch { return ''; }
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.search || ''; } catch { return ''; }
  });
  const [loading, setLoading] = useState(true);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [serverLeads, setServerLeads] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [serverLoading, setServerLoading] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.currentPage || 1; } catch { return 1; }
  });
  const [selectedTagValues, setSelectedTagValues] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.tags || []; } catch { return []; }
  });
  const [selectedServiceValues, setSelectedServiceValues] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.services || []; } catch { return []; }
  });
  const [selectedStatusValues, setSelectedStatusValues] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.status || []; } catch { return []; }
  });

  const containerRef = useRef(null);
  const itemsPerPage = 5;
  const isFilterChange = useRef(false);

  // Save state whenever these values change
  useEffect(() => {
    saveState({ currentPage, search: searchQuery, tags: selectedTagValues, status: selectedStatusValues, services: selectedServiceValues });
  }, [currentPage, searchQuery, selectedTagValues, selectedStatusValues, selectedServiceValues]);

  useEffect(() => { dispatch(fetchTags()); }, [dispatch]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch statuses from API
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const APi_Url = import.meta.env.VITE_API_URL;
        const addedBy = localStorage.getItem('addedBy');
        const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/leadstatus/getall/${addedBy}`);

        const statuses = response.data.leadStatus || [];
        setStatusOptions(statuses.map(status => ({
          name: status.leadStatusText,
          value: status._id
        })));
      } catch (error) {
        // console.error('Error fetching statuses:', error);
      }
    };
    fetchStatuses();
  }, []);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const APi_Url = import.meta.env.VITE_API_URL;
        const addedBy = localStorage.getItem('addedBy');
        const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/service/get/${addedBy}`);

        const services = response.data.services || [];
        setServiceOptions(services.map(service => ({
          name: service.servicesText,
          value: service._id
        })));
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const fetchLeadsFromServer = useCallback(async () => {
    if (!employeeId) return;
    setServerLoading(true);
    try {
      const APi_Url = import.meta.env.VITE_API_URL;
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (selectedTagValues.length > 0) params.append('tags', selectedTagValues.join(','));
      if (selectedStatusValues.length > 0) params.append('status', selectedStatusValues.join(','));
      if (selectedServiceValues.length > 0) params.append('service', selectedServiceValues.join(','));

      const response = await axios.get(
        `${APi_Url}/digicoder/crm/api/v1/lead/pendingleads/${employeeId}?${params.toString()}`
      );
      if (response.data.success) {
        setServerLeads(response.data.leads || []);
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalRecords(response.data.pagination.totalRecords || 0);
      }
      console.log();
      
    } catch (error) {
      console.error('Error fetching leads:', error);
      setServerLeads([]);
      setTotalPages(1);
    } finally {
      setServerLoading(false);
      setLoading(false);
      hasFetched.current = true;
    }
  }, [employeeId, currentPage, debouncedSearchQuery, selectedTagValues, selectedStatusValues, selectedServiceValues]);

  // When filters change → reset to page 1
  useEffect(() => {
    if (isFilterChange.current) {
      isFilterChange.current = false;
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }
    fetchLeadsFromServer();
  }, [debouncedSearchQuery, selectedTagValues, selectedStatusValues, selectedServiceValues, currentPage]);

  // Adjust page if invalid after data loads - only after first fetch
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current && !serverLoading && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, serverLoading]);

  const handleFollowupAdded = useCallback(() => { fetchLeadsFromServer(); }, [fetchLeadsFromServer]);

  // Memoized values
  const tagsOptions = useMemo(() => {
    return tagData
      .filter(tag => tag.tagName.toLowerCase().includes(tagSearchQuery.toLowerCase()))
      .map(tag => ({ name: tag.tagName, value: tag.tagName }));
  }, [tagData, tagSearchQuery]);

  const filteredLeads = serverLeads;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const openModal = (isEdit) => {
    setEditMode(isEdit);
    setTitle(isEdit ? 'Update Lead' : 'Add New Lead');
    setButtonTitle(isEdit ? 'Update Lead' : 'Add Lead');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (lead) => {
    const viewdata = lead;
    const fromEdit = 'FromEdit';
    navigate('fullLeads', { state: { TableTitle, fromEdit, viewdata } });
  };

  const handleView = (lead) => {
    const viewdata = lead;
    navigate('fullLeads', { state: { viewdata, TableTitle } });
  };

  const handleStickyNote = (lead) => {
    setLeadData(lead);
    setNoteOpen(true);
  };

  const closeNote = () => {
    setNoteOpen(false);
  };

  const handleSearchChange = (event) => {
    isFilterChange.current = true;
    setSearchQuery(event.target.value);
  };

  const handleTagSearchChange = (event) => {
    setTagSearchQuery(event.target.value);
  };

  // Filter modal functions
  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const applyFilters = () => {
    closeFilterModal();
  };

  const clearAllFilters = () => {
    isFilterChange.current = true;
    setSelectedServiceValues([]);
    setSelectedStatusValues([]);
    setSelectedTagValues([]);
    setSearchQuery('');
    localStorage.removeItem(STORAGE_KEY);
    closeFilterModal();
  };

  // Render loading state
  if (loading && serverLoading) {
    return (
      <div className="dynamic-card-outer">
        <div className="loader-container">
          <ClipLoader size={50} color={'#3454D1'} loading={loading || serverLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-card-outer" ref={containerRef}>
      {/* Fixed Header with Search and Filter */}
      <div className="fixed-filter-header">
        {/* Search Input */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Name, Phone, Email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="custom-input custom-search-input"
          />
        </div>

        {/* Filter Button */}
        <div className="filter-button-wrapper">
          <button className="filter-toggle-btn" onClick={openFilterModal}>
            <i className="ri-filter-3-fill"></i> Filters
            {(selectedServiceValues.length > 0 || selectedStatusValues.length > 0 || 
              selectedTagValues.length > 0) && (
              <span className="filter-badge">
                {selectedServiceValues.length + selectedStatusValues.length + 
                 selectedTagValues.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="header-spacer"></div>

      {/* Lead Cards - SERVER DATA */}
      {filteredLeads.length > 0 ? (
        filteredLeads?.map((lead, index) => {
          const serialNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
          return (
            <div key={lead._id || index} className="Dynamic-card">
              <strong style={{ float: 'right' }}>#{serialNumber}</strong>

              <div className="dynamic-card-details-body">
                <div className="dynamic-card-details">
                  <div className="card-body">
                    <p>
                      <span className='card-heading'>Name:- </span>
                      <span>{lead.name}</span>
                    </p>
                    <p>
                      <span className='card-heading'>Mobile:- </span>
                      <span>{lead.phone}</span>
                    </p>

                    <div className="priority-source">
                      <p>
                        <span className='card-heading'>Service:- </span>
                        <span>{lead.services?.servicesText || "NA"}</span>
                      </p>
                      <p>
                        <span className='card-heading'>Status:- </span>
                        <span>{lead.leadStatus?.leadStatusText || "NA"}</span>
                      </p>
                    </div>

                    <div className="tags">
                      {lead.tags && Array.isArray(lead.tags) && lead.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="tag">
                          {typeof tag === 'string' ? tag : tag.tagName}
                        </span>
                      ))}
                    </div>

                    <br />
                    <div className="priority-source">
                      <p>
                        <span className='card-heading'>Latest Followup:- </span>
                        <span>
                          {lead?.latestFollowup?.followupMessage || "NA"}
                        </span>
                      </p>
                      <p>
                        <span style={{ color: "grey" }}>
                          {lead?.latestFollowup?.createdAt
                            ? format(lead.latestFollowup.createdAt)
                            : 'No Followup'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dynamic-card-footer">
                <div className='action-abtn'>
                  <div className="call-icon-wrapper">
                    <button
                      style={{
                        color: '#3454D1',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '15px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleEdit(lead)}
                    >
                      <i className="ri-edit-box-fill"></i>
                    </button>
                  </div>

                  <div className="call-icon-wrapper">
                    <button
                      onClick={() => handleView(lead)}
                      style={{
                        color: 'red',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '15px',
                        cursor: 'pointer',
                      }}
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                  </div>
                </div>

                <div className='action-btn-footer'>
                  <div className="call-icon-wrapper">
                    <button
                      onClick={() => handleStickyNote(lead)}
                      style={{ border: 'none', background: 'transparent' }}
                    >
                      <a
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'none',
                          fontSize: '15px',
                          color: '#657C7B',
                        }}
                        className="ri-sticky-note-add-fill"
                      />
                    </button>
                  </div>

                  <div className="call-icon-wrapper">
                    <a
                      href={`https://wa.me/${lead.phone.startsWith('+91')
                        ? lead.phone.replace(/\D/g, '')
                        : '91' + lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <button
                        style={{
                          color: 'green',
                          border: 'none',
                          background: 'transparent',
                          fontSize: '15px',
                          cursor: 'pointer',
                          position: 'relative',
                          bottom: '2px',
                        }}
                      >
                        <i className="ri-whatsapp-line"></i>
                      </button>
                    </a>
                  </div>

                  <div className="call-icon-wrapper">
                    <a
                      href={`tel:${lead.phone}`}
                      style={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        fontSize: '15px',
                        color: '#3454D1',
                      }}
                      className="ri-phone-fill"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="no-results">No leads found matching your filters</div>
      )}

      {/* Pagination - SERVER SIDE */}
      {totalRecords > 0 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || serverLoading}
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <span>
            {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0 || serverLoading}
          >
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      )}

      {/* Filter Modal - EXACTLY SAME */}
      {isFilterModalOpen && (
        <div className="filter-modal-overlay" onClick={closeFilterModal}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3>Filters</h3>
              <button className="close-modal-btn" onClick={closeFilterModal}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            
            <div className="filter-modal-body">
                {/* Tag Filter */}
              <div className="filter-section">
                <label>Tags</label>
                <MultiSelect
                  value={selectedTagValues}
                  options={tagsOptions}
                  optionLabel="name"
                  onChange={(e) => { isFilterChange.current = true; setSelectedTagValues(e.value); }}
                  placeholder="Filter by Tags"
                  className="custom-input custom-multiselect"
                  display="chip"
                  filter
                  filterPlaceholder="Search tags..."
                  onFilter={(e) => setTagSearchQuery(e.filter)}
                />
              </div>
                 {/* Status Filter */}
              <div className="filter-section">
                <label>Status</label>
                <MultiSelect
                  value={selectedStatusValues}
                  options={statusOptions}
                  optionLabel="name"
                  onChange={(e) => { isFilterChange.current = true; setSelectedStatusValues(e.value); }}
                  placeholder="Filter by Status"
                  className="custom-input custom-multiselect"
                  display="chip"
                />
              </div>


              {/* Service Filter */}
              <div className="filter-section">
                <label>Service</label>
                <MultiSelect
                  value={selectedServiceValues}
                  options={serviceOptions}
                  optionLabel="name"
                  onChange={(e) => { isFilterChange.current = true; setSelectedServiceValues(e.value); }}
                  placeholder="Filter by Service"
                  className="custom-input custom-multiselect"
                  display="chip"
                />
              </div>

           
            
            </div>

            <div className="filter-modal-footer">
              <button className="apply-filters-btn" onClick={applyFilters}>
                Apply Filters
              </button>
              <button className="clear-all-btn" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={title}
        buttonTitle={buttonTitle}
        leadData={leadData}
      />

      <FollowUpNotes
        isOpenNote={noteOpen}
        oncloseNote={closeNote}
        leadData={leadData}
        onFollowupAdded={handleFollowupAdded}
      />
    </div>
  );
}

export default PendingLeadCardPage;