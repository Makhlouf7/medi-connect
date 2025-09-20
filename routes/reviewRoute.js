const express = require("express");
const {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  getDoctorReviews,
  getMyReviews,
} = require("../controllers/reviewController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get reviews for a specific doctor
router.get("/doctors/:doctorId", getDoctorReviews);

// Get my reviews (patients)
router.get("/my-reviews", getMyReviews);

// CRUD routes
router
  .route("/")
  .get(restrictTo("admin", "owner"), getAllReviews)
  .post(createReview);

router.route("/:id").get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
