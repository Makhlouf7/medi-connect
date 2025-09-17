const express = require("express");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

app.use(express.json());

// add versions for future updates
// app.use("/api/v1/...")

app.use(globalErrorHandler);
module.exports = app;
