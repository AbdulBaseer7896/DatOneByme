// config/multerUpdate.js

const multer = require('multer');
const path = require('path');

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Directory where files will be stored
    cb(null, path.join(__dirname, '../update/'));  // Change to your update folder path
  },
  filename: (req, file, cb) => {
    // Use original file name for the uploaded file
    cb(null, file.originalname);
  }
});

// Create multer instance with storage configuration
const upload = multer({ storage });

module.exports = upload;