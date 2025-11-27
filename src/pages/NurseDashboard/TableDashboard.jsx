import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TableDashboard.css";

const TableDashboard = () => {
  const navigate = useNavigate();
  const [nameFilter, setNameFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const result = await response.json();
      const appointmentsData = Array.isArray(result) ? result : (result.data || []);
      
      // Map the data to include status (default to Active)
      const mappedAppointments = appointmentsData.map(apt => ({
        ...apt,
        status: apt.status || 'Active', // Add status field if not present
        fullName: `${apt.patient_name?.first || ''} ${apt.patient_name?.middle || ''} ${apt.patient_name?.last || ''}`.trim()
      }));
      
      setAppointments(mappedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (appointmentId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Completed' : 'Active';
    
    try {
      // Update locally first for immediate UI feedback
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

    } catch (err) {
      console.error('Error updating status:', err);
      // Revert on error
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt._id === appointmentId ? { ...apt, status: currentStatus } : apt
        )
      );
    }
  };

  const parseDateForFilter = (dateString) => {
    // Convert MM-DD-YYYY to YYYY-MM-DD for comparison
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0]}-${parts[1]}`;
    }
    return dateString;
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesName = apt.fullName.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesDoctor = (apt.doctor || '').toLowerCase().includes(doctorFilter.toLowerCase());
    const matchesDate = dateFilter === "" || parseDateForFilter(apt.appointment_date) === dateFilter;
    
    return matchesName && matchesDoctor && matchesDate;
  });

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="pdb-container">
        <div className="pdb-header-bar">
          <button className="pdb-back-btn" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
          <h2 className="pdb-title">Patient Appointment Schedule</h2>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading appointments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdb-container">
        <div className="pdb-header-bar">
          <button className="pdb-back-btn" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
          <h2 className="pdb-title">Patient Appointment Schedule</h2>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          Error loading appointments: {error}
          <br />
          <button onClick={fetchAppointments} style={{ marginTop: '10px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pdb-container">
      {/* Header with Back Button */}
      <div className="pdb-header-bar">
        <button className="pdb-back-btn" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
        <h2 className="pdb-title">Patient Appointment Schedule</h2>
      </div>

      {/* Filter Section */}
      <div className="pdb-filter-section">
        <div className="pdb-filter-group">
          <label>Patient Name:</label>
          <input
            type="text"
            className="pdb-filter-input"
            placeholder="Search by patient name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        
        <div className="pdb-filter-group">
          <label>Doctor Name:</label>
          <input
            type="text"
            className="pdb-filter-input"
            placeholder="Search by doctor name"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          />
        </div>
        
        <div className="pdb-filter-group">
          <label>Appointment Date:</label>
          <input
            type="date"
            className="pdb-filter-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        
        <button 
          className="pdb-clear-btn"
          onClick={() => {
            setNameFilter("");
            setDoctorFilter("");
            setDateFilter("");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Results Count */}
      <div className="pdb-results-count">
        Showing {filteredAppointments.length} of {appointments.length} appointments
      </div>

      {/* Table */}
      <div className="pdb-table-wrapper">
        <table className="pdb-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>AGE</th>
              <th>APPOINTMENT DATE</th>
              <th>APPOINTMENT TIME</th>
              <th>APPOINTMENT TYPE</th>
              <th>DOCTOR</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <tr key={apt._id}>
                  <td>{apt.fullName}</td>
                  <td>{apt.age}</td>
                  <td>{apt.appointment_date}</td>
                  <td>{apt.appointment_time}</td>
                  <td>{apt.appointment_type}</td>
                  <td>{apt.doctor || 'Not Assigned'}</td>
                  <td>
                    <button
                      className={`pdb-status-toggle ${apt.status === 'Active' ? 'active' : 'completed'}`}
                      onClick={() => handleStatusToggle(apt._id, apt.status)}
                    >
                      {apt.status}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="pdb-no-results">
                  No appointments found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableDashboard;