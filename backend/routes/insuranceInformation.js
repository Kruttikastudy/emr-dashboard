import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Patient from '../models/patients.js';
import mongoose from 'mongoose';

const router = express.Router();

// Configure multer for insurance card image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/insurance-cards';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'insurance-card-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG) and PDFs are allowed!'));
    }
  }
});

// Helper function to format date from YYYY-MM-DD to MM-DD-YYYY
const formatDateToSchema = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  return `${month}-${day}-${year}`;
};

// POST - Create or update insurance information for a patient
router.post('/', async (req, res) => {
  try {
    const {
      patient_id,
      primaryCompanyName,
      primaryPolicyNumber,
      primaryGroupNumber,
      primaryPlanType,
      primaryStartDate,
      primaryEndDate,
      secondaryCompanyName,
      secondaryPolicyNumber,
      secondaryGroupNumber,
      secondaryPlanType,
      secondaryStartDate,
      secondaryEndDate,
      contactNumber
    } = req.body;

    // Validate required fields
    if (!patient_id) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    if (!primaryCompanyName || !primaryPolicyNumber || !primaryPlanType || !contactNumber) {
      return res.status(400).json({
        error: 'Primary insurance company name, policy number, plan type, and contact number are required'
      });
    }

    // Find patient first to check if insurance card exists
    const patient = await Patient.findById(patient_id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Build insurance object according to schema
    const insuranceData = {
      primary: {
        company_name: primaryCompanyName,
        policy_number: primaryPolicyNumber,
        group_number: primaryGroupNumber || '',
        plan_type: primaryPlanType,
        effective_start: formatDateToSchema(primaryStartDate),
        effective_end: formatDateToSchema(primaryEndDate)
      },
      insurance_contact_number: contactNumber
    };

    // Only include insurance_card_img if it exists in the patient record
    // Otherwise, don't include it at all (this prevents the required validation error)
    if (patient.insurance?.insurance_card_img?.file_id) {
      insuranceData.insurance_card_img = patient.insurance.insurance_card_img;
    }

    if (patient.insurance?.uploaded_files) {
      insuranceData.uploaded_files = patient.insurance.uploaded_files;
    }

    // Add secondary insurance if provided
    if (secondaryCompanyName || secondaryPolicyNumber) {
      insuranceData.secondary = {
        company_name: secondaryCompanyName || '',
        policy_number: secondaryPolicyNumber || '',
        group_number: secondaryGroupNumber || '',
        plan_type: secondaryPlanType || '',
        effective_start: formatDateToSchema(secondaryStartDate),
        effective_end: formatDateToSchema(secondaryEndDate)
      };
    }

    // Update patient insurance information
    patient.insurance = insuranceData;
    await patient.save();

    res.status(200).json({
      message: 'Insurance information saved successfully',
      patient_id: patient._id,
      insurance: patient.insurance
    });

  } catch (error) {
    console.error('Error saving insurance information:', error);
    res.status(500).json({
      error: 'Failed to save insurance information',
      details: error.message
    });
  }
});

// GET - Retrieve insurance information for a patient
router.get('/:patient_id', async (req, res) => {
  try {
    const { patient_id } = req.params;

    const patient = await Patient.findById(patient_id).select('insurance');

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (!patient.insurance) {
      return res.status(404).json({ error: 'No insurance information found for this patient' });
    }

    res.status(200).json({
      patient_id: patient._id,
      insurance: patient.insurance
    });

  } catch (error) {
    console.error('Error fetching insurance information:', error);
    res.status(500).json({
      error: 'Failed to fetch insurance information',
      details: error.message
    });
  }
});

// PUT - Update insurance information for a patient
router.put('/:patient_id', async (req, res) => {
  try {
    const { patient_id } = req.params;
    const {
      primaryCompanyName,
      primaryPolicyNumber,
      primaryGroupNumber,
      primaryPlanType,
      primaryStartDate,
      primaryEndDate,
      secondaryCompanyName,
      secondaryPolicyNumber,
      secondaryGroupNumber,
      secondaryPlanType,
      secondaryStartDate,
      secondaryEndDate,
      contactNumber
    } = req.body;

    const patient = await Patient.findById(patient_id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Build updated insurance object
    const insuranceData = {
      primary: {
        company_name: primaryCompanyName,
        policy_number: primaryPolicyNumber,
        group_number: primaryGroupNumber || '',
        plan_type: primaryPlanType,
        effective_start: formatDateToSchema(primaryStartDate),
        effective_end: formatDateToSchema(primaryEndDate)
      },
      insurance_contact_number: contactNumber
    };

    if (patient.insurance?.insurance_card_img?.file_id) {
      insuranceData.insurance_card_img = patient.insurance.insurance_card_img;
    }

    if (patient.insurance?.uploaded_files) {
      insuranceData.uploaded_files = patient.insurance.uploaded_files;
    }

    // Add secondary insurance if provided
    if (secondaryCompanyName || secondaryPolicyNumber) {
      insuranceData.secondary = {
        company_name: secondaryCompanyName || '',
        policy_number: secondaryPolicyNumber || '',
        group_number: secondaryGroupNumber || '',
        plan_type: secondaryPlanType || '',
        effective_start: formatDateToSchema(secondaryStartDate),
        effective_end: formatDateToSchema(secondaryEndDate)
      };
    }

    patient.insurance = insuranceData;
    await patient.save();

    res.status(200).json({
      message: 'Insurance information updated successfully',
      patient_id: patient._id,
      insurance: patient.insurance
    });

  } catch (error) {
    console.error('Error updating insurance information:', error);
    res.status(500).json({
      error: 'Failed to update insurance information',
      details: error.message
    });
  }
});

// POST - Upload insurance card image(s)
router.post('/:patient_id/upload-card', upload.array('insuranceCards', 5), async (req, res) => {
  try {
    const { patient_id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const patient = await Patient.findById(patient_id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create a placeholder ObjectId for the file
    // In production, you should create a File document in a separate collection
    const fileId = new mongoose.Types.ObjectId();
    // Initialize insurance if it doesn't exist
    if (!patient.insurance) {
      return res.status(400).json({
        error: 'Please create insurance information before uploading card images'
      });
    }

    // Update insurance card image info
    patient.insurance.insurance_card_img = { file_id: fileId };

    // Save the actual filenames to the uploaded_files array
    const newFiles = req.files.map(file => file.filename);
    patient.insurance.uploaded_files = [
      ...(patient.insurance.uploaded_files || []),
      ...newFiles
    ];

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Insurance card image(s) uploaded successfully',
      file_id: fileId,
      files: newFiles
    });

  } catch (error) {
    console.error('Error uploading insurance card:', error);
    res.status(500).json({
      error: 'Failed to upload insurance card',
      details: error.message
    });
  }
});

// DELETE - Remove insurance information for a patient
router.delete('/:patient_id', async (req, res) => {
  try {
    const { patient_id } = req.params;

    const patient = await Patient.findById(patient_id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    patient.insurance = undefined;
    await patient.save();

    res.status(200).json({
      message: 'Insurance information deleted successfully',
      patient_id: patient._id
    });

  } catch (error) {
    console.error('Error deleting insurance information:', error);
    res.status(500).json({
      error: 'Failed to delete insurance information',
      details: error.message
    });
  }
});

export default router;