import React, { useState, useEffect } from "react";
import { useSocialHistory } from "./SocialHistoryContext";
import "./Education.css";

const Education = ({ onClose }) => {
  const { updateEducation, socialHistoryData } = useSocialHistory();
  const [formData, setFormData] = useState({
    highestEducation: "",
    notes: ""
  });

  // Load existing data when component mounts
  useEffect(() => {
    const loadEducationData = async () => {
      const patientId = localStorage.getItem('currentPatientId');
      
      if (!patientId) {
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/education`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFormData({
              highestEducation: result.data.highest_level_of_education || "",
              notes: result.data.notes || ""
            });
          }
        }
      } catch (error) {
        console.error("Error loading education data:", error);
      }
    };

    loadEducationData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.highestEducation) {
      alert('Please select an education level');
      return;
    }

    try {
      // Get the stored patient ID
      const patientId = localStorage.getItem('currentPatientId');
      
      if (!patientId) {
        alert("Please complete Patient Demographics first");
        return;
      }

      const educationData = {
        highestEducation: formData.highestEducation,
        notes: formData.notes
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(educationData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update context with the saved data
        updateEducation(educationData);
        
        console.log("Education data saved:", result.data);
        alert('Education information saved successfully!');
        
        // Optionally close the panel after saving
        if (onClose) {
          onClose();
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Failed to save Education Information: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving education data:", error);
      alert("Error saving education data.");
    }
  };

  const handleCancel = () => {
    setFormData({
      highestEducation: socialHistoryData?.education?.highestEducation || "",
      notes: socialHistoryData?.education?.notes || ""
    });
  };

  return (
    <div className="education-panel">
      <div className="panel-header">
        <h3>Education</h3>
      </div>

      <div className="form-group">
        <label>Highest Level of Education</label>
        <select
          name="highestEducation"
          value={formData.highestEducation}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Uneducated">Uneducated</option>
          <option value="Below 10th">Below 10th</option>
          <option value="10th Passed">10th Passed</option>
          <option value="12th Passed">12th Passed</option>
          <option value="High School">High School</option>
          <option value="Diploma">Diploma</option>
          <option value="Bachelor's">Bachelor's</option>
          <option value="BMS">BMS</option>
          <option value="Master's">Master's</option>
          <option value="PhD">PhD</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional education information..."
          rows={3}
        />
      </div>

      <div className="education-buttons">
        <button className="save-btn" onClick={handleSave}>
          Save Education Data
        </button>
      </div>
    </div>
  );
};

export default Education;
