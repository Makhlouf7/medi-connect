const express = require("express");
const upload = require("../utils/upload");
const {
  register,
  login,
  protect,
  restrictTo,
  getMe,
  updateMe,
  updateMyPassword,
  createPatientReport,
  deletePatientReport,
  deleteMe,
  createAdmin,
  deleteAdmin,
} = require("../controllers/authController");

const router = express.Router();

// Any user route
router.post("/register", register);
router.post("/login", login);

router.use(protect);
router.route("/me").get(getMe).patch(updateMe).delete(deleteMe);
router.patch("/password", updateMyPassword);

// Doctor route
router
  .route("/updatePatientReports/:id")
  .post(upload.array("reportFiles"), restrictTo("doctor"), createPatientReport);

router.delete(
  "/updatePatientReports/:patientId/report/:reportId",
  restrictTo("doctor"),
  deletePatientReport
);

// Owner route
router.post("/admins", restrictTo("owner"), createAdmin);
router.delete("/admins/:id", restrictTo("owner"), deleteAdmin);

module.exports = router;
