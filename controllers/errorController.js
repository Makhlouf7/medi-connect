const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = err.keyValue.name;
  return new AppError(
    `Duplicate field value: '${message}'. Please use another value`,
    400
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational == true) {
    if (req.originalUrl.startsWith("/api"))
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    else {
      res.status(err.statusCode).render("error", {
        message: err.message,
      });
    }
  }
  // Programming or other unknown errors: don't leak error details
  else {
    // Log error
    // Send generic message
    console.log("Error 💥💥", err);
    if (req.originalUrl.startsWith("/api"))
      return res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    res.status(err.statusCode).render("error", {
      message: "Please try again later.",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (process.env.NODE_ENV == "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == "production") {
    let error = Object.assign(err);

    if (error.name == "CastError") {
      error = handleCastErrorDB(error);
    } else if (error.code == 11000) {
      error = handleDuplicateFieldsDB(error);
    } else if (error.name == "ValidationError") {
      error = handleValidationErrorDB(error);
    }
    sendErrorProd(error, req, res);
  }
};

module.exports = globalErrorHandler;
