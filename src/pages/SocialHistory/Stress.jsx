import React, { useState, useEffect } from "react";
import "./Stress.css";

const Stress = ({ onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    stressLevel: "Moderate",
    stressors: "",
    coping: "",
    notes: ""
  });

  // Fetch existing stress data on component mount
  useEffect(() => {
    const fetchStressData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        console.log("No patient ID found in localStorage");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching stress data for patient:", patientId);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/stress`);
        
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
        console.log("Loaded stress data:", result);

        if (response.ok && result.success && result.data) {
          setFormData({
            stressLevel: result.data.perceived_stress_level || "Moderate",
            stressors: result.data.major_stressors || "",
            coping: result.data.coping_mechanisms || "",
            notes: result.data.notes || ""
          });
        }
      } catch (error) {
        console.error("Error fetching stress data:", error);
        alert("Error loading stress data. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStressData();
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
      const stressData = {
        stressLevel: formData.stressLevel,
        stressors: formData.stressors,
        coping: formData.coping,
        notes: formData.notes
      };

      console.log('Sending stress data:', stressData);
      console.log('To URL:', `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/stress`);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/stress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stressData),
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
        throw new Error(result.message || "Failed to save stress data");
      }

      console.log("Stress data saved successfully:", result.data);
      alert('Stress information saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving stress data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="stress-panel">
        <div className="panel-header">
          <h3>Stress</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="stress-panel">
      <div className="panel-header">
        <h3>Stress</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="form-group">
        <label>Perceived Stress Level</label>
        <select
          name="stressLevel"
          value={formData.stressLevel}
          onChange={handleChange}
          disabled={isSaving}
        >
          <option value="None">None</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="High">High</option>
          <option value="Very High">Very High</option>
        </select>
      </div>

      <div className="form-group">
        <label>Major Stressors</label>
        <textarea
          name="stressors"
          placeholder="e.g., Work deadlines, family responsibilities..."
          value={formData.stressors}
          onChange={handleChange}
          rows={3}
          disabled={isSaving}
        />
      </div>

      <div className="form-group">
        <label>Coping Mechanisms</label>
        <textarea
          name="coping"
          placeholder="e.g., Meditation, therapy, exercise..."
          value={formData.coping}
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
          placeholder="Additional notes about stress..."
          rows={3}
          disabled={isSaving}
        />
      </div>

      <div className="stress-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Stress Data"}
        </button>
      </div>
    </div>
  );
};

export default Stress;
