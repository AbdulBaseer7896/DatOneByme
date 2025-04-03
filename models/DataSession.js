// models/DataSession.js

const mongoose = require('mongoose');

const DataSessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  proxy: {
    type: String,
    required: true,
    unique: true,
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    default: null,
  },
}, {
    timestamps: true,
});

// Pre-save middleware to ensure required fields only on creation
DataSessionSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.name = this.name || undefined;
    this.proxy = this.proxy || undefined;
    this.domain = this.domain || undefined;
  }
  next();
});

const DataSession = mongoose.model('dataSession', DataSessionSchema);

module.exports = DataSession;
