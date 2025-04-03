// controllers/dataSessionController.js

const DataSession = require("../models/DataSession");
const fs = require("fs");
const path = require("path");
const { body, validationResult } = require("express-validator");

// Custom validator to check for unique name and proxy
const uniqueNameValidator = async (value) => {
  const existingDataSession = await DataSession.findOne({ name: value });
  if (existingDataSession) {
    throw new Error(
      "Session name already exists. Please choose a different name."
    );
  }
};
const uniqueProxyValidator = async (value) => {
  const existingDataSession = await DataSession.findOne({ proxy: value });
  if (existingDataSession) {
    throw new Error("Proxy already exists. Please choose a different proxy.");
  }
};
const uniqueNameUpdateValidator = async (value) => {
  const existingDataSession = await DataSession.find({ name: value });
  if (existingDataSession.length > 1) {
    throw new Error(
      "Session name already exists. Please choose a different name."
    );
  }
};
const uniqueProxyUpdateValidator = async (value) => {
  const existingDataSession = await DataSession.find({ proxy: value });
  if (existingDataSession.length > 1) {
    throw new Error("Proxy already exists. Please choose a different proxy.");
  }
};

exports.getDataSession = async (req, res) => {
  try {
    const dataSessions = await DataSession.aggregate([
      {
        $lookup: {
          from: "permissions",
          localField: "_id",
          foreignField: "dataSessionId",
          as: "permissions",
        },
      },
      {
        $addFields: {
          userCounts: { $size: "$permissions" },
        },
      },
      {
        $project: {
          permissions: 0,
        },
      },
    ]);

    res.status(200).json(dataSessions);
  } catch (error) {
    console.error("Error fetching Dat Session:", error.message);
    res
      .status(500)
      .json({
        message: "Server error while fetching Dat Session.",
        error: error.message,
      });
  }
};

// Controller function to create a DataSession
exports.createDataSession = async (req, res) => {
  try {
    // Validation rules
    await body("name")
      .isString()
      .withMessage("Please provide a valid session name")
      .notEmpty()
      .withMessage("Session name cannot be empty")
      .custom(uniqueNameValidator) // Add the custom validator here
      .run(req);
    await body("proxy")
      .isString()
      .withMessage("Please provide a valid proxy")
      .notEmpty()
      .withMessage("Proxy cannot be empty")
      .custom(uniqueProxyValidator) // Add the custom validator here
      .run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, proxy, domain } = req.body;

    // Create new DataSession
    const newDataSession = new DataSession({
      name,
      proxy,
      domain,
    });

    // Save DataSession to the database
    const savedDataSession = await newDataSession.save();

    res.status(201).json({
      message: "Dat Session created successfully",
      dataSession: savedDataSession,
    });
  } catch (error) {
    console.error("Error creating Dat Session:", error.message);
    res
      .status(500)
      .json({
        message: "Server error during Dat Session creation",
        error: error.message,
      });
  }
};

// Controller function to update a DataSession
exports.updateDataSession = async (req, res) => {
  const { dataSessionId } = req.params;
  const { name, proxy, domain, isLoggedIn } = req.body;

  // Validation rules
  name &&
    (await body("name")
      .isString()
      .withMessage("Please provide a valid session name")
      .notEmpty()
      .withMessage("Session name cannot be empty")
      .custom(uniqueNameUpdateValidator)
      .run(req));
  proxy &&
    (await body("proxy")
      .isString()
      .withMessage("Please provide a valid proxy")
      .notEmpty()
      .withMessage("Proxy cannot be empty")
      .custom(uniqueProxyUpdateValidator)
      .run(req));

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find the DataSession by ID
    const dataSession = await DataSession.findById(dataSessionId);

    if (!dataSession) {
      return res.status(404).json({ message: "Dat Session not found" });
    }

    // Update fields if provided
    if (name != undefined) dataSession.name = name;
    if (proxy != undefined) dataSession.proxy = proxy;
    if (domain != undefined) dataSession.domain = domain;
    if (isLoggedIn != undefined) dataSession.isLoggedIn = isLoggedIn;

    // Save the updated DataSession to the database
    const updatedDataSession = await dataSession.save();

    res.status(200).json({
      message: "Dat Session updated successfully",
      dataSession: updatedDataSession,
    });
  } catch (error) {
    console.error("Error updating Dat Session:", error.message);
    res
      .status(500)
      .json({
        message: "Server error during Dat Session update",
        error: error.message,
      });
  }
};

// Controller function to delete a DataSession
exports.deleteDataSession = async (req, res) => {
  const { dataSessionId } = req.params;

  try {
    // Find the DataSession by ID
    const dataSession = await DataSession.findById(dataSessionId);

    if (!dataSession) {
      return res.status(404).json({ message: "Dat Session not found" });
    }

    // If there is an associated file, delete it from the filesystem and database
    if (dataSession.fileName) {
      // Delete file from the file system
      const filePath = path.join(__dirname, "../upload/", dataSession.fileName);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file from file system:", err.message);
        }
      });
    }

    // Delete the DataSession from the database
    await DataSession.findByIdAndDelete(dataSessionId);

    res.json({
      message: "Dat Session and associated file (if any) deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Dat Session:", error.message);
    res
      .status(500)
      .json({
        message: "Server error during Dat Session deletion",
        error: error.message,
      });
  }
};
