const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const WorkingTimeSchema = new Schema({
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

const DoctorSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active",
    },
    locations: [{ type: String, trim: true }],
    department: { type: String, trim: true },
    cvUrl: { type: String, trim: true },
    workingTimes: [WorkingTimeSchema],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Doctor = model("Doctor", DoctorSchema);
module.exports = Doctor;
