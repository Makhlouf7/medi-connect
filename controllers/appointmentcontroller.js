const Appointment = require("../modules/appointment");
const catchAsync = require("../utils/catchAsync");

// add new appointment
const addAppointment = catchAsync(async (req, res) => {
  const { doctorId, bookingDate } = req.body;
  const newbooking = new Date(bookingDate);

  const conflict = await Appointment.findOne({
    doctorId,
    bookingDate: {
      $gte: new Date(newbooking.getTime() - 15 * 60000),
      $lte: new Date(newbooking.getTime() + 15 * 60000),
    },
  });

  if (conflict)
    return res.status(400).send({ message: "This appointment is already booked" });

  const appointment = new Appointment(req.body);
  await appointment.save();

  res.status(201).send({
    message: "Appointment created successfully",
    appointment,
  });
});

// delete appointment
const deleteAppointment = catchAsync(async (req, res) => {
  const ID = req.params.id;
  const appointment = await Appointment.findByIdAndDelete(ID);

  if (!appointment)
    return res.status(404).send({ message: "Appointment not found" });

  res.status(200).send({
    message: "Appointment was deleted successfully",
    appointment,
  });
});

// appointments for patient
const getappointmentPatient = catchAsync(async (req, res) => {
  const patientId = req.params.id;
  const appointments = await Appointment.find({ patientId }).populate("doctorId");

  if (!appointments || appointments.length === 0)
    return res.status(404).send({ message: "No appointments found for this patient" });

  res.status(200).send(appointments);
});

// appointments for doctor
const getappointmentDoctor = catchAsync(async (req, res) => {
  const doctorId = req.params.id;
  const appointments = await Appointment.find({ doctorId }).populate("patientId");

  if (!appointments || appointments.length === 0)
    return res.status(404).send({ message: "No appointments found for this doctor" });

  res.status(200).send(appointments);
});

// appointments for admin
const getappointmentAdmin = catchAsync(async (req, res) => {
  const appointments = await Appointment.find({})
    .populate("patientId", "name age phone")
    .populate("doctorId", "name status");

  if (!appointments || appointments.length === 0)
    return res.status(404).send({ message: "No appointments found" });

  res.status(200).send(appointments);
});

module.exports = {
  addAppointment,
  deleteAppointment,
  getappointmentPatient,
  getappointmentDoctor,
  getappointmentAdmin,
};
