import React, { useState, useEffect } from "react";
import "./TobaccoConsumption.css";

const TobaccoConsumption = ({ onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    status: "Never used",
    dailyConsumption: "",
    duration: "",
    durationUnit: "years",
    quitDate: "",
    notes: "",
  });

  // Fetch existing tobacco consumption data on component mount
  useEffect(() => {
    const fetchTobaccoConsumptionData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        console.log("No patient ID found in localStorage");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching tobacco consumption data for patient:", patientId);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/tobacco-consumption`);
        
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
        console.log("Loaded tobacco consumption data:", result);

        if (response.ok && result.success && result.data) {
          setFormData({
            status: result.data.current_status || "Never used",
            dailyConsumption: result.data.average_daily_consumption || "",
            duration: result.data.duration_of_use || "",
            durationUnit: result.data.duration_unit || "years",
            quitDate: result.data.quit_date || "",
            notes: result.data.notes || ""
          });
        }
      } catch (error) {
        console.error("Error fetching tobacco consumption data:", error);
        alert("Error loading tobacco consumption data. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTobaccoConsumptionData();
  }, []);

  const handleInputChange = (e) => {
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
      const tobaccoConsumptionData = {
        status: formData.status,
        dailyConsumption: formData.dailyConsumption,
        duration: formData.duration,
        durationUnit: formData.durationUnit,
        quitDate: formData.quitDate,
        notes: formData.notes
      };

      console.log('Sending tobacco consumption data:', tobaccoConsumptionData);
      console.log('To URL:', `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/tobacco-consumption`);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/tobacco-consumption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tobaccoConsumptionData),
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
        throw new Error(result.message || "Failed to save tobacco consumption data");
      }

      console.log("Tobacco consumption data saved successfully:", result.data);
      alert('Tobacco consumption information saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving tobacco consumption data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="tobacco-consumption-panel">
        <div className="panel-header">
          <h3>Tobacco Consumption</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="tobacco-consumption-panel">
      <div className="panel-header">
        <h3>Tobacco Consumption</h3>
      </div>
      
      <div className="form-group">
        <label>Status:</label>
        <select 
          name="status" 
          value={formData.status} 
          onChange={handleInputChange}
          disabled={isSaving}
        >
          <option value="Never used">Never used</option>
          <option value="Current user">Current user</option>
          <option value="Former user">Former user</option>
          <option value="Social user">Social user</option>
        </select>
      </div>

      {(formData.status === "Current user" || formData.status === "Former user" || formData.status === "Social user") && (
        <>
          <div className="form-group">
            <label>Daily Consumption (units per day):</label>
            <input
              type="number"
              name="dailyConsumption"
              value={formData.dailyConsumption}
              onChange={handleInputChange}
              placeholder="e.g., 5"
              disabled={isSaving}
            />
          </div>

          <div className="form-group duration-group">
            <label>Duration:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Duration"
                disabled={isSaving}
              />
              <select 
                name="durationUnit" 
                value={formData.durationUnit} 
                onChange={handleInputChange}
                disabled={isSaving}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          {formData.status === "Former user" && (
            <div className="form-group">
              <label>Quit Date:</label>
              <input
                type="date"
                name="quitDate"
                value={formData.quitDate}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>
          )}
        </>
      )}

      <div className="form-group">
        <label>Notes:</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Additional notes about tobacco consumption..."
          disabled={isSaving}
        />
      </div>

      <div className="tobacco-consumption-buttons">
        <button 
          onClick={handleSave} 
          className="save-btn"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Tobacco Consumption Data"}
        </button>
      </div>
    </div>
  );
};

export default TobaccoConsumption;
