const Appointment = require("../models/appointmentModel");
const catchAsync = require("../utils/catchAsync");
const Stripe = require("stripe");
const stripe = new Stripe("YOUR_STRIPE_SECRET_KEY"); // ضع مفتاح Stripe الخاص بك

// Add new appointment with Stripe payment
const addAppointment = catchAsync(async (req, res) => {
  const { doctorId, bookingDate, amount, paymentIntentId, patientId, notes } = req.body;
  const newbooking = new Date(bookingDate);

  // Check for doctor appointment conflict (15 minutes)
  const conflict = await Appointment.findOne({
    doctorId,
    bookingDate: {
      $gte: new Date(newbooking.getTime() - 15 * 60000),
      $lte: new Date(newbooking.getTime() + 15 * 60000),
    },
  });

  if (conflict)
    return res.status(400).send({ message: "This appointment is already booked" });

  // Retrieve payment info from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (!paymentIntent || paymentIntent.status !== "succeeded") {
    return res.status(400).send({ message: "Payment not completed" });
  }

  const amountPaid = paymentIntent.amount_received / 100; // Stripe returns amount in cents

  // Check for insufficient payment
  if (amountPaid < amount) {
    return res.status(400).send({ message: "Insufficient payment" });
  }

  // Save appointment (accept overpayment without refund)
  const appointment = new Appointment({
    doctorId,
    patientId,
    bookingDate,
    amount,
    paid: true,
    paymentId: paymentIntentId,
    notes,
  });

  await appointment.save();

  res.status(201).send({
    message: "Appointment created successfully",
    appointment,
  });
});

// Delete an appointment
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

// Get appointments for a specific patient
const getappointmentPatient = catchAsync(async (req, res) => {
  const patientId = req.params.id;
  const appointments = await Appointment.find({ patientId }).populate("doctorId");

  if (!appointments || appointments.length === 0)
    return res
      .status(404)
      .send({ message: "No appointments found for this patient" });

  res.status(200).send(appointments);
});

// Get appointments for a specific doctor
const getappointmentDoctor = catchAsync(async (req, res) => {
  const doctorId = req.params.id;
  const appointments = await Appointment.find({ doctorId }).populate("patientId");

  if (!appointments || appointments.length === 0)
    return res
      .status(404)
      .send({ message: "No appointments found for this doctor" });

  res.status(200).send(appointments);
});

// Get all appointments (for admin)
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
