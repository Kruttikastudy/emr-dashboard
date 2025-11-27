import React, { useState, useEffect } from "react";
import "./ExposureToViolence.css";

const ExposureToViolence = ({ onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    typeOfViolence: "",
    lastExposure: "",
    supportReceived: "",
    notes: ""
  });

  // Fetch existing exposure to violence data on component mount
  useEffect(() => {
    const fetchExposureToViolenceData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        console.log("No patient ID found in localStorage");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching exposure to violence data for patient:", patientId);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/exposure-to-violence`);
        
        console.log("Response status:", response.status);
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Response is not JSON. Content-Type:", contentType);
          const text = await response.text();
          console.error("Response body:", text);
          setIsLoading(false);
          return;
        }

        const result = await response.json();
        console.log("Loaded exposure to violence data:", result);

        if (response.ok && result.success && result.data) {
          setFormData({
            typeOfViolence: result.data.type_of_violence || "",
            lastExposure: result.data.date_of_last_exposure || "",
            supportReceived: result.data.support_or_intervention_received || "",
            notes: result.data.notes || ""
          });
        }
      } catch (error) {
        console.error("Error fetching exposure to violence data:", error);
        alert("Error loading exposure to violence data. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExposureToViolenceData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const patientId = localStorage.getItem("currentPatientId");

    if (!patientId) {
      alert("No patient selected. Please complete Patient Demographics first.");
      return;
    }

    if (!formData.typeOfViolence) {
      alert('Please select a type of violence');
      return;
    }

    setIsSaving(true);

    try {
      const violenceData = {
        typeOfViolence: formData.typeOfViolence,
        lastExposure: formData.lastExposure,
        supportReceived: formData.supportReceived,
        notes: formData.notes
      };

      console.log('Sending exposure to violence data:', violenceData);
      console.log('To URL:', `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/exposure-to-violence`);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/exposure-to-violence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(violenceData),
      });

      console.log("Response status:", response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON. Content-Type:", contentType);
        const text = await response.text();
        console.error("Response body:", text);
        alert("Server error: Received invalid response. Check console for details.");
        return;
      }

      const result = await response.json();
      console.log("Save response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to save exposure to violence data");
      }

      console.log("Exposure to violence data saved successfully:", result.data);
      alert('Violence exposure information saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving exposure to violence data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="violence-panel">
        <div className="panel-header">
          <h3>Exposure to Violence</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="violence-panel">
      <div className="panel-header">
        <h3>Exposure to Violence</h3>
      </div>

      <div className="form-group">
        <label>Type of Violence</label>
        <select
          name="typeOfViolence"
          value={formData.typeOfViolence}
          onChange={handleChange}
          disabled={isSaving}
          required
        >
          <option value="">Select</option>
          <option value="Physical">Physical</option>
          <option value="Sexual violence">Sexual violence</option>
          <option value="Emotional abuse">Emotional abuse</option>
          <option value="Financial">Financial</option>
          <option value="Domestic violence">Domestic violence</option>
          <option value="Child Abuse">Child Abuse</option>
          <option value="Elder Abuse">Elder Abuse</option>
          <option value="Bullying">Bullying</option>
          <option value="Workplace violence">Workplace violence</option>
          <option value="Community violence">Community violence</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Date of Last Exposure</label>
        <input
          type="date"
          name="lastExposure"
          value={formData.lastExposure}
          onChange={handleChange}
          disabled={isSaving}
        />
      </div>

      <div className="form-group">
        <label>Support or Intervention Received</label>
        <textarea
          name="supportReceived"
          placeholder="e.g., Counseling, legal support, shelter..."
          value={formData.supportReceived}
          onChange={handleChange}
          rows={3}
          disabled={isSaving}
        />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional details about the exposure..."
          rows={3}
          disabled={isSaving}
        />
      </div>

      <div className="violence-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Violence Data"}
        </button>
      </div>
    </div>
  );
};

export default ExposureToViolence;
