import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Switch from "@mui/material/Switch";
import "./CSS/FollowUpNotes.css";
import { Toast } from "primereact/toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeadStatus, fetchServices } from "../Features/LeadSlice";
import { Spinner } from "react-bootstrap";

function FollowUpNotes({ isOpenNote, oncloseNote, leadData, onFollowupAdded }) {
  const toast = useRef(null);
  const dispatch = useDispatch();
  const API_URL = import.meta.env.VITE_API_URL;

  // ================= STATE =================
  const [message, setMessage] = useState("");
  const [service, setService] = useState("");
  const [status, setStatus] = useState("");
  const [isScheduled, setIsScheduled] = useState(true); // Changed to true by default
  const [reminder, setReminderDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ================= REDUX =================
  const servicesData = useSelector((state) => state.leads.Services);
  const leadStatusData = useSelector((state) => state.leads.LeadStatus);

  // ================= FETCH MASTER DATA =================
  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchLeadStatus());
  }, [dispatch]);

  // ================= AUTO-SELECT SERVICE & STATUS & SET DEFAULT REMINDER =================
  useEffect(() => {
    if (!isOpenNote || !leadData) return;

    // ✅ SERVICE
    if (leadData?.services) {
      setService(
        typeof leadData.services === "object"
          ? leadData.services._id
          : leadData.services
      );
    }

    // ✅ STATUS
    if (leadData?.leadStatus) {
      setStatus(
        typeof leadData.leadStatus === "object"
          ? leadData.leadStatus._id
          : leadData.leadStatus
      );
    }

    // ✅ Set default reminder date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setReminderDate(tomorrow.toISOString().split('T')[0]);

    // Reset form when modal opens with new lead
    setMessage("");
    setIsScheduled(true); // Keep reminder on by default
  }, [isOpenNote, leadData]);

  // ================= RESET =================
  const resetForm = () => {
    setMessage("");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setReminderDate(tomorrow.toISOString().split('T')[0]);
    setIsScheduled(true);
    setIsLoading(false);
  };

  // ================= SAVE =================
  const saveStickyNote = async () => {
    // Validation
    if (!message.trim()) {
      toast.current.show({
        severity: "warn",
        summary: "Required",
        detail: "Please enter follow-up message",
        life: 3000,
      });
      return;
    }

    if (!service) {
      toast.current.show({
        severity: "warn",
        summary: "Required",
        detail: "Please select a service",
        life: 3000,
      });
      return;
    }

    if (!leadData?._id) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Invalid Lead",
        life: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const employeeId = localStorage.getItem("employeeId");
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/digicoder/crm/api/v1/followup/add/${leadData._id}`,
        {
          message,
          service,
          status,
          followedBy: employeeId,
          reminder: isScheduled ? reminder : null,
        },
        { 
          headers: { 
            "Content-Type": "application/json",
          } 
        }
      );

      if (response.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Follow-up saved successfully",
          life: 2000,
        });

        if (onFollowupAdded) {
          onFollowupAdded();
        }
        
        resetForm();
        oncloseNote(true);
      }
    } catch (error) {
      console.error('Error saving follow-up:', error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to save follow-up",
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ================= CANCEL =================
  const cancelStickyNote = () => {
    resetForm();
    oncloseNote(false);
  };

  // ================= UI =================
  return (
    <>
      <Modal 
        show={isOpenNote} 
        onHide={cancelStickyNote} 
        size="md" 
        centered 
        backdrop="static"
        className="followup-modal"
      >
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className="bi bi-pencil-square me-2" style={{ color: '#0d6efd' }}></i>
            Add Follow-up for <span style={{ color: '#0d6efd' }}>{leadData?.name || 'Student'}</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-2">
          {/* SERVICE & STATUS - Moved to top */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label fw-semibold mb-1">
                  Service <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  style={{ 
                    borderRadius: '8px',
                    borderColor: service ? '#0d6efd' : '#dee2e6',
                    transition: 'all 0.2s'
                  }}
                >
                  <option value="">Select Service</option>
                  {servicesData?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.servicesText}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label fw-semibold mb-1">Status <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ 
                    borderRadius: '8px',
                    borderColor: status ? '#0d6efd' : '#dee2e6',
                    transition: 'all 0.2s'
                  }}
                >
                  <option value="">Select Status</option>
                  {leadStatusData?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.leadStatusText}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* MESSAGE - Smaller textarea */}
          <div className="form-group mb-3">
            <label className="form-label fw-semibold mb-1">
              Message <span className="text-danger">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add your follow-up notes here..."
              className="form-control"
              rows="3"
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '8px',
                borderColor: message ? '#0d6efd' : '#dee2e6',
                resize: 'vertical',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              autoFocus
            />
          </div>

          {/* REMINDER */}
          <div className="form-group">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <Switch
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  color="primary"
                  size="small"
                />
                <span className="fw-semibold ms-1">Set Reminder</span>
              </div>

              {isScheduled && (
                <div className="d-flex align-items-center flex-grow-1">
                  <i className="bi bi-calendar3 me-2 text-primary"></i>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={reminder}
                    onChange={(e) => setReminderDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ 
                      maxWidth: '200px',
                      borderRadius: '6px'
                    }}
                    required={isScheduled}
                  />
                </div>
              )}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-top-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={cancelStickyNote} 
            disabled={isLoading}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={saveStickyNote}
            disabled={isLoading || !message.trim() || !service}
            className="px-4"
            style={{
              backgroundColor: '#0d6efd',
              borderColor: '#0d6efd',
              minWidth: '120px'
            }}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" animation="border" style={{ marginRight: '5px' }} />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle me-2"></i>
                Save Follow-up
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toast ref={toast} position="top-right" />
    </>
  );
}

export default FollowUpNotes;