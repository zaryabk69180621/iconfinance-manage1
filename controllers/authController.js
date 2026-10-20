const User = require('../models/User');

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Remove password from user response object
  const userObj = {
    _id: user._id,
    name: user.name,
    fname: user.fname,
    userId: user.userId,
    email: user.email,
    designation: user.designation,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj
  });
};

// @desc    Register new user (Signup)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, fname, email, designation, password } = req.body;
    // Accept 'id' or 'userId' from request body
    const userId = req.body.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID (id or userId) is required'
      });
    }

    // Check if user with given email or userId already exists
    const existingUser = await User.findOne({
      $or: [{ email: email ? email.toLowerCase() : '' }, { userId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or user ID already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      fname,
      userId,
      email,
      designation,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    next(err);
  }
};

// @desc    Sign in / Authenticate user & get token
// @route   POST /api/auth/signin
// @access  Public
exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const identifier = req.body.email || req.body.id || req.body.userId;

    // Validate email/id and password
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email/user ID and password'
      });
    }

    // Check for user (search by email or userId)
    const user = await User.findOne({
      $or: [
        { email: identifier.toString().toLowerCase() },
        { userId: identifier.toString() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};
