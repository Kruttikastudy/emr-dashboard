import React, { useState, useEffect } from "react";
import { useSocialHistory } from "./SocialHistoryContext";
import "./TobaccoUse.css";

const TobaccoUse = ({ onClose }) => {
  const { updateTobaccoUse } = useSocialHistory();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    status: "Never Smoked",
    dailyConsumption: "",
    duration: "",
    durationUnit: "years",
    quitDate: "",
    notes: "",
  });

  // Fetch existing tobacco smoking data
  useEffect(() => {
    const fetchTobaccoData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      if (!patientId) {
        console.log("No patient ID found in localStorage");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/tobacco-smoking`
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Response is not JSON. Content-Type:", contentType);
          setIsLoading(false);
          return;
        }

        const result = await response.json();

        if (response.ok && result.success && result.data) {
          setFormData({
            status: result.data.current_status || "Never Smoked",
            dailyConsumption: result.data.average_daily_consumption || "",
            duration: result.data.duration_of_use || "",
            durationUnit: result.data.duration_unit || "years",
            quitDate: result.data.quit_date || "",
            notes: result.data.notes || "",
          });
        }
      } catch (error) {
        console.error("Error fetching tobacco data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTobaccoData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const patientId = localStorage.getItem("currentPatientId");
    if (!patientId) {
      alert("No patient selected. Please complete Patient Demographics first.");
      return;
    }

    setIsSaving(true);

    try {
      // Build payload based on status
      const payload = {
        current_status: formData.status, // Required field
        notes: formData.notes || "",
      };

      if (formData.status === "Current Smoker" || formData.status === "Former Smoker") {
        payload.average_daily_consumption = Number(formData.dailyConsumption) || 0;
        payload.duration_of_use = formData.duration || "";
        payload.duration_unit = formData.durationUnit || "years";
      }

      if (formData.status === "Former Smoker") {
        payload.quit_date = formData.quitDate || "";
      }

      console.log("Sending tobacco smoking data:", payload);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/tobacco-smoking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON. Content-Type:", contentType);
        const text = await response.text();
        console.error("Response body:", text);
        alert("Server error: Invalid response.");
        return;
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save tobacco data");

      updateTobaccoUse(payload);
      alert("Tobacco smoking information saved successfully!");

      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving tobacco data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="tobacco-use-panel">
        <div className="panel-header">
          <h3>Tobacco Use (Smoking)</h3>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="tobacco-use-panel">
      <div className="panel-header">
        <h3>Tobacco Use (Smoking)</h3>
      </div>

      <div className="form-group">
        <label>Current Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          disabled={isSaving}
        >
          <option value="Current Smoker">Current Smoker</option>
          <option value="Former Smoker">Former Smoker</option>
          <option value="Never Smoked">Never Smoked</option>
        </select>
      </div>

      {(formData.status === "Current Smoker" || formData.status === "Former Smoker") && (
        <>
          <div className="form-group">
            <label>
              {formData.status === "Former Smoker"
                ? "Average Daily Consumption (before quitting)"
                : "Average Daily Consumption"}
            </label>
            <input
              type="number"
              name="dailyConsumption"
              value={formData.dailyConsumption}
              onChange={handleInputChange}
              placeholder="Number of cigarettes per day"
              disabled={isSaving}
            />
          </div>

          <div className="form-group duration-group">
            <label>
              {formData.status === "Former Smoker"
                ? "Duration of Use (before quitting)"
                : "Duration of Use"}
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
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
        </>
      )}

      {formData.status === "Former Smoker" && (
        <div className="form-group">
          <label>Quit Date</label>
          <input
            type="date"
            name="quitDate"
            value={formData.quitDate}
            onChange={handleInputChange}
            disabled={isSaving}
          />
        </div>
      )}

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Additional notes about tobacco use..."
          disabled={isSaving}
        />
      </div>

      <div className="tobacco-buttons">
        <button
          onClick={handleSave}
          className="save-btn"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Tobacco Data"}
        </button>
      </div>
    </div>
  );
};

export default TobaccoUse;
