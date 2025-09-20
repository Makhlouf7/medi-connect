const Review = require("../models/reviewModel");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const AppError = require("../utils/appError");
const ServerResponse = require("../utils/serverResponse");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const mongoose = require("mongoose");

// Helper function to update doctor ratings
const updateDoctorRatings = async (doctorId) => {
  try {
    console.log("1");

    // Convert string to ObjectId
    const doctorObjectId = mongoose.Types.ObjectId.isValid(doctorId)
      ? new mongoose.Types.ObjectId(doctorId)
      : doctorId;

    const stats = await Review.aggregate([
      {
        $match: { doctor: doctorObjectId },
      },
      {
        $group: {
          _id: "$doctor",
          numRatings: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (stats.length > 0) {
      await Doctor.findByIdAndUpdate(doctorObjectId, {
        ratingsCount: stats[0].numRatings,
        rating: Math.round(stats[0].avgRating * 10) / 10,
      });
    } else {
      await Doctor.findByIdAndUpdate(doctorObjectId, {
        ratingsCount: 0,
        rating: 0,
      });
    }
  } catch (error) {
    console.error("Error updating doctor ratings:", error);
  }
};

// Create a new review (patients only)
const createReview = catchAsync(async (req, res, next) => {
  try {
    const { doctor, rating, comment } = req.body;
    // Validation
    if (!doctor) {
      return next(new AppError("Doctor ID is required", 400));
    }
    if (!rating) {
      return next(new AppError("Rating is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return next(new AppError("Invalid doctor ID format", 400));
    }

    if (req.user.role !== "patient") {
      return next(new AppError("Only patients can create reviews", 403));
    }

    // Get patient profile
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }

    // Check if doctor exists and is approved
    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) {
      return next(new AppError("Doctor not found", 404));
    }
    if (doctorDoc.status !== "approved") {
      return next(new AppError("Cannot review unapproved doctors", 400));
    }

    // Create review with patient ID
    const newReview = await Review.create({
      patient: patient._id,
      doctor,
      rating: Number(rating),
      comment: comment || "",
    });

    // Update doctor ratings
    await updateDoctorRatings(doctor);

    // Populate the review
    const populatedReview = await Review.findById(newReview._id).populate([
      { path: "patient", populate: { path: "user", select: "name email" } },
      { path: "doctor", populate: { path: "user", select: "name email" } },
    ]);

    return new ServerResponse(res, 201, populatedReview);
  } catch (error) {
    console.error("Create review error:", error);
    return next(new AppError("Failed to create review", 500));
  }
});

// Get all reviews (admins and owners only)
const getAllReviews = catchAsync(async (req, res, next) => {
  try {
    if (!["admin", "owner"].includes(req.user.role)) {
      return next(
        new AppError("Access denied. Admin or owner role required", 403)
      );
    }

    const features = new APIFeatures(
      Review.find().populate([
        { path: "patient", populate: { path: "user", select: "name email" } },
        { path: "doctor", populate: { path: "user", select: "name email" } },
      ]),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const reviews = await features.query;
    const total = await Review.countDocuments();

    return new ServerResponse(res, 200, reviews, {
      total,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    return next(new AppError("Failed to fetch reviews", 500));
  }
});

// Get reviews for a specific doctor
const getDoctorReviews = catchAsync(async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return next(new AppError("Invalid doctor ID format", 400));
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(new AppError("Doctor not found", 404));
    }

    const features = new APIFeatures(
      Review.find({ doctor: doctorId }).populate([
        { path: "patient", populate: { path: "user", select: "name" } },
      ]),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const reviews = await features.query;
    const total = await Review.countDocuments({ doctor: doctorId });

    return new ServerResponse(res, 200, reviews, {
      total,
      count: reviews.length,
      doctorRating: doctor.rating,
      doctorRatingsCount: doctor.ratingsCount,
    });
  } catch (error) {
    console.error("Get doctor reviews error:", error);
    return next(new AppError("Failed to fetch doctor reviews", 500));
  }
});

// Get my reviews (for patients)
const getMyReviews = catchAsync(async (req, res, next) => {
  try {
    if (req.user.role !== "patient") {
      return next(new AppError("Only patients can access this endpoint", 403));
    }

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }

    const features = new APIFeatures(
      Review.find({ patient: patient._id }).populate([
        { path: "doctor", populate: { path: "user", select: "name email" } },
      ]),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const reviews = await features.query;
    const total = await Review.countDocuments({ patient: patient._id });

    return new ServerResponse(res, 200, reviews, {
      total,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    return next(new AppError("Failed to fetch your reviews", 500));
  }
});

// Get single review
const getReview = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid review ID format", 400));
    }

    const review = await Review.findById(id).populate([
      { path: "patient", populate: { path: "user", select: "name email" } },
      { path: "doctor", populate: { path: "user", select: "name email" } },
    ]);

    if (!review) {
      return next(new AppError("Review not found", 404));
    }

    // Check permission
    let hasAccess = false;

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient && review.patient._id.equals(patient._id)) {
        hasAccess = true;
      }
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor && review.doctor._id.equals(doctor._id)) {
        hasAccess = true;
      }
    } else if (["admin", "owner"].includes(req.user.role)) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return next(new AppError("Access denied", 403));
    }

    return new ServerResponse(res, 200, review);
  } catch (error) {
    console.error("Get review error:", error);
    return next(new AppError("Failed to fetch review", 500));
  }
});

// Update review (only the patient who created it)
const updateReview = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid review ID format", 400));
    }

    if (req.user.role !== "patient") {
      return next(new AppError("Only patients can update reviews", 403));
    }

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }

    const review = await Review.findById(id);
    if (!review) {
      return next(new AppError("Review not found", 404));
    }

    // Check if patient owns this review
    if (!review.patient.equals(patient._id)) {
      return next(new AppError("You can only update your own reviews", 403));
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = Number(rating);
    if (comment !== undefined) updateData.comment = comment;

    if (Object.keys(updateData).length === 0) {
      return next(new AppError("No valid fields to update", 400));
    }

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "patient", populate: { path: "user", select: "name email" } },
      { path: "doctor", populate: { path: "user", select: "name email" } },
    ]);

    // Update doctor ratings
    await updateDoctorRatings(review.doctor);

    return new ServerResponse(res, 200, updatedReview);
  } catch (error) {
    console.error("Update review error:", error);
    return next(new AppError("Failed to update review", 500));
  }
});

// Delete review
const deleteReview = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid review ID format", 400));
    }

    const review = await Review.findById(id);
    if (!review) {
      return next(new AppError("Review not found", 404));
    }

    // Check permission
    let hasAccess = false;

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient && review.patient.equals(patient._id)) {
        hasAccess = true;
      }
    } else if (["admin", "owner"].includes(req.user.role)) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return next(new AppError("Access denied", 403));
    }

    const doctorId = review.doctor;
    await Review.findByIdAndDelete(id);

    // Update doctor ratings
    await updateDoctorRatings(doctorId);

    return new ServerResponse(res, 204);
  } catch (error) {
    console.error("Delete review error:", error);
    return next(new AppError("Failed to delete review", 500));
  }
});

module.exports = {
  createReview,
  getAllReviews,
  getDoctorReviews,
  getMyReviews,
  getReview,
  updateReview,
  deleteReview,
};
