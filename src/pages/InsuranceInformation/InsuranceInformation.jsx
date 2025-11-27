import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./InsuranceInformation.css";

const InsuranceInformation = () => {
  const navigate = useNavigate();
  const { insuranceData: contextInsuranceData, updatePreviewData } =
    useOutletContext();

  const [insuranceData, setInsuranceData] = useState({
    primaryCompanyName: "",
    primaryPolicyNumber: "",
    primaryGroupNumber: "",
    primaryPlanType: "",
    primaryStartDate: "",
    primaryEndDate: "",
    secondaryCompanyName: "",
    secondaryPolicyNumber: "",
    secondaryGroupNumber: "",
    secondaryPlanType: "",
    secondaryStartDate: "",
    secondaryEndDate: "",
    contactNumber: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Load existing insurance data from database
useEffect(() => {
  const loadInsurance = async () => {
    const patientId = localStorage.getItem("currentPatientId");
    if (!patientId) {
      console.warn("No patientId found in localStorage");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/insurance/${patientId}`);
      const result = await response.json();

      console.log("🔹 Raw backend response:", result);

      if (!response.ok) {
        console.warn("⚠️ Bad response:", response.status);
        return;
      }

      // Support both backend response formats
      const data = result.data?.insurance || result.insurance;

      if (!data) {
        console.warn("⚠️ No insurance data found for patient:", patientId);
        return;
      }

      console.log("✅ Extracted insurance data:", data);

      // Convert backend date (MM-DD-YYYY) to YYYY-MM-DD for input fields
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [mm, dd, yyyy] = dateStr.split("-");
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      };

      const newData = {
        primaryCompanyName: data.primary?.company_name || "",
        primaryPolicyNumber: data.primary?.policy_number || "",
        primaryGroupNumber: data.primary?.group_number || "",
        primaryPlanType: data.primary?.plan_type || "",
        primaryStartDate: formatDate(data.primary?.effective_start),
        primaryEndDate: formatDate(data.primary?.effective_end),
        secondaryCompanyName: data.secondary?.company_name || "",
        secondaryPolicyNumber: data.secondary?.policy_number || "",
        secondaryGroupNumber: data.secondary?.group_number || "",
        secondaryPlanType: data.secondary?.plan_type || "",
        secondaryStartDate: formatDate(data.secondary?.effective_start),
        secondaryEndDate: formatDate(data.secondary?.effective_end),
        contactNumber: data.insurance_contact_number || "",
      };

      console.log("✅ Mapped frontend data:", newData);

      // Set data to state
      setInsuranceData(newData);

      // Show in preview if you have one
      if (typeof updatePreviewData === "function") {
        updatePreviewData(newData, "insurance");
      }

      // Show uploaded files if any
      if (Array.isArray(data.uploaded_files) && data.uploaded_files.length > 0) {
        const existingFiles = data.uploaded_files.map((f) => ({ name: f, existing: true }));
        setSelectedFiles(existingFiles);

        const uploadInput = document.querySelector(".upload-input");
        if (uploadInput) uploadInput.value = data.uploaded_files.join(", ");
      }
    } catch (error) {
      console.error("❌ Error loading insurance data:", error);
    }
  };

  loadInsurance();
}, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setInsuranceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e, dateType) => {
    setInsuranceData((prev) => ({
      ...prev,
      [dateType]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // real File objects
    const fileObjs = files.map(f => f); // keep as File objects — they have .name
    setSelectedFiles(fileObjs);
    const fileNames = files.map(file => file.name).join(', ');
    const displayInput = document.querySelector('.upload-input');
    if (displayInput) {
      displayInput.value = fileNames;
    }
  };

  const handlePreview = () => {
    updatePreviewData(insuranceData, "insurance");
    setShowPreview(true);
  };

  const handleSave = async () => {
    try {
      const patientId = localStorage.getItem('currentPatientId');

      if (!patientId) {
        alert("Please complete Patient Demographics first");
        navigate('/dashboard/patient-demographics');
        return;
      }

      // Save insurance data first
      updatePreviewData(insuranceData, "insurance");

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/insurance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          ...insuranceData
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        console.log("Saved Insurance Data:", data);

        // Upload files if any are selected
        if (selectedFiles.length > 0) {
          await handleFileUpload(patientId);
        }

        alert("Insurance Information saved successfully!");
        setShowPreview(false);
      } else {
        alert("Failed to save Insurance Information: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving insurance info:", error);
      alert("An error occurred while saving insurance info.");
    }
  };
  const handleFileUpload = async () => {
    const patientId = localStorage.getItem("currentPatientId");

    if (!patientId) {
      setUploadStatus("Patient ID not found.");
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadStatus("No files selected for upload.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      // Only upload real File objects, skip existing placeholders
      if (!file.existing) formData.append("insuranceFiles", file);
    });

    try {
      const uploadRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/insurance/upload/${patientId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();

      if (uploadRes.ok && uploadData.success) {
        setUploadStatus("Files uploaded successfully!");
        console.log("Uploaded files:", uploadData);

        // ✅ Backend must return uploaded filenames → update UI state
        const uploadedNames = uploadData.files || uploadData.uploaded_files || [];

        const unified = [
          ...uploadedNames.map(n => ({ name: n, existing: true }))
        ];

        setSelectedFiles(unified);

        // ✅ Update readonly input with new filenames
        const displayInput = document.querySelector('.upload-input');
        if (displayInput) {
          displayInput.value = unified.map(f => f.name).join(", ");
        }

      } else {
        setUploadStatus("File upload failed.");
      }

    } catch (err) {
      console.error("Error uploading files:", err);
      setUploadStatus("Error uploading files.");
    }
  };


  const handleNext = () => {
    updatePreviewData(insuranceData, "insurance");
    navigate("/dashboard/allergies");
  };

  const handleBrowseClick = () => {
    document.getElementById("insuranceCard").click();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const PreviewModal = () => (
    <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h2>Insurance Information Preview</h2>
          <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
        </div>
        
        <div className="preview-content">
          <div className="preview-section">
            <h3>Primary Insurance</h3>
            <div className="preview-row">
              <span className="preview-label">Company Name:</span>
              <span className="preview-value">{insuranceData.primaryCompanyName || "Not provided"}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Policy Number:</span>
              <span className="preview-value">{insuranceData.primaryPolicyNumber || "Not provided"}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Group Number:</span>
              <span className="preview-value">{insuranceData.primaryGroupNumber || "Not provided"}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Plan Type:</span>
              <span className="preview-value">{insuranceData.primaryPlanType || "Not provided"}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Start Date:</span>
              <span className="preview-value">{formatDate(insuranceData.primaryStartDate)}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">End Date:</span>
              <span className="preview-value">{formatDate(insuranceData.primaryEndDate)}</span>
            </div>
          </div>

          {(insuranceData.secondaryCompanyName || insuranceData.secondaryPolicyNumber || insuranceData.secondaryGroupNumber) && (
            <div className="preview-section">
              <h3>Secondary Insurance</h3>
              <div className="preview-row">
                <span className="preview-label">Company Name:</span>
                <span className="preview-value">{insuranceData.secondaryCompanyName || "Not provided"}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Policy Number:</span>
                <span className="preview-value">{insuranceData.secondaryPolicyNumber || "Not provided"}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Group Number:</span>
                <span className="preview-value">{insuranceData.secondaryGroupNumber || "Not provided"}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Plan Type:</span>
                <span className="preview-value">{insuranceData.secondaryPlanType || "Not provided"}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Start Date:</span>
                <span className="preview-value">{formatDate(insuranceData.secondaryStartDate)}</span>
              </div>
              <div className="preview-row">
                <span className="preview-label">End Date:</span>
                <span className="preview-value">{formatDate(insuranceData.secondaryEndDate)}</span>
              </div>
            </div>
          )}

          <div className="preview-section">
            <h3>Contact Information</h3>
            <div className="preview-row">
              <span className="preview-label">Contact Number:</span>
              <span className="preview-value">{insuranceData.contactNumber || "Not provided"}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Insurance Card Files:</span>
              <span className="preview-value">
                {selectedFiles.length > 0 
                  ? selectedFiles.map(file => file.name).join(', ')
                  : "No files selected"
                }
              </span>
            </div>
          </div>
        </div>

        <div className="preview-actions">
          <button className="preview-cancel-btn" onClick={() => setShowPreview(false)}>
            Edit
          </button>
          <button className="preview-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="insurance-container">
      <header className="fixed-header">
        <h1 className="header-title"></h1>
      </header>

      <h2 className="insurance-title">Insurance Information</h2>

      {/* Primary Insurance */}
      <fieldset className="insurance-section">
        <legend className="section-title">Primary Insurance:</legend>

        <div className="form-row">
          <div className="input-group full-width">
            <label htmlFor="primaryCompanyName">Insurance Company Name</label>
            <input
              id="primaryCompanyName"
              type="text"
              name="primaryCompanyName"
              value={insuranceData.primaryCompanyName}
              onChange={handleChange}
              placeholder="Allstate"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="primaryPolicyNumber">Policy Number</label>
            <input
              id="primaryPolicyNumber"
              type="text"
              name="primaryPolicyNumber"
              value={insuranceData.primaryPolicyNumber}
              onChange={handleChange}
              placeholder="9999999"
            />
          </div>

          <div className="input-group">
            <label htmlFor="primaryGroupNumber">Group Number</label>
            <input
              id="primaryGroupNumber"
              type="text"
              name="primaryGroupNumber"
              value={insuranceData.primaryGroupNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="primaryPlanType">Plan Type</label>
            <select
              id="primaryPlanType"
              name="primaryPlanType"
              value={insuranceData.primaryPlanType}
              onChange={handleChange}
            >
              <option value="">Select Plan Type</option>
              <option value="Health Maintenance Organization (HMO)">Health Maintenance Organization (HMO)</option>
              <option value="Preferred Provider Organization (PPO)">Preferred Provider Organization (PPO)</option>
              <option value="Point of Service (POS)">Point of Service (POS)</option>
              <option value="Exclusive Provider Organization (EPO)">Exclusive Provider Organization (EPO)</option>
              <option value="Medicare">Medicare</option>
              <option value="Medicaid">Medicaid</option>
              <option value="Private Insurance">Private Insurance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group date-group">
            <label>Insurance Effective Dates</label>
            <div className="date-container">
              <div className="date-input-group">
                <label htmlFor="primaryStartDate">Start Date</label>
                <input
                  id="primaryStartDate"
                  type="date"
                  onChange={(e) => handleDateChange(e, "primaryStartDate")}
                  value={insuranceData.primaryStartDate}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="primaryEndDate">Expiry Date</label>
                <input
                  id="primaryEndDate"
                  type="date"
                  onChange={(e) => handleDateChange(e, "primaryEndDate")}
                  value={insuranceData.primaryEndDate}
                  className="date-input"
                />
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Secondary Insurance */}
      <fieldset className="insurance-section">
        <legend className="section-title">
          Secondary Insurance: If Applicable
        </legend>

        <div className="form-row">
          <div className="input-group full-width">
            <label htmlFor="secondaryCompanyName">Insurance Company Name</label>
            <input
              id="secondaryCompanyName"
              type="text"
              name="secondaryCompanyName"
              value={insuranceData.secondaryCompanyName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="secondaryPolicyNumber">Policy Number</label>
            <input
              id="secondaryPolicyNumber"
              type="text"
              name="secondaryPolicyNumber"
              value={insuranceData.secondaryPolicyNumber}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="secondaryGroupNumber">Group Number</label>
            <input
              id="secondaryGroupNumber"
              type="text"
              name="secondaryGroupNumber"
              value={insuranceData.secondaryGroupNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="secondaryPlanType">Plan Type</label>
            <select
              id="secondaryPlanType"
              name="secondaryPlanType"
              value={insuranceData.secondaryPlanType}
              onChange={handleChange}
            >
              <option value="">Select Plan Type</option>
              <option value="Health Maintenance Organization (HMO)">Health Maintenance Organization (HMO)</option>
              <option value="Preferred Provider Organization (PPO)">Preferred Provider Organization (PPO)</option>
              <option value="Point of Service (POS)">Point of Service (POS)</option>
              <option value="Exclusive Provider Organization (EPO)">Exclusive Provider Organization (EPO)</option>
              <option value="Medicare">Medicare</option>
              <option value="Medicaid">Medicaid</option>
              <option value="Private Insurance">Private Insurance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group date-group">
            <label>Insurance Effective Dates</label>
            <div className="date-container">
              <div className="date-input-group">
                <label htmlFor="secondaryStartDate">Start Date</label>
                <input
                  id="secondaryStartDate"
                  type="date"
                  onChange={(e) => handleDateChange(e, "secondaryStartDate")}
                  value={insuranceData.secondaryStartDate}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="secondaryEndDate">Expiry Date</label>
                <input
                  id="secondaryEndDate"
                  type="date"
                  onChange={(e) => handleDateChange(e, "secondaryEndDate")}
                  value={insuranceData.secondaryEndDate}
                  className="date-input"
                />
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Contact Info */}
      <fieldset className="insurance-section">
        <legend className="section-title">
          Insurance Contact Information:
        </legend>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <div className="phone-input">
              <input
                id="contactNumber"
                type="tel"
                name="contactNumber"
                value={insuranceData.contactNumber}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group full-width">
            <label htmlFor="insuranceCard">Insurance Card Images</label>
            <div className="upload-row">
              <input
                className="upload-input"
                type="text"
                readOnly
                placeholder="Upload Card Image"
              />
              <button
                className="upload-btn"
                type="button"
                onClick={handleBrowseClick}
              >
                Browse
              </button>
            </div>
            <input
              id="insuranceCard"
              type="file"
              style={{ display: "none" }}
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {uploadStatus && (
              <div className="upload-status">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* Buttons */}
      <div className="form-actions">
        <button className="preview-btn" onClick={handlePreview}>
          Preview
        </button>
        <button className="next-btn" onClick={handleNext}>
          Next
        </button>
      </div>
      {showPreview && <PreviewModal />}
    </div>
  );
};

export default InsuranceInformation;