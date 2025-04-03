// controllers/fileController.js
const fs = require("fs");
const path = require("path");
const DataSession = require("../models/DataSession");

// Controller function to upload a zip file and save its information to the database
exports.downloadZipFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join("uploads", filename);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send("File not found");
      }

      // Send the JSON file as an attachment to trigger a download in the browser
      res.setHeader("Content-Type", "application/json");
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error sending file");
        }
      });
    });
  } catch (error) {
    console.error("Error downloading file:", error.message);
    res.status(500).json({ error: "Server error during file download" });
  }
};

exports.uploadZipFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or invalid file type" });
    }

    const dataSessionId = req.params.dataSessionId; // Get the DataSession ID from the request parameters

    // Check if the data session ID is provided
    if (dataSessionId) {
      // Find the DataSession to check if there's an existing file
      const dataSession = await DataSession.findById(dataSessionId);

      if (dataSession) {
        // Path to the existing file
        if (dataSession.fileName) {
          const existingFilePath = path.join("uploads", dataSession.fileName);

          // Remove the existing file if it exists
          if (fs.existsSync(existingFilePath)) {
            fs.unlink(existingFilePath, (err) => {
              if (err) {
                console.error("Error removing existing file:", err);
              }
            });
          }
        }

        // Update the DataSession with the new file's name
        const updatedDataSession = await DataSession.findByIdAndUpdate(
          dataSessionId,
          { fileName: req.file.filename }, // Update the `fileName` field with the new file's name
          { new: true } // Return the updated document
        );

        res.status(201).json({
          message: "File uploaded and DataSession updated successfully",
          dataSession: updatedDataSession,
        });
      } else {
        // If no DataSession is found, respond with an error
        return res.status(404).json({ message: "DataSession not found" });
      }
    } else {
      // If no DataSession ID is provided, just respond with the uploaded file's details
      res
        .status(201)
        .json({ message: "File uploaded successfully", file: req.file });
    }
  } catch (error) {
    console.error("Error uploading file:", error.message);
    res.status(500).json({ error: "Server error during file upload" });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const dataSessionId = req.params.dataSessionId; // Get the DataSession ID from the request parameters

    // Check if the data session ID is provided
    if (dataSessionId) {
      // Find the DataSession to check if there's an existing file
      const dataSession = await DataSession.findById(dataSessionId);

      if (dataSession) {
        // Path to the existing file
        if (dataSession.fileName) {
          const existingFilePath = path.join("uploads", dataSession.fileName);

          // Remove the existing file if it exists
          if (fs.existsSync(existingFilePath)) {
            fs.unlink(existingFilePath, (err) => {
              if (err) {
                console.error("Error removing existing file:", err);
              }
            });
          }
        }

        // Update the DataSession with the new file's name
        const updatedDataSession = await DataSession.findByIdAndUpdate(
          dataSessionId,
          { fileName: null }, // Update the `fileName` field with the new file's name
          { new: true } // Return the updated document
        );

        res.status(201).json({
          message: "File Deleted and DataSession updated successfully",
          dataSession: updatedDataSession,
        });
      } else {
        // If no DataSession is found, respond with an error
        return res.status(404).json({ message: "DataSession not found" });
      }
    } else {
      // If no DataSession ID is provided, just respond with the uploaded file's details
      res
        .status(201)
        .json({ message: "File Deleted successfully", file: req.file });
    }
  } catch (error) {
    console.error("Error deleting file:", error.message);
    res.status(500).json({ error: "Server error during file delete" });
  }
};

exports.uploadUpdateFiles = (req, res) => {
  try {
    // Check if the files are uploaded
    if (!req.files || !req.files.setupExe || !req.files.setupExeBlockmap || !req.files.latestYaml) {
      return res.status(400).json({ message: 'Required files are missing' });
    }

    const setupExe = req.files.setupExe[0];
    const setupExeBlockmap = req.files.setupExeBlockmap[0];
    const latestYaml = req.files.latestYaml[0];

    // Log file names and paths (for debugging purposes)
    console.log('Uploaded files:', {
      setupExe: setupExe.filename,
      setupExeBlockmap: setupExeBlockmap.filename,
      latestYaml: latestYaml.filename
    });

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: {
        setupExe: setupExe.filename,
        setupExeBlockmap: setupExeBlockmap.filename,
        latestYaml: latestYaml.filename
      }
    });
  } catch (error) {
    console.error('Error uploading files:', error.message);
    res.status(500).json({ error: 'Server error during file upload' });
  }
};

exports.downloadUpdateFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join("update", filename);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send("File not found");
      }

      // Send the JSON file as an attachment to trigger a download in the browser
      res.setHeader("Content-Type", "application/json");
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error sending file");
        }
      });
    });
  } catch (error) {
    console.error("Error downloading file:", error.message);
    res.status(500).json({ error: "Server error during file download" });
  }
};
