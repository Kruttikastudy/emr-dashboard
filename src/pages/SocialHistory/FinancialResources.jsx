import React, { useState, useEffect } from "react";
import { useSocialHistory } from "./SocialHistoryContext";
import "./FinancialResources.css";

const FinancialResources = ({ onClose }) => {
  const { updateFinancialResources } = useSocialHistory();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    incomeLevel: "Moderate",
    employmentStatus: "Employed",
    financialSupport: "None",
    notes: "",
  });

  // Load existing data when component mounts
  useEffect(() => {
    const loadFinancialData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/financial-resources`
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFormData({
              incomeLevel: result.data.income_level || "Moderate",
              employmentStatus: result.data.employment_status || "Employed",
              financialSupport: result.data.financial_support || "None",
              notes: result.data.notes || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading financial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinancialData();
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
      const financialData = {
        incomeLevel: formData.incomeLevel,
        employmentStatus: formData.employmentStatus,
        financialSupport: formData.financialSupport,
        notes: formData.notes
      };

      console.log('Sending financial data:', financialData);

      // Save to backend using patientId
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/financial-resources`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(financialData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save financial data");
      }

      // Update context
      updateFinancialResources(financialData);
      
      console.log("Financial resources saved:", financialData);
      alert('Financial resources saved successfully!');
      
      // Close the panel after successful save
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Error saving financial data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="financial-resources-panel">
        <div className="panel-header">
          <h3>Financial Resources</h3>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="financial-resources-panel">
      <div className="panel-header">
        <h3>Financial Resources</h3>
      </div>

      <div className="form-group">
        <label>Income Level</label>
        <select 
          name="incomeLevel" 
          value={formData.incomeLevel} 
          onChange={handleChange}
        >
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
        </select>
      </div>

      <div className="form-group">
        <label>Employment Status</label>
        <select 
          name="employmentStatus" 
          value={formData.employmentStatus} 
          onChange={handleChange}
        >
          <option>Employed Full-time</option>
          <option>Employed Part-time</option>
          <option>Employed</option>
          <option>Unemployed</option>
          <option>Self-employed</option>
          <option>Student</option>
          <option>Retired</option>
          <option>Homemaker</option>
          <option>Disabled</option>
          <option>Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Financial Support</label>
        <select 
          name="financialSupport" 
          value={formData.financialSupport} 
          onChange={handleChange}
        >
          <option>None</option>
          <option>Family</option>
          <option>Government</option>
          <option>Disability Benefits</option>
          <option>Retirement Benefits</option>
          <option>Child Support</option>
          <option>Alimony</option>
          <option>Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea 
          name="notes" 
          value={formData.notes} 
          onChange={handleChange}
          placeholder="Enter any additional financial information..."
          rows={4}
        />
      </div>

      <div className="financial-buttons">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Financial Data"}
        </button>
      </div>
    </div>
  );
};

export default FinancialResources;