// models/UserPermission.js

const mongoose = require('mongoose');

// Define the schema for user permissions
const UserPermissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', // Reference to the User model
    required: true
  },
	dataSessionId: {
		type: mongoose.Schema.Types.ObjectId,
    ref: 'DataSession', // Reference to the DataSession model
    default: null, // Optional, nullable relationship
	},
  dashboard: {
    type: Boolean,
    default: false
  },
  searchTrucks: {
    type: Boolean,
    default: false
  },
  privateLoads: {
    type: Boolean,
    default: false
  },
  myLoads: {
    type: Boolean,
    default: false
  },
  privateNetwork: {
    type: Boolean,
    default: false
  },
  myTrucks: {
    type: Boolean,
    default: false
  },
  liveSupport: {
    type: Boolean,
    default: false
  },
  tools: {
    type: Boolean,
    default: false
  },
  sendFeedback: {
    type: Boolean,
    default: false
  },
  notifications: {
    type: Boolean,
    default: false
  },
  profile: {
    type: Boolean,
    default: false
  },
  searchLoadsMultitab: {
    type: Boolean,
    default: false
  },
  searchLoadsNoMultitab: {
    type: Number,
    default: 0,
		min: 0,
		max: 10
  },
  searchLoadsLaneRate: {
    type: Boolean,
    default: false
  },
  searchLoadsViewRoute: {
    type: Boolean,
    default: false
  },
  searchLoadsRateview: {
    type: Boolean,
    default: false
  },
  searchLoadsViewDirectory: {
    type: Boolean,
    default: false
  },
  domains: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'whitelisteddomains'
    }
  ],
  domain: {
    type: String,
    default: null
  },
},{
	timestamps: true,
});

UserPermissionSchema.virtual('datasessions', {
  ref: 'datasessions',
  localField: '_id', 
  foreignField: 'dataSessionId',
  justOne: true  
});

// Make sure virtuals are included when converting to JSON
UserPermissionSchema.set('toObject', { virtuals: true });
UserPermissionSchema.set('toJSON', { virtuals: true });

// Create the model from the schema
const UserPermission = mongoose.model('permissions', UserPermissionSchema);

module.exports = UserPermission;
