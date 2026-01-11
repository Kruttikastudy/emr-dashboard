import React, { useState, useEffect } from 'react';
import './NewAppointment.css';
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from 'axios';
import logo from "../../assets/logo.jpg";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const NewAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    contactInfo: '',
    date: '',
    time: '',
    appointmentType: 'Follow-up',
    reason: 'Regular',
    urgencyDropdown: 'No',
    doctor: 'Dr. Ram Shah',
    comments: ''
  });

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle incoming data from navigation (either patientData or appointmentData)
  useEffect(() => {
    // Check if we have appointment data from dashboard (for editing)
    if (location.state?.appointmentData && location.state?.isEditing) {
      const appointment = location.state.appointmentData;
      loadAppointmentData(appointment);
    }
    // Check if we have patient data from PatientDetail (for new appointment)
    else if (location.state?.patientData) {
      const { patientData } = location.state;
      setFormData(prevData => ({
        ...prevData,
        patientId: patientData.patientId || '',
        firstName: patientData.firstName || '',
        middleName: patientData.middleName || '',
        lastName: patientData.lastName || '',
        age: patientData.age || '',
        contactInfo: patientData.contactInfo || ''
      }));
    }
  }, [location.state]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      if (response.data.success) {
        setAppointments(response.data.data || response.data);
      } else if (Array.isArray(response.data)) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  // Load appointment data into form
  const loadAppointmentData = (appointment) => {
    setCurrentAppointmentId(appointment._id);

    // Load appointment data into form
    setFormData({
      patientId: appointment.patient_id || '',
      firstName: appointment.patient_name?.first || '',
      middleName: appointment.patient_name?.middle || '',
      lastName: appointment.patient_name?.last || '',
      age: appointment.age || '',
      contactInfo: appointment.contact_information || '',
      date: formatDateForInput(appointment.appointment_date),
      time: formatTimeForInput(appointment.appointment_time),
      appointmentType: appointment.appointment_type || 'Follow-up',
      reason: appointment.reason_for_appointment || 'Regular',
      urgencyDropdown: appointment.urgency || 'No',
      doctor: appointment.doctor || 'Dr. Ram Shah',
      comments: appointment.comments || ''
    });
  };

  // Format date from MM-DD-YYYY to YYYY-MM-DD for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const [month, day, year] = dateString.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Format time from "HH:MM AM/PM" to "HH:MM" (24-hour format) for input field
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    try {
      const [time, period] = timeString.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } catch (e) {
      return '';
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePatientIdBlur = async () => {
    if (!formData.patientId) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/patient-demographics/${formData.patientId}`);
      if (response.data.success && response.data.data) {
        const patient = response.data.data;

        // Also fetch contact info to be helpful
        let contactInfo = '';
        try {
          const contactRes = await axios.get(`/api/contact-information/${formData.patientId}`);
          if (contactRes.data.success && contactRes.data.data?.contact_info?.mobile?.number) {
            contactInfo = contactRes.data.data.contact_info.mobile.number;
          }
        } catch (e) {
          console.log('Could not fetch contact info');
        }

        setFormData(prev => ({
          ...prev,
          firstName: patient.name?.first || '',
          middleName: patient.name?.middle || '',
          lastName: patient.name?.last || '',
          age: calculateAge(patient.date_of_birth),
          contactInfo: contactInfo || prev.contactInfo
        }));
      }
    } catch (error) {
      console.error("Patient not found", error);
      // We don't clear fields here to allow manual entry if ID is not found/invalid
    } finally {
      setLoading(false);
    }
  };

  const handleNewAppointment = () => {
    setCurrentAppointmentId(null);
    setFormData({
      patientId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      age: '',
      contactInfo: '',
      date: '',
      time: '',
      appointmentType: 'Follow-up',
      reason: 'Regular',
      urgencyDropdown: 'No',
      doctor: 'Dr. Ram Shah',
      comments: ''
    });
  };

  const handleDone = async () => {
    // Validate required fields
    if (!formData.patientId || !formData.firstName || !formData.lastName || !formData.age ||
      !formData.contactInfo || !formData.date || !formData.time) {
      alert('Please fill in all required fields: Patient ID, First Name, Last Name, Age, Contact Information, Date, and Time');
      return;
    }

    // Validate contact info format (7-10 digits)
    if (!/^\d{7,10}$/.test(formData.contactInfo)) {
      alert('Contact information must be 7-10 digits');
      return;
    }

    // Validate age
    if (formData.age <= 0) {
      alert('Please enter a valid age');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        patient_id: formData.patientId,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        age: formData.age,
        contactInfo: formData.contactInfo,
        date: formData.date,
        time: formData.time,
        appointmentType: formData.appointmentType,
        reason: formData.reason,
        urgencyDropdown: formData.urgencyDropdown,
        doctor: formData.doctor,
        comments: formData.comments
      };

      let response;
      if (currentAppointmentId) {
        // Update existing appointment
        response = await axios.put(`/api/appointments/${currentAppointmentId}`, appointmentData);
        alert('Appointment updated successfully!');
      } else {
        // Create new appointment
        response = await axios.post('/api/appointments', appointmentData);
        alert('Appointment created successfully!');
      }

      if (response.data.success) {
        console.log('Appointment ID:', response.data.appointmentId);

        // Refresh appointments list
        fetchAppointments();

        // Reset form
        handleNewAppointment();
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert(error.response?.data?.message || 'Error saving appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    // Clear currentPatientId to ensure we're creating a new patient
    localStorage.removeItem('currentPatientId');
    navigate('/dashboard/patient-demographics');
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    const firstName = appointment.patient_name?.first?.toLowerCase() || '';
    const lastName = appointment.patient_name?.last?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const appointmentId = appointment._id?.slice(-6).toLowerCase() || '';
    return fullName.includes(searchLower) || appointmentId.includes(searchLower);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const formatAppointmentDateTime = (dateString, timeString) => {
    try {
      return `${dateString} at ${timeString}`;
    } catch (e) {
      return 'Invalid date/time';
    }
  };

  return (
    <div className="medapp-container">
      {/* Header - Placeholder for spacing */}
      <div className="medapp-header" />

      <div className="medapp-main-content">
        {/* Left Panel - Appointment Search */}
        <div className="medapp-left-panel">

          {/* Add New Patient button */}
          <div className="medapp-add-patient-container">
            <Link to="/nurse-dashboard" className="nv-logo">
              <img src={logo} alt="Logo" className="nv-logo-image" />
            </Link>
            <button className="medapp-add-patient-btn" onClick={handleAddPatient}>
              +Add New Patient
            </button>
          </div>

          <div className="medapp-search-container">
            <input
              type="text"
              placeholder="Search Appointment"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="medapp-search-input"
            />
            <button className="medapp-search-btn">🔍</button>
          </div>

          <div className="medapp-patient-list">
            {filteredAppointments.map((appointment) => {
              const firstName = appointment.patient_name?.first || '';
              const lastName = appointment.patient_name?.last || '';
              const fullName = `${firstName} ${lastName}`.trim();
              const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

              return (
                <div
                  key={appointment._id}
                  className={`medapp-patient-item ${currentAppointmentId === appointment._id ? 'active' : ''}`}
                  onClick={() => loadAppointmentData(appointment)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="medapp-patient-avatar">{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div className="medapp-patient-name">{fullName}</div>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                      ID: {appointment.patient_id || appointment._id?.slice(-6)}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#999' }}>
                      {formatAppointmentDateTime(appointment.appointment_date, appointment.appointment_time)}
                    </div>
                  </div>
                  <span className="medapp-arrow">›</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Appointment Form */}
        <div className="medapp-right-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title">{currentAppointmentId ? 'Edit Appointment' : 'New Appointment'}</h2>
            {currentAppointmentId && (
              <button
                className="btn-outline"
                onClick={handleNewAppointment}
                style={{ padding: '8px 16px' }}
              >
                + New Appointment
              </button>
            )}
          </div>

          <div className="medapp-form-section">
            <h3 className="medapp-section-title">Patient Information</h3>

            <div className="medapp-form-row">
              <div className="medapp-form-group">
                <label className="medapp-label">
                  Patient ID <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  onBlur={handlePatientIdBlur}
                  className="medapp-input"
                  placeholder=""
                  required
                />
              </div>
              <div className="medapp-form-group">
                <label className="medapp-label">
                  First Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="medapp-input"
                  placeholder=""
                  required
                />
              </div>
              <div className="medapp-form-group">
                <label className="medapp-label">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="medapp-input"
                  placeholder=""
                />
              </div>
              <div className="medapp-form-group">
                <label className="medapp-label">
                  Last Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="medapp-input"
                  placeholder=""
                  required
                />
              </div>
            </div>

            <div className="medapp-form-row">
              <div className="medapp-form-group">
                <label className="medapp-label">
                  Age <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="medapp-input medapp-age-input"
                  placeholder=""
                  min="0"
                  required
                />
              </div>
              <div className="medapp-form-group medapp-contact-group">
                <label className="medapp-label">
                  Contact Information <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  className="medapp-input medapp-contact-input"
                  placeholder="7-10 digits"
                  pattern="\d{7,10}"
                  required
                />
              </div>
            </div>
          </div>

          <div className="medapp-form-section">
            <h3 className="medapp-section-title">Appointment Details</h3>

            <div className="medapp-form-row">
              <div className="medapp-form-group">
                <label className="medapp-label">
                  Date <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="medapp-input"
                  required
                />
              </div>
              <div className="medapp-form-group">
                <label className="medapp-label">
                  Time <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="medapp-input"
                  placeholder=""
                  required
                />
              </div>
            </div>

            <div className="medapp-form-row">
              <div className="medapp-form-group">
                <label className="medapp-label">Appointment Type</label>
                <select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleInputChange}
                  className="medapp-select"
                >
                  <option>Follow-up</option>
                  <option>New patient</option>
                  <option>Routine Check-up</option>
                  <option>Consultation</option>
                  <option>Emergency</option>
                  <option>Specialist Consultation</option>
                  <option>Procedure or Treatment</option>
                  <option>Vaccination</option>
                  <option>Counselling or Therapy</option>
                  <option>Emergency Visit</option>
                  <option>Telemedicine Appointment</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="medapp-form-group">
                <label className="medapp-label">Reason for Appointment</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="medapp-select"
                >
                  <option>Regular</option>
                  <option>General Health Check-up</option>
                  <option>Follow-up Visit</option>
                  <option>Specialist Consultation</option>
                  <option>Vaccination</option>
                  <option>Screening Test</option>
                  <option>Symptoms Evaluation</option>
                  <option>Emergency</option>
                  <option>Routine check</option>
                  <option>Urgent</option>
                  <option>Routine Procedure (e.g., blood test, X-ray)</option>
                  <option>Counseling or Therapy</option>
                  <option>Prescription Refill</option>
                  <option>Health Education</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="medapp-form-row">
              <div className="medapp-form-group">
                <label className="medapp-label">Urgency</label>
                <select
                  name="urgencyDropdown"
                  value={formData.urgencyDropdown}
                  onChange={handleInputChange}
                  className="medapp-select"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div className="medapp-form-group">
                <label className="medapp-label">Doctor</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  className="medapp-select"
                >
                  <option>Dr. Ram Shah</option>
                  <option>Dr. Rohan Sharma</option>
                  <option>Dr. Sanjay Williams</option>
                  <option>Dr. Ajay Patil</option>
                </select>
              </div>
            </div>

            <div className="medapp-form-group medapp-comments-group">
              <label className="medapp-label">Notes</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                className="medapp-textarea"
                rows="4"
                placeholder=""
              />
            </div>
          </div>

          <div className="medapp-form-actions">
            <button
              className="medapp-done-btn"
              onClick={handleDone}
              disabled={loading}
            >
              {loading ? 'Submitting...' : currentAppointmentId ? 'Update' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAppointment;