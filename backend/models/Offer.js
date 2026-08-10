const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['promocode', 'automatic'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, // e.g., 'SUMMER20'
  },
  discountPercentage: { 
    type: Number, 
    required: true 
  },
  minItems: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
