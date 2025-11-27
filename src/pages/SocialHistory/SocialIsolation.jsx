import React, { useState, useEffect } from "react";
import "./SocialIsolation.css";

const SocialIsolation = ({ onClose }) => {
  const [formData, setFormData] = useState({
    isolationStatus: "Low",
    socialSupport: "Supportive family",
    interactions: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        console.error('No patientId in localStorage');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/social-isolation`
        );
        const data = await response.json();
        
        if (data.success && data.data) {
          setFormData({
            isolationStatus: data.data.isolation_status || "Low",
            socialSupport: data.data.social_support || "Supportive family",
            interactions: data.data.frequency_of_social_interactions || "",
            notes: data.data.notes || ""
          });
        }
      } catch (error) {
        console.error('Error fetching social isolation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    console.log("Close button clicked!");
    if (onClose) {
      onClose();
    } else {
      console.log("No onClose function provided!");
      alert("Close function not provided by parent component");
    }
  };

  const handleSave = async () => {
    // Get patientId from localStorage
    const patientId = localStorage.getItem("currentPatientId");

    if (!patientId) {
      alert("No patient selected. Please complete Patient Demographics first.");
      return;
    }

    setIsSaving(true);

    try {
      const isolationData = {
        isolationStatus: formData.isolationStatus,
        socialSupport: formData.socialSupport,
        interactions: formData.interactions,
        notes: formData.notes
      };

      console.log('Sending social isolation data:', isolationData);

      // Save to backend using patientId
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/social-isolation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(isolationData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save social isolation data");
      }

      console.log("Social isolation data saved:", result.data);
      alert('Social isolation information saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving social isolation data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    const patientId = localStorage.getItem("currentPatientId");
    
    if (!patientId) {
      return;
    }

    // Re-fetch data to reset form
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/social-isolation`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        setFormData({
          isolationStatus: data.data.isolation_status || "Low",
          socialSupport: data.data.social_support || "Supportive family",
          interactions: data.data.frequency_of_social_interactions || "",
          notes: data.data.notes || ""
        });
      } else {
        // Reset to defaults if no data
        setFormData({
          isolationStatus: "Low",
          socialSupport: "Supportive family",
          interactions: "",
          notes: ""
        });
      }
    } catch (error) {
      console.error('Error resetting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="social-panel">
        <div className="panel-header">
          <h3>Social Isolation & Connection</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="social-panel">
      <div className="panel-header">
        <h3>Social Isolation & Connection</h3>
      </div>

      <div className="form-group">
        <label>Isolation Status</label>
        <select
          name="isolationStatus"
          value={formData.isolationStatus}
          onChange={handleChange}
        >
          <option value="Not Isolated">Not Isolated</option>
          <option value="Self-Isolating">Self-Isolating</option>
          <option value="Quarantined">Quarantined</option>
          <option value="Socially Isolated">Socially Isolated</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="High">High</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Social Support</label>
        <select
          name="socialSupport"
          value={formData.socialSupport}
          onChange={handleChange}
        >
          <option value="Strong">Strong</option>
          <option value="Moderate">Moderate</option>
          <option value="Limited">Limited</option>
          <option value="None">None</option>
          <option value="Unknown">Unknown</option>
          <option value="Supportive family">Supportive family</option>
          <option value="Friends">Friends</option>
          <option value="Community groups">Community groups</option>
          <option value="Minimal Support">Minimal Support</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Frequency of Social Interactions</label>
        <textarea
          name="interactions"
          placeholder="e.g., Weekly calls, monthly visits, daily chats..."
          value={formData.interactions}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about social connections..."
          rows={3}
        />
      </div>

      <div className="social-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Social Data"}
        </button>
      </div>
    </div>
  );
};

export default SocialIsolation;