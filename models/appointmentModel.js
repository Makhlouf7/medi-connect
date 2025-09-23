const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const appointmentSchema = new Schema(
  {
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

    // Payment fields
    amount: {
      type: Number,
      required: [true, "Appointment amount is required"],
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: String, // Payment ID returned from the payment gateway (e.g., Stripe, Paymob)
    },
  },
  { timestamps: true }
);

// Prevent double booking for the same doctor at the same date/time
appointmentSchema.index({ doctorId: 1, bookingDate: 1 }, { unique: true });

const Appointment = model("Appointment", appointmentSchema);
module.exports = Appointment;
