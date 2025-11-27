import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SocialHistoryPreview.css";

const SocialHistoryPreview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const patientId = typeof window !== 'undefined' ? localStorage.getItem("currentPatientId") : null;
  
  // Extract all data with null fallbacks
  const {
    tobaccoUse = null,
    tobaccoConsumption = null,
    alcoholUse = null,
    socialText = null,
    financialResources = null,
    education = null,
    physicalActivity = null,
    stress = null,
    socialIsolation = null,
    exposureToViolence = null,
    genderIdentity = null,
    sexualOrientation = null,
    nutrientsHistory = null,
    // Add other sections as needed
  } = state?.socialHistoryData || {};

  const [loadedData, setLoadedData] = useState({
    tobaccoUse,
    tobaccoConsumption,
    alcoholUse,
    socialText,
    financialResources,
    education,
    physicalActivity,
    stress,
    socialIsolation,
    exposureToViolence,
    genderIdentity,
    sexualOrientation,
    nutrientsHistory,
  });

  useEffect(() => {
    if (!patientId) return;

    const safeJson = async (res) => {
      try { return await res.json(); } catch { return null; }
    };

    const fetchSection = async (path, mapFn) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/social-history/${patientId}/${path}`);
        if (!res.ok) return null;
        const body = await safeJson(res);
        if (!body || !body.success || !body.data) return null;
        return mapFn(body.data);
      } catch {
        return null;
      }
    };

    const loaders = [
      fetchSection('tobacco-smoking', (d) => ({
        status: d.current_status ?? d.status ?? null,
        dailyConsumption: d.average_daily_consumption ?? d.dailyConsumption ?? null,
        duration: d.duration_of_use ?? d.duration ?? null,
        durationUnit: d.duration_unit ?? d.durationUnit ?? null,
        quitDate: d.quit_date ?? d.quitDate ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'tobaccoUse', value: v })),

      fetchSection('tobacco-consumption', (d) => ({
        status: d.current_status ?? d.status ?? null,
        dailyConsumption: d.average_daily_consumption ?? d.dailyConsumption ?? null,
        duration: d.duration_of_use ?? d.duration ?? null,
        durationUnit: d.duration_unit ?? d.durationUnit ?? null,
        quitDate: d.quit_date ?? d.quitDate ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'tobaccoConsumption', value: v })),

      fetchSection('alcohol', (d) => ({
        status: d.current_status ?? null,
        weeklyConsumption: d.average_weekly_consumption ?? null,
        alcoholType: d.type_of_alcohol ?? null,
        period: d.period_of_use ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'alcoholUse', value: v })),

      fetchSection('social-text', (d) => ({
        notes: d.notes ?? null,
      })).then(v => ({ key: 'socialText', value: v })),

      fetchSection('financial-resources', (d) => ({
        incomeLevel: d.income_level ?? d.incomeLevel ?? null,
        employmentStatus: d.employment_status ?? d.employmentStatus ?? null,
        financialSupport: d.financial_support ?? d.financialSupport ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'financialResources', value: v })),

      fetchSection('education', (d) => ({
        highestEducation: d.highest_level_of_education ?? d.highestEducation ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'education', value: v })),

      fetchSection('physical-activity', (d) => ({
        frequency: d.frequency ?? null,
        type: d.type_of_exercise ?? d.type ?? null,
        duration: d.duration ?? null,
        durationUnit: d.duration_unit ?? null,
        consistency: d.consistency ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'physicalActivity', value: v })),

      fetchSection('stress', (d) => ({
        stressLevel: d.perceived_stress_level ?? d.stressLevel ?? null,
        stressors: d.major_stressors ?? d.stressors ?? null,
        coping: d.coping_mechanisms ?? d.coping ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'stress', value: v })),

      fetchSection('social-isolation', (d) => ({
        isolationStatus: d.isolation_status ?? d.isolationStatus ?? null,
        socialSupport: d.social_support ?? d.socialSupport ?? null,
        interactions: d.frequency_of_social_interactions ?? d.interactions ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'socialIsolation', value: v })),

      fetchSection('exposure-to-violence', (d) => ({
        typeOfViolence: d.type_of_violence ?? d.typeOfViolence ?? null,
        lastExposure: d.date_of_last_exposure ?? d.lastExposure ?? null,
        supportReceived: d.support_or_intervention_received ?? d.supportReceived ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'exposureToViolence', value: v })),

      fetchSection('gender-identity', (d) => ({
        identity: d.gender_identity ?? d.identity ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'genderIdentity', value: v })),

      fetchSection('sexual-orientation', (d) => ({
        orientation: d.sexual_orientation ?? d.orientation ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'sexualOrientation', value: v })),

      fetchSection('nutrients-history', (d) => ({
        dietaryPreferences: d.dietary_preferences ?? d.dietaryPreferences ?? null,
        supplementUsage: d.supplement_usage ?? d.supplementUsage ?? null,
        notes: d.notes ?? null,
      })).then(v => ({ key: 'nutrientsHistory', value: v })),
    ];

    Promise.all(loaders).then((pairs) => {
      setLoadedData((prev) => {
        const updated = { ...prev };
        for (const p of pairs) {
          if (p && p.value) updated[p.key] = p.value;
        }
        return updated;
      });
    });
  }, [patientId]);

  const handleBack = () => navigate(-1);
  const handleNext = () => navigate('/dashboard/preview');

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="social-history-preview-container">
      <div className="preview-header">
        <header className="fixed-header">
          <h1 className="header-title"></h1>
        </header>
        <h2>Social History Preview</h2>
        <button onClick={handleBack} className="back-button">
          ← Back to Edit
        </button>
      </div>

      <div className="preview-sections">
        {/* Tobacco Use Section */}
        <section className="preview-section">
          <h3>Tobacco Use (Smoking)</h3>
          <div className="preview-grid">
            <div className="preview-item">
              <strong>Status:</strong> {loadedData.tobaccoUse?.status || "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Daily Consumption:</strong> 
              {loadedData.tobaccoUse?.dailyConsumption ? `${loadedData.tobaccoUse.dailyConsumption} cigarettes/day` : "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Duration:</strong> 
              {loadedData.tobaccoUse?.duration ? `${loadedData.tobaccoUse.duration} ${loadedData.tobaccoUse.durationUnit || "years"}` : "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Quit Date:</strong> {loadedData.tobaccoUse?.quitDate ? formatDate(loadedData.tobaccoUse.quitDate) : "Not specified"}
            </div>
            <div className="preview-item notes">
              <strong>Notes:</strong> {loadedData.tobaccoUse?.notes || "No notes provided"}
            </div>
          </div>
        </section>

        {/* Tobacco Consumption Section */}
        <section className="preview-section">
          <h3>Tobacco Consumption</h3>
          <div className="preview-grid">
            <div className="preview-item">
              <strong>Status:</strong> {loadedData.tobaccoConsumption?.status || "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Daily Consumption:</strong> 
              {loadedData.tobaccoConsumption?.dailyConsumption ? `${loadedData.tobaccoConsumption.dailyConsumption} units/day` : "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Duration:</strong> 
              {loadedData.tobaccoConsumption?.duration ? `${loadedData.tobaccoConsumption.duration} ${loadedData.tobaccoConsumption.durationUnit || "years"}` : "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Quit Date:</strong> {loadedData.tobaccoConsumption?.quitDate ? formatDate(loadedData.tobaccoConsumption.quitDate) : "Not specified"}
            </div>
            <div className="preview-item notes">
              <strong>Notes:</strong> {loadedData.tobaccoConsumption?.notes || "No notes provided"}
            </div>
          </div>
        </section>

        {/* Alcohol Use Section */}
        <section className="preview-section">
          <h3>Alcohol Use</h3>
          <div className="preview-grid">
            <div className="preview-item">
              <strong>Status:</strong> {loadedData.alcoholUse?.status || "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Weekly Consumption:</strong> 
              {loadedData.alcoholUse?.weeklyConsumption ? `${loadedData.alcoholUse.weeklyConsumption} drinks/week` : "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Preferred Type:</strong> {loadedData.alcoholUse?.alcoholType || "Not specified"}
            </div>
            <div className="preview-item">
              <strong>Period of Use:</strong> {loadedData.alcoholUse?.period || "Not specified"}
            </div>
            <div className="preview-item notes">
              <strong>Notes:</strong> {loadedData.alcoholUse?.notes || "No notes provided"}
            </div>
          </div>
        </section>

        {/* Social Text Section */}
        <section className="preview-section">
          <h3>Social History (free text)</h3>
          {loadedData.socialText?.notes ? (
            <div className="preview-text-content">
              <p>{loadedData.socialText.notes}</p>
            </div>
          ) : (
            <p className="no-data">No additional notes provided</p>
          )}
        </section>

        {/* Financial Resources Section */}
        <section className="preview-section">
          <h3>Financial Resources</h3>
          {loadedData.financialResources ? (
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Income Level:</strong> {loadedData.financialResources.incomeLevel || "Not specified"}
              </div>
              <div className="preview-item">
                <strong>Employment Status:</strong> {loadedData.financialResources.employmentStatus || "Not specified"}
              </div>
              <div className="preview-item">
                <strong>Financial Support:</strong> {loadedData.financialResources.financialSupport || "Not specified"}
              </div>
              {loadedData.financialResources.notes && (
                <div className="preview-item notes">
                  <strong>Notes:</strong> {loadedData.financialResources.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">No financial resources information provided</p>
          )}
        </section>

        {/* Education */}
        <section className="preview-section">
            <h3>Education</h3>
            {loadedData.education ? (
              <div className="preview-grid">
                <div className="preview-item">
                  <strong>Highest Education:</strong> {loadedData.education.highestEducation || "Not specified"}
                </div>
                {loadedData.education.notes && (
                  <div className="preview-item notes">
                    <strong>Notes:</strong> {loadedData.education.notes}
                  </div>
                )}
              </div>
            ) : (
              <p className="no-data">No education information provided</p>
            )}
          </section>

        {/* Physical Activity Section */}
        <section className="preview-section">
          <h3>Physical Activity</h3>
          {loadedData.physicalActivity ? (
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Frequency:</strong> {loadedData.physicalActivity.frequency || "Not specified"}
              </div>
              <div className="preview-item">
                <strong>Type:</strong> {loadedData.physicalActivity.type || "Not specified"}
              </div>
              <div className="preview-item">
                <strong>Duration:</strong> {loadedData.physicalActivity.duration ? `${loadedData.physicalActivity.duration} ${loadedData.physicalActivity.durationUnit}` : "Not specified"}
              </div>
              <div className="preview-item">
                <strong>Consistency:</strong> {loadedData.physicalActivity.consistency || "Not specified"}
              </div>
              {loadedData.physicalActivity.notes && (
                <div className="preview-item notes">
                  <strong>Notes:</strong> {loadedData.physicalActivity.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">No physical activity information provided</p>
          )}
        </section>
        {/* Stress */}
        <section className="preview-section">
          <h3>Stress</h3>
          {loadedData.stress ? (
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Stress Level:</strong> {loadedData.stress.stressLevel || "Not specified"}
              </div>
              {loadedData.stress.stressors && (
                <div className="preview-item">
                  <strong>Major Stressors:</strong> {loadedData.stress.stressors}
                </div>
              )}
              {loadedData.stress.coping && (
                <div className="preview-item">
                  <strong>Coping Mechanisms:</strong> {loadedData.stress.coping}
                </div>
              )}
              {loadedData.stress.notes && (
                <div className="preview-item notes">
                  <strong>Notes:</strong> {loadedData.stress.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">No stress information provided</p>
          )}
        </section>
        {/* Social Isolation */}
        <section className="preview-section">
          <h3>Social Isolation & Connection</h3>
          {loadedData.socialIsolation ? (
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Isolation Status:</strong> {loadedData.socialIsolation.isolationStatus || "Not specified"}
              </div>
              <div className="preview-item">
                <strong>Social Support:</strong> {loadedData.socialIsolation.socialSupport || "Not specified"}
              </div>
              {loadedData.socialIsolation.interactions && (
                <div className="preview-item">
                  <strong>Social Interactions:</strong> {loadedData.socialIsolation.interactions}
                </div>
              )}
              {loadedData.socialIsolation.notes && (
                <div className="preview-item notes">
                  <strong>Notes:</strong> {loadedData.socialIsolation.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">No social isolation information provided</p>
          )}
        </section>
        {/* Exposure To Violence */}
        <section className="preview-section">
          <h3>Exposure to Violence</h3>       
          {loadedData.exposureToViolence ? (
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Type of Violence:</strong> {loadedData.exposureToViolence.typeOfViolence || "Not specified"}
              </div>
              {loadedData.exposureToViolence.lastExposure && (
                <div className="preview-item">
                  <strong>Last Exposure:</strong> {new Date(loadedData.exposureToViolence.lastExposure).toLocaleDateString()}
                </div>
              )}
              {loadedData.exposureToViolence.supportReceived && (
                <div className="preview-item">
                  <strong>Support Received:</strong> {loadedData.exposureToViolence.supportReceived}
                </div>
              )}
              {loadedData.exposureToViolence.notes && (
                <div className="preview-item notes">
                  <strong>Notes:</strong> {loadedData.exposureToViolence.notes}
               </div>
              )}
            </div>
          ) : (
            <p className="no-data">No violence exposure information provided</p>
          )}
        </section>
        {/* Gender Identity */}
       <section className="preview-section">
        <h3>Gender Identity</h3>
        {loadedData.genderIdentity ? (
          <div className="preview-grid">
            <div className="preview-item">
              <strong>Identity:</strong> {loadedData.genderIdentity.identity || "Not specified"}
            </div>
            {loadedData.genderIdentity.notes && (
              <div className="preview-item notes">
                <strong>Notes:</strong> {loadedData.genderIdentity.notes}
              </div>
            )}
          </div>
        ) : (
          <p className="no-data">No gender identity information provided</p>
        )}
      </section>
        
        {/* Sexual Orientation */}
        <section className="preview-section">
          <h3>Sexual Orientation</h3>
          {loadedData.sexualOrientation ? (
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Orientation:</strong> {loadedData.sexualOrientation.orientation || "Not specified"}
              </div>
              {loadedData.sexualOrientation.notes && (
                <div className="preview-item notes">
                  <strong>Notes:</strong> {loadedData.sexualOrientation.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">No sexual orientation information provided</p>
          )}
        </section>
        {/* Nutrient History */}
        <section className="preview-section">
          <h3>Nutrients History</h3>
          {loadedData.nutrientsHistory ? (
            <div className="preview-grid">
              {loadedData.nutrientsHistory.dietaryPreferences && (
                <div className="preview-item">
                  <strong>Dietary Preferences:</strong> {loadedData.nutrientsHistory.dietaryPreferences}
                </div>
              )}
              <div className="preview-item">
                <strong>Supplement Usage:</strong> {loadedData.nutrientsHistory.supplementUsage || "Not specified"}
              </div>
              {loadedData.nutrientsHistory.notes && (
                <div className="preview-item notes">
                  <strong>Notes:</strong> {loadedData.nutrientsHistory.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="no-data">No nutrients history information provided</p>
          )}
       </section>
      </div>

      {/* Next Button */}
      <div className="preview-footer">
        <button onClick={handleNext} className="next-button">
          Next →
        </button>
      </div>
    </div>
  );        
};

export default SocialHistoryPreview;