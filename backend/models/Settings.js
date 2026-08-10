const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  marqueeText: { 
    type: String, 
    default: "⚡ FREE EXPRESS SHIPPING ON ALL ORDERS OVER $150 ⚡ NEW AUTUMN COLLECTION DROPPING THIS FRIDAY ⚡" 
  },
  marqueeActive: { 
    type: Boolean, 
    default: true 
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
