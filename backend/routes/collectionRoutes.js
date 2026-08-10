const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/collections
// @desc    Get all active collections
// @access  Public
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true }).populate('products');
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/collections/admin
// @desc    Get all collections (including inactive)
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const collections = await Collection.find({}).populate('products');
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/collections
// @desc    Create a new collection
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, imageUrl, products, isActive } = req.body;
    const collection = new Collection({
      title,
      description,
      imageUrl,
      products,
      isActive
    });
    const createdCollection = await collection.save();
    res.status(201).json(createdCollection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/collections/:id
// @desc    Update a collection
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, imageUrl, products, isActive } = req.body;
    const collection = await Collection.findById(req.params.id);

    if (collection) {
      collection.title = title || collection.title;
      collection.description = description || collection.description;
      collection.imageUrl = imageUrl || collection.imageUrl;
      if (products) collection.products = products;
      if (isActive !== undefined) collection.isActive = isActive;

      const updatedCollection = await collection.save();
      res.json(updatedCollection);
    } else {
      res.status(404).json({ message: 'Collection not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/collections/:id
// @desc    Delete a collection
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (collection) {
      await collection.deleteOne();
      res.json({ message: 'Collection removed' });
    } else {
      res.status(404).json({ message: 'Collection not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
