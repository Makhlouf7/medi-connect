const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const ReviewSchema = new Schema(
  {
    patient: {
      type: Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
    },
    doctor: {
      type: Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Rating is required"],
    },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ patient: 1, doctor: 1 }, { unique: true });

const Review = model("Review", ReviewSchema);

module.exports = Review;
