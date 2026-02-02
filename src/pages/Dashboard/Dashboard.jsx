import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Dashboard.css';

export default function Dashboard() {
  const [patientData, setPatientData] = useState({});
  const [contactData, setContactData] = useState({});
  const [insuranceData, setInsuranceData] = useState({});
  // Initialize sidebar based on screen width
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleItemClick = () => {
    // Only auto-close on mobile
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };


  const updatePreviewData = (newData, section) => {
    switch (section) {
      case 'patient':
        setPatientData(newData);
        break;
      case 'contact':
        setContactData(newData);
        break;
      case 'insurance':
        setInsuranceData(newData);
        break;
      default:
        console.warn(`Unknown section: ${section}`);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Container */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar onItemClick={handleItemClick} />
        <button className="sidebar-toggle-btn close" onClick={() => setIsSidebarOpen(false)} title="Close Sidebar">
          ×
        </button>
      </div>

      <div className="main-content">
        {!isSidebarOpen && (
          <button className="sidebar-toggle-btn open" onClick={toggleSidebar} title="Open Sidebar">
            ☰
          </button>
        )}
        <Outlet context={{
          patientData,
          contactData,
          insuranceData,
          updatePreviewData
        }} />
      </div>
    </div>
  );
}