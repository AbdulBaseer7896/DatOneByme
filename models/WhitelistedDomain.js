// models/WhitelistedDomain.js

const mongoose = require('mongoose');

// Define the schema for the WhitelistedDomain
const WhitelistedDomainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true, // Ensure domain names are unique
    trim: true
  }
}, {
  timestamps: true, // Automatically create createdAt and updatedAt fields
});

// Create the model from the schema
const WhitelistedDomain = mongoose.model('whitelistedDomain', WhitelistedDomainSchema);

module.exports = WhitelistedDomain;
