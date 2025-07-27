const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Access denied. No token provided.',
          status: 401
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid token. User not found.',
          status: 401
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: {
          message: 'Account is deactivated.',
          status: 401
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'Invalid token.',
          status: 401
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: 'Token expired.',
          status: 401
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Server error during authentication.',
        status: 500
      }
    });
  }
};

module.exports = authMiddleware;
