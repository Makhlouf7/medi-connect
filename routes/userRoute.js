const express = require("express");
const {
  register,
  login,
  protect,
  restrictTo,
  getMe,
  updateMe,
  deleteMe,
  createAdmin,
  deleteAdmin,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.use(protect);
router.route("/me").get(getMe).patch(updateMe).delete(deleteMe);

router.post("/admins", restrictTo("owner"), createAdmin);
router.delete("/admins/:id", restrictTo("owner"), deleteAdmin);

module.exports = router;
