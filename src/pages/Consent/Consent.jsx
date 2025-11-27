// src/pages/Consent/Consent.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import './Consent.css';

export default function Consent() {
  const outlet = useOutletContext() || {};
  const {
    patientData = {},
    contactData = {}
  } = outlet;

  const navigate = useNavigate();
  const patientId = typeof window !== 'undefined' ? localStorage.getItem("currentPatientId") : null;

  // State for fetching data from backend
  const [patientDataLoaded, setPatientDataLoaded] = useState(patientData);
  const [contactDataLoaded, setContactDataLoaded] = useState(contactData);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch patient and contact data from backend
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch patient demographics
        const patientRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/patient-demographics/${patientId}`);
        if (patientRes.ok) {
          const patientJson = await patientRes.json();
          if (patientJson.success && patientJson.data) {
            setPatientDataLoaded(patientJson.data);
          }
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }

      try {
        // Fetch contact information
        const contactRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact-information/${patientId}`);
        if (contactRes.ok) {
          const contactJson = await contactRes.json();
          if (contactJson.success && contactJson.data) {
            setContactDataLoaded({
              contact_info: contactJson.data.contact_info,
              id: contactJson.data.id
            });
          }
        }
      } catch (error) {
        console.error('Error fetching contact data:', error);
      }

      setLoading(false);
    };

    fetchData();
  }, [patientId]);

  // Helper function to get patient name from nested or flat structure
  const getFullName = () => {
    const data = patientDataLoaded || patientData;
    const firstName = data.name?.first || data.firstName || '';
    const middleName = data.name?.middle || data.middleName || '';
    const lastName = data.name?.last || data.lastName || '';
    
    return [firstName, middleName, lastName]
      .filter(Boolean)
      .join(' ') || "[Patient's Name]";
  };

  // Helper function to get full address from nested or flat structure
  const getFullAddress = () => {
    const data = patientDataLoaded || patientData;
    const address1 = data.address?.street || data.address1 || '';
    const address2 = data.address?.street2 || data.address2 || '';
    const city = data.address?.city || data.city || '';
    const postalCode = data.address?.postal_code || data.postalCode || '';
    const district = data.address?.district || data.district || '';
    const state = data.address?.state || data.state || '';
    const country = data.address?.country || data.country || '';

    return [address1, address2, city, district, state, country, postalCode]
      .filter(Boolean)
      .join(', ') || 'N/A';
  };

  // Helper function to get DOB from nested or flat structure
  const getDOB = () => {
    const data = patientDataLoaded || patientData;
    return data.date_of_birth || data.dob || 'N/A';
  };

  // Helper function to get mobile phone from nested or flat structure
  const getMobilePhone = () => {
    const data = contactDataLoaded || contactData;
    if (data.contact_info?.mobile) {
      const code = data.contact_info.mobile.code || '';
      const number = data.contact_info.mobile.number || '';
      return `${code} ${number}`.trim() || 'N/A';
    }
    return data.mobilePhone || 'N/A';
  };

  // Helper function to get email from nested or flat structure
  const getEmail = () => {
    const data = contactDataLoaded || contactData;
    return data.contact_info?.email || data.email || 'N/A';
  };

  const handleSave = async () => {
    if (!agreed) {
      alert('Please agree to the terms before saving.');
      return;
    }

    if (!patientId) {
      alert('Patient ID not found. Please try again.');
      return;
    }

    try {
      alert('Consent saved successfully!');
      navigate('/nurse-dashboard');
    } catch (error) {
      console.error('Error saving consent:', error);
      alert('An error occurred while saving consent. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="consent-container">
        <header className="fixed-header">
          <h1 className="header-title"></h1>
        </header>
        <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading consent form...</p>
      </div>
    );
  }

  const fullName = getFullName();
  const fullAddress = getFullAddress();
  const dob = getDOB();
  const mobilePhone = getMobilePhone();
  const email = getEmail();

  return (
    <div className="consent-container">
      <header className="fixed-header">
        <h1 className="header-title"></h1>
      </header>
      <h2 className="form-title">Consent Form</h2>

      <div className="consent-header">
        <p>
          <strong>Name:</strong> {fullName} &nbsp;&nbsp;&nbsp;&nbsp; 
          <strong>Date of Birth:</strong> {dob}
        </p>
        <p><strong>Address:</strong> <u>{fullAddress}</u></p>
        <p>
          <strong>Contact no:</strong> <u>{mobilePhone}</u> &nbsp;&nbsp;&nbsp;&nbsp; 
          <strong>E-mail:</strong> {email}
        </p>
      </div>

      <div className="consent-body">
        <p>
          I, <strong>{fullName}</strong>, hereby give my consent to
          <strong> SSPD</strong> to use electronic medical record (EMR) systems for the
          management of my health information. I understand and agree to the following terms:
        </p>

        <ol>
          <li>
            <strong>Purpose of EMR:</strong> I understand that the purpose of using EMR systems is to efficiently manage and store my medical information, including but not limited to medical history, diagnoses, treatment plans, medications, and test results.
          </li>
          <li>
            <strong>Confidentiality:</strong> I acknowledge that my health information stored in the EMR will be treated with the utmost confidentiality and will only be accessed by authorized healthcare professionals involved in my care.
          </li>
          <li>
            <strong>Security Measures:</strong> I understand that <em>[Healthcare Provider's Name]</em> has implemented security measures to protect the privacy and security of my health information stored in the EMR system.
          </li>
          <li>
            <strong>Access and Amendments:</strong> I understand that I have the right to access my medical records stored in the EMR system and request amendments to any inaccuracies or incomplete information.
          </li>
          <li>
            <strong>Sharing of Information:</strong> I acknowledge that my health information may be shared with other healthcare providers involved in my treatment, as necessary for continuity of care.
          </li>
          <li>
            <strong>Research and Quality Improvement:</strong> I understand that my de-identified health information may be used for research or quality improvement purposes to enhance healthcare services, with appropriate safeguards to protect my privacy.
          </li>
          <li>
            <strong>Revocation of Consent:</strong> I understand that I have the right to revoke this consent at any time, except to the extent that action has already been taken in reliance on this consent.
          </li>
        </ol>

        <div className="consent-confirmation">
          <p>
            By checking the box below, I confirm that I have read and understood the contents of this consent form and agree to the use of electronic medical records for managing my health information.
          </p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            &nbsp;I agree to the terms outlined above
          </label>
        </div>
      </div>

      <button 
        className="save-btn" 
        onClick={handleSave} 
        disabled={!agreed}
      >
        Save
      </button>
    </div>
  );
}