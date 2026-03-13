import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './CSS/LeadsPage.css'

import FollowUpNotes from "../Components/FollowUpNotes";
import "../Components/CSS/DynamicTable.css";

export default function PendingLeadPage({ TableTitle = "Employee Leads" }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const employeeId = localStorage.getItem("employeeId");
  const adminId = localStorage.getItem("addedBy");

  // ===============================
  // 🔹 LOCAL STORAGE KEY
  // ===============================
  const STORAGE_KEY = `emp_leads_state_${employeeId}`;

  // ===============================
  // 🔹 LOAD INITIAL STATE FROM LOCAL STORAGE
  // ===============================
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (error) {
    //   console.error("Error loading saved state:", error);
    }
    return null;
  };

  // ===============================
  // 🔹 SAVE STATE TO LOCAL STORAGE
  // ===============================
  const saveState = (state) => {
    try {
      const stateToSave = {
        ...state,
        timestamp: Date.now(),
        tableTitle: TableTitle
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    //   console.log("Saved state:", stateToSave);
    } catch (error) {
    //   console.error("Error saving state:", error);
    }
  };

  // ===============================
  // 🔹 TABLE STATE (Initialize from localStorage)
  // ===============================
  const savedState = loadSavedState();
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBtn, setShowBtn] = useState(true);
  const [first, setFirst] = useState(savedState?.first || 0);
  const [rows, setRows] = useState(savedState?.rows || 100);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState(savedState?.search || "");
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(savedState?.selectedTags || []);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [leadData, setLeadData] = useState(null);

  // =====================================================
  // 🔹 SET BUTTON VISIBILITY BASED ON TITLE
  // =====================================================
  useEffect(() => {
    const closedLeadTitles = ['Closed Lead', 'Negative Lead', 'closed lead', 'negative lead'];
    setShowBtn(!closedLeadTitles.includes(TableTitle));
  }, [TableTitle]);

  // =====================================================
  // 🔹 FETCH LEADS (SEARCH + TAG + PAGINATION)
  // =====================================================
  const fetchLeads = useCallback(async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      const page = first / rows + 1;

      const res = await axios.get(
        `${API_URL}/digicoder/crm/api/v1/lead/pendingleads/${employeeId}`,
        {
          params: {
            page,
            limit: rows,
            search,
            tags: selectedTags.join(","),
          },
        }
      );
      setLeads(res.data.leads || []);
      setTotalRecords(res.data.pagination?.totalRecords || 0);

      // ✅ Save state after successful fetch
      saveState({ first, rows, search, selectedTags });

    } catch (error) {
      console.error("Fetch leads error:", error);
      setLeads([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [API_URL, employeeId, first, rows, search, selectedTags]);

  // =====================================================
  // 🔹 FETCH TAGS
  // =====================================================
  const fetchTags = useCallback(async () => {
    if (!adminId) return;

    try {
      setTagsLoading(true);
      const res = await axios.get(
        `${API_URL}/digicoder/crm/api/v1/tags/getall/${adminId}`
      );

      const tags = (res.data.tags || []).map(tag => ({
        label: tag.tagName || tag.name || 'Unnamed Tag',
        value: tag.tagName || tag.name || 'Unnamed Tag',
      }));

      const uniqueTags = tags.filter((tag, index, self) => 
        index === self.findIndex(t => t.value === tag.value)
      );

      setAvailableTags(uniqueTags);
    } catch (error) {
      console.error("Fetch tags error:", error);
      setAvailableTags([]);
    } finally {
      setTagsLoading(false);
    }
  }, [API_URL, adminId]);

  // =====================================================
  // 🔹 EFFECTS
  // =====================================================
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // =====================================================
  // 🔹 EVENT HANDLERS
  // =====================================================
  const onPage = (e) => {
    setFirst(e.first);
    setRows(e.rows);
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setFirst(0); // Reset to first page on search
  };

  const onTagChange = (e) => {
    setSelectedTags(e.value || []);
    setFirst(0); // Reset to first page on tag filter change
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedTags([]);
    setFirst(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  // =====================================================
  // 🔹 ACTION HANDLERS
  // =====================================================
  const handleEdit = (rowData) => {
    saveState({ first, rows, search, selectedTags });
    navigate('fullLeads', { 
      state: { 
        TableTitle, 
        fromEdit: 'FromEdit', 
        viewdata: rowData 
      } 
    });
  };

  const handleView = (rowData) => {
    saveState({ first, rows, search, selectedTags });
    navigate('fullLeads', { 
      state: { 
        viewdata: rowData, 
        TableTitle 
      } 
    });
  };

  // =====================================================
  // 🔹 HEADER WITH CLEAR FILTERS BUTTON
  // =====================================================
  const header = (
    <div className="flex justify-content-between align-items-center gap-3 p-2 flex-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h5 style={{ fontWeight: '600', color: '#2c3e50', margin: 0 }}>{TableTitle}</h5>
        
        {/* Show Clear Filters button only when filters are active */}
        {(search.trim() !== "" || selectedTags.length > 0) && (
          <button
            onClick={clearAllFilters}
            className="clear-filters-btn"
            title="Clear all filters"
          >
            <i className="ri-close-line" />
            Clear Filters
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <InputText
          value={search}
          onChange={onSearchChange}
          placeholder="Search name / phone"
          className="p-inputtext-sm"
          style={{ 
            width: "300px", 
            borderRadius: "6px",
            border: "1px solid #ced4da"
          }}
        />

        <MultiSelect
          value={selectedTags}
          options={availableTags}
          onChange={onTagChange}
          placeholder="Filter by Tags"
          loading={tagsLoading}
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
          maxSelectedLabels={3}
          selectedItemsLabel="{0} tags selected"
          emptyMessage="No tags found"
          emptyFilterMessage="No tags match the search"
          className="p-multiselect-sm"
          style={{ 
            minWidth: "220px",
            borderRadius: "6px"
          }}
        />
      </div>
    </div>
  );

  // =====================================================
  // 🔹 COLUMN TEMPLATES
  // =====================================================
  const srTemplate = (_, { rowIndex }) => (
    <span style={{ fontWeight: '500', color: '#2c3e50' }}>
      {rowIndex + 1}
    </span>
  );

  const nameTemplate = (row) => (
    <span style={{ fontWeight: '500', color: '#2c3e50' }}>
      {row.name || 'N/A'}
    </span>
  );

  const phoneTemplate = (row) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ paddingTop: '8px', minWidth: '100px', fontWeight: '500' }}>
        {row.phone || 'N/A'}
      </div>
      
      {showBtn && row.phone && (
        <div style={{ display: "flex", gap: "5px" }}>
          <div
            className="action-btn"
            onClick={() => window.location.href = `tel:${row.phone}`}
            title="Call"
          >
            <i className="ri-phone-fill" style={{ color: '#3454D1', fontSize: '16px' }} />
          </div>
          
          <div
            className="action-btn"
            onClick={() => window.open(`https://wa.me/91${row.phone}`, '_blank')}
            title="WhatsApp"
          >
            <i className="ri-whatsapp-line" style={{ color: '#25D366', fontSize: '18px' }} />
          </div>
          
          <div
            className="action-btn"
            onClick={() => {
              setLeadData(row);
              setNoteOpen(true);
            }}
            title="Add Note"
          >
            <i className="ri-sticky-note-add-fill" style={{ color: '#657C7B', fontSize: '16px' }} />
          </div>
        </div>
      )}
    </div>
  );

  const tagsTemplate = (row) => {
    if (!row.tags?.length) return (
      <span style={{ color: '#888', fontStyle: 'italic' }}>No tags</span>
    );

    return (
      <div className="tags-container">
        {row.tags.slice(0, 3).map(tag => (
          <span 
            key={tag._id} 
            className="tag-chip-display"
            title={tag.tagName || tag.name}
          >
            {tag.tagName || tag.name}
          </span>
        ))}
        {row.tags.length > 3 && (
          <span 
            className="tag-chip-display tag-chip-more"
            title={`${row.tags.length - 3} more tags`}
          >
            +{row.tags.length - 3}
          </span>
        )}
      </div>
    );
  };

  const actionTemplate = (row) => (
    <div style={{ display: "flex", gap: "5px" }}>
      <div className="action-btn" onClick={() => handleEdit(row)} title="Edit Lead">
        <i className="ri-edit-box-fill" style={{ color: '#3454D1', fontSize: '20px' }} />
      </div>
      
      <div className="action-btn" onClick={() => handleView(row)} title="View Lead">
        <i className="ri-eye-line" style={{ color: '#e74c3c', fontSize: '20px' }} />
      </div>
    </div>
  );

  // =====================================================
  // 🔹 RENDER
  // =====================================================
  return (
    <div className="card" style={{ borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
      <DataTable
        value={leads}
        lazy
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        header={header}
        dataKey="_id"
        scrollable
        scrollHeight="600px"
        emptyMessage={
          <div className="text-center p-4">
            <i className="ri-inbox-line" style={{ fontSize: '48px', color: '#ccc', marginBottom: '1rem' }} />
            <p style={{ color: '#666' }}>No leads found. Try adjusting your filters.</p>
          </div>
        }
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} leads"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        rowsPerPageOptions={[50, 100, 200]}
        className="p-datatable-sm"
        style={{ borderRadius: '10px', opacity: loading ? 0.5 : 1 }}
      >
        <Column 
          header="SR No." 
          body={srTemplate} 
          style={{ width: "80px", textAlign: "center" }} 
          frozen 
        />
        <Column 
          field="name" 
          header="NAME" 
          body={nameTemplate} 
          sortable 
          style={{ minWidth: "200px" }}
        />
        <Column 
          field="phone" 
          header="PHONE" 
          body={phoneTemplate} 
          sortable 
          style={{ minWidth: "250px" }}
        />
        <Column 
          header="TAGS" 
          body={tagsTemplate} 
          sortable 
          style={{ minWidth: "250px" }}
        />
        <Column 
          header="ACTIONS" 
          body={actionTemplate} 
          style={{ width: "120px", textAlign: "center" }} 
          frozen 
          alignFrozen="right" 
        />
      </DataTable>

      {loading && (
        <div className="single-loader-overlay">
          <div className="single-loader-content">
            <ClipLoader size={50} color="#3454D1" />
            <p style={{ marginTop: '1rem', color: '#666' }}>Loading leads...</p>
          </div>
        </div>
      )}

      <FollowUpNotes
        isOpenNote={noteOpen}
        oncloseNote={() => setNoteOpen(false)}
        leadData={leadData}
      />
    </div>
  );
}