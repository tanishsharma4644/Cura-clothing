const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    profilePicture: { type: String, default: '' },
    // Persistent wishlist stored in DB — allows cross-device sync
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    // Password reset flow
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Magic link (passwordless login) flow
    magicLinkToken: String,
    magicLinkExpire: Date,
    // Track last login for admin user management insights
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
