const User = require("../models/userModel");
const AppError = require("../utils/appError");
const ServerResponse = require("../utils/serverResponse");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password"));
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  new ServerResponse(res, 200, { token });
});

const register = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  if (role !== "doctor" && role !== "patient") {
    return next(new AppError("Please specify a valid role", 400));
  }
  const user = await User.create(req.body);

  try {
    if (role === "doctor") await Doctor.create({ ...req.body, user: user._id });
    else if (role === "patient")
      await Patient.create({ ...req.body, user: user._id });
  } catch (err) {
    // Delete the created user if we failed to create a patient or doctor profile
    await User.findByIdAndDelete(user._id);
  }

  new ServerResponse(res, 201);
});

// Admins controllers =====
const createAdmin = catchAsync(async (req, res, next) => {
  await User.create({ ...req.body, role: "admin" });

  new ServerResponse(res, 201, {
    email: req.body.email,
    password: req.body.password,
    message:
      "Please give the email and password to the admin and ask him to change password for security measures",
  });
});

const deleteAdmin = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  new ServerResponse(res, 204);
});

// Profile controllers =====

const getMe = catchAsync(async (req, res, next) => {
  new ServerResponse(res, 200, req.user);
});

const updateMe = catchAsync(async (req, res, next) => {});

const updateMyCredentials = catchAsync(async (req, res, next) => {});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);

  if (req.user.role === "patient")
    await Patient.findOneAndDelete({ user: req.user._id });
  else if (req.user.role === "doctor")
    await Doctor.findOneAndDelete({ user: req.user._id });

  new ServerResponse(res, 204);
});

// Check the sent token and add user to the request
const protect = catchAsync(async (req, res, next) => {
  if (
    !req?.headers?.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("Invalid token", 401));
  }

  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId)
    .populate("doctorProfile")
    .populate("patientProfile");

  if (!user) return next(new AppError("invalid token", 401));

  req.user = user;
  next();
});

// Restrict a route to specific role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req?.user?.role))
      return next(
        new AppError(
          `Access denied: your role (${req?.user?.role}) is not authorized to perform this action.`,
          403
        )
      );

    next();
  };
};

module.exports = {
  login,
  protect,
  restrictTo,
  register,
  getMe,
  updateMe,
  deleteMe,
  createAdmin,
  deleteAdmin,
};
