// server.js

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware for security
app.use(helmet());
app.use(cors({
  origin: '*', // Adjust as needed
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Body parser
app.use(express.json());

// Logging HTTP requests
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
// app.use(limiter);

// Define routes
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/file', require('./routes/file'));
app.use('/session', require('./routes/dataSession'));
app.use('/domain', require('./routes/whitelistedDomain'));

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
