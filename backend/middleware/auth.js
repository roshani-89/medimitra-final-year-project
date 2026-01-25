const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    console.log('=== Auth Middleware ===');
    
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    console.log('Token decoded:', decoded);
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('User authenticated:', user._id);
    
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};