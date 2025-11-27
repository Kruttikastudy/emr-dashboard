import React, { useState, useEffect } from "react";
import "./GenderIdentity.css";

const GenderIdentity = ({ onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    identity: "Male",
    notes: ""
  });

  // Fetch existing gender identity data on component mount
  useEffect(() => {
    const fetchGenderIdentityData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        console.log("No patient ID found in localStorage");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching gender identity data for patient:", patientId);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/gender-identity`);
        
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
        console.log("Loaded gender identity data:", result);

        if (response.ok && result.success && result.data) {
          setFormData({
            identity: result.data.gender_identity || "Male",
            notes: result.data.notes || ""
          });
        }
      } catch (error) {
        console.error("Error fetching gender identity data:", error);
        alert("Error loading gender identity data. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenderIdentityData();
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

    setIsSaving(true);

    try {
      const genderData = {
        identity: formData.identity,
        notes: formData.notes
      };

      console.log('Sending gender identity data:', genderData);
      console.log('To URL:', `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/gender-identity`);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/gender-identity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genderData),
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
        throw new Error(result.message || "Failed to save gender identity data");
      }

      console.log("Gender identity data saved successfully:", result.data);
      alert('Gender identity saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving gender identity data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="gender-identity-panel">
        <div className="panel-header">
          <h3>Gender Identity</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="gender-identity-panel">
      <div className="panel-header">
        <h3>Gender Identity</h3>
      </div>

      <div className="form-group">
        <label>Gender Identity</label>
        <select 
          name="identity" 
          value={formData.identity} 
          onChange={handleChange}
          disabled={isSaving}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Transgender">Transgender</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
          disabled={isSaving}
        />
      </div>

      <div className="identity-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Gender Data"}
        </button>
      </div>
    </div>
  );
};

export default GenderIdentity;
