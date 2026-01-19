import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import Patient from "../models/patients.js";

const router = express.Router();

// Create uploads directory if it doesn't exist (fallback)
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for GridFS storage
const storage = multer.memoryStorage(); // Store in memory temporarily

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
    }
  },
});

// Helper function to upload file to GridFS
const uploadToGridFS = async (file) => {
  console.log("=== uploadToGridFS called ===");
  console.log("MongoDB connection state:", mongoose.connection.readyState);
  console.log("Database name:", mongoose.connection.db?.databaseName);

  return new Promise((resolve, reject) => {
    try {
      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "patientImages",
      });

      console.log("✓ GridFS bucket created");
      console.log("File to upload:", file.originalname);
      console.log("Buffer size:", file.buffer?.length, "bytes");

      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });

      console.log("✓ Upload stream opened");

      uploadStream.end(file.buffer);

      uploadStream.on("finish", () => {
        console.log("✓ Upload stream finished");
        console.log("Generated file ID:", uploadStream.id);
        resolve(uploadStream.id);
      });

      uploadStream.on("error", (error) => {
        console.error("✗ Upload stream error:", error);
        reject(error);
      });
    } catch (error) {
      console.error("✗ Error in uploadToGridFS:", error);
      reject(error);
    }
  });
};

// Helper function to convert date format from YYYY-MM-DD to MM-DD-YYYY
const convertDateFormat = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}-${day}-${year}`;
};

// POST - Create new patient demographics
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    console.log("=== POST REQUEST RECEIVED ===");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    const {
      firstName,
      middleName,
      lastName,
      dob,
      gender,
      address1,
      address2,
      city,
      postalCode,
      district,
      state,
      country,
      bloodGroup,
      occupation,
      aadharNumber,
      panNumber,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dob || !gender || !bloodGroup || !aadharNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: firstName, lastName, dob, gender, bloodGroup, and aadharNumber are required",
      });
    }

    // Validate address required fields
    if (!city || !postalCode || !district || !state) {
      return res.status(400).json({
        success: false,
        message: "Missing required address fields: city, postalCode, district, and state are required",
      });
    }

    // Map blood group display value to schema enum value
    const bloodGroupMap = {
      "A+": "A Positive (A⁺)",
      "A-": "A Negative (A⁻)",
      "B+": "B Positive (B⁺)",
      "B-": "B Negative (B⁻)",
      "AB+": "AB Positive (AB⁺)",
      "AB-": "AB Negative (AB⁻)",
      "O+": "O Positive (O⁺)",
      "O-": "O Negative (O⁻)",
      "None": "None",
    };

    // Prepare patient data according to schema
    const patientData = {
      name: {
        first: firstName,
        middle: middleName || "",
        last: lastName,
      },
      date_of_birth: convertDateFormat(dob),
      gender: gender,
      blood_group: bloodGroupMap[bloodGroup] || bloodGroup,
      address: {
        street: address1 || "",
        street2: address2 || "",
        city: city,
        postal_code: postalCode,
        district: district,
        state: state,
        country: country || "India",
      },
    };

    // Add optional fields only if they exist
    if (occupation) {
      patientData.occupation = occupation;
    }

    if (aadharNumber) {
      patientData.aadhaar = aadharNumber;
    }

    if (panNumber) {
      patientData.pan = panNumber;
    }

    // Handle photo upload to GridFS
    if (req.file) {
      console.log("=== FILE UPLOAD DETECTED ===");
      console.log("File buffer size:", req.file.buffer?.length);
      console.log("File mimetype:", req.file.mimetype);
      console.log("File originalname:", req.file.originalname);

      try {
        console.log("Attempting to upload to GridFS...");
        const fileId = await uploadToGridFS(req.file);
        console.log("✓ GridFS upload successful! File ID:", fileId);

        patientData.img = {
          file_id: fileId,
        };
        console.log("✓ Image data added to patientData:", patientData.img);
      } catch (uploadError) {
        console.error("✗ Error uploading image to GridFS:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: uploadError.message,
        });
      }
    } else {
      console.log("⚠ No file received in request");
    }

    // Add placeholder data for required fields that aren't in demographics form
    patientData.contact_info = {
      mobile: {
        code: "+91",
        number: "0000000000"
      },
      email: "placeholder@example.com",
      preferred_contact_methods: ["Email"],
      emergency_contact: []
    };

    patientData.insurance = {
      primary: {
        company_name: "Not Provided",
        policy_number: "N/A",
        plan_type: "Other",
      },
      insurance_contact_number: "0000000000",
      insurance_card_img: {
        file_id: new mongoose.Types.ObjectId()
      }
    };

    // Initialize social_history with proper structure
    patientData.social_history = {
      tobacco_smoking: {},
      tobacco_consumption: {},
      alcohol_use: {},
      social_history_free_text: {
        notes: ""
      },
      financial_resources: {},
      education: {},
      physical_activity: {},
      stress: {},
      social_isolation_connection: {},
      exposure_to_violence: {},
      gender_identity: {},
      sexual_orientation: {},
      nutrients_history: {}
    };

    console.log("=== CREATING NEW PATIENT ===");
    console.log("Patient data to save:", JSON.stringify(patientData, null, 2));

    // Create new patient
    const newPatient = new Patient(patientData);
    await newPatient.save();

    console.log("✓ Patient saved successfully!");
    console.log("Saved patient img field:", newPatient.img);

    res.status(201).json({
      success: true,
      message: "Patient demographics saved successfully",
      data: {
        id: newPatient._id,
        name: `${firstName} ${middleName} ${lastName}`.trim(),
        photoFileId: req.file ? newPatient.img.file_id : null,
      },
    });
  } catch (error) {
    console.error("=== ERROR SAVING PATIENT ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A patient with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to save patient demographics",
      error: error.message,
    });
  }
});

// GET - Retrieve all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().select(
      "name date_of_birth gender blood_group contact_info.email"
    );

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
});

// GET - Retrieve single patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
      error: error.message,
    });
  }
});

// GET - Retrieve image file by file_id
router.get("/file/:id", async (req, res) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "patientImages",
    });

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Set appropriate content type
    res.set("Content-Type", files[0].contentType || "image/jpeg");

    // Stream the file
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", (error) => {
      console.error("Error streaming image:", error);
      res.status(404).json({
        success: false,
        message: "Error retrieving image",
      });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch image",
      error: error.message,
    });
  }
});

// PUT - Update patient demographics
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      dob,
      gender,
      address1,
      address2,
      city,
      postalCode,
      district,
      state,
      country,
      bloodGroup,
      occupation,
      aadharNumber,
      panNumber,
    } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Validate required fields
    if (!firstName || !lastName || !dob || !gender || !bloodGroup || !aadharNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: firstName, lastName, dob, gender, bloodGroup, and aadharNumber are required",
      });
    }

    // Map blood group
    const bloodGroupMap = {
      "A+": "A Positive (A⁺)",
      "A-": "A Negative (A⁻)",
      "B+": "B Positive (B⁺)",
      "B-": "B Negative (B⁻)",
      "AB+": "AB Positive (AB⁺)",
      "AB-": "AB Negative (AB⁻)",
      "O+": "O Positive (O⁺)",
      "O-": "O Negative (O⁻)",
      "None": "None",
    };

    // Update fields
    if (firstName) patient.name.first = firstName;
    if (middleName !== undefined) patient.name.middle = middleName;
    if (lastName) patient.name.last = lastName;
    if (dob) patient.date_of_birth = convertDateFormat(dob);
    if (gender) patient.gender = gender;
    if (address1 !== undefined) patient.address.street = address1;
    if (address2 !== undefined) patient.address.street2 = address2;
    if (city) patient.address.city = city;
    if (postalCode) patient.address.postal_code = postalCode;
    if (district) patient.address.district = district;
    if (state) patient.address.state = state;
    if (country) patient.address.country = country;
    if (bloodGroup) patient.blood_group = bloodGroupMap[bloodGroup] || bloodGroup;
    if (occupation) patient.occupation = occupation;
    if (aadharNumber !== undefined) patient.aadhaar = aadharNumber;
    if (panNumber !== undefined) patient.pan = panNumber;

    // Handle photo upload to GridFS
    if (req.file) {
      try {
        const fileId = await uploadToGridFS(req.file);
        patient.img = {
          file_id: fileId,
        };
      } catch (uploadError) {
        console.error("Error uploading image to GridFS:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
          error: uploadError.message,
        });
      }
    }

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Patient demographics updated successfully",
      data: patient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);

    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update patient demographics",
      error: error.message,
    });
  }
});

// DELETE - Delete patient
router.delete("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Delete associated image from GridFS if exists
    if (patient.img && patient.img.file_id) {
      try {
        const bucket = new GridFSBucket(mongoose.connection.db, {
          bucketName: "patientImages",
        });
        await bucket.delete(patient.img.file_id);
      } catch (deleteError) {
        console.error("Error deleting image from GridFS:", deleteError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete patient",
      error: error.message,
    });
  }
});

export default router;