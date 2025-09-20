const fs = require("fs/promises");
const path = require("path");

const deleteFiles = async (files) => {
  await Promise.all(
    files.map(async (originalname) =>
      fs.unlink(path.join(__dirname, `../uploads/${originalname}`))
    )
  );
};

module.exports = deleteFiles;
