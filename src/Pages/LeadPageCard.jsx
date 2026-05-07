import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import '../Components/CSS/DynamicCard.css';
import FollowUpNotes from '../Components/FollowUpNotes';
import Modal from '../Components/LeadForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MultiSelect } from 'primereact/multiselect';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'timeago.js';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
  const [refreshing, setRefreshing] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [tagOptionsWithIds, setTagOptionsWithIds] = useState([]);
  
  // State for server-side data
  const [serverLeads, setServerLeads] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [serverLoading, setServerLoading] = useState(false);
  
  // State for filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Refs
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Constants
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tagData = useSelector((state) => state.leads.tag);

  const employeeId = localStorage.getItem("employeeId");

  // Initialize current page
  const [currentPage, setCurrentPage] = useState(() => {
    const pageFromUrl = parseInt(searchParams.get('page'));
    if (pageFromUrl && !isNaN(pageFromUrl)) {
      return pageFromUrl;
    }
    const savedPage = localStorage.getItem('currentLeadPage');
    if (savedPage) {
      return parseInt(savedPage);
    }
    return 1;
  });

  // Initialize filters
  const [selectedTagValues, setSelectedTagValues] = useState(() => {
    const savedTags = localStorage.getItem('selectedTagFilters');
    return savedTags ? JSON.parse(savedTags) : [];
  });

  const [selectedServiceValues, setSelectedServiceValues] = useState(() => {
    const savedServices = localStorage.getItem('selectedServiceFilters');
    return savedServices ? JSON.parse(savedServices) : [];
  });

  const [selectedStatusValues, setSelectedStatusValues] = useState(() => {
    const savedStatus = localStorage.getItem('selectedStatusFilters');
    return savedStatus ? JSON.parse(savedStatus) : [];
  });

  // Fetch tags with IDs from API
  useEffect(() => {
    const fetchTagsWithIds = async () => {
      try {
        const APi_Url = import.meta.env.VITE_API_URL;
        const addedBy = localStorage.getItem('addedBy');
        const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/tags/getall/${addedBy}`);
        
        if (response.data.tags) {
          const tagsWithIds = response.data.tags.map(tag => ({
            name: tag.tagName,
            value: tag._id,
            tagName: tag.tagName
          }));
          setTagOptionsWithIds(tagsWithIds);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        if (tagData && tagData.length > 0) {
          const tagsFromRedux = tagData.map(tag => ({
            name: tag.tagName,
            value: tag._id || tag.tagName,
            tagName: tag.tagName
          }));
          setTagOptionsWithIds(tagsFromRedux);
        }
      }
    };
    fetchTagsWithIds();
  }, [tagData]);

  // Filtered tag options for search
  const filteredTagOptions = useMemo(() => {
    return tagOptionsWithIds.filter(tag => 
      tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [tagOptionsWithIds, tagSearchQuery]);

  // Effects for pagination and filters
  useEffect(() => {
    searchParams.set('page', currentPage.toString());
    setSearchParams(searchParams);
    localStorage.setItem('currentLeadPage', currentPage.toString());
  }, [currentPage, setSearchParams, searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      localStorage.setItem('leadSearchQuery', searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('selectedTagFilters', JSON.stringify(selectedTagValues));
  }, [selectedTagValues]);

  useEffect(() => {
    localStorage.setItem('selectedServiceFilters', JSON.stringify(selectedServiceValues));
  }, [selectedServiceValues]);

  useEffect(() => {
    localStorage.setItem('selectedStatusFilters', JSON.stringify(selectedStatusValues));
  }, [selectedStatusValues]);

  // Scroll to top function
  const scrollToTop = useCallback((behavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior });
    }
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior, block: 'start' });
    }
  }, []);

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

  // Fetch leads from server
  const fetchLeadsFromServer = useCallback(async (showRefreshing = false) => {
    if (!employeeId) {
      console.error('No employee ID found');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setServerLoading(true);
    }

    try {
      const APi_Url = import.meta.env.VITE_API_URL;
      
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
          timeout: 10000
        }
      );

      if (response.data.success) {
        setServerLeads(response.data.leads || []);
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalRecords(response.data.pagination.totalRecords || 0);
      }
    } catch (error) {
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

  // Track previous filter values
  const prevFilters = useRef({
    search: localStorage.getItem('leadSearchQuery') || '',
    tags: selectedTagValues,
    status: selectedStatusValues,
    services: selectedServiceValues
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchLeadsFromServer();
      return;
    }
    
    const filtersChanged = 
      prevFilters.current.search !== debouncedSearchQuery ||
      JSON.stringify(prevFilters.current.tags) !== JSON.stringify(selectedTagValues) ||
      JSON.stringify(prevFilters.current.status) !== JSON.stringify(selectedStatusValues) ||
      JSON.stringify(prevFilters.current.services) !== JSON.stringify(selectedServiceValues);
    
    prevFilters.current = {
      search: debouncedSearchQuery,
      tags: selectedTagValues,
      status: selectedStatusValues,
      services: selectedServiceValues
    };
    
    if (filtersChanged) {
      if (currentPage !== 1) {
        setCurrentPage(1);
        scrollToTop('smooth');
      } else {
        fetchLeadsFromServer();
      }
    } else {
      fetchLeadsFromServer();
    }
  }, [debouncedSearchQuery, selectedTagValues, selectedStatusValues, selectedServiceValues]);

  const handlePageChange = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && !serverLoading && !refreshing) {
      setCurrentPage(pageNumber);
      localStorage.setItem('currentLeadPage', pageNumber.toString());
      scrollToTop('auto');
    }
  }, [totalPages, serverLoading, refreshing, scrollToTop]);

  useEffect(() => {
    if (!isInitialMount.current) {
      scrollToTop('auto');
      fetchLeadsFromServer();
    }
  }, [currentPage, fetchLeadsFromServer, scrollToTop]);

  useEffect(() => {
    if (serverLeads.length === 0 && currentPage > 1 && !serverLoading && !refreshing && totalRecords > 0) {
      handlePageChange(currentPage - 1);
    }
  }, [serverLeads.length, currentPage, serverLoading, refreshing, totalRecords, handlePageChange]);

  // Event handlers
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

  const closeNote = useCallback(async (followupAdded = false) => {
    setNoteOpen(false);
    
    if (followupAdded) {
      if (onFollowupAdded) {
        onFollowupAdded();
      }
      await fetchLeadsFromServer(true);
    }
  }, [onFollowupAdded, fetchLeadsFromServer]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTagSearchChange = (event) => {
    setTagSearchQuery(event.target.value);
  };

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedServiceValues([]);
    setSelectedStatusValues([]);
    setSelectedTagValues([]);
    setSearchQuery('');
    localStorage.removeItem('leadSearchQuery');
    closeFilterModal();
    scrollToTop('smooth');
  };

  // Skeleton Card Component
  const CardSkeleton = () => (
    <div className="Dynamic-card">
      <strong style={{ float: 'right' }}>
        <Skeleton width={40} />
      </strong>

      <div className="dynamic-card-details-body">
        <div className="dynamic-card-details">
          <div className="card-body">
            <p>
              <span className='card-heading'><Skeleton width={50} /></span>
              <span><Skeleton width={150} /></span>
            </p>
            <p>
              <span className='card-heading'><Skeleton width={60} /></span>
              <span><Skeleton width={130} /></span>
            </p>

            <div className="priority-source">
              <p>
                <span className='card-heading'><Skeleton width={60} /></span>
                <span><Skeleton width={100} /></span>
              </p>
              <p>
                <span className='card-heading'><Skeleton width={55} /></span>
                <span><Skeleton width={90} /></span>
              </p>
            </div>

            <div className="tags">
              <Skeleton width={60} height={24} style={{ borderRadius: '12px', marginRight: '8px' }} />
              <Skeleton width={70} height={24} style={{ borderRadius: '12px', marginRight: '8px' }} />
              <Skeleton width={50} height={24} style={{ borderRadius: '12px' }} />
            </div>

            <br />
            <div className="priority-source">
              <p>
                <span className='card-heading'><Skeleton width={110} /></span>
                <span><Skeleton width={120} /></span>
              </p>
              <p>
                <Skeleton width={80} />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="dynamic-card-footer">
        <div className='action-abtn'>
          <div className="call-icon-wrapper">
            <Skeleton circle width={32} height={32} />
          </div>
          <div className="call-icon-wrapper">
            <Skeleton circle width={32} height={32} />
          </div>
        </div>
        <div className='action-btn-footer'>
          <div className="call-icon-wrapper">
            <Skeleton circle width={32} height={32} />
          </div>
          <div className="call-icon-wrapper">
            <Skeleton circle width={32} height={32} />
          </div>
          <div className="call-icon-wrapper">
            <Skeleton circle width={32} height={32} />
          </div>
        </div>
      </div>
    </div>
  );

  // Show initial loader while data is being fetched
  if (loading) {
    return (
      <div className="dynamic-card-outer">
        <div className="fixed-filter-header">
          <div className="search-container">
            <Skeleton height={40} style={{ borderRadius: '6px' }} />
          </div>
          <div className="filter-button-wrapper">
            <Skeleton height={40} width={100} style={{ borderRadius: '6px' }} />
          </div>
        </div>
        <div className="header-spacer"></div>
        {[...Array(5)].map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const showDataLoader = serverLoading && !refreshing && !loading;
  
  return (
    <div className="dynamic-card-outer" ref={containerRef}>
      {/* Fixed Header with Search and Filter */}
      <div className="fixed-filter-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Name, Phone, Email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="custom-input custom-search-input"
          />
        </div>

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

      <div className="header-spacer"></div>

      {/* Loading overlay for page refresh */}
      {(showDataLoader || refreshing) && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="skeleton-spinner">
              <Skeleton circle width={40} height={40} />
            </div>
            <span>Loading leads...</span>
          </div>
        </div>
      )}

      {/* Leads list with skeleton while loading */}
      {!showDataLoader && serverLeads.length > 0 ? (
        serverLeads?.map((lead, index) => {
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
      ) : !showDataLoader && serverLeads.length === 0 && !loading ? (
        <div className="no-results">No leads found matching your filters</div>
      ) : showDataLoader ? (
        // Show skeletons while loading
        [...Array(5)].map((_, index) => (
          <CardSkeleton key={index} />
        ))
      ) : null}

      {/* Pagination */}
      {totalRecords > 0 && !showDataLoader && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || serverLoading || refreshing}
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <span>
            Page {currentPage} of {totalPages || 1} ({totalRecords} total)
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
              <div className="filter-section">
                <label>Tags</label>
                <MultiSelect
                  value={selectedTagValues}
                  options={filteredTagOptions}
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
            </div>

            <div className="filter-modal-footer">
              <button className="apply-filters-btn" onClick={clearAllFilters}>
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
        onFollowupAdded={onFollowupAdded}
      />
    </div>
  );
}

export default LeadPageCard;