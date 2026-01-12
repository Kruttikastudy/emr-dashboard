import express from 'express';
import mongoose from 'mongoose';
import Visit from '../models/visits.js';
import Patient from '../models/patients.js';

const router = express.Router();

// Create a new visit
// REPLACE your POST /visits route with this improved version

router.post('/visits', async (req, res) => {
  try {
    const {
      visit_type,
      patient_id,
      patient_name,
      chief_complaints,
      vitals,
      notes,
      investigation_request,
      investigation_result,
      diagnosis,
      treatment,
      medication_history,
      seen_by,
      appointment_date,
      billing,
      status
    } = req.body;

    // Validate required fields
    if (!visit_type || !patient_name) {
      return res.status(400).json({
        success: false,
        message: 'Visit type and patient name are required'
      });
    }

    // Generate a new patient_id if not provided
    const finalPatientId = patient_id || new mongoose.Types.ObjectId();

    // Process medications if provided
    let formattedMedications = [];
    if (medication_history && Array.isArray(medication_history)) {
      formattedMedications = medication_history
        .filter(med => {
          const hasProblem = med.problem && med.problem.trim();
          const hasMedicine = med.medicine && med.medicine.trim();
          const hasDosage = med.dosage;
          return hasProblem || hasMedicine || hasDosage;
        })
        .map(med => ({
          problem: med.problem?.trim() || '',
          medicine: med.medicine?.trim() || '',
          dosage: med.dosage ? parseFloat(med.dosage) : 0,
          dose_time: med.dose_time?.trim() || '',
          frequency: med.frequency?.trim() || '',
          duration: med.duration?.trim() || '',
          status: med.status || 'Inactive'
        }))
        .filter(med => med.problem && med.medicine && med.dosage > 0);
    }

    // Create visit object - use fields directly from request
    const visitData = {
      visit_type,
      patient_name,
      patient_id: finalPatientId,
      chief_complaints: chief_complaints || '',
      vitals: vitals || {
        height: null,
        weight: null,
        blood_pressure: null,
        pulse: null,
        respiratory_rate: null,
        oxygen_saturation: null,
        temperature: null
      },
      investigation_request: investigation_request || null,
      investigation_result: investigation_result || null,
      diagnosis: diagnosis || {
        icd10_quickest: null,
        full_icd10_list: null
      },
      treatment: treatment || null,
      medication_history: formattedMedications,
      seen_by: seen_by || null,
      appointment_date: appointment_date || null,
      billing: {
        total_cost: billing?.total_cost || 0,
        amount_paid: billing?.amount_paid || 0,
        balance_amount: billing?.balance_amount || 0
      },
      notes: notes || null,
      status: status || 'pending'
    };

    // Create new visit
    const newVisit = new Visit(visitData);
    const savedVisit = await newVisit.save();

    res.status(201).json({
      success: true,
      message: 'Visit created successfully',
      data: savedVisit,
      visitId: savedVisit._id,
      patientId: finalPatientId,
      medicationCount: formattedMedications.length
    });

  } catch (error) {
    console.error('Error creating visit:', error);

    // Log detailed validation error information for MongoDB schema validation
    if (error.code === 121) {
      console.error('MongoDB Validation Error Details:');
      console.error('Error Info:', JSON.stringify(error.errInfo, null, 2));

      return res.status(400).json({
        success: false,
        message: 'Document validation failed',
        error: error.errmsg,
        details: error.errInfo
      });
    }

    // Better error handling
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating visit',
      error: error.message
    });
  }
});

// Get all visits
router.get('/visits', async (req, res) => {
  try {
    const { patientId, patientName, visitType, startDate, endDate } = req.query;

    let query = {};

    // Filter by patient ID
    if (patientId) {
      query.patient_id = patientId;
    }

    // Filter by patient name
    if (patientName) {
      query.patient_name = { $regex: patientName, $options: 'i' };
    }

    // Filter by visit type
    if (visitType) {
      query.visit_type = visitType;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const visits = await Visit.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits
    });

  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visits',
      error: error.message
    });
  }
});

// Get single visit by ID
router.get('/visits/:id', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: visit
    });

  } catch (error) {
    console.error('Error fetching visit:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visit',
      error: error.message
    });
  }
});

// Update visit
router.put('/visits/:id', async (req, res) => {
  try {
    const {
      visitType,
      patientName,
      chiefComplaints,
      height,
      weight,
      bloodPressure,
      pulse,
      respiratoryRate,
      oxygenSaturation,
      temperature,
      notes,
      investigationRequest,
      investigationResult,
      icdQuickest,
      icdFull,
      treatment,
      seenBy,
      followUpDate,
      totalCost,
      amountPaid,
      balanceAmount
    } = req.body;

    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Update fields
    if (visitType) visit.visit_type = visitType;
    if (patientName) visit.patient_name = patientName;
    if (chiefComplaints) visit.chief_complaints = chiefComplaints;

    // Update vitals
    if (height !== undefined) visit.vitals.height = height ? parseFloat(height) : null;
    if (weight !== undefined) visit.vitals.weight = weight ? parseFloat(weight) : null;
    if (bloodPressure !== undefined) visit.vitals.blood_pressure = bloodPressure || null;
    if (pulse !== undefined) visit.vitals.pulse = pulse ? parseInt(pulse) : null;
    if (respiratoryRate !== undefined) visit.vitals.respiratory_rate = respiratoryRate ? parseInt(respiratoryRate) : null;
    if (oxygenSaturation !== undefined) visit.vitals.oxygen_saturation = oxygenSaturation ? parseFloat(oxygenSaturation) : null;
    if (temperature !== undefined) visit.vitals.temperature = temperature ? parseFloat(temperature) : null;

    // Update other fields
    if (investigationRequest !== undefined) visit.investigation_request = investigationRequest || null;
    if (investigationResult !== undefined) visit.investigation_result = investigationResult || null;
    if (icdQuickest !== undefined) visit.diagnosis.icd10_quickest = icdQuickest || null;
    if (icdFull !== undefined) visit.diagnosis.full_icd10_list = icdFull || null;
    if (treatment !== undefined) visit.treatment = treatment || null;
    if (seenBy !== undefined) visit.seen_by = seenBy || null;
    if (followUpDate !== undefined) visit.appointment_date = followUpDate ? formatDateToMMDDYYYY(followUpDate) : null;
    if (notes !== undefined) visit.notes = notes || null;

    // Update billing
    if (totalCost !== undefined) visit.billing.total_cost = totalCost ? parseFloat(totalCost) : null;
    if (amountPaid !== undefined) visit.billing.amount_paid = amountPaid ? parseFloat(amountPaid) : null;
    if (balanceAmount !== undefined) visit.billing.balance_amount = balanceAmount ? parseFloat(balanceAmount) : null;

    const updatedVisit = await visit.save();

    res.status(200).json({
      success: true,
      message: 'Visit updated successfully',
      data: updatedVisit
    });

  } catch (error) {
    console.error('Error updating visit:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating visit',
      error: error.message
    });
  }
});

// Delete visit
router.delete('/visits/:id', async (req, res) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Visit deleted successfully',
      data: visit
    });

  } catch (error) {
    console.error('Error deleting visit:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting visit',
      error: error.message
    });
  }
});

// Get visits by patient ID
router.get('/patients/:patientId/visits', async (req, res) => {
  try {
    const visits = await Visit.find({ patient_id: req.params.patientId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits
    });

  } catch (error) {
    console.error('Error fetching patient visits:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient visits',
      error: error.message
    });
  }
});

// Get visit statistics
router.get('/visits/stats/overview', async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();
    const visitsByType = await Visit.aggregate([
      {
        $group: {
          _id: '$visit_type',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentVisits = await Visit.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalVisits,
        visitsByType,
        recentVisits
      }
    });

  } catch (error) {
    console.error('Error fetching visit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visit statistics',
      error: error.message
    });
  }
});

// Add these routes to your visitsRoutes.js file

// ============ MEDICATION HISTORY ROUTES ============

// Add medication to a visit
router.post('/visits/:visitId/medications', async (req, res) => {
  try {
    const { visitId } = req.params;
    const medications = req.body.medications; // Array of medication objects

    // Validate visit exists
    const visit = await Visit.findById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Validate medications array
    if (!Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Medications array is required and cannot be empty'
      });
    }

    // Transform and validate each medication
    const formattedMedications = medications.map(med => {
      // Skip empty rows
      if (!med.problem?.trim() && !med.medicine?.trim() && !med.mg?.trim()) {
        return null;
      }

      // Validate required fields
      if (!med.problem || !med.medicine || !med.mg) {
        throw new Error('Problem, medicine, and dosage are required for each medication');
      }

      return {
        problem: med.problem.trim(),
        medicine: med.medicine.trim(),
        dosage: parseFloat(med.mg),
        dose_time: med.doseTime || '',
        frequency: med.frequency || '',
        duration: med.timePeriod || '',
        status: med.status ? 'Active' : 'Inactive'
      };
    }).filter(med => med !== null); // Remove null entries

    // Add medications to visit
    visit.medication_history = formattedMedications;
    const updatedVisit = await visit.save();

    res.status(200).json({
      success: true,
      message: 'Medications added successfully',
      data: updatedVisit
    });

  } catch (error) {
    console.error('Error adding medications:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding medications',
      error: error.message
    });
  }
});

// Get all medications for a visit
router.get('/visits/:visitId/medications', async (req, res) => {
  try {
    const { visitId } = req.params;

    const visit = await Visit.findById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    res.status(200).json({
      success: true,
      count: visit.medication_history?.length || 0,
      data: visit.medication_history || []
    });

  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medications',
      error: error.message
    });
  }
});

// Update a specific medication in a visit
router.put('/visits/:visitId/medications/:medicationId', async (req, res) => {
  try {
    const { visitId, medicationId } = req.params;
    const medicationUpdate = req.body;

    const visit = await Visit.findById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Find medication by _id in the array
    const medication = visit.medication_history.id(medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    // Update fields
    if (medicationUpdate.problem) medication.problem = medicationUpdate.problem;
    if (medicationUpdate.medicine) medication.medicine = medicationUpdate.medicine;
    if (medicationUpdate.mg) medication.dosage = parseFloat(medicationUpdate.mg);
    if (medicationUpdate.doseTime) medication.dose_time = medicationUpdate.doseTime;
    if (medicationUpdate.frequency) medication.frequency = medicationUpdate.frequency;
    if (medicationUpdate.timePeriod) medication.duration = medicationUpdate.timePeriod;
    if (medicationUpdate.status !== undefined) {
      medication.status = medicationUpdate.status ? 'Active' : 'Inactive';
    }

    const updatedVisit = await visit.save();

    res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      data: updatedVisit
    });

  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medication',
      error: error.message
    });
  }
});

// Delete a specific medication from a visit
router.delete('/visits/:visitId/medications/:medicationId', async (req, res) => {
  try {
    const { visitId, medicationId } = req.params;

    const visit = await Visit.findById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Remove medication by _id
    const medication = visit.medication_history.id(medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    medication.remove();
    const updatedVisit = await visit.save();

    res.status(200).json({
      success: true,
      message: 'Medication deleted successfully',
      data: updatedVisit
    });

  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting medication',
      error: error.message
    });
  }
});

// Get active medications for a visit
router.get('/visits/:visitId/medications/active', async (req, res) => {
  try {
    const { visitId } = req.params;

    const visit = await Visit.findById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    const activeMedications = visit.medication_history?.filter(
      med => med.status === 'Active'
    ) || [];

    res.status(200).json({
      success: true,
      count: activeMedications.length,
      data: activeMedications
    });

  } catch (error) {
    console.error('Error fetching active medications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active medications',
      error: error.message
    });
  }
});

// Get all medications for a patient (across all visits)
router.get('/patients/:patientId/medications', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query; // Optional: filter by status (Active/Inactive)

    const visits = await Visit.find({ patient_id: patientId });

    let allMedications = [];
    visits.forEach(visit => {
      if (visit.medication_history && visit.medication_history.length > 0) {
        visit.medication_history.forEach(med => {
          allMedications.push({
            ...med.toObject(),
            visitId: visit._id,
            visitDate: visit.createdAt,
            visitType: visit.visit_type
          });
        });
      }
    });

    // Filter by status if provided
    if (status) {
      allMedications = allMedications.filter(med => med.status === status);
    }

    // Sort by visit date (most recent first)
    allMedications.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

    res.status(200).json({
      success: true,
      count: allMedications.length,
      data: allMedications
    });

  } catch (error) {
    console.error('Error fetching patient medications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient medications',
      error: error.message
    });
  }
});

// Update medication status (toggle Active/Inactive)
router.patch('/visits/:visitId/medications/:medicationId/status', async (req, res) => {
  try {
    const { visitId, medicationId } = req.params;
    const { status } = req.body; // Expected: true for Active, false for Inactive

    const visit = await Visit.findById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    const medication = visit.medication_history.id(medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    medication.status = status ? 'Active' : 'Inactive';
    const updatedVisit = await visit.save();

    res.status(200).json({
      success: true,
      message: 'Medication status updated successfully',
      data: {
        medicationId: medication._id,
        status: medication.status
      }
    });

  } catch (error) {
    console.error('Error updating medication status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medication status',
      error: error.message
    });
  }
});


// Helper function to format date
function formatDateToMMDDYYYY(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

export default router;
