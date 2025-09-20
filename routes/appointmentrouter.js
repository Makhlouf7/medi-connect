const express = require("express");
const {
  addAppointment,
  deleteAppointment,
  getappointmentPatient,
  getappointmentDoctor,
  getappointmentAdmin,
} = require("../controllers/appointmentController");

const router = express.Router();

//Add new appointment
router.post("/", addAppointment);

// Delete appointment by ID
router.delete("/:id", deleteAppointment);

// Get appointments for specific patient
router.get("/patient/:id", getappointmentPatient);

// Get appointments for specific doctor
router.get("/doctor/:id", getappointmentDoctor);

// Get all appointments (Admin)
router.get("/admin", getappointmentAdmin);

module.exports = router;
