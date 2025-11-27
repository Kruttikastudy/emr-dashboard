import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PatientDetail.css';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for all patient data
  const [patientData, setPatientData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [insuranceData, setInsuranceData] = useState(null);
  const [allergiesData, setAllergiesData] = useState([]);
  const [familyHistoryData, setFamilyHistoryData] = useState({ familyMembers: [], geneticConditions: [] });
  const [socialHistoryData, setSocialHistoryData] = useState(null);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch patient demographics
      const patientRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/patient-demographics/${id}`);
      if (patientRes.ok) {
        const patientJson = await patientRes.json();
        if (patientJson.success && patientJson.data) {
          setPatientData(patientJson.data);
        }
      }

      // Fetch contact information
      try {
        const contactRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact-information/${id}`);
        if (contactRes.ok) {
          const contactJson = await contactRes.json();
          if (contactJson.success && contactJson.data) {
            setContactData(contactJson.data);
          }
        }
      } catch (error) {
        console.error('Error fetching contact data:', error);
      }

      // Fetch insurance information
      try {
        const insuranceRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/insurance/${id}`);
        if (insuranceRes.ok) {
          const insuranceJson = await insuranceRes.json();
          if (insuranceJson.insurance) {
            setInsuranceData(insuranceJson);
          }
        }
      } catch (error) {
        console.error('Error fetching insurance data:', error);
      }

      // Fetch allergies
      try {
        const allergiesRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/allergies/${id}`);
        if (allergiesRes.ok) {
          const allergiesJson = await allergiesRes.json();
          if (allergiesJson.success) {
            setAllergiesData(allergiesJson.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching allergies:', error);
      }

      // Fetch family history
      try {
        const familyHistoryRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/family-history/${id}`);
        if (familyHistoryRes.ok) {
          const familyHistoryJson = await familyHistoryRes.json();
          if (familyHistoryJson.success) {
            setFamilyHistoryData(familyHistoryJson.data || { familyMembers: [], geneticConditions: [] });
          }
        }
      } catch (error) {
        console.error('Error fetching family history:', error);
      }

      // Fetch social history
      try {
        const [
          tobaccoSmokingRes,
          tobaccoConsumptionRes,
          alcoholRes,
          socialTextRes,
          financialRes,
          educationRes,
          physicalActivityRes,
          stressRes,
          socialIsolationRes,
          exposureToViolenceRes,
          genderIdentityRes,
          sexualOrientationRes,
          nutrientsRes
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/tobacco-smoking`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/tobacco-consumption`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/alcohol`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/social-text`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/financial-resources`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/education`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/physical-activity`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/stress`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/social-isolation`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/exposure-to-violence`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/gender-identity`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/sexual-orientation`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${id}/nutrients-history`)
        ]);

        const results = await Promise.all([
          tobaccoSmokingRes.ok ? tobaccoSmokingRes.json() : null,
          tobaccoConsumptionRes.ok ? tobaccoConsumptionRes.json() : null,
          alcoholRes.ok ? alcoholRes.json() : null,
          socialTextRes.ok ? socialTextRes.json() : null,
          financialRes.ok ? financialRes.json() : null,
          educationRes.ok ? educationRes.json() : null,
          physicalActivityRes.ok ? physicalActivityRes.json() : null,
          stressRes.ok ? stressRes.json() : null,
          socialIsolationRes.ok ? socialIsolationRes.json() : null,
          exposureToViolenceRes.ok ? exposureToViolenceRes.json() : null,
          genderIdentityRes.ok ? genderIdentityRes.json() : null,
          sexualOrientationRes.ok ? sexualOrientationRes.json() : null,
          nutrientsRes.ok ? nutrientsRes.json() : null
        ]);

        if (results.some(r => r && r.success)) {
          setSocialHistoryData({
            tobaccoSmoking: results[0]?.data,
            tobaccoConsumption: results[1]?.data,
            alcohol: results[2]?.data,
            socialText: results[3]?.data,
            financial: results[4]?.data,
            education: results[5]?.data,
            physicalActivity: results[6]?.data,
            stress: results[7]?.data,
            socialIsolation: results[8]?.data,
            exposureToViolence: results[9]?.data,
            genderIdentity: results[10]?.data,
            sexualOrientation: results[11]?.data,
            nutrients: results[12]?.data
          });
        }
      } catch (error) {
        console.error('Error fetching social history:', error);
      }

    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewVisit = () => {
    navigate('/new-visit', { state: { patientId: id } });
  };

  const handleNewAppointment = () => {
    if (patientData) {
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

      navigate('/new-appointment', {
        state: {
          patientData: {
            firstName: patientData.name?.first || '',
            middleName: patientData.name?.middle || '',
            lastName: patientData.name?.last || '',
            age: calculateAge(patientData.date_of_birth),
            contactInfo: contactData?.contact_info?.mobile?.number || ''
          }
        }
      });
    }
  };

  const handleGoToMessages = () => {};

  const handleBackToDashboard = () => navigate('/dashboard');

  const handleEditDemographics = () => {
    localStorage.setItem('currentPatientId', id);
    navigate('/dashboard/patient-demographics');
  };

  const handleEditContact = () => {
    localStorage.setItem('currentPatientId', id);
    navigate('/dashboard/contact-information');
  };

  const handleEditInsurance = () => {
    localStorage.setItem('currentPatientId', id);
    navigate('/dashboard/insurance-information');
  };

  const handleEditAllergies = () => {
    localStorage.setItem('currentPatientId', id);
    navigate('/dashboard/allergies');
  };

  const handleEditFamilyHistory = () => {
    localStorage.setItem('currentPatientId', id);
    navigate('/dashboard/family-history');
  };

  const handleEditSocialHistory = () => {
    localStorage.setItem('currentPatientId', id);
    navigate('/dashboard/social-history');
  };

  if (loading) {
    return (
      <div className="pd-container">
        <p>Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd-container">
        <p style={{ color: 'red' }}>Error loading patient data: {error}</p>
        <button onClick={fetchPatientData}>Retry</button>
      </div>
    );
  }

  if (!patientData) {
    return <div className="pd-notfound">Patient not found</div>;
  }

  // Extract data for header
  const firstName = patientData.name?.first || '';
  const middleName = patientData.name?.middle || '';
  const lastName = patientData.name?.last || '';
  const phone = contactData?.contact_info?.mobile 
    ? `${contactData.contact_info.mobile.code || ''} ${contactData.contact_info.mobile.number || ''}`.trim()
    : 'N/A';
  const dob = patientData.date_of_birth || 'N/A';
  const gender = patientData.gender || 'N/A';
  const address = patientData.address;
  const location = address?.city && address?.state 
    ? `${address.city}, ${address.state}`
    : address?.country || 'N/A';

  return (
    <div className="pd-container">
      {/* Back to Dashboard Button */}
      <div className="pd-back-button-container">
        <button className="pd-back-button" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Header Card */}
      <div className="pd-header-card">
        <div className="pd-header-left">
          <div className="pd-avatar-circle">
            <span className="pd-avatar-letter">
              {firstName.charAt(0).toUpperCase()}
              {lastName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="pd-header-info">
            <h1 className="pd-header-name">
              {firstName} {middleName && middleName + ' '}{lastName}
            </h1>

            <div className="pd-header-details">
              <div><span className="pd-label-inline">Phone no:</span> <span className="pd-value-inline">{phone}</span></div>
              <div><span className="pd-label-inline">DOB:</span> <span className="pd-value-inline">{dob}</span></div>
              <div><span className="pd-label-inline">Gender:</span> <span className="pd-value-inline">{gender}</span></div>
              <div><span className="pd-label-inline">Location:</span> <span className="pd-value-inline">{location}</span></div>
            </div>
          </div>
        </div>

        <div className="pd-header-actions">
          <button className="pd-pill" onClick={handleNewVisit}>New Visit</button>
          <button className="pd-pill" onClick={handleNewAppointment}>New Appointment</button>
          <button className="pd-pill" onClick={handleGoToMessages}>Go To Messages</button>
        </div>
      </div>

      {/* Patient Overview */}
      <div className="pd-overview-card">
        <h2>Patient Overview</h2>

        {/* Demographics Section */}
        {patientData && (
          <section className="pd-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Demographics</h3>
              <button onClick={handleEditDemographics} className="pd-edit-link">Edit</button>
            </div>
            <p><strong>Name:</strong> {firstName} {middleName && middleName + ' '}{lastName}</p>
            {dob && <p><strong>DOB:</strong> {dob}</p>}
            {gender && <p><strong>Gender:</strong> {gender}</p>}
            {address && (
              <p>
                <strong>Address:</strong>{' '}
                {[
                  address.street,
                  address.city,
                  address.district,
                  address.state,
                  address.country,
                  address.postal_code
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {patientData.blood_group && <p><strong>Blood Group:</strong> {patientData.blood_group}</p>}
            {patientData.occupation && <p><strong>Occupation:</strong> {patientData.occupation}</p>}
            {patientData.aadhaar && <p><strong>Aadhar No.:</strong> {patientData.aadhaar}</p>}
            {patientData.pan && <p><strong>PAN No.:</strong> {patientData.pan}</p>}
          </section>
        )}

        {/* Contact Section */}
        {contactData && (
          <section className="pd-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Contact Information</h3>
              <button onClick={handleEditContact} className="pd-edit-link">Edit</button>
            </div>
            {contactData.contact_info?.mobile && (
              <p><strong>Mobile:</strong> {contactData.contact_info.mobile.code} {contactData.contact_info.mobile.number}</p>
            )}
            {contactData.contact_info?.home_phone && (
              <p><strong>Home Phone:</strong> {contactData.contact_info.home_phone.code} {contactData.contact_info.home_phone.number}</p>
            )}
            {contactData.contact_info?.work_phone && (
              <p><strong>Work Phone:</strong> {contactData.contact_info.work_phone.code} {contactData.contact_info.work_phone.number}</p>
            )}
            {contactData.contact_info?.email && (
              <p><strong>Email:</strong> {contactData.contact_info.email}</p>
            )}
            {contactData.contact_info?.emergency_contact?.[0] && (
              <>
                <h4 style={{ marginTop: '15px' }}>Emergency Contact</h4>
                <p>
                  <strong>Name:</strong>{' '}
                  {[
                    contactData.contact_info.emergency_contact[0].name?.first,
                    contactData.contact_info.emergency_contact[0].name?.middle,
                    contactData.contact_info.emergency_contact[0].name?.last
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </p>
                {contactData.contact_info.emergency_contact[0].relationship && (
                  <p><strong>Relationship:</strong> {contactData.contact_info.emergency_contact[0].relationship}</p>
                )}
                {contactData.contact_info.emergency_contact[0].phone && (
                  <p><strong>Phone:</strong> {contactData.contact_info.emergency_contact[0].phone.code} {contactData.contact_info.emergency_contact[0].phone.number}</p>
                )}
                {contactData.contact_info.emergency_contact[0].email && (
                  <p><strong>Email:</strong> {contactData.contact_info.emergency_contact[0].email}</p>
                )}
              </>
            )}
          </section>
        )}

        {/* Insurance Section */}
        {insuranceData?.insurance && (
          <section className="pd-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Insurance Information</h3>
              <button onClick={handleEditInsurance} className="pd-edit-link">Edit</button>
            </div>
            
            {insuranceData.insurance.primary && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Primary Insurance</h4>
                {insuranceData.insurance.primary.company_name && (
                  <p><strong>Company Name:</strong> {insuranceData.insurance.primary.company_name}</p>
                )}
                {insuranceData.insurance.primary.policy_number && (
                  <p><strong>Policy Number:</strong> {insuranceData.insurance.primary.policy_number}</p>
                )}
                {insuranceData.insurance.primary.group_number && (
                  <p><strong>Group Number:</strong> {insuranceData.insurance.primary.group_number}</p>
                )}
                {insuranceData.insurance.primary.plan_type && (
                  <p><strong>Plan Type:</strong> {insuranceData.insurance.primary.plan_type}</p>
                )}
                {(insuranceData.insurance.primary.effective_start || insuranceData.insurance.primary.effective_end) && (
                  <p>
                    <strong>Effective Dates:</strong>{' '}
                    {insuranceData.insurance.primary.effective_start || 'N/A'} - {insuranceData.insurance.primary.effective_end || 'N/A'}
                  </p>
                )}
              </div>
            )}

            {insuranceData.insurance.secondary && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Secondary Insurance</h4>
                {insuranceData.insurance.secondary.company_name && (
                  <p><strong>Company Name:</strong> {insuranceData.insurance.secondary.company_name}</p>
                )}
                {insuranceData.insurance.secondary.policy_number && (
                  <p><strong>Policy Number:</strong> {insuranceData.insurance.secondary.policy_number}</p>
                )}
                {insuranceData.insurance.secondary.group_number && (
                  <p><strong>Group Number:</strong> {insuranceData.insurance.secondary.group_number}</p>
                )}
                {insuranceData.insurance.secondary.plan_type && (
                  <p><strong>Plan Type:</strong> {insuranceData.insurance.secondary.plan_type}</p>
                )}
                {(insuranceData.insurance.secondary.effective_start || insuranceData.insurance.secondary.effective_end) && (
                  <p>
                    <strong>Effective Dates:</strong>{' '}
                    {insuranceData.insurance.secondary.effective_start || 'N/A'} - {insuranceData.insurance.secondary.effective_end || 'N/A'}
                  </p>
                )}
              </div>
            )}

            {insuranceData.insurance.insurance_contact_number && (
              <p><strong>Contact Number:</strong> {insuranceData.insurance.insurance_contact_number}</p>
            )}
          </section>
        )}

        {/* Allergies Section */}
        {allergiesData?.length > 0 && (
          <section className="pd-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Allergies</h3>
              <button onClick={handleEditAllergies} className="pd-edit-link">Edit</button>
            </div>
            {allergiesData.map((allergy, index) => (
              <div key={index} className="pd-allergy-section">
                <h4 className="pd-allergy-title">Allergy {index + 1}</h4>
                <ul className="pd-allergy-list">
                  {allergy.allergen && <li><strong>Allergen:</strong> {allergy.allergen}</li>}
                  {allergy.category && <li><strong>Category:</strong> {allergy.category}</li>}
                  {allergy.reaction && <li><strong>Reaction:</strong> {allergy.reaction}</li>}
                  {allergy.severity && <li><strong>Severity:</strong> {allergy.severity}</li>}
                  {allergy.status && <li><strong>Status:</strong> {allergy.status}</li>}
                  {allergy.code && <li><strong>Allergy Code:</strong> {allergy.code}</li>}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Family History Section */}
        {(familyHistoryData?.familyMembers?.length > 0 || familyHistoryData?.geneticConditions?.length > 0) && (
          <section className="pd-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Family History</h3>
              <button onClick={handleEditFamilyHistory} className="pd-edit-link">Edit</button>
            </div>
            
            {familyHistoryData?.familyMembers?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Family Members</h4>
                {familyHistoryData.familyMembers.map((member, index) => (
                  <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                    <p><strong>Name:</strong> {member.firstName} {member.lastName}</p>
                    <p><strong>Relationship:</strong> {member.relationship}</p>
                    {member.dob && <p><strong>Date of Birth:</strong> {member.dob}</p>}
                    {member.gender && <p><strong>Gender:</strong> {member.gender}</p>}
                    <p><strong>Deceased:</strong> {member.deceased ? 'Yes' : 'No'}</p>
                    {member.medicalConditions?.length > 0 && (
                      <p><strong>Medical Conditions:</strong> {member.medicalConditions.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {familyHistoryData?.geneticConditions?.length > 0 && (
              <div>
                <h4>Genetic Conditions</h4>
                {familyHistoryData.geneticConditions.map((condition, index) => (
                  <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                    {condition.conditionName && <p><strong>Condition:</strong> {condition.conditionName}</p>}
                    {condition.affectedMember && <p><strong>Affected Member:</strong> {condition.affectedMember}</p>}
                    {condition.testResults && <p><strong>Test Results:</strong> {condition.testResults}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Social History Section */}
        {socialHistoryData && Object.keys(socialHistoryData).some(key => socialHistoryData[key]) && (
          <section className="pd-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Social History</h3>
              <button onClick={handleEditSocialHistory} className="pd-edit-link">Edit</button>
            </div>

            {/* Tobacco Smoking */}
            {socialHistoryData.tobaccoSmoking && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Tobacco Smoking</h4>
                {socialHistoryData.tobaccoSmoking.current_status && (
                  <p><strong>Status:</strong> {socialHistoryData.tobaccoSmoking.current_status}</p>
                )}
                {socialHistoryData.tobaccoSmoking.average_daily_consumption && (
                  <p><strong>Daily Consumption:</strong> {socialHistoryData.tobaccoSmoking.average_daily_consumption} cigarettes/day</p>
                )}
                {socialHistoryData.tobaccoSmoking.duration_of_use && (
                  <p><strong>Duration:</strong> {socialHistoryData.tobaccoSmoking.duration_of_use} {socialHistoryData.tobaccoSmoking.duration_unit}</p>
                )}
                {socialHistoryData.tobaccoSmoking.quit_date && (
                  <p><strong>Quit Date:</strong> {socialHistoryData.tobaccoSmoking.quit_date}</p>
                )}
                {socialHistoryData.tobaccoSmoking.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.tobaccoSmoking.notes}</p>
                )}
              </div>
            )}

            {/* Tobacco Consumption */}
            {socialHistoryData.tobaccoConsumption && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Tobacco Consumption</h4>
                {socialHistoryData.tobaccoConsumption.type_of_tobacco && (
                  <p><strong>Type:</strong> {socialHistoryData.tobaccoConsumption.type_of_tobacco}</p>
                )}
                {socialHistoryData.tobaccoConsumption.frequency && (
                  <p><strong>Frequency:</strong> {socialHistoryData.tobaccoConsumption.frequency}</p>
                )}
                {socialHistoryData.tobaccoConsumption.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.tobaccoConsumption.notes}</p>
                )}
              </div>
            )}

            {/* Alcohol */}
            {socialHistoryData.alcohol && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Alcohol Use</h4>
                {socialHistoryData.alcohol.current_status && (
                  <p><strong>Status:</strong> {socialHistoryData.alcohol.current_status}</p>
                )}
                {socialHistoryData.alcohol.average_weekly_consumption && (
                  <p><strong>Weekly Consumption:</strong> {socialHistoryData.alcohol.average_weekly_consumption} drinks/week</p>
                )}
                {socialHistoryData.alcohol.type_of_alcohol && (
                  <p><strong>Type:</strong> {socialHistoryData.alcohol.type_of_alcohol}</p>
                )}
                {socialHistoryData.alcohol.period_of_use && (
                  <p><strong>Period of Use:</strong> {socialHistoryData.alcohol.period_of_use}</p>
                )}
                {socialHistoryData.alcohol.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.alcohol.notes}</p>
                )}
              </div>
            )}

            {/* Social Text */}
            {socialHistoryData.socialText?.notes && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Additional Social Notes</h4>
                <p>{socialHistoryData.socialText.notes}</p>
              </div>
            )}

            {/* Financial Resources */}
            {socialHistoryData.financial && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Financial Resources</h4>
                {socialHistoryData.financial.income_level && (
                  <p><strong>Income Level:</strong> {socialHistoryData.financial.income_level}</p>
                )}
                {socialHistoryData.financial.employment_status && (
                  <p><strong>Employment Status:</strong> {socialHistoryData.financial.employment_status}</p>
                )}
                {socialHistoryData.financial.financial_support && (
                  <p><strong>Financial Support:</strong> {socialHistoryData.financial.financial_support}</p>
                )}
                {socialHistoryData.financial.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.financial.notes}</p>
                )}
              </div>
            )}

            {/* Education */}
            {socialHistoryData.education?.highest_level_of_education && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Education</h4>
                <p><strong>Highest Level:</strong> {socialHistoryData.education.highest_level_of_education}</p>
                {socialHistoryData.education.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.education.notes}</p>
                )}
              </div>
            )}

            {/* Physical Activity */}
            {socialHistoryData.physicalActivity && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Physical Activity</h4>
                {socialHistoryData.physicalActivity.frequency && (
                  <p><strong>Frequency:</strong> {socialHistoryData.physicalActivity.frequency}</p>
                )}
                {socialHistoryData.physicalActivity.type_of_exercise && (
                  <p><strong>Type:</strong> {socialHistoryData.physicalActivity.type_of_exercise}</p>
                )}
                {socialHistoryData.physicalActivity.duration && (
                  <p><strong>Duration:</strong> {socialHistoryData.physicalActivity.duration} {socialHistoryData.physicalActivity.duration_unit}</p>
                )}
                {socialHistoryData.physicalActivity.consistency && (
                  <p><strong>Consistency:</strong> {socialHistoryData.physicalActivity.consistency}</p>
                )}
                {socialHistoryData.physicalActivity.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.physicalActivity.notes}</p>
                )}
              </div>
            )}

            {/* Stress */}
            {socialHistoryData.stress && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Stress</h4>
                {socialHistoryData.stress.perceived_stress_level && (
                  <p><strong>Stress Level:</strong> {socialHistoryData.stress.perceived_stress_level}</p>
                )}
                {socialHistoryData.stress.major_stressors && (
                  <p><strong>Major Stressors:</strong> {socialHistoryData.stress.major_stressors}</p>
                )}
                {socialHistoryData.stress.coping_mechanisms && (
                  <p><strong>Coping Mechanisms:</strong> {socialHistoryData.stress.coping_mechanisms}</p>
                )}
                {socialHistoryData.stress.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.stress.notes}</p>
                )}
              </div>
            )}

            {/* Social Isolation */}
            {socialHistoryData.socialIsolation && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Social Isolation & Connection</h4>
                {socialHistoryData.socialIsolation.isolation_status && (
                  <p><strong>Isolation Status:</strong> {socialHistoryData.socialIsolation.isolation_status}</p>
                )}
                {socialHistoryData.socialIsolation.social_support && (
                  <p><strong>Social Support:</strong> {socialHistoryData.socialIsolation.social_support}</p>
                )}
                {socialHistoryData.socialIsolation.frequency_of_social_interactions && (
                  <p><strong>Frequency of Interactions:</strong> {socialHistoryData.socialIsolation.frequency_of_social_interactions}</p>
                )}
                {socialHistoryData.socialIsolation.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.socialIsolation.notes}</p>
                )}
              </div>
            )}

            {/* Exposure to Violence */}
            {socialHistoryData.exposureToViolence && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Exposure to Violence</h4>
                {socialHistoryData.exposureToViolence.type_of_violence && (
                  <p><strong>Type of Violence:</strong> {socialHistoryData.exposureToViolence.type_of_violence}</p>
                )}
                {socialHistoryData.exposureToViolence.date_of_last_exposure && (
                  <p><strong>Last Exposure:</strong> {socialHistoryData.exposureToViolence.date_of_last_exposure}</p>
                )}
                {socialHistoryData.exposureToViolence.support_or_intervention_received && (
                  <p><strong>Support Received:</strong> {socialHistoryData.exposureToViolence.support_or_intervention_received}</p>
                )}
                {socialHistoryData.exposureToViolence.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.exposureToViolence.notes}</p>
                )}
              </div>
            )}

            {/* Gender Identity */}
            {socialHistoryData.genderIdentity?.gender_identity && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Gender Identity</h4>
                <p><strong>Identity:</strong> {socialHistoryData.genderIdentity.gender_identity}</p>
                {socialHistoryData.genderIdentity.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.genderIdentity.notes}</p>
                )}
              </div>
            )}

            {/* Sexual Orientation */}
            {socialHistoryData.sexualOrientation?.sexual_orientation && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Sexual Orientation</h4>
                <p><strong>Orientation:</strong> {socialHistoryData.sexualOrientation.sexual_orientation}</p>
                {socialHistoryData.sexualOrientation.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.sexualOrientation.notes}</p>
                )}
              </div>
            )}

            {/* Nutrients History */}
            {socialHistoryData.nutrients && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Nutrients History</h4>
                {socialHistoryData.nutrients.dietary_preferences && (
                  <p><strong>Dietary Preferences:</strong> {socialHistoryData.nutrients.dietary_preferences}</p>
                )}
                {socialHistoryData.nutrients.supplement_usage && (
                  <p><strong>Supplement Usage:</strong> {socialHistoryData.nutrients.supplement_usage}</p>
                )}
                {socialHistoryData.nutrients.notes && (
                  <p><strong>Notes:</strong> {socialHistoryData.nutrients.notes}</p>
                )}
              </div>
            )}
          </section>
        )}

        {/* No Data Message */}
        {!patientData && !contactData && !insuranceData && allergiesData.length === 0 && 
         familyHistoryData.familyMembers.length === 0 && familyHistoryData.geneticConditions.length === 0 &&
         (!socialHistoryData || !Object.keys(socialHistoryData).some(key => socialHistoryData[key])) && (
          <p>No data available for this patient.</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;