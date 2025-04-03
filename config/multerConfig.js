// config/multerConfig.js

const multer = require('multer');
const path = require('path');

// Configure storage options for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    // Set the file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter to allow only zip files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/json' || file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
    cb(null, true);
  } else {
    cb(new Error('Only zip files are allowed!'), false);
  }
};

// Initialize multer with the defined storage configuration and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
