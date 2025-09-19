const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const AppointmentSchema = new Schema(
  {
    doctor: {
      type: Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    patient: {
      type: Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
    },
    bookingDate: { type: Date, required: [true, "Booking date is required"] },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Appointment = model("Appointment", AppointmentSchema);
module.exports = Appointment;
