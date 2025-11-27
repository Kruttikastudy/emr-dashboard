import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./Allergies.css";

const Allergies = () => {
  const navigate = useNavigate();
  const [allergyData, setAllergyData] = useState([
    {
      allergen: "",
      reaction: "",
      severity: "",
      category: "",
      code: "",
      status: "",
    },
  ]);

  // Dropdown options
  const allergenOptions = [
    "Penicillin", "Sulfa Drugs", "Aspirin", "Shellfish",
    "Nuts (e.g., peanuts, almonds, cashews)", "Eggs", "Milk",
    "Wheat", "Soy", "Pollen (specific types, e.g., ragweed, grass)",
    "Dust Mites", "Latex", "Nickel", "Pet Dander",
    "Bee Venom", "Mould", "Certain Medications",
    "Other"
  ];

  const reactionOptions = [
    "Rash", "Itching", "Hives", "Swelling", "Difficulty Breathing",
    "Anaphylaxis", "Nausea", "Vomiting", "Diarrhoea", "Dizziness",
    "Fainting", "Sneezing", "Other"
  ];

  const severityOptions = ["Mild", "Moderate", "Severe", "Critical", "Unknown", "None"];

  const statusOptions = ["Active", "Inactive", "Resolved", "Chronic", "Acute", "Recurrent", "Unknown", "None"];

  const categoryOptions = ["Medications", "Foods", "Environmental", "Insects", "Latex", "Other"];

  const codeOptions = [
    "A100: Medications",
    "A200: Foods",
    "A300: Environmental",
    "A400: Insects",
    "A500: Latex",
    "A600: Other"
  ];

  // Load existing allergy data from database
useEffect(() => {
  const loadExistingData = async () => {
    const patientId = localStorage.getItem("currentPatientId");
    if (!patientId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/allergies/${patientId}`);
      if (!response.ok) return;

      const json = await response.json();
      console.log("Backend returned:", json);

      // ✅ Backend returns json.data as an array
      const allergies = json.data;

      if (Array.isArray(allergies) && allergies.length > 0) {
        const formattedAllergies = allergies.map(a => ({
          allergen: a.allergen || "",
          reaction: a.reaction || "",
          severity: a.severity || "",
          category: a.category || "",
          code: a.code || "",
          status: a.status || "",
        }));

        setAllergyData(formattedAllergies);
      } else {
        setAllergyData([
          {
            allergen: "",
            reaction: "",
            severity: "",
            category: "",
            code: "",
            status: "",
          }
        ]);
      }

    } catch (err) {
      console.error("Error loading allergy data:", err);
    }
  };

  loadExistingData();
}, []);


  const handleChange = (index, field, value) => {
    const updatedData = [...allergyData];
    updatedData[index][field] = value;
    setAllergyData(updatedData);
  };

  const handleNext = () => navigate('/dashboard/family-history');

  const handleSave = async () => {
    try {
      const patientId = localStorage.getItem('currentPatientId');

      if (!patientId) {
        alert("Please complete Patient Demographics first");
        navigate('/dashboard/patient-demographics');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/allergies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          allergies: allergyData
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert("Allergy information saved successfully!");
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Failed to save allergy information: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving allergy information:", error);
      alert("Error saving allergy information.");
    }
  };

  const handleAddRow = () => {
    setAllergyData([
      ...allergyData,
      { allergen: "", reaction: "", severity: "", category: "", code: "", status: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (allergyData.length > 1) {
      const updatedData = allergyData.filter((_, i) => i !== index);
      setAllergyData(updatedData);
    }
  };

  return (
    <div className="allergies-container">
      <header className="fixed-header">
        <h1 className="header-title"></h1>
      </header>
      <h2 className="allergies-title">Allergies Information</h2>
      
      <div className="allergies-section">
        <legend className="section-title">Allergy Details</legend>
        <div className="table-container">
          <table className="allergies-table">
            <thead>
              <tr>
                <th>Allergen</th>
                <th>Reaction</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allergyData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={item.allergen}
                      onChange={(e) => handleChange(index, "allergen", e.target.value)}
                    >
                      <option value="">Select</option>
                      {allergenOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.reaction}
                      onChange={(e) => handleChange(index, "reaction", e.target.value)}
                    >
                      <option value="">Select</option>
                      {reactionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.severity}
                      onChange={(e) => handleChange(index, "severity", e.target.value)}
                    >
                      <option value="">Select</option>
                      {severityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.category}
                      onChange={(e) => handleChange(index, "category", e.target.value)}
                    >
                      <option value="">Select</option>
                      {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.code}
                      onChange={(e) => handleChange(index, "code", e.target.value)}
                    >
                      <option value="">Select</option>
                      {codeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleChange(index, "status", e.target.value)}
                    >
                      <option value="">Select</option>
                      {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveRow(index)}
                      disabled={allergyData.length === 1}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-actions">
        <button className="add-btn" onClick={handleAddRow}>
          + Add Allergy
        </button>
        <div className="nav-buttons">
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
          <button className="next-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Allergies;