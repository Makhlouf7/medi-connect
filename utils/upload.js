const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const [fileName, fileExt] = file.originalname.split(".");
    file.originalname = `${fileName}-${uniqueSuffix}.${fileExt}`;
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
