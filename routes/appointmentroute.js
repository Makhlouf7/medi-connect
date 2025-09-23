const express = require("express");
const {
  addAppointment,
  deleteAppointment,
  getappointmentPatient,
  getappointmentDoctor,
  getappointmentAdmin,
} = require("../controllers/appointmentcontroller");

const router = express.Router();

// Add a new appointment (after payment)
router.post("/appointments", addAppointment);

// Delete an appointment
router.delete("/appointments/:id", deleteAppointment);

// Get appointments for a specific patient
router.get("/appointments/patient/:id", getappointmentPatient);

// Get appointments for a specific doctor
router.get("/appointments/doctor/:id", getappointmentDoctor);

// Get all appointments (admin)
router.get("/appointments/admin", getappointmentAdmin);

module.exports = router;
