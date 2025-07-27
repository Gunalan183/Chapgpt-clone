const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: {
          message: 'Username, email, and password are required.',
          status: 400
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: {
          message: existingUser.email === email 
            ? 'Email already registered.' 
            : 'Username already taken.',
          status: 400
        }
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: {
          message: messages.join('. '),
          status: 400
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Server error during registration.',
        status: 500
      }
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'Email and password are required.',
          status: 400
        }
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password.',
          status: 401
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password.',
          status: 401
        }
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: {
          message: 'Account is deactivated.',
          status: 401
        }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        lastLogin: user.lastLogin
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Server error during login.',
        status: 500
      }
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        preferences: req.user.preferences,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Server error fetching profile.',
        status: 500
      }
    });
  }
});

// Update user preferences
router.patch('/preferences', authMiddleware, async (req, res) => {
  try {
    const { theme, language, defaultModel } = req.body;
    
    const updateData = {};
    if (theme) updateData['preferences.theme'] = theme;
    if (language) updateData['preferences.language'] = language;
    if (defaultModel) updateData['preferences.defaultModel'] = defaultModel;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: {
          message: messages.join('. '),
          status: 400
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Server error updating preferences.',
        status: 500
      }
    });
  }
});

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

module.exports = router;
