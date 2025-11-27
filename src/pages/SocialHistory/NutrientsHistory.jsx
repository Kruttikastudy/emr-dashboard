import React, { useState, useEffect } from "react";
import "./NutrientsHistory.css";

const NutrientsHistory = ({ onClose }) => {
  const [formData, setFormData] = useState({
    dietaryPreferences: "",
    supplementUsage: "",
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
          `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/nutrients-history`
        );
        const data = await response.json();
        
        if (data.success && data.data) {
          setFormData({
            dietaryPreferences: data.data.dietary_preferences || "",
            supplementUsage: data.data.supplement_usage || "",
            notes: data.data.notes || ""
          });
        }
      } catch (error) {
        console.error('Error fetching nutrients history data:', error);
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
      const nutrientsData = {
        dietaryPreferences: formData.dietaryPreferences,
        supplementUsage: formData.supplementUsage,
        notes: formData.notes
      };

      console.log('Sending nutrients history data:', nutrientsData);

      // Save to backend using patientId
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/nutrients-history`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nutrientsData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save nutrients history data");
      }

      console.log("Nutrients history data saved:", result.data);
      alert('Nutrients history saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving nutrients history data:", error);
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
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/nutrients-history`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        setFormData({
          dietaryPreferences: data.data.dietary_preferences || "",
          supplementUsage: data.data.supplement_usage || "",
          notes: data.data.notes || ""
        });
      } else {
        // Reset to defaults if no data
        setFormData({
          dietaryPreferences: "",
          supplementUsage: "",
          notes: ""
        });
      }
    } catch (error) {
      console.error('Error resetting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="nutrients-panel">
        <div className="panel-header">
          <h3>Nutrients History</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="nutrients-panel">
      <div className="panel-header">
        <h3>Nutrients History</h3>
      </div>

      <div className="form-group">
        <label>Dietary Preferences</label>
        <textarea
          name="dietaryPreferences"
          placeholder="e.g., Vegetarian, Vegan, Keto, Gluten-free, etc."
          value={formData.dietaryPreferences}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Supplement Usage</label>
        <select
          name="supplementUsage"
          value={formData.supplementUsage}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Occasionally">Occasionally</option>
        </select>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about nutrition and supplements..."
          rows={3}
        />
      </div>

      <div className="nutrients-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Nutrients Data"}
        </button>
      </div>
    </div>
  );
};

export default NutrientsHistory;