import React, { useState, useEffect } from "react";
import { useSocialHistory } from "./SocialHistoryContext";
import "./PhysicalActivity.css";

const PhysicalActivity = ({ onClose }) => {
  const { updatePhysicalActivity } = useSocialHistory();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    frequency: "3 times/week",
    type: "",
    duration: "30",
    durationUnit: "min",
    consistency: "Regular",
    notes: ""
  });

  // Load existing data when component mounts
  useEffect(() => {
    const loadPhysicalActivityData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/physical-activity`
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFormData({
              frequency: result.data.frequency || "3 times/week",
              type: result.data.type_of_exercise || "",
              duration: result.data.duration || "30",
              durationUnit: result.data.duration_unit || "min",
              consistency: result.data.consistency || "Regular",
              notes: result.data.notes || ""
            });
          }
        }
      } catch (error) {
        console.error("Error loading physical activity data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhysicalActivityData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    console.log("Close button clicked!");
    console.log("onClose prop:", onClose);
    
    if (onClose) {
      console.log("Calling onClose function");
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
      const activityData = {
        frequency: formData.frequency,
        type: formData.type,
        duration: formData.duration,
        durationUnit: formData.durationUnit,
        consistency: formData.consistency,
        notes: formData.notes
      };

      console.log('Sending physical activity data:', activityData);

      // Save to backend using patientId
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/physical-activity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activityData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save physical activity data");
      }

      // Update context if function exists
      if (updatePhysicalActivity) {
        updatePhysicalActivity(activityData);
      }
      
      console.log("Physical activity saved:", activityData);
      alert('Physical activity information saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving physical activity data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="physical-activity-panel">
        <div className="panel-header">
          <h3>Physical Activity</h3>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="physical-activity-panel">
      <div className="panel-header">
        <h3>Physical Activity</h3>
        <button className="close-btn" onClick={handleClose}>×</button>
      </div>

      <div className="form-group">
        <label>Frequency</label>
        <select 
          name="frequency" 
          value={formData.frequency} 
          onChange={handleChange}
          disabled={isSaving}
        >
          <option>1–2 times/week</option>
          <option>3 times/week</option>
          <option>5+ times/week</option>
          <option>Rarely</option>
        </select>
      </div>

      <div className="form-group">
        <label>Type of Exercise</label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="e.g., Running, Swimming, Yoga"
          disabled={isSaving}
        />
      </div>

      <div className="form-group rowed">
        <label>Duration</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          min="1"
          disabled={isSaving}
        />
        <select 
          name="durationUnit" 
          value={formData.durationUnit} 
          onChange={handleChange}
          disabled={isSaving}
        >
          <option>min</option>
          <option>hr</option>
        </select>
      </div>

      <div className="form-group">
        <label>Consistency</label>
        <select 
          name="consistency" 
          value={formData.consistency} 
          onChange={handleChange}
          disabled={isSaving}
        >
          <option>Regular</option>
          <option>Occasional</option>
          <option>Irregular</option>
          <option>Never</option>
        </select>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about physical activity..."
          rows={3}
          disabled={isSaving}
        />
      </div>

      <div className="activity-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Activity Data"}
        </button>
      </div>
    </div>
  );
};

export default PhysicalActivity;