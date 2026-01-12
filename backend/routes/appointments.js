import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/appointments.js';

const router = express.Router();

// Create a new appointment
router.post('/appointments', async (req, res) => {
  try {
    console.log('Received appointment data:', req.body);
    const {
      firstName,
      middleName,
      lastName,
      age,
      contactInfo,
      date,
      time,
      appointmentType,
      reason,
      urgencyDropdown,
      doctor,
      comments,
      patient_id
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || (age === undefined || age === null || age === '') || !contactInfo || !date || !time) {
      console.log('Validation failed. Missing fields:', { firstName, lastName, age, contactInfo, date, time });
      return res.status(400).json({
        success: false,
        message: 'First name, last name, age, contact information, date, and time are required'
      });
    }

    // Validate contact info format (7-10 digits)
    if (!/^\d{7,10}$/.test(contactInfo)) {
      return res.status(400).json({
        success: false,
        message: 'Contact information must be 7-10 digits'
      });
    }

    // Use provided patient_id or generate a new one
    const finalPatientId = patient_id || new mongoose.Types.ObjectId();

    // Format date from YYYY-MM-DD to MM-DD-YYYY
    const formattedDate = formatDateToMMDDYYYY(date);

    // Format time from HH:MM (24hr) to HH:MM AM/PM
    const formattedTime = formatTimeTo12Hour(time);

    // Create appointment object
    const appointmentData = {
      patient_name: {
        first: firstName,
        middle: middleName || null,
        last: lastName
      },
      patient_id: finalPatientId,
      age: parseInt(age),
      contact_information: contactInfo,
      appointment_date: formattedDate,
      appointment_time: formattedTime,
      appointment_type: appointmentType || 'Follow-up',
      reason_for_appointment: reason || 'Regular',
      urgency: urgencyDropdown || 'No',
      doctor: doctor || null,
      comments: comments || null
    };

    // Create new appointment
    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: savedAppointment,
      appointmentId: savedAppointment._id,
      patientId: finalPatientId
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const { patientId, patientName, doctor, appointmentType, startDate, endDate, urgency } = req.query;

    let query = {};

    // Filter by patient ID
    if (patientId) {
      query.patient_id = patientId;
    }

    // Filter by patient name (search in first or last name)
    if (patientName) {
      query.$or = [
        { 'patient_name.first': { $regex: patientName, $options: 'i' } },
        { 'patient_name.last': { $regex: patientName, $options: 'i' } }
      ];
    }

    // Filter by doctor
    if (doctor) {
      query.doctor = { $regex: doctor, $options: 'i' };
    }

    // Filter by appointment type
    if (appointmentType) {
      query.appointment_type = appointmentType;
    }

    // Filter by urgency
    if (urgency) {
      query.urgency = urgency;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

// Get single appointment by ID
router.get('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
});

// Update appointment
router.put('/appointments/:id', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      age,
      contactInfo,
      date,
      time,
      appointmentType,
      reason,
      urgencyDropdown,
      doctor,
      comments
    } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update patient name fields
    if (firstName !== undefined) appointment.patient_name.first = firstName;
    if (middleName !== undefined) appointment.patient_name.middle = middleName || null;
    if (lastName !== undefined) appointment.patient_name.last = lastName;

    // Update other fields
    if (age !== undefined) appointment.age = parseInt(age);
    if (contactInfo !== undefined) {
      // Validate contact info format
      if (!/^\d{7,10}$/.test(contactInfo)) {
        return res.status(400).json({
          success: false,
          message: 'Contact information must be 7-10 digits'
        });
      }
      appointment.contact_information = contactInfo;
    }
    if (date !== undefined) appointment.appointment_date = formatDateToMMDDYYYY(date);
    if (time !== undefined) appointment.appointment_time = formatTimeTo12Hour(time);
    if (appointmentType !== undefined) appointment.appointment_type = appointmentType;
    if (reason !== undefined) appointment.reason_for_appointment = reason;
    if (urgencyDropdown !== undefined) appointment.urgency = urgencyDropdown;
    if (doctor !== undefined) appointment.doctor = doctor || null;
    if (comments !== undefined) appointment.comments = comments || null;

    const updatedAppointment = await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
});

// Delete appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message
    });
  }
});

// Get appointments by patient ID
router.get('/patients/:patientId/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient_id: req.params.patientId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient appointments',
      error: error.message
    });
  }
});

// Get appointment statistics
router.get('/appointments/stats/overview', async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();

    const appointmentsByType = await Appointment.aggregate([
      {
        $group: {
          _id: '$appointment_type',
          count: { $sum: 1 }
        }
      }
    ]);

    const urgentAppointments = await Appointment.countDocuments({ urgency: 'Yes' });

    const appointmentsByDoctor = await Appointment.aggregate([
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        urgentAppointments,
        appointmentsByType,
        appointmentsByDoctor,
        recentAppointments
      }
    });

  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment statistics',
      error: error.message
    });
  }
});

// Get appointments for today
router.get('/appointments/today/list', async (req, res) => {
  try {
    const today = new Date();
    const todayFormatted = formatDateToMMDDYYYY(today.toISOString().split('T')[0]);

    const appointments = await Appointment.find({ appointment_date: todayFormatted })
      .sort({ appointment_time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s appointments',
      error: error.message
    });
  }
});

// Helper function to format date from YYYY-MM-DD to MM-DD-YYYY
function formatDateToMMDDYYYY(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

// Helper function to format time from 24-hour (HH:MM) to 12-hour (HH:MM AM/PM)
function formatTimeTo12Hour(timeString) {
  if (!timeString) return null;

  const [hours, minutes] = timeString.split(':');
  let hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;
  hour = hour ? hour : 12; // Convert 0 to 12

  const formattedHour = String(hour).padStart(2, '0');

  return `${formattedHour}:${minutes} ${ampm}`;
}

export default router;