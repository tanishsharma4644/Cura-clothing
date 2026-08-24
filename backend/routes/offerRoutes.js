const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const { protect, admin } = require('../middleware/authMiddleware');

const DEFAULT_OFFERS = [
  { type: 'promocode', title: 'Welcome 10% Off', code: 'FIRST10', discountPercentage: 10, minItems: 1, isActive: true },
  { type: 'promocode', title: 'CURA Luxury 20% Off', code: 'CURA20', discountPercentage: 20, minItems: 1, isActive: true },
  { type: 'promocode', title: 'VIP Special 15% Off', code: 'WELCOME15', discountPercentage: 15, minItems: 1, isActive: true },
  { type: 'automatic', title: 'Buy 3+ Get 15% Off', code: '', discountPercentage: 15, minItems: 3, isActive: true }
];

// @route   GET /api/offers
// @desc    Get all offers (Auto-seeds defaults if empty)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let offers = await Offer.find({});
    if (offers.length === 0) {
      offers = await Offer.insertMany(DEFAULT_OFFERS);
    }
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/offers
// @desc    Create a new offer
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { type, title, code, discountPercentage, minItems, isActive } = req.body;
    const offer = await Offer.create({ type, title, code, discountPercentage, minItems, isActive });
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid offer data' });
  }
});

// @route   PUT /api/offers/:id
// @desc    Update an offer
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      offer.type = req.body.type || offer.type;
      offer.title = req.body.title || offer.title;
      offer.code = req.body.code !== undefined ? req.body.code : offer.code;
      offer.discountPercentage = req.body.discountPercentage || offer.discountPercentage;
      offer.minItems = req.body.minItems !== undefined ? req.body.minItems : offer.minItems;
      offer.isActive = req.body.isActive !== undefined ? req.body.isActive : offer.isActive;

      const updatedOffer = await offer.save();
      res.json(updatedOffer);
    } else {
      res.status(404).json({ message: 'Offer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/offers/:id
// @desc    Delete an offer
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      await offer.deleteOne();
      res.json({ message: 'Offer removed' });
    } else {
      res.status(404).json({ message: 'Offer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/offers/apply
// @desc    Validate and get a promo code
// @access  Public
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body;
    const cleanCode = (code || '').trim().toUpperCase();
    
    let offer = await Offer.findOne({ code: cleanCode, type: 'promocode', isActive: true });
    
    // Fallback for default codes
    if (!offer) {
      const foundDefault = DEFAULT_OFFERS.find(o => o.code === cleanCode && o.type === 'promocode');
      if (foundDefault) {
        offer = foundDefault;
      }
    }

    if (offer) {
      res.json(offer);
    } else {
      res.status(404).json({ message: 'Invalid or expired promo code. Try FIRST10, CURA20, or WELCOME15!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
