import { useEffect, useState } from "react";
import axios from "axios";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Dashboard from "../Components/Dashboard";
import "./CSS/EmployeeTagRequest.css";

const EmployeeTagRequest = () => {
  const API = import.meta.env.VITE_API_URL;

  const employeeId = localStorage.getItem("employeeId");
  const addedBy = localStorage.getItem("addedBy");

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [requests, setRequests] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 5,
    page: 1,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // ===============================
  // LOAD TAGS
  // ===============================
  useEffect(() => {
    const fetchTags = async () => {
      const res = await axios.get(
        `${API}/digicoder/crm/api/v1/tags/getall/${addedBy}`
      );

      setTags(
        res.data.tags.map((tag) => ({
          label: tag.tagName,
          value: tag._id,
        }))
      );
    };

    fetchTags();
  }, []);

  // ===============================
  // LOAD REQUESTS (SERVER SIDE)
  // ===============================
  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/digicoders/crm/api/v1/request/employee/all-requests/${employeeId}`,
        {
          params: {
            page: lazyParams.page,
            limit: lazyParams.rows,
            search,
            status,
          },
        }
      );

      setRequests(res.data.data || []);
      setTotalRecords(res.data.total || 0);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [lazyParams, search, status]);

  // ===============================
  // REFRESH HANDLER
  // ===============================
  const handleRefresh = () => {
    loadRequests();
  };

  // ===============================
  // SEND REQUEST
  // ===============================
  const handleSubmit = async () => {
    if (selectedTags.length === 0) {
      alert("Select at least one tag");
      return;
    }

    await axios.post(
      `${API}/digicoders/crm/api/v1/request/request-tags`,
      {
        tags: selectedTags,
        employeeId,
      }
    );

    alert("Request Sent!");
    setSelectedTags([]);
    loadRequests();
  };

  // ===============================
  // PAGINATION
  // ===============================
  const onPage = (event) => {
    setLazyParams({
      ...lazyParams,
      first: event.first,
      rows: event.rows,
      page: event.page + 1,
    });
  };

  // ===============================
  // UI HELPERS
  // ===============================
  const statusBody = (row) => {
    const severity =
      row.status === "accepted"
        ? "success"
        : row.status === "rejected"
        ? "danger"
        : "warning";

    return <Tag value={row.status} severity={severity} />;
  };

  const tagsBody = (row) => (
    <div className="flex flex-wrap gap-1">
      {row.tags.map((t) => (
        <Tag key={t._id} value={t.tagName} />
      ))}
    </div>
  );

  const reasonBody = (row) =>
    row.status === "rejected"
      ? row.rejectionReason || "No reason"
      : "-";

  // ===============================
  // COUNTS
  // ===============================
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const acceptedCount = requests.filter(r => r.status === "accepted").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <Dashboard>
      <div className="employee-tag-request">

        {/* Header Section */}
        <div className="page-header">
          <h1 className="page-title">Lead Requests</h1>
          <p className="page-subtitle">Request leads by selecting relevant tags</p>
        </div>

        {/* Request Form Card */}
        <div className="form-card">
          <div className="form-header">
            <i className="pi pi-tag"></i>
            <h2>New Request</h2>
          </div>
          
          <div className="form-content">
            <div className="field">
              <label className="field-label">Select Tags</label>
              <MultiSelect
                value={selectedTags}
                options={tags}
                onChange={(e) => setSelectedTags(e.value)}
                placeholder="Choose tags for lead request..."
                display="chip"
                filter
                className="custom-multiselect"
              />
            </div>
            
            <Button
              label="Send Request"
              icon="pi pi-send"
              onClick={handleSubmit}
              className="submit-btn"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-icon">
              <i className="pi pi-clock"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{pendingCount}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card accepted">
            <div className="stat-icon">
              <i className="pi pi-check-circle"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{acceptedCount}</span>
              <span className="stat-label">Accepted</span>
            </div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-icon">
              <i className="pi pi-times-circle"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{rejectedCount}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        {/* Filters Bar with Refresh Button */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <i className="pi pi-search search-icon"></i>
            <InputText
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <Dropdown
            value={status}
            options={[
              { label: "All Status", value: "" },
              { label: "Pending", value: "pending" },
              { label: "Accepted", value: "accepted" },
              { label: "Rejected", value: "rejected" },
            ]}
            onChange={(e) => setStatus(e.value)}
            placeholder="Filter by status"
            className="status-dropdown"
          />

          <Button
            icon="pi pi-refresh"
            label="Refresh"
            onClick={handleRefresh}
            className="refresh-btn"
            loading={loading}
            tooltip="Refresh data"
            tooltipOptions={{ position: 'top' }}
          />
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <DataTable
            value={requests}
            lazy
            paginator
            first={lazyParams.first}
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            onPage={onPage}
            className="custom-datatable"
            emptyMessage="No requests found"
            loading={loading}
          >
            <Column 
              header="Tags" 
              body={tagsBody} 
              style={{ width: '50%' }}
              headerClassName="table-header"
            />
            <Column 
              header="Status" 
              body={statusBody} 
              style={{ width: '20%' }}
              headerClassName="table-header"
            />
            <Column 
              header="Reason" 
              body={reasonBody} 
              style={{ width: '30%' }}
              headerClassName="table-header"
            />
          </DataTable>
        </div>

      </div>
    </Dashboard>
  );
};

export default EmployeeTagRequest;