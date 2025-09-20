const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const Doctor = require("./doctorModel"); // Import the Doctor model

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

ReviewSchema.statics.calcAverageRatings = async function (doctorId) {
  const stats = await this.aggregate([
    {
      $match: { doctor: doctorId },
    },
    {
      $group: {
        _id: "$doctor",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsCount: stats[0].nRating,
      rating: stats[0].avgRating,
    });
  } else {
    await Doctor.findByIdAndUpdate(doctorId, {
      ratingsCount: 0,
      rating: 0,
    });
  }
};

// Middleware to update ratings on save
ReviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.doctor);
});

// Middleware to update (findByIdAndUpdate || findByIdAndDelete)
ReviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.doctor);
  }
});

const Review = model("Review", ReviewSchema);

module.exports = Review;
