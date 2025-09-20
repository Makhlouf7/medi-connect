const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const PatientReportSchema = new Schema({
  doctor: { type: Types.ObjectId, ref: "Doctor" },
  notes: { type: String, trim: true },
  files: [String],
});

const PatientSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    reports: [PatientReportSchema],
  },
  { timestamps: true }
);

const Patient = model("Patient", PatientSchema);
module.exports = Patient;
