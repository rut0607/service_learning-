const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, interests } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate interests array
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ message: 'Please select at least one interest' });
    }

    // Create user
    try {
      const user = await User.create({
        name,
        email,
        password,
        interests
      });

      sendTokenResponse(user, 201, res);
    } catch (createError) {
      // Handle specific Mongoose validation errors
      if (createError.name === 'ValidationError') {
        const messages = Object.values(createError.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      
      // Handle duplicate key error (if unique constraint is violated)
      if (createError.code === 11000) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Re-throw for general error handling
      throw createError;
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server Error. Please try again later.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Send login notification email
    const loginEmailHtml = `
      <h2>Login Notification</h2>
      <p>Hello ${user.name},</p>
      <p>You have successfully logged in to your ISKCON Events account.</p>
      <p>If this wasn't you, please contact us immediately.</p>
      <p>Thank you,<br>ISKCON Events Team</p>
    `;
    
    try {
      await sendEmail(
        user.email,
        'Login Notification - ISKCON Events',
        loginEmailHtml
      );
      console.log(`Login notification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send login notification email:', emailError);
      // Continue with login process even if email fails
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  // Use secure flag in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};