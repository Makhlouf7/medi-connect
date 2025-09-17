const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const validator = require("validator");

const USER_ROLES = ["patient", "doctor", "admin", "owner"];

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (val) => validator.isEmail(val),
        message: "Please enter a valid email",
      },
    },
    password: { type: String, required: true, select: false },
    passwordChangedAt: Date,
    role: { type: String, enum: USER_ROLES, default: "patient" },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (val) => validator.isMobilePhone(val, "ar-EG"),
        message: "Please enter a valid phone number",
      },
    },
    age: { type: Number, min: 0, max: 140 },
    language: { type: String, trim: true },
  },
  { timestamps: true }
);

UserSchema.virtual("doctorProfile", {
  ref: "Doctor",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

UserSchema.virtual("patientProfile", {
  ref: "Patient",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

const User = model("User", UserSchema);
module.exports = User;
