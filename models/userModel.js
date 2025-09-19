const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const bcrypt = require("bcrypt");
const validator = require("validator");

const USER_ROLES = ["patient", "doctor", "admin", "owner"];

const UserSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (val) => validator.isEmail(val),
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      validate: {
        validator: function (val) {
          return validator.isStrongPassword(val, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          "Password must be at least 8 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol.",
      },
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password confirmation is required"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords do not match",
      },
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Encrypt password before saving
UserSchema.pre("save", async function (next) {
  const encryptedPassword = await bcrypt.hash(this.password, 12);
  this.password = encryptedPassword;
  this.passwordChangedAt = Date.now();
  this.passwordConfirm = undefined;

  next();
});

// Take the entered password by the user and compares it with the encrypted password in the DB
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add the doctor profile if user was a doctor
UserSchema.virtual("doctorProfile", {
  ref: "Doctor",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

// Add the patient profile if user was patient
UserSchema.virtual("patientProfile", {
  ref: "Patient",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

const User = model("User", UserSchema);
module.exports = User;
