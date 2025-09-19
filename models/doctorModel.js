const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const WorkingTimeSchema = new Schema({
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    required: [true, "Day of week is required"],
  },
  start: { type: Date, required: [true, "Start time is required"] },
  end: { type: Date, required: [true, "End time is required"] },
});

const DoctorSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    locations: [{ type: String, trim: true }],
    department: {
      type: String,
      trim: true,
      required: [true, "Department is required"],
    },
    cvUrl: { type: String, trim: true, required: [true, "CV URL is required"] },
    workingTimes: {
      type: [WorkingTimeSchema],
      required: [true, "Please add your working hours"],
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Doctor = model("Doctor", DoctorSchema);
module.exports = Doctor;
