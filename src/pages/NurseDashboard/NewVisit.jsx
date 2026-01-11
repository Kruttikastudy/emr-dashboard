import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './NewVisit.css';
import logo from "../../assets/logo.jpg";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const emptyMedRow = () => ({
  problem: "",
  medicine: "",
  mg: "",
  doseTime: "",
  frequency: "",
  timePeriod: "",
  status: false
});

const NewVisit = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentVisitId, setCurrentVisitId] = useState(null);
  const [medications, setMedications] = useState([emptyMedRow()]);
  const [formData, setFormData] = useState({
    visitType: location.state?.visitType || 'Emergency Visit',
    patientId: '',
    patientName: '',
    chiefComplaints: '',
    height: '',
    weight: '',
    bloodPressure: '',
    pulse: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    temperature: '',
    notes: '',
    investigationRequest: '',
    investigationResult: '',
    icdQuickest: '',
    icdFull: '',
    treatment: '',
    seenBy: 'Dr. Smith',
    sendFollowUp: '',
    followUpDate: '',
    totalCost: '',
    amountPaid: '',
    balanceAmount: '',
    status: 'pending'
  });

  const visitTypes = [
    'Emergency Visit', 'Regular Checkup', 'Follow-up', 'Consultation',
    'Physical Exam', 'Vaccination', 'Lab Results Review', 'Urgent Care',
    'Specialist Referral', 'Other'
  ];

  const doctors = [
    'Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'
  ];

  // Fetch visits on component mount
  useEffect(() => {
    fetchVisits();
  }, []);

  // Handle incoming visit data from dashboard
  useEffect(() => {
    if (location.state?.visitData && location.state?.isEditing) {
      const visit = location.state.visitData;
      loadVisitData(visit);
    }
  }, [location.state]);

  const fetchVisits = async () => {
    try {
      const response = await axios.get('/api/visits');
      if (response.data.success) {
        setVisits(response.data.data || response.data);
      } else if (Array.isArray(response.data)) {
        setVisits(response.data);
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      setVisits([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Load visit data into form
  const loadVisitData = (visit) => {
    setCurrentVisitId(visit._id);

    // Load basic form data
    setFormData({
      visitType: visit.visit_type || 'Emergency Visit',
      patientId: visit.patient_id || '',
      patientName: visit.patient_name || '',
      chiefComplaints: visit.chief_complaints || '',
      height: visit.vitals?.height || '',
      weight: visit.vitals?.weight || '',
      bloodPressure: visit.vitals?.blood_pressure || '',
      pulse: visit.vitals?.pulse || '',
      respiratoryRate: visit.vitals?.respiratory_rate || '',
      oxygenSaturation: visit.vitals?.oxygen_saturation || '',
      temperature: visit.vitals?.temperature || '',
      notes: visit.notes || '',
      investigationRequest: visit.investigation_request || '',
      investigationResult: visit.investigation_result || '',
      icdQuickest: visit.diagnosis?.icd10_quickest || '',
      icdFull: visit.diagnosis?.full_icd10_list || '',
      treatment: visit.treatment || '',
      seenBy: visit.seen_by || 'Dr. Smith',
      followUpDate: visit.appointment_date || '',
      totalCost: visit.billing?.total_cost || '',
      amountPaid: visit.billing?.amount_paid || '',
      balanceAmount: visit.billing?.balance_amount || '',
      status: visit.status || 'pending'
    });

    // Load medications
    if (visit.medication_history && visit.medication_history.length > 0) {
      const loadedMeds = visit.medication_history.map(med => ({
        problem: med.problem || '',
        medicine: med.medicine || '',
        mg: med.dosage || '',
        doseTime: med.dose_time || '',
        frequency: med.frequency || '',
        timePeriod: med.duration || '',
        status: med.status === 'Active'
      }));
      setMedications(loadedMeds);
    } else {
      setMedications([emptyMedRow()]);
    }

    // Reset to first step
    setCurrentStep(1);
  };

  // Medication handlers
  const handleMedChange = (index, field, value) => {
    setMedications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const toggleMedStatus = (index) => {
    setMedications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status: !copy[index].status };
      return copy;
    });
  };

  const addMedRow = () => setMedications((prev) => [...prev, emptyMedRow()]);

  const removeMedRow = (index) =>
    setMedications((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.patientName || !formData.patientId) {
        alert('Please fill in Patient Name and Patient ID');
        return;
      }
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAddPatient = () => {
    // Clear currentPatientId to ensure we're creating a new patient
    localStorage.removeItem('currentPatientId');
    navigate('/dashboard/patient-demographics');
  };

  const handleNewVisit = () => {
    // Reset form for new visit
    setCurrentVisitId(null);
    setFormData({
      visitType: 'Emergency Visit',
      patientId: '',
      patientName: '',
      chiefComplaints: '',
      height: '',
      weight: '',
      bloodPressure: '',
      pulse: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      temperature: '',
      notes: '',
      investigationRequest: '',
      investigationResult: '',
      icdQuickest: '',
      icdFull: '',
      treatment: '',
      seenBy: 'Dr. Smith',
      sendFollowUp: '',
      followUpDate: '',
      totalCost: '',
      amountPaid: '',
      balanceAmount: '',
      status: 'pending'
    });
    setMedications([emptyMedRow()]);
    setCurrentStep(1);
  };

  const isFormMinimal = () => {
    return formData.patientName && formData.patientId &&
      !formData.chiefComplaints &&
      !formData.height &&
      !formData.weight &&
      !formData.bloodPressure &&
      !formData.investigationRequest &&
      !formData.treatment &&
      medications.every(m => !m.problem && !m.medicine && !m.mg);
  };

  const handleSubmit = async (status = 'saved') => {
    if (!formData.patientName || !formData.patientId) {
      alert('Patient Name and Patient ID are required');
      return;
    }

    setLoading(true);

    try {
      let visitStatus = status === 'complete' ? 'complete' : 'saved';

      if (isFormMinimal() && status !== 'complete') {
        visitStatus = 'pending';
      }

      const visitData = {
        visit_type: formData.visitType, patient_id: formData.patientId,
        patient_name: formData.patientName,
        chief_complaints: formData.chiefComplaints,
        vitals: {
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          blood_pressure: formData.bloodPressure || null,
          pulse: formData.pulse ? parseInt(formData.pulse) : null,
          respiratory_rate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
          oxygen_saturation: formData.oxygenSaturation ? parseFloat(formData.oxygenSaturation) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null
        },
        notes: formData.notes || null,
        investigation_request: formData.investigationRequest || null,
        investigation_result: formData.investigationResult || null,
        diagnosis: {
          icd10_quickest: formData.icdQuickest || null,
          full_icd10_list: formData.icdFull || null
        },
        treatment: formData.treatment || null,
        medication_history: medications
          .filter(m => m.problem?.trim() || m.medicine?.trim() || m.mg?.trim())
          .map(m => ({
            problem: m.problem || null,
            medicine: m.medicine || null,
            dosage: m.mg ? parseFloat(m.mg) : null,
            dose_time: m.doseTime || null,
            frequency: m.frequency || null,
            duration: m.timePeriod || null,
            status: m.status ? 'Active' : 'Inactive'
          })),
        seen_by: formData.seenBy || null,
        appointment_date: formData.followUpDate || null,
        billing: {
          total_cost: formData.totalCost || null,
          amount_paid: formData.amountPaid || null,
          balance_amount: displayBalance || formData.balanceAmount || null
        },
        status: visitStatus
      };

      let response;
      if (currentVisitId) {
        // Update existing visit
        response = await axios.put(`/api/visits/${currentVisitId}`, visitData);
        alert('Visit updated successfully!');
      } else {
        // Create new visit
        response = await axios.post('/api/visits', visitData);
        const statusMessage = visitStatus === 'pending'
          ? 'saved as pending (incomplete information)'
          : visitStatus === 'complete'
            ? 'saved and marked complete'
            : 'saved';
        alert(`Visit ${statusMessage} successfully!`);
      }

      if (response.data.success) {
        // Refresh visits list
        fetchVisits();

        // Reset form
        handleNewVisit();
      }
    } catch (error) {
      console.error('Error saving visit:', error);
      alert(error.response?.data?.message || 'Error saving visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const computedBalance = useMemo(() => {
    const total = parseFloat(formData.totalCost || 0) || 0;
    const paid = parseFloat(formData.amountPaid || 0) || 0;
    const bal = total - paid;
    return Number.isNaN(bal) ? '' : bal.toFixed(2);
  }, [formData.totalCost, formData.amountPaid]);

  const displayBalance = formData.balanceAmount === '' ? computedBalance : formData.balanceAmount;

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

  // Filter visits based on search term
  const filteredVisits = visits.filter(visit => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = visit.patient_name?.toLowerCase() || '';
    const visitId = visit._id?.slice(-6).toLowerCase() || '';
    return patientName.includes(searchLower) || visitId.includes(searchLower);
  });

  return (
    <div className="new-visit">
      <div className="visit-header" />

      <div className="visit-layout">
        <aside className="nv-sidebar">
          <div className="nv-sidebar-header">
            <Link to="/nurse-dashboard" className="nv-logo">
              <img src={logo} alt="Logo" className="nv-logo-image" />
            </Link>
            <button className="add-patient-btn" onClick={handleAddPatient}>
              + Add New Patient
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search Visits"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="patient-list">
            {filteredVisits.map((visit) => {
              const initials = visit.patient_name?.split(' ').map(n => n[0]).join('') || 'NA';
              return (
                <div
                  key={visit._id}
                  className="patient-item"
                  onClick={() => loadVisitData(visit)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="patient-avatar">{initials}</div>
                  <div className="patient-details">
                    <div className="patient-name">{visit.patient_name}</div>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                      ID: {visit.patient_id || visit._id?.slice(-6)}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#999' }}>
                      {visit.createdAt ? formatVisitTime(visit.createdAt) : ''}
                    </div>
                  </div>
                  <div className="patient-arrow">›</div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="main-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title">{currentVisitId ? 'Edit Visit' : 'New Visit'}</h2>
            {currentVisitId && (
              <button
                className="btn-outline"
                onClick={handleNewVisit}
                style={{ padding: '8px 16px' }}
              >
                + New Visit
              </button>
            )}
          </div>

          {/* STEP 1 - PATIENT INFO & VITALS */}
          {currentStep === 1 && (
            <>
              <div className="form-card">
                <div className="form-group">
                  <label>Visit Type <span style={{ color: 'red' }}>*</span></label>
                  <select
                    value={formData.visitType}
                    onChange={(e) => handleInputChange('visitType', e.target.value)}
                  >
                    {visitTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Patient ID <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.patientId}
                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                    placeholder="Enter patient ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Patient Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Chief Complaints</label>
                  <textarea
                    value={formData.chiefComplaints}
                    onChange={(e) => handleInputChange('chiefComplaints', e.target.value)}
                    rows="3"
                    placeholder="Describe the main complaints"
                  />
                </div>

                <div className="form-group">
                  <h3>Vitals</h3>
                  <div className="vitals-grid">
                    <div className="vital-item">
                      <label>Height</label>
                      <div className="input-unit">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.height}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          placeholder="0.0"
                        />
                        <span>ft</span>
                      </div>
                    </div>
                    <div className="vital-item">
                      <label>RR</label>
                      <div className="input-unit">
                        <input
                          type="number"
                          value={formData.respiratoryRate}
                          onChange={(e) => handleInputChange('respiratoryRate', e.target.value)}
                          placeholder="0"
                        />
                        <span>bpm</span>
                      </div>
                    </div>
                    <div className="vital-item">
                      <label>Weight</label>
                      <div className="input-unit">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          placeholder="0.0"
                        />
                        <span>kg</span>
                      </div>
                    </div>
                    <div className="vital-item">
                      <label>Oxygen%</label>
                      <div className="input-unit">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.oxygenSaturation}
                          onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
                          placeholder="0.0"
                        />
                        <span>%</span>
                      </div>
                    </div>
                    <div className="vital-item">
                      <label>Blood pressure</label>
                      <input
                        type="text"
                        value={formData.bloodPressure}
                        onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                        placeholder="120/80"
                      />
                    </div>
                    <div className="vital-item">
                      <label>Temperature</label>
                      <div className="input-unit">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.temperature}
                          onChange={(e) => handleInputChange('temperature', e.target.value)}
                          placeholder="98.6"
                        />
                        <span>F</span>
                      </div>
                    </div>
                    <div className="vital-item">
                      <label>Pulse</label>
                      <div className="input-unit">
                        <input
                          type="number"
                          value={formData.pulse}
                          onChange={(e) => handleInputChange('pulse', e.target.value)}
                          placeholder="0"
                        />
                        <span>bpm</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows="4"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </>
          )}

          {/* STEP 2 - INVESTIGATION & DIAGNOSIS */}
          {currentStep === 2 && (
            <div className="form-card">
              <div className="form-group">
                <label>Investigation Request</label>
                <textarea
                  value={formData.investigationRequest}
                  onChange={(e) => handleInputChange('investigationRequest', e.target.value)}
                  rows="2"
                  placeholder="Enter investigation requests..."
                />
              </div>

              <div className="form-group">
                <label>Investigation Result</label>
                <textarea
                  value={formData.investigationResult}
                  onChange={(e) => handleInputChange('investigationResult', e.target.value)}
                  rows="2"
                  placeholder="Enter investigation results..."
                />
              </div>

              <div className="form-group">
                <h3>Diagnosis</h3>
                <p className="helper-text">Condition</p>
                <input
                  type="text"
                  value={formData.icdQuickest}
                  onChange={(e) => handleInputChange('icdQuickest', e.target.value)}
                  placeholder="Enter ICD-10 code"
                />
                <p className="helper-text">Full ICD-10 List</p>
                <input
                  type="text"
                  value={formData.icdFull}
                  onChange={(e) => handleInputChange('icdFull', e.target.value)}
                  placeholder="Enter full ICD-10 list"
                />
              </div>

              <div className="form-group">
                <label>Treatment</label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => handleInputChange('treatment', e.target.value)}
                  rows="2"
                  placeholder="Enter treatment plan..."
                />
              </div>

              <div className="form-group">
                <label>Seen by</label>
                <select value={formData.seenBy} onChange={(e) => handleInputChange('seenBy', e.target.value)}>
                  {doctors.map(doctor => <option key={doctor} value={doctor}>{doctor}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3 - MEDICATION HISTORY */}
          {currentStep === 3 && (
            <div className="form-card">
              <h3>Medication History</h3>
              <div className="medication-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Problem</th>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Dose Time</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med, index) => (
                      <tr key={index} className={med.status ? 'active-med-row' : ''}>
                        <td>
                          <input
                            type="text"
                            value={med.problem}
                            placeholder="e.g. Hypertension"
                            onChange={(e) => handleMedChange(index, "problem", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={med.medicine}
                            placeholder="e.g. Amlodipine"
                            onChange={(e) => handleMedChange(index, "medicine", e.target.value)}
                          />
                        </td>
                        <td>
                          <div className="dosage-input-wrapper">
                            <input
                              type="text"
                              value={med.mg}
                              placeholder="5"
                              onChange={(e) => handleMedChange(index, "mg", e.target.value)}
                            />
                            <span>mg</span>
                          </div>
                        </td>
                        <td>
                          <select
                            value={med.doseTime}
                            onChange={(e) => handleMedChange(index, "doseTime", e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                            <option value="Night">Night</option>
                            <option value="Before Meals">Before Meals</option>
                            <option value="After Meals">After Meals</option>
                            <option value="With Meals">With Meals</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={med.frequency}
                            onChange={(e) => handleMedChange(index, "frequency", e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="Once daily (OD)">Once daily (OD)</option>
                            <option value="Twice daily (BD)">Twice daily (BD)</option>
                            <option value="Thrice daily (TDS)">Thrice daily (TDS)</option>
                            <option value="Four times daily (QID)">Four times daily (QID)</option>
                            <option value="As needed (PRN)">As needed (PRN)</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={med.timePeriod}
                            onChange={(e) => handleMedChange(index, "timePeriod", e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="1 week">1 week</option>
                            <option value="2 weeks">2 weeks</option>
                            <option value="1 month">1 month</option>
                            <option value="3 months">3 months</option>
                            <option value="6 months">6 months</option>
                            <option value="1 year">1 year</option>
                            <option value="Ongoing">Ongoing</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`med-status-btn ${med.status ? 'active' : 'inactive'}`}
                            onClick={() => toggleMedStatus(index)}
                          >
                            {med.status ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td>
                          <div className="med-action-buttons">
                            <button
                              type="button"
                              className="med-add-btn"
                              onClick={addMedRow}
                            >
                              +
                            </button>
                            {medications.length > 1 && (
                              <button
                                type="button"
                                className="med-remove-btn"
                                onClick={() => removeMedRow(index)}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4 - PAYMENT & COMPLETION */}
          {currentStep === 4 && (
            <div className="form-card">
              <div className="form-group">
                <label>Follow-up Appointment</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Total Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalCost}
                  onChange={(e) => handleInputChange('totalCost', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Amount Paid</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Balance Amount</label>
                <input
                  type="text"
                  value={displayBalance}
                  onChange={(e) => handleInputChange('balanceAmount', e.target.value)}
                  placeholder="Auto-calculated"
                />
              </div>

              <div className="form-actions-row">
                <button
                  className="btn-save"
                  onClick={() => handleSubmit('saved')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : currentVisitId ? 'Update' : 'Save'}
                </button>
                <button
                  className="btn-complete"
                  onClick={() => handleSubmit('complete')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : currentVisitId ? 'Update as Complete' : 'Save as Complete'}
                </button>
              </div>
            </div>
          )}

          <div className="form-nav">
            {currentStep > 1 && <button className="btn-outline" onClick={prevStep}>Previous</button>}
            <div className="spacer" />
            {currentStep < 4 ? <button className="btn-primary" onClick={nextStep}>Next</button> : null}
          </div>

          <div className="step-indicator">
            <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`} />
            <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`} />
            <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`} />
            <div className={`step-dot ${currentStep >= 4 ? 'active' : ''}`} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewVisit;
