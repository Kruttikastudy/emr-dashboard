import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSocialHistory } from "./SocialHistoryContext";
import "./SocialHistory.css";
import TobaccoUse from "./TobaccoUse.jsx";
import TobaccoConsumption from "./TobaccoConsumption.jsx";
import AlcoholUse from "./AlcoholUse.jsx";
import FinancialResources from "./FinancialResources.jsx";
import PhysicalActivity from "./PhysicalActivity.jsx";
import GenderIdentity from "./GenderIdentity.jsx";
import SocialText from "./SocialText.jsx";
import SexualOrientation from "./SexualOrientation.jsx";
import Stress from "./Stress.jsx";
import SocialIsolation from "./SocialIsolation.jsx";
import ExposureToViolence from "./ExposureToViolence.jsx";
import NutrientsHistory from "./NutrientsHistory.jsx";
import Education from "./Education.jsx";

const SocialHistory = () => {
  const fields = [
    "Tobacco use (Smoking)",
    "Tobacco (consumption)",
    "Alcohol use",
    "Social History (free text)",
    "Financial Resources",
    "Education",
    "Physical activity",
    "Stress",
    "Social isolation & connection",
    "Exposure to violence",
    "Gender identity",
    "Sexual orientation",
    "Nutrients History",
  ];

  const [toggles, setToggles] = useState(
    fields.reduce((acc, field) => {
      acc[field] = false;
      return acc;
    }, {})
  );

  const navigate = useNavigate();
  const { socialHistoryData } = useSocialHistory();

  const handleToggle = (field) => {
    setToggles((prev) => {
      // Create a new object with all toggles set to false
      const newToggles = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});

      // Set the clicked toggle to the opposite of its current value
      newToggles[field] = !prev[field];

      return newToggles;
    });
  };

  // Function to close any panel by turning off its toggle
  const handleClosePanel = (fieldName) => {
    setToggles((prev) => ({ ...prev, [fieldName]: false }));
  };

  const handleNext = () => {
    navigate('/dashboard/social-history-preview', {
      state: { socialHistoryData }
    });
  };

  return (
    <div className="social-history-container">
      <header className="fixed-header">
        <h1 className="header-title"></h1>
      </header>
      <h2>Social History</h2>

      <div className="toggle-list">
        {fields.map((field) => (
          <div className="toggle-row" key={field}>
            <label>{field}</label>
            <div
              className={`toggle-switch ${toggles[field] ? "on" : "off"}`}
              onClick={() => handleToggle(field)}
            >
              <div className={`toggle-slider ${toggles[field] ? "on" : "off"}`}>
                {toggles[field] ? "ON" : "OFF"}
              </div>
            </div>
          </div>
        ))}
      </div>
      {Object.entries(toggles).some(([_, val]) => val) && (
        <div className="modal-overlay">
          <div className="modal-content">
            {toggles["Tobacco use (Smoking)"] && (
              <TobaccoUse onClose={() => handleClosePanel("Tobacco use (Smoking)")} />
            )}
            {toggles["Tobacco (consumption)"] && (
              <TobaccoConsumption onClose={() => handleClosePanel("Tobacco (consumption)")} />
            )}
            {toggles["Alcohol use"] && (
              <AlcoholUse onClose={() => handleClosePanel("Alcohol use")} />
            )}
            {toggles["Social History (free text)"] && (
              <SocialText onClose={() => handleClosePanel("Social History (free text)")} />
            )}
            {toggles["Financial Resources"] && (
              <FinancialResources onClose={() => handleClosePanel("Financial Resources")} />
            )}
            {toggles["Physical activity"] && (
              <PhysicalActivity onClose={() => handleClosePanel("Physical activity")} />
            )}
            {toggles["Gender identity"] && (
              <GenderIdentity onClose={() => handleClosePanel("Gender identity")} />
            )}
            {toggles["Sexual orientation"] && (
              <SexualOrientation onClose={() => handleClosePanel("Sexual orientation")} />
            )}
            {toggles["Stress"] && (
              <Stress onClose={() => handleClosePanel("Stress")} />
            )}
            {toggles["Social isolation & connection"] && (
              <SocialIsolation onClose={() => handleClosePanel("Social isolation & connection")} />
            )}
            {toggles["Exposure to violence"] && (
              <ExposureToViolence onClose={() => handleClosePanel("Exposure to violence")} />
            )}
            {toggles["Nutrients History"] && (
              <NutrientsHistory onClose={() => handleClosePanel("Nutrients History")} />
            )}
            {toggles["Education"] && (
              <Education onClose={() => handleClosePanel("Education")} />
            )}
          </div>
        </div>
      )}

      <div className="social-history-buttons">
        <button
          className="next-btn"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SocialHistory;