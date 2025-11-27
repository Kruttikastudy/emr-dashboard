import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import "./ContactInformation.css";

const ContactInformation = () => {
  const { updatePreviewData } = useOutletContext();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  // Common country codes
  const countryCodes = [
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'IN' },
    { code: '+61', country: 'AU' },
    { code: '+81', country: 'JP' },
    { code: '+86', country: 'CN' },
    { code: '+33', country: 'FR' },
    { code: '+49', country: 'DE' },
    { code: '+39', country: 'IT' },
    { code: '+7', country: 'RU' },
  ];

  const [formData, setFormData] = useState({
    mobilePhone: { code: '+91', number: '' },
    homePhone: { code: '+91', number: '' },
    workPhone: { code: '+91', number: '' },
    email: '',
    preferredContactMethod: [],
    emergencyContacts: [
      {
        firstName: '',
        middleName: '',
        lastName: '',
        relationship: '',
        phone: { code: '+91', number: '' },
        email: ''
      }
    ]
  });

  // Load existing contact data from database
  useEffect(() => {
    const loadExistingData = async () => {
      const patientId = localStorage.getItem("currentPatientId");
      if (!patientId) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact-information/${patientId}`);
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data?.contact_info) {
            const data = json.data.contact_info;
            
            // Normalize preferred contact methods to lowercase
            const normalizedMethods = (data.preferred_contact_methods || []).map(method => {
              const lowerMethod = method.toLowerCase();
              // Map backend values to frontend values
              if (lowerMethod === 'email') return 'email';
              if (lowerMethod === 'phone' || lowerMethod === 'phone call') return 'phone';
              if (lowerMethod === 'messages' || lowerMethod === 'message') return 'messages';
              return lowerMethod;
            });

            // Remove duplicates
            const uniqueMethods = [...new Set(normalizedMethods)];
            
            setFormData({
              mobilePhone: data.mobile || { code: '+91', number: '' },
              homePhone: data.home_phone || { code: '+91', number: '' },
              workPhone: data.work_phone || { code: '+91', number: '' },
              email: data.email || '',
              preferredContactMethod: uniqueMethods,
              emergencyContacts: (data.emergency_contact && data.emergency_contact.length > 0) ? data.emergency_contact.map(contact => ({
                firstName: contact.name?.first || '',
                middleName: contact.name?.middle || '',
                lastName: contact.name?.last || '',
                relationship: contact.relationship || '',
                phone: contact.phone || { code: '+91', number: '' },
                email: contact.email || ''
              })) : [{
                firstName: '',
                middleName: '',
                lastName: '',
                relationship: '',
                phone: { code: '+91', number: '' },
                email: ''
              }]
            });
          }
        }
      } catch (error) {
        console.error("Error loading contact data:", error);
      }
    };

    loadExistingData();
  }, []);

  const handlePhoneChange = (field, type, value) => {
    const updatedData = {
      ...formData,
      [field]: {
        ...formData[field],
        [type]: value
      }
    };
    setFormData(updatedData);
    updatePreviewData(updatedData, 'contact');
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    
    if (index !== null && name.startsWith("emergency")) {
      // Handle emergency contact fields
      const fieldName = name.replace("emergency", "").charAt(0).toLowerCase() + name.replace("emergency", "").slice(1);
      const updatedContacts = [...formData.emergencyContacts];
      updatedContacts[index] = {
        ...updatedContacts[index],
        [fieldName]: value
      };
      
      const updatedData = { ...formData, emergencyContacts: updatedContacts };
      setFormData(updatedData);
      updatePreviewData(updatedData, 'contact');
    } else {
      // Handle regular fields
      const updatedData = { ...formData, [name]: value };
      setFormData(updatedData);
      updatePreviewData(updatedData, 'contact');
    }
  };

  const handleEmergencyPhoneChange = (index, type, value) => {
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      phone: {
        ...updatedContacts[index].phone,
        [type]: value
      }
    };
    
    const updatedData = { ...formData, emergencyContacts: updatedContacts };
    setFormData(updatedData);
    updatePreviewData(updatedData, 'contact');
  };

  const handleContactMethodChange = (method) => {
    // Toggle the method - add if not present, remove if present
    let updatedMethods;
    if (formData.preferredContactMethod.includes(method)) {
      // Remove the method
      updatedMethods = formData.preferredContactMethod.filter(m => m !== method);
    } else {
      // Add the method
      updatedMethods = [...formData.preferredContactMethod, method];
    }
    
    const updatedData = { ...formData, preferredContactMethod: updatedMethods };
    setFormData(updatedData);
    updatePreviewData(updatedData, 'contact');
  };

  const addEmergencyContact = () => {
    const newContact = {
      firstName: '',
      middleName: '',
      lastName: '',
      relationship: '',
      phone: { code: '+91', number: '' },
      email: ''
    };
    
    const updatedData = {
      ...formData, 
      emergencyContacts: [...formData.emergencyContacts, newContact]
    };
    
    setFormData(updatedData);
    updatePreviewData(updatedData, 'contact');
  };

  const removeEmergencyContact = (index) => {
    if (formData.emergencyContacts.length <= 1) return;
    
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts.splice(index, 1);
    
    const updatedData = {
      ...formData, 
      emergencyContacts: updatedContacts
    };
    
    setFormData(updatedData);
    updatePreviewData(updatedData, 'contact');
  };

  const handlePreview = () => {
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

      // Prepare data - phone objects are already in the correct format
      const dataToSend = {
        mobilePhone: formData.mobilePhone,
        homePhone: formData.homePhone,
        workPhone: formData.workPhone,
        email: formData.email,
        preferredContactMethod: formData.preferredContactMethod,
        emergencyContacts: formData.emergencyContacts
      };

      console.log('Sending data:', JSON.stringify(dataToSend, null, 2));

      // Use PUT for updates
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact-information/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Save successful:', result);
        alert("Contact Information updated successfully!");
        setShowPreview(false);
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        alert(errorData.message || "Failed to save Contact Information.");
      }
    } catch (error) {
      console.error("Error saving contact information:", error);
      alert("Error saving contact information: " + error.message);
    }
  };

  const handleNext = () => {
    navigate('/dashboard/insurance-information');
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const formatPhoneNumber = (phone) => {
    if (phone && typeof phone === 'object') {
      return phone.number ? `${phone.code} ${phone.number}` : 'Not provided';
    }
    return phone ? phone : 'Not provided';
  };

  const formatPreferredMethods = (methods) => {
    return methods.length > 0 ? methods.map(m => {
      // Capitalize first letter for display
      return m.charAt(0).toUpperCase() + m.slice(1);
    }).join(', ') : 'None selected';
  };

  return (
    <div className="contact-container">
      <header className="fixed-header">
        <h1 className="header-title"></h1>
      </header>
      <h2 className="contact-title">Contact Information</h2>

      <fieldset className="contact-section">
        <legend className="section-title">Contact Details</legend>
        <div className="contact-details">
          <div className="contact-info-left">
            <div className="contact-row">
              <label className="contact-label">Mobile/Cell Phone</label>
              <div className="phone-input">
                <select 
                  className="phone-code-select"
                  value={formData.mobilePhone.code}
                  onChange={(e) => handlePhoneChange('mobilePhone', 'code', e.target.value)}
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} ({item.country})
                    </option>
                  ))}
                </select>
                <input 
                  className="phone-number"
                  type="text" 
                  name="mobilePhone" 
                  value={formData.mobilePhone.number} 
                  onChange={(e) => handlePhoneChange('mobilePhone', 'number', e.target.value)}
                  placeholder="3447166844"
                />
              </div>
            </div>
            
            <div className="contact-row">
              <label className="contact-label">Home Phone No.</label>
              <div className="phone-input">
                <select 
                  className="phone-code-select"
                  value={formData.homePhone.code}
                  onChange={(e) => handlePhoneChange('homePhone', 'code', e.target.value)}
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} ({item.country})
                    </option>
                  ))}
                </select>
                <input 
                  className="phone-number"
                  type="text" 
                  name="homePhone" 
                  value={formData.homePhone.number} 
                  onChange={(e) => handlePhoneChange('homePhone', 'number', e.target.value)}
                  placeholder="9789609691"
                />
              </div>
            </div>
            
            <div className="contact-row">
              <label className="contact-label">Work Phone No.</label>
              <div className="phone-input">
                <select 
                  className="phone-code-select"
                  value={formData.workPhone.code}
                  onChange={(e) => handlePhoneChange('workPhone', 'code', e.target.value)}
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} ({item.country})
                    </option>
                  ))}
                </select>
                <input 
                  className="phone-number"
                  type="text" 
                  name="workPhone" 
                  value={formData.workPhone.number} 
                  onChange={(e) => handlePhoneChange('workPhone', 'number', e.target.value)}
                  placeholder="4017825419"
                />
              </div>
            </div>
            
            <div className="contact-row">
              <label className="contact-label">E-mail Address</label>
              <input 
                className="email-input"
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="abc.emr@gmail.com"
              />
            </div>
          </div>
          
          <div className="contact-info-right">
            <div className="preferred-contact-section">
              <h4 className="preferred-title">Preferred Contact Method</h4>
              <div className="contact-methods">
                <div className="contact-method-item" onClick={() => handleContactMethodChange('phone')}>
                  <div className={`contact-method-checkbox ${formData.preferredContactMethod.includes('phone') ? 'checked' : ''}`}></div>
                  <label className="contact-method-label">Phone Call</label>
                </div>
                <div className="contact-method-item" onClick={() => handleContactMethodChange('messages')}>
                  <div className={`contact-method-checkbox ${formData.preferredContactMethod.includes('messages') ? 'checked' : ''}`}></div>
                  <label className="contact-method-label">Messages</label>
                </div>
                <div className="contact-method-item" onClick={() => handleContactMethodChange('email')}>
                  <div className={`contact-method-checkbox ${formData.preferredContactMethod.includes('email') ? 'checked' : ''}`}></div>
                  <label className="contact-method-label">Email</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="contact-section">
        <legend className="section-title">Emergency Contact Information</legend>
        
        {formData.emergencyContacts.map((contact, index) => (
          <div key={index} className="emergency-contact-group">
            {index > 0 && (
              <button 
                type="button" 
                className="remove-contact-btn"
                onClick={() => removeEmergencyContact(index)}
                aria-label="Remove contact"
              >
                ×
              </button>
            )}
            
            <div className="form-row">
              <div className="input-group">
                <label htmlFor={`emergencyFirstName-${index}`}>First Name</label>
                <input 
                  id={`emergencyFirstName-${index}`}
                  type="text" 
                  name="emergencyFirstName" 
                  value={contact.firstName} 
                  onChange={(e) => handleChange(e, index)} 
                />
              </div>
              
              <div className="input-group">
                <label htmlFor={`emergencyMiddleName-${index}`}>Middle Name</label>
                <input 
                  id={`emergencyMiddleName-${index}`}
                  type="text" 
                  name="emergencyMiddleName" 
                  value={contact.middleName} 
                  onChange={(e) => handleChange(e, index)} 
                />
              </div>
              
              <div className="input-group">
                <label htmlFor={`emergencyLastName-${index}`}>Last Name</label>
                <input 
                  id={`emergencyLastName-${index}`}
                  type="text" 
                  name="emergencyLastName" 
                  value={contact.lastName} 
                  onChange={(e) => handleChange(e, index)} 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="input-group">
                <label htmlFor={`emergencyRelationship-${index}`}>Relationship to Patient</label>
                <input 
                  id={`emergencyRelationship-${index}`}
                  type="text" 
                  name="emergencyRelationship" 
                  value={contact.relationship} 
                  onChange={(e) => handleChange(e, index)} 
                />
              </div>
              <div className="input-group phone-group">
                <label htmlFor={`emergencyPhone-${index}`}>Emergency Contact No.</label>
                <div className="phone-input">
                  <select 
                    className="phone-code-select"
                    value={contact.phone.code}
                    onChange={(e) => handleEmergencyPhoneChange(index, 'code', e.target.value)}
                  >
                    {countryCodes.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} ({item.country})
                      </option>
                    ))}
                  </select>
                  <input 
                    id={`emergencyPhone-${index}`}
                    type="tel"
                    name="emergencyPhone"
                    value={contact.phone.number}
                    onChange={(e) => handleEmergencyPhoneChange(index, 'number', e.target.value)}
                    placeholder="Enter number"
                    className="phone-number"
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor={`emergencyEmail-${index}`}>Emergency Email Address</label>
                <input 
                  id={`emergencyEmail-${index}`}
                  type="email" 
                  name="emergencyEmail" 
                  value={contact.email} 
                  onChange={(e) => handleChange(e, index)} 
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="add-contact-container">
          <button type="button" className="add-contact-btn" onClick={addEmergencyContact}>
            + Add Another Emergency Contact
          </button>
        </div>
      </fieldset>

      <div className="form-actions">
        <button className="preview-btn" onClick={handlePreview}>Preview</button>
        <button className="next-btn" onClick={handleNext}>Next</button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Contact Information Preview</h3>
              <button className="close-btn" onClick={closePreview}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="preview-section">
                <h4>Contact Details</h4>
                <div className="preview-grid">
                  <div className="preview-item">
                    <strong>Mobile Phone:</strong> {formatPhoneNumber(formData.mobilePhone)}
                  </div>
                  <div className="preview-item">
                    <strong>Home Phone:</strong> {formatPhoneNumber(formData.homePhone)}
                  </div>
                  <div className="preview-item">
                    <strong>Work Phone:</strong> {formatPhoneNumber(formData.workPhone)}
                  </div>
                  <div className="preview-item">
                    <strong>Email:</strong> {formData.email || 'Not provided'}
                  </div>
                  <div className="preview-item">
                    <strong>Preferred Contact:</strong> {formatPreferredMethods(formData.preferredContactMethod)}
                  </div>
                </div>
              </div>

              <div className="preview-section">
                <h4>Emergency Contacts</h4>
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="emergency-preview-item">
                    <h5>Contact {index + 1}</h5>
                    <div className="preview-grid">
                      <div className="preview-item">
                        <strong>Name:</strong> {`${contact.firstName} ${contact.middleName} ${contact.lastName}`.trim() || 'Not provided'}
                      </div>
                      <div className="preview-item">
                        <strong>Relationship:</strong> {contact.relationship || 'Not provided'}
                      </div>
                      <div className="preview-item">
                        <strong>Phone:</strong> {formatPhoneNumber(contact.phone)}
                      </div>
                      <div className="preview-item">
                        <strong>Email:</strong> {contact.email || 'Not provided'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={closePreview}>Cancel</button>
              <button className="modal-save-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInformation;