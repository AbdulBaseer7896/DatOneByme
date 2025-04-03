const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSession = require('../models/UserSession');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if the session still exists in the database
    const session = await UserSession.findOne({ userId: decoded.userId, token });
    const user = await  User.findById(decoded.userId)
    if (!session) {
      return res.status(401).json({ message: 'Session expired or token invalid' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid User or user not exits' });
    }
    if (user.isBanned) {
      return res.status(401).json({ message: 'User is Banned' });
    }

    req.user = decoded;
    next();
  } catch (error) {    
    res.status(401).json({ message: 'Unauthorized Access' });
  }
};
