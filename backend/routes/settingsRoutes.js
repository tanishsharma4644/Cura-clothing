const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// @route   GET /api/settings
// @desc    Get store settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (req.body.marqueeText !== undefined) {
      settings.marqueeText = req.body.marqueeText;
    }
    if (req.body.marqueeActive !== undefined) {
      settings.marqueeActive = req.body.marqueeActive;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/settings/broadcast
// @desc    Send a newsletter broadcast to all users
// @access  Private/Admin
router.post('/broadcast', protect, admin, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Get all users to send emails to (in a real app, you might have a NewsletterSubscriber model)
    const users = await User.find({}, 'email name');
    
    // Create a Nodemailer transporter using Ethereal (mock SMTP for testing)
    // In production, you would use SendGrid, Mailgun, AWS SES, etc.
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const emails = users.map(u => u.email).join(', ');

    let info = await transporter.sendMail({
      from: '"Our Clothing Store" <newsletter@ourclothing.com>',
      to: emails,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="font-weight: 900; text-transform: uppercase;">OUR CLOTHING.</h1>
          <p style="white-space: pre-wrap;">${message}</p>
          <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 10px; color: #999; text-transform: uppercase;">You are receiving this because you are a registered user of Our Clothing.</p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.json({ 
      message: 'Broadcast sent successfully', 
      recipients: users.length,
      previewUrl: nodemailer.getTestMessageUrl(info) 
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Error sending broadcast' });
  }
});

module.exports = router;
