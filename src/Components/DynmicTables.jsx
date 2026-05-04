import React, { useState, useEffect, useCallback } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import Modal from './LeadForm';
import { useNavigate } from 'react-router-dom';
import FollowUpNotes from './FollowUpNotes';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';
import './CSS/DynamicTable.css'
export default function DynamicTable({ lead, TableTitle }) {
    const APi_Url = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    // State management
    const [showBtn, setShowBtn] = useState(true);
    const [noteOpen, setNoteOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [isEditMode, setEditMode] = useState(false);
    const [buttonTitle, setButtonTitle] = useState('');
    const [leadData, setLeadData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);

    // Filters state
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        phone: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        tags: { value: null, matchMode: FilterMatchMode.IN },
    });

    // Fetch all tags from API
    const fetchAllTags = useCallback(async () => {
        try {
            setTagsLoading(true);
            const AdminId = localStorage.getItem('addedBy');
            
            if (!AdminId) {
                setAvailableTags([]);
                return;
            }

            const response = await axios.get(`${APi_Url}/digicoder/crm/api/v1/tags/getall/${AdminId}`);
            
            if (response.data && response.data.tags) {
                // Transform API response to dropdown format
                const formattedTags = response.data.tags.map(tag => ({
                    label: tag.tagName || tag.name || 'Unnamed Tag',
                    value: tag.tagName || tag.name || 'Unnamed Tag'
                }));
                
                // Remove duplicates
                const uniqueTags = formattedTags.filter((tag, index, self) => 
                    index === self.findIndex(t => t.value === tag.value)
                );
                
                setAvailableTags(uniqueTags);
            } else {
                console.warn('No tags found in API response');
                setAvailableTags([]);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
            setAvailableTags([]);
            
            // Optional: Show user-friendly error message
            if (error.response) {
                console.error('API Error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Network Error:', error.request);
            } else {
                console.error('Error:', error.message);
            }
        } finally {
            setTagsLoading(false);
        }
    }, [APi_Url]);

    // Filter handlers
    const onGlobalFilterChange = useCallback((e) => {
        const value = e.target.value;
        setFilters(prevFilters => ({
            ...prevFilters,
            global: { ...prevFilters.global, value }
        }));
        setGlobalFilterValue(value);
    }, []);

    const onTagsFilterChange = useCallback((e) => {
        const value = e.value;
        setFilters(prevFilters => ({
            ...prevFilters,
            tags: { ...prevFilters.tags, value }
        }));
        setSelectedTags(value);
    }, []);

    // Custom tags filter function
    const tagsFilterFunction = useCallback((value, filter) => {
        if (!filter || filter.length === 0) return true;
        if (!value || !Array.isArray(value)) return false;
        
        const tagNames = value.map(tag => tag.tagName || tag.name || '');
        return filter.some(filterTag => tagNames.includes(filterTag));
    }, []);

    // Pagination handler
    const onPageChange = useCallback((event) => {
        setFirst(event.first);
        setRows(event.rows);
    }, []);



    // Header component
    const renderHeader = useCallback(() => {
        return (
            <div className="flex justify-content-between gap-3 align-items-center p-2 flex-wrap">
                <h5>{TableTitle}</h5>
                
                <div style={{display:"flex", gap:"10px"}}>
                       <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Keyword Search"
                        style={{ width: '400px', maxHeight: '50px' }}
                    />
                    <MultiSelect
                        value={selectedTags}
                        options={availableTags}
                        onChange={onTagsFilterChange}
                        placeholder="Filter by Tags"
                        showClear
                        filter
                        filterPlaceholder="Search tags"
                        panelFooterTemplate={() => (
                            tagsLoading ? (
                                <div className="flex justify-content-center p-2">
                                    <ClipLoader color="#3454D1" size={20} />
                                </div>
                            ) : (
                                availableTags.length === 0 && (
                                    <div className="flex justify-content-center p-2 text-muted">
                                        No tags available
                                    </div>
                                )
                            )
                        )}
                        loading={tagsLoading}
                        disabled={tagsLoading}
                        style={{ minWidth: '200px' }}
                        maxSelectedLabels={3}
                        selectedItemsLabel="{0} tags selected"
                        emptyMessage="No tags found"
                        emptyFilterMessage="No tags match the search"
                    />
                    
                 
                </div>
            </div>  
        );
    }, [TableTitle, selectedTags, availableTags, onTagsFilterChange, tagsLoading, globalFilterValue, onGlobalFilterChange]);

    // Action buttons template
    const actionBodyTemplate = useCallback((rowData) => {
        return (
            <div style={{display:"flex"}}>
                <div
                    style={{
                        height: '40px',
                        width: '40px',
                        backgroundColor: '#EDF1FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                    }}
                >
                    <button
                        style={{
                            color: '#3454D1',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleEdit(rowData)}
                        aria-label="Edit lead"
                        title="Edit Lead"
                    >
                        <i className="ri-edit-box-fill"></i>
                    </button>
                </div>
                <div
                    style={{
                        height: '40px',
                        width: '40px',
                        backgroundColor: '#EDF1FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                    }}
                >
                    <button
                        onClick={() => handleView(rowData)}
                        style={{
                            color: '#e74c3c',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                        }}
                        aria-label="View lead"
                        title="View Lead"
                    >
                        <i className="ri-eye-line"></i>
                    </button>
                </div>
            </div>
        );
    }, []);

    // Tags display template
    const tagsBodyTemplate = useCallback((rowData) => {
        if (!rowData.tags || rowData.tags.length === 0) {
            return <span style={{ color: '#888', fontStyle: 'italic' }}>No tags</span>;
        }
        
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '250px' }}>
                {rowData.tags.slice(0, 3).map((tag, index) => (
                    <span
                        key={tag._id || index}
                        style={{
                            backgroundColor: '#E3F2FD',
                            color: '#1976D2',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: '1px solid #BBDEFB',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '80px'
                        }}
                        title={tag.tagName || tag.name}
                    >
                        {tag.tagName || tag.name}
                    </span>
                ))}
                {rowData.tags.length > 3 && (
                    <span
                        style={{
                            backgroundColor: '#f5f5f5',
                            color: '#666',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: '1px solid #ddd'
                        }}
                        title={`${rowData.tags.length - 3} more tags`}
                    >
                        +{rowData.tags.length - 3}
                    </span>
                )}
            </div>
        );
    }, []);

    // Phone column template
    const phoneBodyTemplate = useCallback((rowData) => {
        return (
            <div style={{display:"flex"}}>
                <div style={{ paddingTop: '10px', minWidth: '100px' }}>
                    {rowData?.phone || 'N/A'}
                </div>
                {showBtn && rowData?.phone && (
                    <div style={{display:"flex", gap:"5px"}}>
                        <div
                            style={{
                                height: '35px',
                                width: '35px',
                                backgroundColor: '#EDF1FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                            }}
                        >
                            <a
                                href={`tel:${rowData.phone}`}
                                style={{
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    fontSize: '16px',
                                    color: '#3454D1',
                                }}
                                className="ri-phone-fill"
                                aria-label="Call"
                                title="Call"
                            />
                        </div>
                        <div
                            style={{
                                height: '35px',
                                width: '35px',
                                backgroundColor: '#EDF1FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                            }}
                        >
                            <a 
                                href={`https://wa.me/91${rowData.phone}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="WhatsApp"
                            >
                                <button
                                    style={{
                                        color: '#25D366',
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                    }}
                                    aria-label="WhatsApp"
                                >
                                    <i className="ri-whatsapp-line"></i>
                                </button>
                            </a>
                        </div>
                        <div
                            style={{
                                height: '35px',
                                width: '35px',
                                backgroundColor: '#EDF1FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                            }}
                        >
                            <button 
                                onClick={() => handleStickyNote(rowData)} 
                                style={{ 
                                    border: 'none', 
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: '#657C7B',
                                }}
                                aria-label="Add note"
                                title="Add Note"
                            >
                                <i className="ri-sticky-note-add-fill" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }, [showBtn]);

    // Serial number template
    const serialNumberTemplate = useCallback((rowData, { rowIndex }) => {
        return (
            <span style={{ fontWeight: '500' }}>
                {rowIndex + 1}
            </span>
        );
    }, [first]);

    // Name template with fallback
    const nameBodyTemplate = useCallback((rowData) => {
        return (
            <span style={{ fontWeight: '500' }}>
                {rowData.name || 'N/A'}
            </span>
        );
    }, []);

    // Event handlers
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setTitle('');
        setButtonTitle('');
        setEditMode(false);
    }, []);

    const handleEdit = useCallback((rowData) => {
        const viewdata = rowData;
        const fromEdit = 'FromEdit';
        navigate('fullLeads', { state: { TableTitle, fromEdit, viewdata } });
    }, [navigate, TableTitle]);

    const handleView = useCallback((rowData) => {
        const viewdata = rowData;
        navigate('fullLeads', { state: { viewdata, TableTitle } });
    }, [navigate, TableTitle]);

    const handleStickyNote = useCallback((rowData) => {
        setNoteOpen(true);
        setLeadData(rowData);
    }, []);

    const closeNote = useCallback(() => {
        setNoteOpen(false);
        setLeadData([]);
    }, []);

    // Effects
    useEffect(() => {
        // Set button visibility based on table title
        const closedLeadTitles = ['Closed Lead', 'Negative Lead', 'closed lead', 'negative lead'];
        setShowBtn(!closedLeadTitles.includes(TableTitle));
        
        // Initial data load
        setLoading(true);
        
        // Simulate loading delay for better UX
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [TableTitle]);

    // Fetch tags when component mounts
    useEffect(() => {
        fetchAllTags();
    }, [fetchAllTags]);

    // Reset pagination when lead data changes
    useEffect(() => {
        setFirst(0);
    }, [lead]);

    const header = renderHeader();

    if (loading) {
        return (
            <div className="card">
                <div className="flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <div className="text-center">
                        <ClipLoader color="#3454D1" size={50} />
                        <p style={{ marginTop: '1rem', color: '#666' }}>Loading leads...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <DataTable
                value={lead || []}
                rows={rows}
                first={first}
                paginator
                dataKey="_id"
                filters={filters}
                filterDisplay="row"
                globalFilterFields={['name', 'phone', 'tags']}
                header={header}
                emptyMessage="No leads found. Try adjusting your filters."
                onPage={onPageChange}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} leads"
                removableSort
                style={{ borderRadius: '10px' }}
                className="p-datatable-sm"
                scrollable
                scrollHeight="600px"
                loading={loading}
                loadingIcon={<ClipLoader color="#3454D1" size={30} />}
            >
                <Column
                    header="SR No."
                    body={serialNumberTemplate}
                    style={{ width: '80px',textAlign: 'center' }}
                    frozen
                />
                <Column 
                    field="name" 
                    header="NAME" 
                    sortable 
                    style={{ minWidth: '200px' }}
                    body={nameBodyTemplate}
                />
                <Column
                    field="phone"
                    header="PHONE"
                    sortable
                    style={{ minWidth: '80px' }}
                    body={phoneBodyTemplate}
                />
                <Column
                    header="TAGS"
                    body={tagsBodyTemplate}
                    sortable
                    style={{ minWidth: '250px' }}
                    field="tags"
                    filterFunction={tagsFilterFunction}
                />
                <Column 
                    header="ACTIONS" 
                    body={actionBodyTemplate} 
                    style={{ width: '120px', textAlign: 'center' }}
                    exportable={false}
                    frozen
                    alignFrozen="right"
                />
            </DataTable>

            {/* Modals */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title={title} 
                buttonTitle={buttonTitle} 
                leadData={leadData}
                isEditMode={isEditMode}
            />
            
            <FollowUpNotes 
                isOpenNote={noteOpen} 
                oncloseNote={closeNote} 
                leadData={leadData} 
            />
        </div>
    );
}