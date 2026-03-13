import { useEffect, useState } from "react";
import axios from "axios";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./CSS/EmployeeTagRequest.css";
import Dashboard from "../Components/Dashboard";

const EmployeeTagRequest = () => {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const APi_Url = import.meta.env.VITE_API_URL;

  const employeeId = localStorage.getItem("employeeId");
  const addedBy = localStorage.getItem("addedBy");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get(
          `${APi_Url}/digicoder/crm/api/v1/tags/getall/${addedBy}`
        );

        if (res.data?.tags) {
          setTags(
            res.data.tags.map((tag) => ({
              label: tag.tagName,
              value: tag._id,
            }))
          );
        } else {
          setTags([]);
        }
      } catch (err) {
        console.log("Error loading tags:", err);
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = async () => {
    if (selectedTags.length === 0) {
      alert("Please select at least one tag");
      return;
    } 

    try {
      await axios.post(`${APi_Url}/digicoders/crm/api/v1/request/request-tags`, {
        tags: selectedTags,
        employeeId,
      });

      alert("Request Sent Successfully!");
      setSelectedTags([]);
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <Dashboard>
    <div className="tag-request-container">
      <div className="tag-request-card">
        <h2 className="tag-request-title">Request Leads by Tags</h2>

        <label className="tag-request-label">Select Tags (Multiple)</label>

        <MultiSelect
          value={selectedTags}
          options={tags}
          onChange={(e) => setSelectedTags(e.value)}
          placeholder="Select Tags"
          display="chip"
          filter
          className="tag-multiselect"
        />

        <Button
          label="Send Request"
          icon="pi pi-send"
          className="tag-submit-btn"
          onClick={handleSubmit}
        />
      </div>
    </div>
    </Dashboard>
  );
};

export default EmployeeTagRequest;
