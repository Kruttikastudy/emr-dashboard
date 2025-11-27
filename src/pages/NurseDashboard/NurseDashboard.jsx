import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NurseDashboard.css';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visitsSearchTerm, setVisitsSearchTerm] = useState('');
  const [appointmentsSearchTerm, setAppointmentsSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all patients
      const patientsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/patients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!patientsResponse.ok) {
        const errorText = await patientsResponse.text();
        throw new Error(`Failed to fetch patients: ${errorText}`);
      }
      const patientsData = await patientsResponse.json();
      
      // Handle both array and object responses
      const patientsArray = Array.isArray(patientsData) ? patientsData : (patientsData.data || []);
      
      // Map patients data to match the component structure
      const mappedPatients = patientsArray.map(patient => ({
        id: patient._id,
        first_name: patient.name?.first || '',
        last_name: patient.name?.last || '',
        middle_name: patient.name?.middle || ''
      }));
      setPatients(mappedPatients);

      // Fetch recent visits
      const visitsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/visits`);
      if (!visitsResponse.ok) {
        throw new Error('Failed to fetch visits');
      }
      const visitsResult = await visitsResponse.json();
      
      // Handle both array and object responses
      const visitsData = Array.isArray(visitsResult) ? visitsResult : (visitsResult.data || []);
      
      // Sort visits by creation time (most recent first) and store full data
      const sortedVisits = visitsData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10); // Get last 10 visits
      
      setRecentVisits(sortedVisits);

      // Fetch upcoming appointments
      const appointmentsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`);
      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const appointmentsResult = await appointmentsResponse.json();
      
      // Handle both array and object responses
      const appointmentsData = Array.isArray(appointmentsResult) ? appointmentsResult : (appointmentsResult.data || []);
      
      // Filter and sort appointments for today and future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingAppointments = appointmentsData
        .map(appointment => {
          // Parse the date (MM-DD-YYYY format)
          const dateParts = appointment.appointment_date.split('-');
          const appointmentDate = new Date(
            parseInt(dateParts[2]), // year
            parseInt(dateParts[0]) - 1, // month (0-indexed)
            parseInt(dateParts[1]) // day
          );
          
          return {
            ...appointment, // Keep all original data
            date: appointmentDate,
            dateString: appointment.appointment_date
          };
        })
        .filter(appointment => appointment.date >= today)
        .sort((a, b) => {
          // Sort by date first, then by time
          if (a.date.getTime() !== b.date.getTime()) {
            return a.date - b.date;
          }
          // If same date, sort by time
          return a.appointment_time.localeCompare(b.appointment_time);
        })
        .slice(0, 10); // Get next 10 appointments
      
      setAppointments(upcomingAppointments);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    console.log('Navigating to: /dashboard/patient-demographics');
    // Clear currentPatientId to ensure we're creating a new patient
    localStorage.removeItem('currentPatientId');
    navigate('/dashboard/patient-demographics');
  };

  const handleNewVisit = () => {
    console.log('Navigating to: /new-visit with emergency visit');
    navigate('/new-visit', { state: { visitType: 'Emergency Visit' } });
  };

  const handleNewAppointment = () => {
    console.log('Navigating to: /new-appointment');
    navigate('/new-appointment');
  };

  const handleViewPatient = (patientId) => {
    console.log('Navigating to: /patient/' + patientId);
    // Store patient ID for reference
    localStorage.setItem('currentPatientId', patientId);
    navigate(`/patient/${patientId}`);
  };

  const handleViewVisit = (visit) => {
    console.log('Opening visit for editing:', visit._id);
    // Navigate to new-visit page with the visit data
    navigate('/new-visit', { 
      state: { 
        visitData: visit,
        isEditing: true 
      } 
    });
  };

  const handleViewAppointment = (appointment) => {
    console.log('Opening appointment for editing:', appointment._id);
    // Navigate to new-appointment page with the appointment data
    navigate('/new-appointment', { 
      state: { 
        appointmentData: appointment,
        isEditing: true 
      } 
    });
  };

  const handleViewFullSchedule = () => {
    console.log('Navigating to: /table-dashboard');
    navigate('/table-dashboard');
  };

  const formatVisitTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.middle_name} ${patient.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredVisits = recentVisits.filter(visit =>
    visit.patient_name?.toLowerCase().includes(visitsSearchTerm.toLowerCase())
  );

  const filteredAppointments = appointments.filter(appointment => {
    const firstName = appointment.patient_name?.first || '';
    const lastName = appointment.patient_name?.last || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    return fullName.includes(appointmentsSearchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="nurse-dashboard">
        <div className="dashboard-header">
          <h1>SSPD Dashboard</h1>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nurse-dashboard">
        <div className="dashboard-header">
          <h1>SSPD Dashboard</h1>
          <p style={{ color: 'red' }}>Error loading data: {error}</p>
          <button onClick={fetchDashboardData} className="header-action-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nurse-dashboard">
      <div className="dashboard-header">
        <h1>SSPD Dashboard</h1>
        <p>Welcome Back! Here's Today's Patient Overview.</p>
      </div>

      <div className="dashboard-content">
        {/* Column 1: Add patient + All Patients */}
        <div className="col">
          <div className="card">
            <div className="card-header-section">
              <h2>Patient Directory</h2>
              <button className="header-action-btn" onClick={handleAddPatient}>
                + Add New Patient
              </button>
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder="Search patients..."
                className="search-box"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="content-scrollable">
              <h3>All Patients ({patients.length})</h3>
              {filteredPatients.length > 0 ? (
                <ul>
                  {filteredPatients.map((patient) => (
                    <li key={patient.id} className="patient-item">
                      <div className="patient-avatar">
                        {patient.first_name.charAt(0).toUpperCase()}
                        {patient.last_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="patient-info">
                        <span className="patient-name">
                          {patient.first_name} {patient.middle_name ? patient.middle_name + ' ' : ''}{patient.last_name}
                        </span>
                        <span className="patient-id">Patient ID: {patient.id}</span>
                      </div>
                      <div className="patient-actions">
                        <button 
                          className="view-btn"
                          onClick={() => handleViewPatient(patient.id)}
                        >
                          View
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No patients found</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Recent patients (descending order) */}
        <div className="col">
          <div className="card">
            <div className="card-header-section">
              <h2>Recent Patient Encounters</h2>
              <button className="header-action-btn" onClick={handleNewVisit}>
                + New Visit
              </button>
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder="Search visits..."
                className="search-box"
                value={visitsSearchTerm}
                onChange={(e) => setVisitsSearchTerm(e.target.value)}
              />
            </div>

            <div className="content-scrollable">
              <h3>Recent Visits ({recentVisits.length})</h3>
              {filteredVisits.length > 0 ? (
                <ul>
                  {filteredVisits.map((visit) => (
                    <li 
                      key={visit._id} 
                      className="recent-patient-item"
                      onClick={() => handleViewVisit(visit)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="recent-patient-info">
                        <span className="patient-name">
                          {visit.patient_name}
                        </span>
                        <span className="visit-type">
                          {visit.visit_type}
                        </span>
                        <span className="visit-time">
                          {formatVisitTime(visit.createdAt)}
                        </span>
                      </div>
                      <div className="status-badge new">New</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No recent visits found</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Upcoming appointments */}
        <div className="col">
          <div className="card">
            <div className="card-header-section">
              <h2>Upcoming Appointments</h2>
              <button className="header-action-btn" onClick={handleNewAppointment}>
                + New Appointment
              </button>
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder="Search appointments..."
                className="search-box"
                value={appointmentsSearchTerm}
                onChange={(e) => setAppointmentsSearchTerm(e.target.value)}
              />
            </div>

            <div className="content-scrollable">
              <h3>Upcoming Schedule ({appointments.length})</h3>
              {filteredAppointments.length > 0 ? (
                <ul>
                  {filteredAppointments.map((appointment) => (
                    <li 
                      key={appointment._id} 
                      className="appointment-item"
                      onClick={() => handleViewAppointment(appointment)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="appointment-time">
                        <div>{appointment.appointment_time}</div>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                          {appointment.dateString}
                        </div>
                      </div>
                      <div className="appointment-info">
                        <span className="patient-name">
                          {appointment.patient_name?.first} {appointment.patient_name?.last}
                        </span>
                        <span className="appointment-type">{appointment.appointment_type}</span>
                        {appointment.reason_for_appointment && (
                          <span className="appointment-reason" style={{ fontSize: '0.85em', color: '#666' }}>
                            {appointment.reason_for_appointment}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No upcoming appointments</p>
              )}
              <button className="view-schedule-btn" onClick={handleViewFullSchedule}>
                View Full Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;