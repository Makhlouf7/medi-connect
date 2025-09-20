const User = require("../models/userModel");
const AppError = require("../utils/appError");
const ServerResponse = require("../utils/serverResponse");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");
const catchAsync = require("../utils/catchAsync");
const filterAttributes = require("../utils/filterAttributes");
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

// Allow user to update the followings: email, name, phone, age, language, locations, department, cvUrl, and workingTimes
/* Notes:  

1. some of these attributes might be specified for specific profile which will make the function decide based on the role then update it.

2. email shouldn't be updated that way, we should send an email having a confirmation token to confirm if its a real email but as its an internship we won't be able to do that

3. SMTP is not reliable as its blocked from lots of deployment platforms

4. Correct path would be using api from sendGrid or similar one which require having an authenticated domain
*/
const updateMe = catchAsync(async (req, res, next) => {
  // Making sure we are allowing only the needed fields
  const allowedAttributes = [
    "email",
    "name",
    "phone",
    "age",
    "language",
    "locations",
    "department",
    "cvUrl",
    "workingTimes",
  ];
  const filteredObj = filterAttributes(req.body, allowedAttributes);
  // Update common attributes per users "User"
  await User.findByIdAndUpdate(req.user._id, filteredObj, {
    runValidators: true,
  });
  // Update fields related to specific profile
  if (req.user.role === "doctor")
    await Doctor.findOneAndUpdate({ user: req.user._id }, filteredObj, {
      runValidators: true,
    });
  // Note patient doesn't have anything to be updated but you can add an else if in the future if patient profile changed

  const updatedUser = await User.findById(req.user._id);
  new ServerResponse(res, 200, updatedUser);
});

// Responsible on updating password
const updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  if (!(await req.user.comparePassword(currentPassword)))
    return next(new AppError("Current password is incorrect", 422));

  // Proceed to update password
  req.user.password = newPassword;
  req.user.passwordConfirm = newPasswordConfirm;
  await req.user.save();

  new ServerResponse(res, 200, {
    message: "Password updated successfully. please login",
  });
});

// Allowing doctor to update his patients reports
const updatePatientReports = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const filteredObj = filterAttributes(req.body, ["reports"]);
  const patient = req.user.doctorProfile.patients.id(id);

  if (!patient)
    return next(new AppError("You can only update your patients reports", 403));

  const updatedPatient = await Patient.findByIdAndUpdate(id, filteredObj, {
    new: true,
    runValidators: true,
  });

  new ServerResponse(res, 200, updatedPatient);
});

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
    .populate("patientProfile")
    .select("+passwordChangedAt +password");

  if (!user) return next(new AppError("invalid token", 401));

  if (user.isIssuedBeforeLatestPasswordChange(decoded.iat))
    return next(
      new AppError("Password was changed. Please log in again.", 401)
    );

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
  updateMyPassword,
  updatePatientReports,
  deleteMe,
  createAdmin,
  deleteAdmin,
};
