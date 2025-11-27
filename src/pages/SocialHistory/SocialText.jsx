import React, { useState, useEffect } from "react";
import { useSocialHistory } from "./SocialHistoryContext";
import "./SocialText.css";

const SocialText = ({ onClose }) => {
  const { updateSocialText } = useSocialHistory();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    notes: "",
  });

  // Load existing data when component mounts
  useEffect(() => {
    const loadSocialTextData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/social-text`
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFormData({
              notes: result.data.notes || ""
            });
          }
        }
      } catch (error) {
        console.error("Error loading social history text:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialTextData();
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
      const socialTextData = {
        notes: formData.notes
      };

      console.log('Sending social history text:', socialTextData);

      // Save to backend using patientId
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/social-text`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(socialTextData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save social history text");
      }

      // Update context if function exists
      if (updateSocialText) {
        updateSocialText(socialTextData);
      }
      
      console.log("Social history text saved:", socialTextData);
      alert('Social History notes saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving social history text:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="social-text-panel slide-in">
        <div className="panel-header">
          <h3>Social History (Free Text)</h3>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="social-text-panel slide-in">
      <div className="panel-header">
        <h3>Social History (Free Text)</h3>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional social history notes..."
          rows={5}
          disabled={isSaving}
        />
      </div>

      <div className="social-text-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </button>
      </div>
    </div>
  );
};

export default SocialText;