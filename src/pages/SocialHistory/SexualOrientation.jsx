import React, { useState, useEffect } from "react";
import "./SexualOrientation.css";

const SexualOrientation = ({ onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    orientation: "Heterosexual",
    notes: ""
  });

  // Fetch existing sexual orientation data on component mount
  useEffect(() => {
    const fetchSexualOrientationData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        console.log("No patient ID found in localStorage");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching sexual orientation data for patient:", patientId);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/sexual-orientation`);
        
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
        console.log("Loaded sexual orientation data:", result);

        if (response.ok && result.success && result.data) {
          setFormData({
            orientation: result.data.sexual_orientation || "Heterosexual",
            notes: result.data.notes || ""
          });
        }
      } catch (error) {
        console.error("Error fetching sexual orientation data:", error);
        alert("Error loading sexual orientation data. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSexualOrientationData();
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
      const orientationData = {
        orientation: formData.orientation,
        notes: formData.notes
      };

      console.log('Sending sexual orientation data:', orientationData);
      console.log('To URL:', `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/sexual-orientation`);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/sexual-orientation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orientationData),
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
        throw new Error(result.message || "Failed to save sexual orientation data");
      }

      console.log("Sexual orientation data saved successfully:", result.data);
      alert('Sexual orientation saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving sexual orientation data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sexual-orientation-panel">
        <div className="panel-header">
          <h3>Sexual Orientation</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="sexual-orientation-panel">
      <div className="panel-header">
        <h3>Sexual Orientation</h3>
      </div>

      <div className="form-group">
        <label>Sexual Orientation</label>
        <select 
          name="orientation" 
          value={formData.orientation} 
          onChange={handleChange}
          disabled={isSaving}
        >
          <option value="Straight">Straight</option>
          <option value="Heterosexual">Heterosexual</option>
          <option value="Homosexual">Homosexual</option>
          <option value="Bisexual">Bisexual</option>
          <option value="Pansexual">Pansexual</option>
          <option value="Asexual">Asexual</option>
          <option value="Queer">Queer</option>
          <option value="Questioning">Questioning</option>
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

      <div className="orientation-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Orientation Data"}
        </button>
      </div>
    </div>
  );
};

export default SexualOrientation;
