const mongoose = require("mongoose");
require("dotenv").config({ path: "config.env" });
const app = require("./app.js");

const port = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL.replace("<db_password>", process.env.DB_PASS);

mongoose
  .connect(DB_URL)
  .then(() => console.log("Connected to database"))
  .catch(() => console.log("DB connection failed"));

app.listen(port, (err) => {
  if (err) console.log(err);

  console.log(`Server is listening on port ${port}`);
});
