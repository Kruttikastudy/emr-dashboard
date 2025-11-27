import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import "./PatientDemographics.css";

const PatientDemographics = () => {
  const { updatePreviewData } = useOutletContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    district: "",
    state: "",
    country: "",
    bloodGroup: "",
    occupation: "",
    aadharNumber: "",
    panNumber: "",
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoadingPostal, setIsLoadingPostal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [patientId, setPatientId] = useState(null); // Added state for patient ID

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Load existing patient data from database
  useEffect(() => {
    const loadExistingData = async () => {
      const storedPatientId = localStorage.getItem("currentPatientId");
      if (!storedPatientId) return;

      setPatientId(storedPatientId); // Store patient ID in state

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/patient-demographics/${storedPatientId}`);
        if (!response.ok) return;

        const json = await response.json();
        console.log("Loaded patient data:", json);
        
        if (!json.success || !json.data) return;

        const data = json.data;
        
        setFormData({
          firstName: data.name?.first || "",
          middleName: data.name?.middle || "",
          lastName: data.name?.last || "",
          dob: data.date_of_birth ? convertDateFormatForInput(data.date_of_birth) : "",
          gender: data.gender || "",
          address1: data.address?.street || "",
          address2: data.address?.street2 || "",
          city: data.address?.city || "",
          postalCode: data.address?.postal_code || "",
          district: data.address?.district || "",
          state: data.address?.state || "",
          country: data.address?.country || "",
          bloodGroup: data.blood_group || "",
          occupation: data.occupation || "",
          aadharNumber: data.aadhaar || "",
          panNumber: data.pan || "",
          photo: null,
        });

        // Load image from backend - CORRECTED FOR GRIDFS
        console.log("Image data from backend:", data.img);
        
        if (data.img && data.img.file_id) {
          // Backend stores file_id in GridFS
          const imageUrl = `${import.meta.env.VITE_BACKEND_URL}/api/patient-demographics/file/${data.img.file_id}`;
          console.log("Loading image from GridFS:", imageUrl);
          
          // Test if the image loads
          const img = new Image();
          img.onload = () => {
            console.log("✓ Image loaded successfully from GridFS!");
            setImagePreview(imageUrl);
          };
          img.onerror = (error) => {
            console.error("✗ Failed to load image from GridFS:", error);
            console.error("URL attempted:", imageUrl);
          };
          img.src = imageUrl;
        } else {
          console.log("No image data found in patient record");
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
      }
    };

    loadExistingData();
  }, []);

  // Helper function to convert MM-DD-YYYY to YYYY-MM-DD for input
  const convertDateFormatForInput = (dateStr) => {
    if (!dateStr) return "";
    const [month, day, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };

  const fetchLocationData = async (postalCode) => {
    if (!postalCode || postalCode.length < 5) return;

    setIsLoadingPostal(true);
    try {
      // Indian PIN code API
      const fallbackResponse = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData[0].Status === "Success" && fallbackData[0].PostOffice && fallbackData[0].PostOffice.length) {
          const postOffice = fallbackData[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.Name || postOffice.Block || '',
            district: postOffice.District || '',
            state: postOffice.State || '',
            country: postOffice.Country || 'India'
          }));
          setIsLoadingPostal(false);
          return;
        }
      }
    } catch (error) {
      console.error('Primary API failed:', error);
    }

    try {
      // Fallback Zippopotam
      const response = await fetch(`https://api.zippopotam.us/IN/${postalCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          setFormData(prev => ({
            ...prev,
            city: place['place name'] || '',
            district: place['state abbreviation'] || place['state'] || '',
            state: place['state'] || '',
            country: data.country || 'India'
          }));
        }
      } else {
        console.log('Postal code not found in both APIs');
      }
    } catch (error) {
      console.error('Both APIs failed:', error);
    } finally {
      setIsLoadingPostal(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.dob.trim()) newErrors.dob = "Date of birth is required";
    if (!formData.gender.trim()) newErrors.gender = "Gender is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    navigate('/dashboard/contact-information');
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill location data when postal code is entered
    if (name === 'postalCode' && value.length >= 6) {
      fetchLocationData(value);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const currentPatientId = localStorage.getItem('currentPatientId');
      const formDataToSend = new FormData();
      
      console.log("=== FRONTEND SAVE ===");
      console.log("Photo file:", formData.photo);
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'photo' && formData[key]) {
          console.log("✓ Appending photo to FormData:", formData[key].name, formData[key].size, "bytes");
          formDataToSend.append('photo', formData[key]);
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Log what's in FormData
      console.log("FormData contents:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

      // Use PUT for updates, POST for new patients
      const method = currentPatientId ? 'PUT' : 'POST';
      const url = currentPatientId
        ? `${import.meta.env.VITE_BACKEND_URL}/api/patient-demographics/${currentPatientId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/patient-demographics`;

      console.log("Sending request:", method, url);

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      const result = await response.json();
      console.log("Response:", result);

      if (response.ok) {
        if (!currentPatientId) {
          localStorage.setItem('currentPatientId', result.data.id);
          setPatientId(result.data.id); // Update state with new patient ID
        }

        alert(currentPatientId ? "Patient demographics updated successfully!" : "Patient demographics saved successfully!");
        updatePreviewData(formData, "patient");
        setShowPreview(false);
        
        // Reload the page to fetch updated data including image
        window.location.reload();
      } else {
        alert(result.message || "Failed to save patient demographics");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data.");
    }
  };

  // Upload handlers
  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old preview if blob
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setFormData(prev => ({ ...prev, photo: file }));
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData(prev => ({ ...prev, photo: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Format data for preview display
  const formatPreviewData = () => {
    return {
      ...(patientId && {
        "Patient Identification": {
          "Patient ID": patientId
        }
      }),
      "Personal Information": {
        "Name": `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
        "Date of Birth": formData.dob,
        "Gender": formData.gender,
      },
      "Address Information": {
        "Address Line 1": formData.address1,
        "Address Line 2": formData.address2,
        "Postal Code": formData.postalCode,
        "District": formData.city,
        "City": formData.district,
        "State": formData.state,
        "Country": formData.country,
      },
      "Other Details": {
        "Blood Group": formData.bloodGroup,
        "Occupation": formData.occupation,
        "Aadhar Number": formData.aadharNumber,
        "PAN Number": formData.panNumber,
      }
    };
  };

  return (
    <div>
      {/* Fixed Header */}
      <header className="fixed-header">
        <h1 className="header-title"></h1>
      </header>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Patient Demographics Preview</h2>
              <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
            </div>
            
            <div className="preview-content">
              {/* Patient Photo */}
              {imagePreview && (
                <div className="preview-photo-section">
                  <img src={imagePreview} alt="Patient" className="preview-photo" />
                </div>
              )}

              {/* Data Sections */}
              {Object.entries(formatPreviewData()).map(([sectionName, sectionData]) => (
                <div key={sectionName} className="preview-section">
                  <h3 className="preview-section-title">{sectionName}</h3>
                  <div className="preview-section-content">
                    {Object.entries(sectionData).map(([key, value]) => (
                      value && (
                        <div key={key} className="preview-field">
                          <span className="preview-field-label">{key}:</span>
                          <span className="preview-field-value">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="preview-actions">
              <button className="preview-cancel-btn" onClick={() => setShowPreview(false)}>
                Cancel
              </button>
              <button className="preview-save-btn" onClick={handleSave}>
                Save Patient Demographics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="patient-demographics-container">
        {/* Avatar / uploader positioned top-right */}
        <div className="avatar-uploader" aria-hidden={false}>
          <div className="avatar-preview" onClick={handleUploadClick} role="button" tabIndex={0}>
            {imagePreview ? (
              <img src={imagePreview} alt="Patient preview" />
            ) : (
              <svg viewBox="0 0 100 100" className="avatar-placeholder" aria-hidden>
                <circle cx="50" cy="30" r="18" fill="#333" />
                <path d="M20 80 Q20 60 35 60 L65 60 Q80 60 80 80 Z" fill="#333" />
              </svg>
            )}
          </div>

          <div className="avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button type="button" className="upload-btn" onClick={handleUploadClick}>
              Upload
            </button>
            {imagePreview && (
              <button type="button" className="upload-btn" onClick={handleRemoveImage}>
                Remove
              </button>
            )}
          </div>
        </div>

        <h2 className="patient-header">Patient Demographics</h2>

        {/* Display Patient ID in form header if it exists */}
        {patientId && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px', 
            fontSize: '14px', 
            color: '#666',
            fontWeight: '500'
          }}>
            Patient ID: <strong>{patientId}</strong>
          </div>
        )}

        <form>
          {/* --- Personal Information --- */}
          <fieldset className="section">
            <legend>Personal Information</legend>
            <div className="section-inner">
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="middleName">Middle Name</label>
                  <input
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    id="dob"
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                  {errors.dob && <span className="error-message">{errors.dob}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
                </div>
              </div>
            </div>
          </fieldset>

          {/* --- Contact Information --- */}
          <fieldset className="section">
            <legend>Address Information</legend>
            <div className="section-inner">
              <div className="form-row">
                <div className="input-group full-width">
                  <label htmlFor="address1">Address Line 1</label>
                  <input
                    id="address1"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group full-width">
                  <label htmlFor="address2">Address Line 2</label>
                  <input
                    id="address2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Enter 6-digit PIN code"
                  />
                  {isLoadingPostal && <span className="loading-indicator">Loading location...</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="city">District</label>
                  <input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="district">City</label>
                  <input
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* --- Other Details --- */}
          <fieldset className="section">
            <legend>Other Details</legend>
            <div className="section-inner">
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A Positive (A⁺)</option>
                    <option value="A-">A Negative (A⁻)</option>
                    <option value="B+">B Positive (B⁺)</option>
                    <option value="B-">B Negative (B⁻)</option>
                    <option value="AB+">AB Positive (AB⁺)</option>
                    <option value="AB-">AB Negative (AB⁻)</option>
                    <option value="O+">O Positive (O⁺)</option>
                    <option value="O-">O Negative (O⁻)</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="occupation">Occupation</label>
                  <select
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                  >
                    <option value="">Select Occupation</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Employed">Employed</option>
                    <option value="Student">Student</option>
                    <option value="Business">Business</option>
                    <option value="Services">Services</option>
                    <option value="Retired">Retired</option>
                    <option value="Government /civil service">Government / Civil Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="aadharNumber">Aadhar Number</label>
                  <input
                    id="aadharNumber"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="panNumber">PAN Number</label>
                  <input
                    id="panNumber"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <div className="form-actions-center">
            <button type="button" className="preview-btn" onClick={handlePreview}>
              Preview
            </button>
            <button type="button" className="next-btn" onClick={handleNext}>
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientDemographics;