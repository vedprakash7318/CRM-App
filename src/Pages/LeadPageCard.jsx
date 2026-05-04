import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import '../Components/CSS/DynamicCard.css';
import FollowUpNotes from '../Components/FollowUpNotes';
import Modal from '../Components/LeadForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MultiSelect } from 'primereact/multiselect';
import { ClipLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTags } from '../Features/LeadSlice';
import { format } from 'timeago.js';
import axios from 'axios';

function LeadPageCard({ TableTitle, onFollowupAdded }) {
  // State variables
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [leadData, setLeadData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('leadSearchQuery') || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() => localStorage.getItem('leadSearchQuery') || '');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Add this for smooth refresh
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  
  // New state for server-side data
  const [serverLeads, setServerLeads] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [serverLoading, setServerLoading] = useState(false);
  
  // New state for filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Ref for container
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null); // Add for request cancellation

  // Constants
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tagData = useSelector((state) => state.leads.tag);

  // Get employeeId from URL params
  const employeeId = localStorage.getItem("employeeId");

  // Initialize current page - with localStorage persistence
  const [currentPage, setCurrentPage] = useState(() => {
    // First check URL params
    const pageFromUrl = parseInt(searchParams.get('page'));
    if (pageFromUrl && !isNaN(pageFromUrl)) {
      return pageFromUrl;
    }
    // Then check localStorage
    const savedPage = localStorage.getItem('currentLeadPage');
    if (savedPage) {
      return parseInt(savedPage);
    }
    // Default to page 1
    return 1;
  });

  // Initialize selected tags
  const [selectedTagValues, setSelectedTagValues] = useState(() => {
    const savedTags = localStorage.getItem('selectedTagFilters');
    return savedTags ? JSON.parse(savedTags) : [];
  });

  // Initialize selected services
  const [selectedServiceValues, setSelectedServiceValues] = useState(() => {
    const savedServices = localStorage.getItem('selectedServiceFilters');
    return savedServices ? JSON.parse(savedServices) : [];
  });

  // Initialize selected status
  const [selectedStatusValues, setSelectedStatusValues] = useState(() => {
    const savedStatus = localStorage.getItem('selectedStatusFilters');
    return savedStatus ? JSON.parse(savedStatus) : [];
  });

  // Effects
  useEffect(() => {
    searchParams.set('page', currentPage.toString());
    setSearchParams(searchParams);
    localStorage.setItem('currentLeadPage', currentPage.toString());
  }, [currentPage, setSearchParams, searchParams]);

  // Debounce search query and save to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      localStorage.setItem('leadSearchQuery', searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('selectedTagFilters', JSON.stringify(selectedTagValues));
  }, [selectedTagValues]);

  useEffect(() => {
    localStorage.setItem('selectedServiceFilters', JSON.stringify(selectedServiceValues));
  }, [selectedServiceValues]);

  useEffect(() => {
    localStorage.setItem('selectedStatusFilters', JSON.stringify(selectedStatusValues));
  }, [selectedStatusValues]);

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
        console.error('Error fetching statuses:', error);
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

  // ============================================
  // 🔥 SERVER-SIDE DATA FETCHING (WITH ABORT CONTROLLER)
  // ============================================
  const fetchLeadsFromServer = useCallback(async (showRefreshing = false) => {
    if (!employeeId) {
      console.error('No employee ID found');
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Set loading states
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setServerLoading(true);
    }

    try {
      const APi_Url = import.meta.env.VITE_API_URL;
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      
      if (selectedTagValues.length > 0) {
        params.append('tags', selectedTagValues.join(','));
      }
      
      if (selectedStatusValues.length > 0) {
        params.append('status', selectedStatusValues.join(','));
      }
      
      if (selectedServiceValues.length > 0) {
        params.append('service', selectedServiceValues.join(','));
      }

      const response = await axios.get(
        `${APi_Url}/digicoder/crm/api/v1/lead/empgetall/${employeeId}?${params.toString()}`,
        {
          signal: abortControllerRef.current.signal,
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.success) {
        setServerLeads(response.data.leads || []);
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalRecords(response.data.pagination.totalRecords || 0);
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Error fetching leads:', error);
        setServerLeads([]);
        setTotalPages(1);
      }
    } finally {
      setServerLoading(false);
      setRefreshing(false);
      setLoading(false);
    }
  }, [employeeId, currentPage, debouncedSearchQuery, selectedTagValues, selectedStatusValues, selectedServiceValues]);

  // Track previous filter values to detect actual changes
  const prevFilters = useRef({
    search: localStorage.getItem('leadSearchQuery') || '',
    tags: selectedTagValues,
    status: selectedStatusValues,
    services: selectedServiceValues
  });

  // Reset to page 1 when filters change, but NOT on initial load or after refresh
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the first run when component mounts
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // After initial mount, fetch data with restored filters and page
      fetchLeadsFromServer();
      return;
    }
    
    // Check if filters actually changed (not just because of localStorage restoration)
    const filtersChanged = 
      prevFilters.current.search !== debouncedSearchQuery ||
      JSON.stringify(prevFilters.current.tags) !== JSON.stringify(selectedTagValues) ||
      JSON.stringify(prevFilters.current.status) !== JSON.stringify(selectedStatusValues) ||
      JSON.stringify(prevFilters.current.services) !== JSON.stringify(selectedServiceValues);
    
    // Update previous filters
    prevFilters.current = {
      search: debouncedSearchQuery,
      tags: selectedTagValues,
      status: selectedStatusValues,
      services: selectedServiceValues
    };
    
    // Only reset to page 1 if filters actually changed by user
    if (filtersChanged) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchLeadsFromServer();
      }
    } else {
      // If filters didn't change (like after refresh), just fetch data with current page
      fetchLeadsFromServer();
    }
  }, [debouncedSearchQuery, selectedTagValues, selectedStatusValues, selectedServiceValues]);

  // Memoized values
  const tagsOptions = useMemo(() => {
    return tagData
      .filter(tag => tag.tagName.toLowerCase().includes(tagSearchQuery.toLowerCase()))
      .map(tag => ({ name: tag.tagName, value: tag.tagName }));
  }, [tagData, tagSearchQuery]);

  // No client-side filtering needed anymore
  const filteredLeads = serverLeads;

  // Ensure current page is valid
  useEffect(() => {
    if (filteredLeads.length === 0 && currentPage > 1 && !serverLoading && !refreshing) {
      handlePageChange(currentPage - 1);
    }
  }, [filteredLeads.length, currentPage, serverLoading, refreshing]);

  // Event handlers
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Save to localStorage
      localStorage.setItem('currentLeadPage', pageNumber.toString());
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ============================================
  // 🔥 IMPORTANT: Followup close hone par fetch call
  // ============================================
  const closeNote = useCallback(async (followupAdded = false) => {
    setNoteOpen(false);
    
    // Agar followup add hua hai to refresh karo data
    if (followupAdded) {
      // Pehle parent component ko batao (agar zaroorat ho)
      if (onFollowupAdded) {
        onFollowupAdded();
      }
      
      // Ab turant API call karo with refreshing indicator
      await fetchLeadsFromServer(true); // true = show refreshing state
    }
  }, [onFollowupAdded, fetchLeadsFromServer]);

  const handleSearchChange = (event) => {
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
    setSelectedServiceValues([]);
    setSelectedStatusValues([]);
    setSelectedTagValues([]);
    setSearchQuery(''); // Clear search query
    localStorage.removeItem('leadSearchQuery'); // Remove from localStorage
    closeFilterModal();
  };

  // ============================================
  // FOLLOWUP NOTES COMPONENT KE LIYE PROPS
  // ============================================
  const followUpNotesProps = {
    isOpenNote: noteOpen,
    oncloseNote: closeNote,
    leadData: leadData,
    onFollowupAdded: onFollowupAdded
  };

  // Render loading state
  if (loading) {
    return (
      <div className="dynamic-card-outer">
        <div className="loader-container">
          <ClipLoader size={50} color={'#3454D1'} loading={loading} />
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

      {/* Refreshing Indicator (for followup updates) */}
      {refreshing && (
        <div className="refreshing-overlay">
          <ClipLoader size={20} color={'#3454D1'} />
          <span>Updating...</span>
        </div>
      )}

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
                          {lead?.latestFollowup?.[0]?.followupMessage || "NA"}
                        </span>
                      </p>
                      <p>
                        <span style={{ color: "grey" }}>
                          {lead?.latestFollowup?.[0]?.createdAt
                            ? format(lead.latestFollowup[0].createdAt)
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
                      <i
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
            disabled={currentPage === 1 || serverLoading || refreshing}
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <span>
            {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0 || serverLoading || refreshing}
          >
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      )}

      {/* Filter Modal */}
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
              {/* Service Filter */}
              <div className="filter-section">
                <label>Service</label>
                <MultiSelect
                  value={selectedServiceValues}
                  options={serviceOptions}
                  optionLabel="name"
                  onChange={(e) => setSelectedServiceValues(e.value)}
                  placeholder="Filter by Service"
                  className="custom-input custom-multiselect"
                  display="chip"
                />
              </div>

              {/* Status Filter */}
              <div className="filter-section">
                <label>Status</label>
                <MultiSelect
                  value={selectedStatusValues}
                  options={statusOptions}
                  optionLabel="name"
                  onChange={(e) => setSelectedStatusValues(e.value)}
                  placeholder="Filter by Status"
                  className="custom-input custom-multiselect"
                  display="chip"
                />
              </div>

              {/* Tag Filter */}
              <div className="filter-section">
                <label>Tags</label>
                <MultiSelect
                  value={selectedTagValues}
                  options={tagsOptions}
                  optionLabel="name"
                  onChange={(e) => setSelectedTagValues(e.value)}
                  placeholder="Filter by Tags"
                  className="custom-input custom-multiselect"
                  display="chip"
                  filter
                  filterPlaceholder="Search tags..."
                  onFilter={(e) => setTagSearchQuery(e.filter)}
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

      {/* FollowUp Notes - with updated props */}
      <FollowUpNotes
        isOpenNote={noteOpen}
        oncloseNote={closeNote}
        leadData={leadData}
        onFollowupAdded={onFollowupAdded}
      />
    </div>
  );
}

export default LeadPageCard;