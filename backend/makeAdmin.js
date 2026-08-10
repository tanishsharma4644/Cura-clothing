const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    const emailToUpgrade = process.argv[2];

    if (!emailToUpgrade) {
      console.log('Please provide an email address. Usage: node makeAdmin.js <email>');
      process.exit(1);
    }

    const user = await User.findOne({ email: emailToUpgrade });
    
    if (user) {
      user.isAdmin = true;
      await user.save();
      console.log(`Success! User ${emailToUpgrade} is now an admin.`);
    } else {
      console.log(`User with email ${emailToUpgrade} not found.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
