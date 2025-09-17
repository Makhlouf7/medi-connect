const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!(await user.comparePassword(password))) {
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

  res.status(200).json({
    status: "success",
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  if (
    !req?.headers?.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("Invalid token", 401));
  }

  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId);
  if (!user) return next(new AppError("invalid token", 401));

  req.user = user;
  next();
});

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

module.exports = { login, protect, restrictTo };
