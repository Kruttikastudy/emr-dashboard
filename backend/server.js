// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import patientDemographicsRoutes from "./routes/patientDemographics.js";
import contactInformationRoutes from "./routes/contactInformation.js";
import insuranceInformationRoutes from "./routes/insuranceInformation.js"
import allergiesRoutes from "./routes/allergies.js"
import familyhistoryRoutes from "./routes/familyHistory.js"
import socialHistoryRoutes from "./routes/socialHistory.js";
import visitRoutes from './routes/visitRoutes.js';
import appointmentRoutes from './routes/appointments.js';
import dashboardRoutes from './routes/DashboardRoutes.js';
import icdRoutes from './routes/icdRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for uploaded images)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/patient-demographics', patientDemographicsRoutes);
app.use('/api/contact-information', contactInformationRoutes);
app.use('/api/insurance', insuranceInformationRoutes);
app.use('/api/allergies', allergiesRoutes);
app.use('/api/family-history', familyhistoryRoutes);
app.use('/api/social-history', socialHistoryRoutes);
app.use('/api', visitRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/icd', icdRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "EMR Server is running",
    endpoints: {
      patientDemographics: "/api/patient-demographics",
      contactInformation: "/api/contact-information",
      medicalHistory: "/api/medical-history",
      socialHistory: "/api/social-history"
    }
  });
});

// Start server and connect to DB
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB, server not started:', err);
    process.exit(1);
  });
