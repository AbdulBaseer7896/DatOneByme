// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({  
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    required: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Date,
    default: null
  },
}, {
  timestamps: true,
});

UserSchema.virtual('permissions', {
  ref: 'permissions',
  localField: '_id', 
  foreignField: 'userId',
  justOne: true  
});

// Make sure virtuals are included when converting to JSON
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to hash password before saving a user
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-update middleware to hash password before updating a user
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  // Check if the password field is being modified
  if (update.password !== undefined) {
    // Ensure that the password field is not empty
    if (update.password === '') {
      delete update.password; // Do not update password if it's blank
    } else {
      try {
        const salt = await bcrypt.genSalt(10);
        update.password = await bcrypt.hash(update.password, salt);
      } catch (error) {
        return next(error);
      }
    }
  }
  next();
});

// Pre-update middleware to hash password before updating a user
UserSchema.pre('updateOne', async function (next) {
  const update = this.getUpdate();

  // Check if the password field is being modified
  if (update.password !== undefined) {
    // Ensure that the password field is not empty
    if (update.password === '') {
      delete update.password; // Do not update password if it's blank
    } else {
      try {
        const salt = await bcrypt.genSalt(10);
        update.password = await bcrypt.hash(update.password, salt);
      } catch (error) {
        return next(error);
      }
    }
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error('Error comparing passwords');
  }
};

const User = mongoose.model('users', UserSchema);

module.exports = User;
