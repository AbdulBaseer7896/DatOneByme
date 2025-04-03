// routes/fileRoutes.js

const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const upload = require("../config/multerConfig"); // Multer configuration for file uploads
const update = require("../config/multerUpdate"); // Multer configuration for file updates
const auth = require("../middleware/auth");

// Route to upload a file and save its information
router.get("/download/:filename", auth, fileController.downloadZipFile);
router.get("/update/:filename", fileController.downloadUpdateFile);
router.post(
  "/update",
  update.fields([
    { name: "setupExe", maxCount: 1 },
    { name: "setupExeBlockmap", maxCount: 1 },
    { name: "latestYaml", maxCount: 1 },
  ]),
  fileController.uploadUpdateFiles
);
router.post(
  "/upload/:dataSessionId",
  auth,
  upload.single("file"),
  fileController.uploadZipFile
);
router.post("/delete/:dataSessionId", auth, fileController.deleteFile);

module.exports = router;
