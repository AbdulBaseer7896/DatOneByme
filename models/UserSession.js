// models/UserSession.js

const mongoose = require('mongoose');

// Define schema for user sessions
const UserSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 28800 // Token expires after 8 hour
  }
});

const UserSession = mongoose.model('sessions', UserSessionSchema);

module.exports = UserSession;
