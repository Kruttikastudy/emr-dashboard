import React, { useState, useEffect } from "react";
import { useSocialHistory } from "./SocialHistoryContext";
import "./AlcoholUse.css";

const AlcoholUse = ({ onClose }) => {
  const { updateAlcoholUse } = useSocialHistory();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingData, setExistingData] = useState(false);

  const [formData, setFormData] = useState({
    status: "",
    weeklyConsumption: "",
    alcoholType: "",
    period: "",
    notes: "",
  });

  // ✅ Fetch Alcohol Data from Backend
  useEffect(() => {
    const fetchAlcoholData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      if (!patientId) {
        console.error("No patient ID found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/alcohol`
        );

        if (!res.ok) {
          console.warn("No existing alcohol data found for patient.");
          setLoading(false);
          return;
        }

        const body = await res.json();
        console.log("Raw response:", body);
        
        // Handle different response structures
        const data = body?.data || body?.alcohol_use || null;

        if (data) {
          console.log("Loaded alcohol data:", data);
          setFormData({
            status: data.current_status || "",
            weeklyConsumption: data.average_weekly_consumption || "",
            alcoholType: data.type_of_alcohol || "",
            period: data.period_of_use || "",
            notes: data.notes || "",
          });
          setExistingData(true);
        } else {
          console.warn("No existing alcohol data found for patient.");
        }
      } catch (error) {
        console.error("Error loading alcohol data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlcoholData();
  }, []);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Save (POST for create, PUT for update)
  const handleSave = async () => {
    const patientId = localStorage.getItem("currentPatientId");
    if (!patientId) {
      alert("No patient selected. Please complete Patient Demographics first.");
      return;
    }

    // Validate required fields
    if (!formData.status) {
      alert("Please select a current status");
      return;
    }

    setIsSaving(true);

    const alcoholData = {
      status: formData.status,
      weeklyConsumption: formData.weeklyConsumption,
      alcoholType: formData.alcoholType,
      period: formData.period,
      notes: formData.notes,
    };

    try {
      // Use PUT if data exists, POST if creating new
      const method = existingData ? "PUT" : "POST";
      
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/alcohol`,
        {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alcoholData),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.error("Server error:", result);
        throw new Error(result.message || result.error || "Failed to save alcohol data");
      }

      updateAlcoholUse(alcoholData);
      alert("Alcohol information saved successfully!");
      setExistingData(true);

      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving alcohol data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return <p>Loading alcohol data...</p>;
  }

  return (
    <div className="alcohol-use-panel">
      <div className="panel-header">
        <h3>Alcohol Use</h3>
      </div>

      <div className="form-group">
        <label>Current Status *</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="">Select...</option>
          <option value="Non-Drinker">Non-Drinker</option>
          <option value="Moderate Drinker">Moderate Drinker</option>
          <option value="Heavy Drinker">Heavy Drinker</option>
        </select>
      </div>

      <div className="form-group">
        <label>Average Weekly Consumption (drinks)</label>
        <input
          type="number"
          name="weeklyConsumption"
          value={formData.weeklyConsumption}
          onChange={handleChange}
          placeholder="e.g., 5"
        />
      </div>

      <div className="form-group">
        <label>Type of Alcohol</label>
        <select
          name="alcoholType"
          value={formData.alcoholType}
          onChange={handleChange}
        >
          <option value="">Select...</option>
          <option value="Beer">Beer</option>
          <option value="Wine">Wine</option>
          <option value="Red wine">Red Wine</option>
          <option value="Wiskey">Whiskey</option>
          <option value="Vodka">Vodka</option>
          <option value="Rum">Rum</option>
          <option value="Gin">Gin</option>
          <option value="Tequila">Tequila</option>
          <option value="Brandy">Brandy</option>
          <option value="Mixed Drinks">Mixed Drinks</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Period of Use</label>
        <input
          type="text"
          name="period"
          value={formData.period}
          onChange={handleChange}
          placeholder="e.g., 2 years"
        />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
        />
      </div>

      <div className="alcohol-buttons">
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : existingData ? "Save Alcohol Data" : "Save Alcohol Data"}
        </button>
      </div>
    </div>
  );
};

export default AlcoholUse;