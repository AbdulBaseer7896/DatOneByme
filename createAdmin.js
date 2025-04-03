const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const UserPermission = require('./models/UserPermission');

dotenv.config({ path: '.env' });

// Admin configuration
const ADMIN_CONFIG = {
  name: 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'SecureAdminPass123!',
  role: 'admin'
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check for existing admin
    const existingAdmin = await User.findOne({ email: ADMIN_CONFIG.email });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);
    
    const adminUser = new User({
      name: ADMIN_CONFIG.name,
      email: ADMIN_CONFIG.email,
      password: hashedPassword,
      role: ADMIN_CONFIG.role
    });

    const savedUser = await adminUser.save();

    // Create admin permissions
    const adminPermissions = new UserPermission({
      userId: savedUser._id,
      dashboard: true,
      searchTrucks: true,
      privateLoads: true,
      myLoads: true,
      privateNetwork: true,
      myTrucks: true,
      liveSupport: true,
      tools: true,
      sendFeedback: true,
      notifications: true,
      profile: true,
      dataSessionId: null
    });

    await adminPermissions.save();
    console.log('✅ Admin user and permissions created successfully');

  } catch (error) {
    console.error('❌ Error during admin creation:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🚪 MongoDB connection closed');
  }
}

createAdmin();