import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import './Preview.css';

export default function Preview() {
  // protect against undefined outlet context
  const outlet = useOutletContext() || {};
  const {
    patientData = {},
    contactData = {},
    insuranceData = {}
  } = outlet;

  const navigate = useNavigate();
  const patientId = typeof window !== 'undefined' ? localStorage.getItem("currentPatientId") : null;
  
  // State for fetching all data from backend
  const [patientDataLoaded, setPatientDataLoaded] = useState(patientData);
  const [contactDataLoaded, setContactDataLoaded] = useState(contactData);
  const [insuranceDataLoaded, setInsuranceDataLoaded] = useState(insuranceData);
  const [allergiesData, setAllergiesData] = useState([]);
  const [familyHistoryData, setFamilyHistoryData] = useState({ familyMembers: [], geneticConditions: [] });
  const [socialHistoryData, setSocialHistoryData] = useState(null);

  // Fetch allergies, family history, and social history data
  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
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

      try {
        // Fetch insurance information
        const insuranceRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/insurance/${patientId}`);
        if (insuranceRes.ok) {
          const insuranceJson = await insuranceRes.json();
          if (insuranceJson.insurance) {
            setInsuranceDataLoaded({
              insurance: insuranceJson.insurance,
              id: insuranceJson.patient_id
            });
          }
        }
      } catch (error) {
        console.error('Error fetching insurance data:', error);
      }

      try {
        // Fetch allergies
        const allergiesRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/allergies/${patientId}`);
        if (allergiesRes.ok) {
          const allergiesJson = await allergiesRes.json();
          if (allergiesJson.success) {
            setAllergiesData(allergiesJson.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching allergies:', error);
      }

      try {
        // Fetch family history
        const familyHistoryRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/family-history/${patientId}`);
        if (familyHistoryRes.ok) {
          const familyHistoryJson = await familyHistoryRes.json();
          if (familyHistoryJson.success) {
            setFamilyHistoryData(familyHistoryJson.data || { familyMembers: [], geneticConditions: [] });
          }
        }
      } catch (error) {
        console.error('Error fetching family history:', error);
      }

      try {
        // Fetch social history - tobacco smoking
        const tobaccoSmokingRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/tobacco-smoking`);
        const tobaccoConsumptionRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/tobacco-consumption`);
        const alcoholRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/alcohol`);
        const socialTextRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/social-text`);
        const financialRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/financial-resources`);
        const educationRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/education`);
        const physicalActivityRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/physical-activity`);
        const stressRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/stress`);
        const socialIsolationRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/social-isolation`);
        const exposureToViolenceRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/exposure-to-violence`);
        const genderIdentityRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/gender-identity`);
        const sexualOrientationRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/sexual-orientation`);
        const nutrientsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/nutrients-history`);

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
    };

    fetchData();
  }, [patientId]);

  const handleNext = () => {
    navigate('/dashboard/consent');
  };

  const handleEditDemographics = () => {
    navigate('/dashboard/patient-demographics');
  };

  const handleEditContact = () => {
    navigate('/dashboard/contact-information');
  };

  const handleEditInsurance = () => {
    navigate('/dashboard/insurance-information');
  };

  const handleEditAllergies = () => {
    navigate('/dashboard/allergies');
  };

  const handleEditFamilyHistory = () => {
    navigate('/dashboard/family-history');
  };

  const handleEditSocialHistory = () => {
    navigate('/dashboard/social-history');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="preview-container">
      <header className="fixed-header">
        <h1 className="header-title"></h1>
      </header>

      <h2>Review Your Info</h2>

      {/* Demographics Section */}
      {(patientDataLoaded && Object.keys(patientDataLoaded).length > 0) || (patientData && Object.keys(patientData).length > 0) ? (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Demographics</h3>
            <button onClick={handleEditDemographics} className="edit-button">Edit</button>
          </div>
          {(() => {
            const data = patientDataLoaded || patientData;
            // Map nested schema data to flat structure if needed
            const firstName = data.name?.first || data.firstName;
            const middleName = data.name?.middle || data.middleName;
            const lastName = data.name?.last || data.lastName;
            const dob = data.date_of_birth || data.dob;
            const gender = data.gender;
            const bloodGroup = data.blood_group || data.bloodGroup;
            const occupation = data.occupation;
            const aadharNumber = data.aadhaar || data.aadharNumber;
            const panNumber = data.pan || data.panNumber;
            
            // Handle address - can be nested or flat
            const address1 = data.address?.street || data.address1 || '';
            const address2 = data.address?.city || data.address2 || '';
            const city = data.address?.city || data.city || '';
            const postalCode = data.address?.postal_code || data.postalCode || '';
            const district = data.address?.district || data.district || '';
            const state = data.address?.state || data.state || '';
            const country = data.address?.country || data.country || '';

            return (
              <>
                <p>
                  <strong>Name:</strong>{' '}
                  {[
                    firstName,
                    middleName,
                    lastName
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </p>
                {dob && <p><strong>DOB:</strong> {dob}</p>}
                {gender && <p><strong>Gender:</strong> {gender}</p>}
                {(address1 || city) && (
                  <p>
                    <strong>Address:</strong>{' '}
                    {[
                      address1,
                      city,
                      district,
                      state,
                      country,
                      postalCode
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                {bloodGroup && <p><strong>Blood Group:</strong> {bloodGroup}</p>}
                {occupation && <p><strong>Occupation:</strong> {occupation}</p>}
                {aadharNumber && <p><strong>Aadhar No.:</strong> {aadharNumber}</p>}
                {panNumber && <p><strong>PAN No.:</strong> {panNumber}</p>}
              </>
            );
          })()}
        </section>
      ) : null}

      {/* Contact Section */}
      {(contactDataLoaded && Object.keys(contactDataLoaded).length > 0) || (contactData && Object.keys(contactData).length > 0) ? (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Contact</h3>
            <button onClick={handleEditContact} className="edit-button">Edit</button>
          </div>
          {(() => {
            const data = contactDataLoaded || contactData;
            // Map nested schema data to flat structure
            const mobilePhone = data.contact_info?.mobile ? `${data.contact_info.mobile.code || ''} ${data.contact_info.mobile.number || ''}`.trim() : data.mobilePhone;
            const homePhone = data.contact_info?.home_phone ? `${data.contact_info.home_phone.code || ''} ${data.contact_info.home_phone.number || ''}`.trim() : data.homePhone;
            const workPhone = data.contact_info?.work_phone ? `${data.contact_info.work_phone.code || ''} ${data.contact_info.work_phone.number || ''}`.trim() : data.workPhone;
            const email = data.contact_info?.email || data.email;
            
            // Emergency contact (array in schema)
            const emergencyContact = data.contact_info?.emergency_contact?.[0] || data.emergencyContact;
            const emergencyFirstName = emergencyContact?.name?.first || data.emergencyFirstName;
            const emergencyMiddleName = emergencyContact?.name?.middle || data.emergencyMiddleName;
            const emergencyLastName = emergencyContact?.name?.last || data.emergencyLastName;
            const emergencyRelationship = emergencyContact?.relationship || data.emergencyRelationship;
            const emergencyPhone = emergencyContact?.phone ? `${emergencyContact.phone.code || ''} ${emergencyContact.phone.number || ''}`.trim() : data.emergencyPhone;
            const emergencyEmail = emergencyContact?.email || data.emergencyEmail;

            return (
              <>
                {mobilePhone && <p><strong>Mobile:</strong> {mobilePhone}</p>}
                {homePhone && <p><strong>Home:</strong> {homePhone}</p>}
                {workPhone && <p><strong>Work:</strong> {workPhone}</p>}
                {email && <p><strong>Email:</strong> {email}</p>}
                {(emergencyFirstName || emergencyLastName) && (
                  <p>
                    <strong>Emergency Contact:</strong>{' '}
                    {[
                      emergencyFirstName,
                      emergencyMiddleName,
                      emergencyLastName
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                )}
                {emergencyRelationship && (
                  <p><strong>Relationship:</strong> {emergencyRelationship}</p>
                )}
                {emergencyPhone && <p><strong>Phone:</strong> {emergencyPhone}</p>}
                {emergencyEmail && <p><strong>Email:</strong> {emergencyEmail}</p>}
              </>
            );
          })()}
        </section>
      ) : null}

      {/* Insurance Section */}
      {(insuranceDataLoaded && Object.keys(insuranceDataLoaded).length > 0) || (insuranceData && Object.keys(insuranceData).length > 0) ? (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Insurance Information</h3>
            <button onClick={handleEditInsurance} className="edit-button">Edit</button>
          </div>
          {(() => {
            const data = insuranceDataLoaded || insuranceData;
            // Map nested schema data to flat structure
            const primaryCompanyName = data.insurance?.primary?.company_name || data.primaryCompanyName;
            const primaryPolicyNumber = data.insurance?.primary?.policy_number || data.primaryPolicyNumber;
            const primaryGroupNumber = data.insurance?.primary?.group_number || data.primaryGroupNumber;
            const primaryPlanType = data.insurance?.primary?.plan_type || data.primaryPlanType;
            const primaryStartDate = data.insurance?.primary?.effective_start || data.primaryStartDate;
            const primaryEndDate = data.insurance?.primary?.effective_end || data.primaryEndDate;
            
            const secondaryCompanyName = data.insurance?.secondary?.company_name || data.secondaryCompanyName;
            const secondaryPolicyNumber = data.insurance?.secondary?.policy_number || data.secondaryPolicyNumber;
            const secondaryGroupNumber = data.insurance?.secondary?.group_number || data.secondaryGroupNumber;
            const secondaryPlanType = data.insurance?.secondary?.plan_type || data.secondaryPlanType;
            const secondaryStartDate = data.insurance?.secondary?.effective_start || data.secondaryStartDate;
            const secondaryEndDate = data.insurance?.secondary?.effective_end || data.secondaryEndDate;
            
            const contactNumber = data.insurance?.insurance_contact_number || data.contactNumber;

            return (
              <>
                <div>
                  <h4>Primary Insurance</h4>
                  {primaryCompanyName && <p><strong>Insurance Company Name:</strong> {primaryCompanyName}</p>}
                  {primaryPolicyNumber && <p><strong>Policy Number:</strong> {primaryPolicyNumber}</p>}
                  {primaryGroupNumber && <p><strong>Group Number:</strong> {primaryGroupNumber}</p>}
                  {primaryPlanType && <p><strong>Plan Type:</strong> {primaryPlanType}</p>}
                  <p>
                    <strong>Insurance Effective Dates:</strong>{' '}
                    {primaryStartDate && primaryEndDate
                      ? `${primaryStartDate} - ${primaryEndDate}`
                      : 'N/A'}
                  </p>
                </div>

                {(secondaryCompanyName || secondaryPolicyNumber) && (
                  <div>
                    <h4>Secondary Insurance</h4>
                    {secondaryCompanyName && <p><strong>Insurance Company Name:</strong> {secondaryCompanyName}</p>}
                    {secondaryPolicyNumber && <p><strong>Policy Number:</strong> {secondaryPolicyNumber}</p>}
                    {secondaryGroupNumber && <p><strong>Group Number:</strong> {secondaryGroupNumber}</p>}
                    {secondaryPlanType && <p><strong>Plan Type:</strong> {secondaryPlanType}</p>}
                    <p>
                      <strong>Insurance Effective Dates:</strong>{' '}
                      {secondaryStartDate && secondaryEndDate
                        ? `${secondaryStartDate} - ${secondaryEndDate}`
                        : 'N/A'}
                    </p>
                  </div>
                )}

                <div>
                  <h4>Contact Information</h4>
                  {contactNumber && <p><strong>Contact Number:</strong> {contactNumber}</p>}
                </div>
              </>
            );
          })()}
        </section>
      ) : null}

      {/* Allergies Section */}
      {allergiesData?.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Allergies</h3>
            <button onClick={handleEditAllergies} className="edit-button">Edit</button>
          </div>
          {allergiesData.map((allergy, index) => (
            <div key={index} >
              <h4>Allergy {index + 1}</h4>
              {allergy.allergen && <p><strong>Allergen:</strong> {allergy.allergen}</p>}
              {allergy.category && <p><strong>Category:</strong> {allergy.category}</p>}
              {allergy.reaction && <p><strong>Reaction:</strong> {allergy.reaction}</p>}
              {allergy.severity && <p><strong>Severity:</strong> {allergy.severity}</p>}
              {allergy.status && <p><strong>Status:</strong> {allergy.status}</p>}
              {allergy.code && <p><strong>Code:</strong> {allergy.code}</p>}
              {index < allergiesData.length - 1 && <hr />}
            </div>
          ))}
        </section>
      )}

      {/* Family History Section */}
      {(familyHistoryData?.familyMembers?.length > 0 || familyHistoryData?.geneticConditions?.length > 0) && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Family History</h3>
            <button onClick={handleEditFamilyHistory} className="edit-button">Edit</button>
          </div>
          
          {/* Family Members */}
          {familyHistoryData?.familyMembers?.length > 0 && (
            <div>
              <h4>Family Members</h4>
              {familyHistoryData.familyMembers.map((member, index) => (
                <div key={index}>
                  <h5>{member.firstName} {member.lastName}</h5>
                  <p><strong>Relationship:</strong> {member.relationship}</p>
                  {member.dob && <p><strong>Date of Birth:</strong> {member.dob}</p>}
                  {member.gender && <p><strong>Gender:</strong> {member.gender}</p>}
                  <p><strong>Deceased:</strong> {member.deceased ? 'Yes' : 'No'}</p>
                  {member.medicalConditions && member.medicalConditions.length > 0 && (
                    <p><strong>Medical Conditions:</strong> {member.medicalConditions.join(', ')}</p>
                  )}
                  {index < familyHistoryData.familyMembers.length - 1 && <hr />}
                </div>
              ))}
            </div>
          )}

          {/* Genetic Conditions */}
          {familyHistoryData?.geneticConditions?.length > 0 && (
            <div>
              <h4>Genetic Conditions</h4>
              {familyHistoryData.geneticConditions.map((condition, index) => (
                <div key={index}>
                  {condition.conditionName && <p><strong>Condition:</strong> {condition.conditionName}</p>}
                  {condition.affectedMember && <p><strong>Affected Family Member:</strong> {condition.affectedMember}</p>}
                  {condition.testResults && <p><strong>Test Results:</strong> {condition.testResults}</p>}
                  {index < familyHistoryData.geneticConditions.length - 1 && <hr />}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Social History Section */}
      {socialHistoryData && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Social History</h3>
            <button onClick={handleEditSocialHistory} className="edit-button">Edit</button>
          </div>
          
          {/* Tobacco Smoking */}
          {socialHistoryData.tobaccoSmoking && (
            <div>
              <h4>Tobacco Smoking</h4>
              {socialHistoryData.tobaccoSmoking.current_status && <p><strong>Status:</strong> {socialHistoryData.tobaccoSmoking.current_status}</p>}
              {socialHistoryData.tobaccoSmoking.average_daily_consumption && <p><strong>Daily Consumption:</strong> {socialHistoryData.tobaccoSmoking.average_daily_consumption} cigarettes/day</p>}
              {socialHistoryData.tobaccoSmoking.duration_of_use && <p><strong>Duration:</strong> {socialHistoryData.tobaccoSmoking.duration_of_use} {socialHistoryData.tobaccoSmoking.duration_unit}</p>}
              {socialHistoryData.tobaccoSmoking.quit_date && <p><strong>Quit Date:</strong> {socialHistoryData.tobaccoSmoking.quit_date}</p>}
              {socialHistoryData.tobaccoSmoking.notes && <p><strong>Notes:</strong> {socialHistoryData.tobaccoSmoking.notes}</p>}
            </div>
          )}

          {/* Alcohol Use */}
          {socialHistoryData.alcohol && (
            <div>
              <h4>Alcohol Use</h4>
              {socialHistoryData.alcohol.current_status && <p><strong>Status:</strong> {socialHistoryData.alcohol.current_status}</p>}
              {socialHistoryData.alcohol.average_weekly_consumption && <p><strong>Weekly Consumption:</strong> {socialHistoryData.alcohol.average_weekly_consumption} drinks/week</p>}
              {socialHistoryData.alcohol.type_of_alcohol && <p><strong>Type:</strong> {socialHistoryData.alcohol.type_of_alcohol}</p>}
              {socialHistoryData.alcohol.period_of_use && <p><strong>Period of Use:</strong> {socialHistoryData.alcohol.period_of_use}</p>}
              {socialHistoryData.alcohol.notes && <p><strong>Notes:</strong> {socialHistoryData.alcohol.notes}</p>}
            </div>
          )}

          {/* Social Text */}
          {socialHistoryData.socialText?.notes && (
            <div>
              <h4>Additional Notes</h4>
              <p>{socialHistoryData.socialText.notes}</p>
            </div>
          )}

          {/* Financial Resources */}
          {socialHistoryData.financial && (
            <div>
              <h4>Financial Resources</h4>
              {socialHistoryData.financial.income_level && <p><strong>Income Level:</strong> {socialHistoryData.financial.income_level}</p>}
              {socialHistoryData.financial.employment_status && <p><strong>Employment Status:</strong> {socialHistoryData.financial.employment_status}</p>}
              {socialHistoryData.financial.financial_support && <p><strong>Financial Support:</strong> {socialHistoryData.financial.financial_support}</p>}
              {socialHistoryData.financial.notes && <p><strong>Notes:</strong> {socialHistoryData.financial.notes}</p>}
            </div>
          )}

          {/* Education */}
          {socialHistoryData.education?.highest_level_of_education && (
            <div>
              <h4>Education</h4>
              <p><strong>Highest Level:</strong> {socialHistoryData.education.highest_level_of_education}</p>
              {socialHistoryData.education.notes && <p><strong>Notes:</strong> {socialHistoryData.education.notes}</p>}
            </div>
          )}

          {/* Physical Activity */}
          {socialHistoryData.physicalActivity && (
            <div>
              <h4>Physical Activity</h4>
              {socialHistoryData.physicalActivity.frequency && <p><strong>Frequency:</strong> {socialHistoryData.physicalActivity.frequency}</p>}
              {socialHistoryData.physicalActivity.type_of_exercise && <p><strong>Type:</strong> {socialHistoryData.physicalActivity.type_of_exercise}</p>}
              {socialHistoryData.physicalActivity.duration && <p><strong>Duration:</strong> {socialHistoryData.physicalActivity.duration} {socialHistoryData.physicalActivity.duration_unit}</p>}
              {socialHistoryData.physicalActivity.consistency && <p><strong>Consistency:</strong> {socialHistoryData.physicalActivity.consistency}</p>}
              {socialHistoryData.physicalActivity.notes && <p><strong>Notes:</strong> {socialHistoryData.physicalActivity.notes}</p>}
            </div>
          )}

          {/* Stress */}
          {socialHistoryData.stress && (
            <div>
              <h4>Stress</h4>
              {socialHistoryData.stress.perceived_stress_level && <p><strong>Stress Level:</strong> {socialHistoryData.stress.perceived_stress_level}</p>}
              {socialHistoryData.stress.major_stressors && <p><strong>Major Stressors:</strong> {socialHistoryData.stress.major_stressors}</p>}
              {socialHistoryData.stress.coping_mechanisms && <p><strong>Coping Mechanisms:</strong> {socialHistoryData.stress.coping_mechanisms}</p>}
              {socialHistoryData.stress.notes && <p><strong>Notes:</strong> {socialHistoryData.stress.notes}</p>}
            </div>
          )}

          {/* Social Isolation */}
          {socialHistoryData.socialIsolation && (
            <div>
              <h4>Social Isolation & Connection</h4>
              {socialHistoryData.socialIsolation.isolation_status && <p><strong>Isolation Status:</strong> {socialHistoryData.socialIsolation.isolation_status}</p>}
              {socialHistoryData.socialIsolation.social_support && <p><strong>Social Support:</strong> {socialHistoryData.socialIsolation.social_support}</p>}
              {socialHistoryData.socialIsolation.frequency_of_social_interactions && <p><strong>Frequency of Interactions:</strong> {socialHistoryData.socialIsolation.frequency_of_social_interactions}</p>}
              {socialHistoryData.socialIsolation.notes && <p><strong>Notes:</strong> {socialHistoryData.socialIsolation.notes}</p>}
            </div>
          )}

          {/* Exposure to Violence */}
          {socialHistoryData.exposureToViolence && (
            <div>
              <h4>Exposure to Violence</h4>
              {socialHistoryData.exposureToViolence.type_of_violence && <p><strong>Type of Violence:</strong> {socialHistoryData.exposureToViolence.type_of_violence}</p>}
              {socialHistoryData.exposureToViolence.date_of_last_exposure && <p><strong>Last Exposure:</strong> {socialHistoryData.exposureToViolence.date_of_last_exposure}</p>}
              {socialHistoryData.exposureToViolence.support_or_intervention_received && <p><strong>Support Received:</strong> {socialHistoryData.exposureToViolence.support_or_intervention_received}</p>}
              {socialHistoryData.exposureToViolence.notes && <p><strong>Notes:</strong> {socialHistoryData.exposureToViolence.notes}</p>}
            </div>
          )}

          {/* Gender Identity */}
          {socialHistoryData.genderIdentity?.gender_identity && (
            <div>
              <h4>Gender Identity</h4>
              <p><strong>Identity:</strong> {socialHistoryData.genderIdentity.gender_identity}</p>
              {socialHistoryData.genderIdentity.notes && <p><strong>Notes:</strong> {socialHistoryData.genderIdentity.notes}</p>}
            </div>
          )}

          {/* Sexual Orientation */}
          {socialHistoryData.sexualOrientation?.sexual_orientation && (
            <div>
              <h4>Sexual Orientation</h4>
              <p><strong>Orientation:</strong> {socialHistoryData.sexualOrientation.sexual_orientation}</p>
              {socialHistoryData.sexualOrientation.notes && <p><strong>Notes:</strong> {socialHistoryData.sexualOrientation.notes}</p>}
            </div>
          )}

          {/* Nutrients History */}
          {socialHistoryData.nutrients && (
            <div>
              <h4>Nutrients History</h4>
              {socialHistoryData.nutrients.dietary_preferences && <p><strong>Dietary Preferences:</strong> {socialHistoryData.nutrients.dietary_preferences}</p>}
              {socialHistoryData.nutrients.supplement_usage && <p><strong>Supplement Usage:</strong> {socialHistoryData.nutrients.supplement_usage}</p>}
              {socialHistoryData.nutrients.notes && <p><strong>Notes:</strong> {socialHistoryData.nutrients.notes}</p>}
            </div>
          )}
        </section>
      )}

      {/* No Data Message */}
      {!(
        (patientDataLoaded && Object.keys(patientDataLoaded).length > 0) ||
        (patientData && Object.keys(patientData).length > 0) ||
        (contactDataLoaded && Object.keys(contactDataLoaded).length > 0) ||
        (contactData && Object.keys(contactData).length > 0) ||
        (insuranceDataLoaded && Object.keys(insuranceDataLoaded).length > 0) ||
        (insuranceData && Object.keys(insuranceData).length > 0) ||
        (allergiesData?.length > 0) ||
        (familyHistoryData?.familyMembers?.length > 0 || familyHistoryData?.geneticConditions?.length > 0) ||
        (socialHistoryData && Object.keys(socialHistoryData).some(key => socialHistoryData[key]))
      ) && (
        <p>No data yet. Fill in the forms to preview.</p>
      )}

      {/* Next Button */}
      <div className="preview-footer">
        <button onClick={handleNext} className="preview-next-button">
          Next →
        </button>
      </div>
    </div>
  );
}
