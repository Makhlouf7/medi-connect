const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const appointmentSchema = new Schema({
  doctorId: {
    type: Types.ObjectId,
    ref: "Doctor",
    required: [true, "DoctorId is required"],
  },
  patientId: {
    type: Types.ObjectId,
    ref: "Patient",
    required: [true, "PatientId is required"],
  },
  bookingDate: {
    type: Date,
    required: [true, "Booking date is required"],
  },
  status: {
    type: String,
    enum: ["booked", "cancelled", "completed"],
    default: "booked",
  },
  notes: { type: String, trim: true },
} , {timestamps : true});
appointmentSchema.index({doctorId : 1 , bookingDate : 1} , {unique : true})
const Appointment = model ("Appointment" , appointmentSchema)
module.exports = Appointment

