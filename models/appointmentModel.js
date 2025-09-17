const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const AppointmentSchema = new Schema(
  {
    doctor: { type: Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Types.ObjectId, ref: "Patient", required: true },
    bookingDate: { type: Date, required: true },
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
