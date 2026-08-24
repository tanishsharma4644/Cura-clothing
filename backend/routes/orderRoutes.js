const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');

// Create new order
router.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, isPaid, paidAt } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  } else {
    try {
      // Generate tracking number if not set
      const trackingNumber = `CURA-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        totalPrice,
        isPaid: isPaid || false,
        paidAt: paidAt || (isPaid ? new Date() : undefined),
        trackingNumber,
        courierPartner: 'Delhivery Express',
        estimatedDelivery,
        orderStatus: 'Placed'
      });

      const createdOrder = await order.save();
      
      // Decrement inventory stock
      for (const item of orderItems) {
        const product = await Product.findById(item._id || item.product);
        if (product) {
          if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v.size === item.selectedSize && v.color === item.selectedColor);
            if (variant) {
              variant.stock = Math.max(0, variant.stock - item.qty);
            }
          } else {
            product.countInStock = Math.max(0, product.countInStock - item.qty);
          }
          await product.save();
        }
      }

      // Send order confirmation email asynchronously
      if (req.user && req.user.email) {
        sendOrderConfirmationEmail(req.user.email, createdOrder, req.user.name).catch(err => {
          console.error('[Email Send Warning]', err.message);
        });
      }

      res.status(201).json(createdOrder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while creating order' });
    }
  }
});

// Track order by ID or tracking number
router.get('/track/:id', async (req, res) => {
  try {
    const searchId = req.params.id.trim();
    let order = null;

    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(searchId).populate('user', 'name email');
    }

    if (!order) {
      order = await Order.findOne({
        $or: [
          { trackingNumber: searchId.toUpperCase() },
          { trackingNumber: searchId },
          { 'shippingAddress.phone': searchId }
        ]
      }).populate('user', 'name email');
    }

    if (!order) {
      const allOrders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
      order = allOrders.find(o => o._id.toString().toUpperCase().endsWith(searchId.toUpperCase()));
    }

    if (!order) {
      return res.status(404).json({ message: 'No matching order found for this tracking ID or phone number.' });
    }

    // Timeline calculations
    const createdDate = new Date(order.createdAt);
    const estDate = order.estimatedDelivery || new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000);

    let currentStepIndex = 1;
    let statusText = 'Processing & Quality Check';

    if (order.isDelivered || order.orderStatus === 'Delivered') {
      currentStepIndex = 4;
      statusText = 'Delivered';
    } else if (order.orderStatus === 'Out for Delivery') {
      currentStepIndex = 3;
      statusText = 'Out for Delivery';
    } else if (order.orderStatus === 'Dispatched') {
      currentStepIndex = 2;
      statusText = 'Dispatched via Courier';
    } else if (order.isPaid || order.orderStatus === 'Processing') {
      currentStepIndex = 1;
      statusText = 'Order Confirmed & Processing';
    }

    const steps = [
      { label: 'Order Placed', time: createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), done: true },
      { label: 'Processing & Quality Check', time: new Date(createdDate.getTime() + 12 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), done: currentStepIndex >= 1 },
      { label: 'Dispatched (Delhivery)', time: new Date(createdDate.getTime() + 36 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), done: currentStepIndex >= 2 },
      { label: 'Out for Delivery', time: new Date(createdDate.getTime() + 72 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), done: currentStepIndex >= 3 },
      { label: 'Delivered', time: estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), done: currentStepIndex >= 4 }
    ];

    res.json({
      orderId: order._id,
      shortId: order._id.toString().slice(-8).toUpperCase(),
      trackingNumber: order.trackingNumber || `CURA-TRK-${order._id.toString().slice(-6).toUpperCase()}`,
      courierPartner: order.courierPartner || 'Delhivery Express',
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      currentStatus: statusText,
      currentStepIndex,
      estimatedDelivery: estDate,
      shippingAddress: order.shippingAddress,
      orderItems: order.orderItems,
      steps,
      customerName: order.user?.name || 'Customer'
    });

  } catch (error) {
    console.error('Track Order Error:', error);
    res.status(500).json({ message: 'Server error retrieving tracking details' });
  }
});

// Get user orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (Admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, courierPartner, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (order) {
      if (status) order.orderStatus = status;
      if (courierPartner) order.courierPartner = courierPartner;
      if (trackingNumber) order.trackingNumber = trackingNumber;

      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order to delivered (Admin)
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.orderStatus = 'Delivered';
      order.deliveredAt = Date.now();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
