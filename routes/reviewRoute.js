const express = require("express");
const {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  getDoctorReviews,
} = require("../controllers/reviewController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

// Get reviews for a specific doctor
router.get("/doctors/:doctorId", getDoctorReviews);

// CRUD routes
router.route("/").get(getAllReviews).post(restrictTo("patient"), createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("patient"), updateReview)
  .delete(restrictTo("patient", "admin"), deleteReview);

module.exports = router;
