const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email: 'tanishsharma4644@gmail.com' },
      { isAdmin: true },
      { new: true }
    );
    console.log('Made admin:', user);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
