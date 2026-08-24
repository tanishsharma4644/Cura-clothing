const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { protect, admin } = require('../middleware/authMiddleware');
const { sendPasswordResetEmail, sendMagicLinkEmail } = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Track last login time for admin analytics
      user.lastLoginAt = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (with populated wishlist)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name imageUrl price category');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        wishlist: user.wishlist,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (name, email, password)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

    // Only hash and update password if a new one is provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      profilePicture: updatedUser.profilePicture,
      token: generateToken(updatedUser._id), // Return fresh token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote user to admin (Admin)
router.put('/:id/promote', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isAdmin = true;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Ban/Delete user (Admin)
router.delete('/:id/ban', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Prevent the admin from deleting themselves
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }
      
      await user.deleteOne();
      res.json({ message: 'User deleted successfully from database' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/users/forgot-password
 * @desc    Generate a password reset token and email it to the user
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Please provide an email address.' });

  try {
    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration attacks
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash it before saving (never store raw tokens in DB)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Build reset URL pointing to the frontend page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error.message);
    res.status(500).json({ message: 'Failed to send reset email. Try again later.' });
  }
});

/**
 * @route   POST /api/users/reset-password/:token
 * @desc    Validate the reset token and update the user password
 * @access  Public
 */
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    // Hash the incoming token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    // Update password and clear reset fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      message: 'Password reset successfully! You can now log in.',
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[ResetPassword] Error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/**
 * @route   POST /api/users/send-magic-link
 * @desc    Send a one-time magic login link to the user's email
 * @access  Public
 */
router.post('/send-magic-link', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (!user) {
      return res.json({ message: 'If that email is registered, a magic link has been sent.' });
    }

    // Generate a signed JWT as the magic token (15-min expiry)
    const magicToken = jwt.sign(
      { id: user._id, purpose: 'magic-login' },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '15m' }
    );

    // Store hashed version for single-use validation
    user.magicLinkToken = crypto.createHash('sha256').update(magicToken).digest('hex');
    user.magicLinkExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const magicUrl = `${frontendUrl}/verify-magic?token=${magicToken}`;

    await sendMagicLinkEmail(user.email, magicUrl);

    res.json({ message: 'If that email is registered, a magic link has been sent.' });
  } catch (error) {
    console.error('[MagicLink] Error:', error.message);
    res.status(500).json({ message: 'Failed to send magic link. Try again later.' });
  }
});

/**
 * @route   POST /api/users/verify-magic
 * @desc    Verify magic link token and log the user in (one-time use)
 * @access  Public
 */
router.post('/verify-magic', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token is required.' });

  try {
    // First, verify JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    } catch {
      return res.status(400).json({ message: 'Magic link has expired or is invalid. Please request a new one.' });
    }

    if (decoded.purpose !== 'magic-login') {
      return res.status(400).json({ message: 'Invalid token type.' });
    }

    // Hash token and check DB (ensures one-time use)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      _id: decoded.id,
      magicLinkToken: hashedToken,
      magicLinkExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'This magic link has already been used or has expired.' });
    }

    // Invalidate token immediately after use (one-time only)
    user.magicLinkToken = undefined;
    user.magicLinkExpire = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[VerifyMagic] Error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
