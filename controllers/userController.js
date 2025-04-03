// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const UserPermission = require('../models/UserPermission');
const { body, validationResult } = require('express-validator');
const DataSession = require('../models/DataSession');
const WhitelistedDomain = require('../models/WhitelistedDomain');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(401).json({ message: 'User is banned' });
    }

    // Check if the user already has an active session
    const existingSession = await UserSession.findOne({ userId: user._id });
    if (existingSession) {
      // Remove or update the existing session
      await UserSession.deleteOne({ _id: existingSession._id });
    }

    // Create a new JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });

    // Save the new session
    const newSession = new UserSession({ userId: user._id, token });
    await newSession.save();

    const getPermission = await UserPermission.findOne({ userId: user._id });
    const getDataSession = await DataSession.findById(getPermission.dataSessionId);
    const relatedDomains = await WhitelistedDomain.find({
      _id: { $in: getPermission.domains }
    });

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, token, permission: getPermission, datAccount: getDataSession, allowedDomains: relatedDomains });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.isLoggedIn = async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the session still exists in the database
    const existingSession = await UserSession.findOne({ userId: decoded.userId, token });
    if (!existingSession) {
      return res.status(401).json({ message: 'Session expired or token invalid' });
    }
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ message: 'Invalid User' });
    }
    if (user.isBanned) {
      return res.status(401).json({ message: 'User is Banned' });
    }

    user.isOnline = new Date();
    await user.save();

    const getPermission = await UserPermission.findOne({ userId: user._id });
    const getDataSession = await DataSession.findById(getPermission.dataSessionId);
    const relatedDomains = await WhitelistedDomain.find({
      _id: { $in: getPermission.domains }
    });

    // If session exists, return success
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, token, permission: getPermission, datAccount: getDataSession, allowedDomains: relatedDomains });
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.logout = async (req, res) => {
  const token = req.header('Authorization');

  try {
    await UserSession.findOneAndUpdate({ token }, { isActive: false });
    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

exports.ban = async (req, res) => {
  const { userId } = req.params;

  try {
    // Update user to be banned
    await User.findByIdAndUpdate(userId, { isBanned: true });
    // Invalidate all sessions for this user
    await UserSession.updateMany({ userId }, { isActive: false });
    res.json({ message: `User ${userId} has been banned` });
  } catch (error) {
    console.error('Ban user error:', error.message);
    res.status(500).json({ error: 'Server error while banning user' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate({
      path: 'permissions',
      populate: {
        path: 'dataSessionId',
        model: 'dataSession',
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching Users:', error.message);
    res.status(500).json({ error: 'Server error while fetching Users.' });
  }
}

exports.createUser = async (req, res) => {
    // Validation rules
    await body('email').isEmail().withMessage('Invalid email address').run(req);
    await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req);
    await body('role').isString().isIn(['admin', 'user']).withMessage('Invalid role').run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
  
    // Simple validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Create a new user
      const newUser = new User({ name, email, password, role });
  
      // Save the user to the database
      await newUser.save();
      // Create default permissions for the new user
      const newPermission = new UserPermission({ userId: newUser._id, ...req.body.permissions });
      await newPermission.save();
  
      res.status(200).json(newUser);
    } catch (err) {
      console.error('Error during user creation:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
  // Validation rules
  await body('email').optional().isEmail().withMessage('Invalid email address').run(req);
  // await body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req);
  await body('role').optional().isString().isIn(['admin', 'user']).withMessage('Invalid role').run(req);
  await body('isBanned').optional().isBoolean().withMessage('Invalid value for isBanned').run(req);
  await body('permissions').optional().isObject().withMessage('Invalid permissions data').run(req);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const userId = req.params.userId;
  const { email, password, role, isBanned, permissions } = req.body;
  
  try {
    // Update the user document
    const updateData = { email, password, role, isBanned };
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document
      runValidators: true // Run schema validations
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the permissions if provided
    if (permissions) {
      const updatedPermissions = await UserPermission.findOneAndUpdate(
        { userId: userId }, // Find permission by userId
        permissions, // Update with provided permissions data
        { new: true, runValidators: true } // Return updated document and run validators
      );

      if (!updatedPermissions) {
        return res.status(404).json({ message: 'Permissions not found' });
      }

      // Attach updated permissions to the response
      updatedUser.permissions = updatedPermissions;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({ error: 'Server error during user update' });
  }
};

exports.createUserPermission = async (req, res) => {
    try {
      const userId = req.body.userId;
  
      // Check if a permission already exists for the given userId
      const existingPermission = await UserPermission.findOne({ userId });
  
      if (existingPermission) {
        return res.status(400).json({ message: 'Permissions for this user already exist.' });
      }
  
      const newPermission = new UserPermission(req.body);
  
      const savedPermission = await newPermission.save();
  
      res.status(201).json(savedPermission);
    } catch (error) {
      console.error('Error creating user permission:', error.message);
      res.status(500).json({ error: 'Server error while creating user permission' });
    }
};

exports.updateUserPermission = async (req, res) => {
    try {
      const userId = req.params.userId;
      const updates = req.body;
  
      // Update the user permission
      const updatedPermission = await UserPermission.findOneAndUpdate(
        { userId }, // Find the document by userId
        updates, // Apply the updates from the request body
        { new: true } // Return the updated document
      );
  
      if (!updatedPermission) {
        return res.status(404).json({ message: 'User permission not found' });
      }
  
      res.json(updatedPermission);
    } catch (error) {
      console.error('Error updating user permission:', error.message);
      res.status(500).json({ error: 'Server error while updating user permission' });
    }
};

exports.getUserSession = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userSession = await UserSession.find({ userId });
    res.status(200).json(userSession);
  } catch (error) {
    console.error('Error fetching User Session:', error.message);
    res.status(500).json({ error: 'Server error while fetching User Session.' });
  }
}

exports.deleteUserSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const deleteSession = await UserSession.findByIdAndDelete(sessionId);
    if (deleteSession) {
      res.status(200).json('User Session has been deleted.');
    } else {
      res.status(200).json('User Session not found.');
    }
  } catch (error) {
    console.error('Error deleting User Session:', error.message);
    res.status(500).json({ error: 'Server error while deleting User Session.' });
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json('User not found.');
    }

    // Delete associated permissions
    await UserPermission.deleteMany({ userId: userId });

    // Delete associated sessions
    await Session.deleteMany({ userId: userId });

    res.status(200).json('User and associated data have been deleted.');
  } catch (error) {
    console.error('Error deleting User:', error.message);
    res.status(500).json({ error: 'Server error while deleting User.' });
  }
};