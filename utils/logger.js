const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });

module.exports = morgan('combined', { stream: accessLogStream });
