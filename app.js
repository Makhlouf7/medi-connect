const express = require("express");
const userRoute = require("./routes/userRoute");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

app.use(express.json());

// add versions for future updates
app.use("/api/v1/users", userRoute);
app.use("/api/v1/reviews", reviewRoute);

app.use(globalErrorHandler);
module.exports = app;
