import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./FamilyHistory.css";

const FamilyHistory = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [geneticConditions, setGeneticConditions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const navigate = useNavigate();
  const [hasAddedMembers, setHasAddedMembers] = useState(false);
  const [currentMember, setCurrentMember] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "Select",
    relationship: "Select",
    deceased: false,
    medicalConditions: [],
    newCondition: ""
  });
  const [currentGeneticCondition, setCurrentGeneticCondition] = useState({
    conditionName: "",
    affectedMember: "Select",
    testResults: ""
  });

  // Fetch Family History from backend when component loads
  React.useEffect(() => {
    const fetchFamilyHistory = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      if (!patientId) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/family-history/${patientId}`);
        if (!response.ok) return;

        const json = await response.json();
        console.log("Backend family history:", json);

        // ✅ Support both response shapes
        const data = json.data || {};
        const loadedMembers = data.familyMembers || json.familyMembers || [];
        const loadedGenetics = data.geneticConditions || json.geneticConditions || [];

        // ✅ Load saved family members
        if (Array.isArray(loadedMembers) && loadedMembers.length > 0) {
          setFamilyMembers(loadedMembers);
          setHasAddedMembers(true);
        }

        // ✅ Load saved genetic conditions
        if (Array.isArray(loadedGenetics) && loadedGenetics.length > 0) {
          setGeneticConditions(loadedGenetics);
        }

      } catch (error) {
        console.error("Error loading family history:", error);
      }
    };

    fetchFamilyHistory();
  }, []);


  const handleMemberChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    setCurrentMember(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Requirement: Affected Member should auto-fill with Relationship
    if (name === "relationship") {
      setCurrentGeneticCondition(prev => ({
        ...prev,
        affectedMember: finalValue
      }));
    }
  };

  const handleGeneticConditionChange = (e) => {
    const { name, value } = e.target;
    setCurrentGeneticCondition(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMedicalCondition = () => {
    if (currentMember.newCondition.trim()) {
      setCurrentMember(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, prev.newCondition],
        newCondition: ""
      }));
    }
  };

  const addFamilyMember = () => {
    if (currentMember.relationship !== "Select") {
      setFamilyMembers([...familyMembers, currentMember]);
      setHasAddedMembers(true);
      setCurrentMember({
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        gender: "Select",
        relationship: "Select",
        deceased: false,
        medicalConditions: [],
        newCondition: ""
      });
    } else {
      alert("Please select a relationship");
    }
  };

  const removeFamilyMember = (index) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const addGeneticCondition = () => {
    if (
      currentGeneticCondition.conditionName.trim() &&
      currentGeneticCondition.affectedMember !== "Select"
    ) {
      setGeneticConditions([...geneticConditions, currentGeneticCondition]);
      setCurrentGeneticCondition({
        conditionName: "",
        affectedMember: "Select",
        testResults: ""
      });
    }
  };

  const removeGeneticCondition = (index) => {
    setGeneticConditions(geneticConditions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addFamilyMember();
    if (currentGeneticCondition.conditionName) {
      addGeneticCondition();
    }
  };

  // Save to database function
  const saveToDatabase = async () => {
    // ✅ Get patientId from localStorage (same as Ailments.jsx)
    const patientId = localStorage.getItem("currentPatientId");

    if (!patientId) {
      setSaveStatus('Error: No patient selected. Please complete Patient Demographics first.');
      navigate("/dashboard/patient-demographics");
      return false;
    }

    if (familyMembers.length === 0) {
      setSaveStatus('Please add at least one family member before saving');
      return false;
    }

    setIsLoading(true);
    setSaveStatus('Saving...');

    try {
      // ✅ Use patientId from localStorage in the API call
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/family-history/${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyMembers: familyMembers,
          geneticConditions: geneticConditions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save family history');
      }

      setSaveStatus('Family history saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      return true;
    } catch (error) {
      console.error('Error saving family history:', error);
      setSaveStatus(`Error: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save button click
  const handleSave = async () => {
    await saveToDatabase();
  };

  // Handle next button click
  const handleNext = async () => {
    const saved = await saveToDatabase();
    if (saved) {
      navigate('/dashboard/social-history');
    }
  };

  return (
    <div className="family-history-container">
      <header className="fixed-header">
        <h1 className="header-title"></h1>
      </header>
      <h2>Family History</h2>

      {/* Save Status Message */}
      {saveStatus && (
        <div className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
          {saveStatus}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="section">
          <h3>Family Members Details:</h3>
          <div className="form-row">
            <label>Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={currentMember.firstName}
              onChange={handleMemberChange}
            />
            <input
              type="text"
              name="middleName"
              placeholder="Middle Name"
              value={currentMember.middleName}
              onChange={handleMemberChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={currentMember.lastName}
              onChange={handleMemberChange}
            />
          </div>

          <div className="form-row">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              placeholder="DD/MM/YYYY"
              value={currentMember.dob}
              onChange={handleMemberChange}
              max={new Date().toISOString().split('T')[0]}
            />
            <label>Gender</label>
            <select
              name="gender"
              value={currentMember.gender}
              onChange={handleMemberChange}
            >
              <option>Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-row">
            <label>Relationship</label>
            <select
              name="relationship"
              value={currentMember.relationship}
              onChange={handleMemberChange}
            >
              <option>Select</option>
              <option>Father</option>
              <option>Mother</option>
              <option>Brother</option>
              <option>Sister</option>
              <option>Son</option>
              <option>Daughter</option>
              <option>Grandfather</option>
              <option>Grandmother</option>
              <option>Uncle</option>
              <option>Aunt</option>
              <option>Cousin</option>
              <option>Nephew</option>
              <option>Niece</option>
              <option>Spouse</option>
              <option>Other</option>
            </select>

            <label>Deceased</label>
            <input
              type="checkbox"
              name="deceased"
              checked={currentMember.deceased}
              onChange={handleMemberChange}
            />
          </div>

          <div className="form-row">
            <label>Medical Conditions</label>
            <div className="condition-row">
              <input
                type="text"
                placeholder="Write Here"
                value={currentMember.newCondition}
                onChange={(e) => setCurrentMember(prev => ({
                  ...prev,
                  newCondition: e.target.value
                }))}
              />
              <button
                type="button"
                className="add-btn"
                onClick={addMedicalCondition}
              >
                +
              </button>
            </div>
            {currentMember.medicalConditions.length > 0 && (
              <div className="conditions-list">
                {currentMember.medicalConditions.join(", ")}
              </div>
            )}
          </div>
        </div>

        <div className="section">
          <h3>Genetic Conditions:</h3>
          <div className="form-row">
            <label>Condition Name</label>
            <select
              name="conditionName"
              value={currentGeneticCondition.conditionName}
              onChange={handleGeneticConditionChange}
            >
              <option value="">Select Condition</option>
              {currentMember.medicalConditions.map((condition, idx) => (
                <option key={idx} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Affected Family Member (Relationship or Name)</label>
            <select
              name="affectedMember"
              value={currentGeneticCondition.affectedMember}
              onChange={handleGeneticConditionChange}
            >
              <option>Select</option>
              {/* Existing relationships */}
              <optgroup label="Relationship">
                <option>Father</option>
                <option>Mother</option>
                <option>Brother</option>
                <option>Sister</option>
                <option>Son</option>
                <option>Daughter</option>
                <option>Grandfather</option>
                <option>Grandmother</option>
                <option>Uncle</option>
                <option>Aunt</option>
                <option>Cousin</option>
                <option>Nephew</option>
                <option>Niece</option>
                <option>Other</option>
              </optgroup>
              {/* Dynamically added members */}
              {familyMembers.length > 0 && (
                <optgroup label="Specific Members">
                  {familyMembers.map((m, i) => (
                    <option key={i} value={`${m.firstName} ${m.lastName}`.trim() || m.relationship}>
                      {`${m.firstName} ${m.lastName}`.trim() ? `${m.firstName} ${m.lastName} (${m.relationship})` : m.relationship}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div className="form-row">
            <label>Genetic Testing Results</label>
            <select
              name="testResults"
              value={currentGeneticCondition.testResults}
              onChange={handleGeneticConditionChange}
              required
            >
              <option value="">Select</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Pending">Pending</option>
              <option value="Unknown">Unknown</option>
              <option value="Not Tested">Not Tested</option>
            </select>

          </div>
        </div>

        <div className="button-row">
          <button type="button" className="add-btn" onClick={addFamilyMember}>
            Add Member
          </button>
          <button type="button" className="add-btn" onClick={addGeneticCondition} style={{ background: '#2E86AB' }}>
            Add Genetic Condition
          </button>
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="next-btn"
            disabled={isLoading}
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </form>

      {/* Display added family members */}
      {familyMembers.length > 0 && (
        <div className="display-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Family Members:</h3>
          </div>
          <div className="members-grid">
            {familyMembers.map((member, index) => (
              <div key={index} className="member-card">
                <button
                  className="delete-card-btn"
                  onClick={() => removeFamilyMember(index)}
                  title="Remove Member"
                >×</button>
                <p><strong>Name:</strong> {`${member.firstName} ${member.middleName} ${member.lastName}`.trim() || 'N/A'}</p>
                <p><strong>DOB:</strong> {member.dob || 'N/A'}</p>
                <p><strong>Gender:</strong> {member.gender}</p>
                <p><strong>Relation:</strong> {member.relationship}</p>
                <p><strong>Deceased:</strong> {member.deceased ? "Yes" : "No"}</p>
                {member.medicalConditions.length > 0 && (
                  <p><strong>Conditions:</strong> {member.medicalConditions.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display genetic conditions in a table */}
      {geneticConditions.length > 0 && (
        <div className="display-section">
          <h3>Genetic Conditions:</h3>
          <table className="genetic-table">
            <thead>
              <tr>
                <th>Condition Name</th>
                <th>Affected Member</th>
                <th>Test Results</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {geneticConditions.map((condition, index) => (
                <tr key={index}>
                  <td>{condition.conditionName}</td>
                  <td>{condition.affectedMember}</td>
                  <td>{condition.testResults || 'Unknown'}</td>
                  <td>
                    <button
                      className="delete-table-btn"
                      onClick={() => removeGeneticCondition(index)}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FamilyHistory;