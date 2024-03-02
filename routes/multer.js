const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// to find the extention of the file require this package
const path = require("path");

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/profile');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4();
    // cb(null, uniqueName); // this is a file uploade without an extensiton which will not shown up, to add the extension use the following syntax
    cb(null, uniqueName+path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
