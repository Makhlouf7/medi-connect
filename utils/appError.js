class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    // Include the error to the error stack which contains information like where that error happened
    // by default err.stack is logging also the constructor function of the error which is not really helpful so we passed the constructor function as a second argument to be excluded
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
