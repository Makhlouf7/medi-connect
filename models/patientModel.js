const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const ReportFileSchema = new Schema({
  name: { type: String, trim: true }, // default file name
  url: { type: String, trim: true }, // uploads/filename.ext
});

const PatientReportSchema = new Schema({
  doctor: { type: Types.ObjectId, ref: "Doctor" },
  notes: { type: String, trim: true },
  files: [ReportFileSchema],
  createdAt: { type: Date, default: Date.now },
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
