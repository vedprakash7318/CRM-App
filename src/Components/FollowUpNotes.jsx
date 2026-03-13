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
  const [isScheduled, setIsScheduled] = useState(false);
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

  // ================= AUTO-SELECT SERVICE & STATUS =================
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

    // Reset form when modal opens with new lead
    setMessage("");
    setReminderDate("");
    setIsScheduled(false);
  }, [isOpenNote, leadData]);

  // ================= RESET =================
  const resetForm = () => {
    setMessage("");
    setReminderDate("");
    setIsScheduled(false);
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
      const token = localStorage.getItem("token"); // Agar token use hota hai to

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
            // "Authorization": `Bearer ${token}` // Agar authorization chahiye to
          } 
        }
      );

      if (response.data.success) {
        // Success Toast
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Follow-up saved successfully",
          life: 2000,
        });

        // 🔥 IMPORTANT: Parent component ko call karo refresh ke liye
        if (onFollowupAdded) {
          onFollowupAdded(); // LeadPageCard mein fetchLeadsFromServer call hoga
        }
        
        // Form reset karo
        resetForm();
        
        // 🔥 IMPORTANT: Modal close karo with true parameter indicating followup added
        // Ab oncloseNote function ko call karo with true parameter
        // Parent component (LeadPageCard) ko pata chalega ki followup add hua hai
        oncloseNote(true); // <-- true bhej rahe hain
        
        // Agar parent oncloseNote true parameter nahi leta to ye alternative use karo:
        // setTimeout(() => {
        //   oncloseNote();
        //   if (onFollowupAdded) onFollowupAdded();
        // }, 100);
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
    oncloseNote(false); // <-- false bhej rahe hain (followup add nahi hua)
  };

  // ================= UI =================
  return (
    <>
      <Modal show={isOpenNote} onHide={cancelStickyNote} size="lg" centered backdrop="static">
        <Modal.Header closeButton>
          {/* <Modal.Title>
            Follow Up Notes
            {leadData?.name && <small style={{ marginLeft: '10px', color: '#666' }}> - {leadData.name}</small>}
          </Modal.Title> */}
        </Modal.Header>

        <Modal.Body>
          {/* MESSAGE */}
          <div className="form-group">
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
              Message <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note..."
              className="sticky-note-textarea"
              rows="4"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              autoFocus
            />
          </div>

          {/* SERVICE & STATUS */}
          <div className="form-row-notes" style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Service</label>
              <select
                className="sticky-note-select"
                value={service}
                onChange={(e) => setService(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
              >
                <option value="">Select Service</option>
                {servicesData?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.servicesText}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Status</label>
              <select
                className="sticky-note-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
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

          {/* REMINDER */}
          <div className="form-group reminder-switch" style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Switch
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              color="primary"
            />
            <label style={{ fontWeight: 'bold' }}>Set Reminder</label>

            {isScheduled && (
              <input
                type="date"
                className="date-input"
                value={reminder}
                onChange={(e) => setReminderDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                required={isScheduled}
              />
            )}
          </div>
          
        
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={cancelStickyNote} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={saveStickyNote}
            disabled={isLoading || !message.trim()}
            style={{ minWidth: '100px' }}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" animation="border" style={{ marginRight: '5px' }} />
                Saving...
              </>
            ) : (
              "Save Follow-up"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toast ref={toast} position="top-right" />
    </>
  );
}

export default FollowUpNotes;