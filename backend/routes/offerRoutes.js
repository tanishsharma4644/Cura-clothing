const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/offers
// @desc    Get all offers (Active for public, all for admin)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find({});
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
    const offer = await Offer.findOne({ code: code, type: 'promocode', isActive: true });
    
    if (offer) {
      res.json(offer);
    } else {
      res.status(404).json({ message: 'Invalid or expired promo code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
