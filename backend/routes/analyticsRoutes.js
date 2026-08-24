const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get aggregated dashboard analytics for the Admin
 * @access  Private/Admin
 *
 * Demonstrates MongoDB Aggregation Pipeline — a key skill for backend roles.
 * Returns: revenue over time, top-selling products, user growth, category breakdown.
 */
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    // ── 1. Revenue Aggregation: Total revenue grouped by month ────────────────
    const revenueByMonth = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }, // Last 12 months
    ]);

    // ── 2. Top-Selling Products: Products with the most order line items ──────
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.qty' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
          productName: { $first: '$orderItems.name' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // ── 3. Category Breakdown: Revenue per category ───────────────────────────
    const categoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$countInStock' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // ── 4. Summary Stats: Single-query aggregation for key metrics ────────────
    const [orderStats] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          paidOrders: { $sum: { $cond: ['$isPaid', 1, 0] } },
          deliveredOrders: { $sum: { $cond: ['$isDelivered', 1, 0] } },
          avgOrderValue: { $avg: '$totalPrice' },
        },
      },
    ]);

    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const lowStockProducts = await Product.countDocuments({ countInStock: { $lte: 5 } });

    // ── 5. User Growth: New user registrations per month ─────────────────────
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalOrders: orderStats?.totalOrders || 0,
          totalRevenue: orderStats?.totalRevenue || 0,
          paidOrders: orderStats?.paidOrders || 0,
          deliveredOrders: orderStats?.deliveredOrders || 0,
          avgOrderValue: orderStats?.avgOrderValue?.toFixed(2) || 0,
          totalUsers,
          totalProducts,
          lowStockProducts,
        },
        revenueByMonth,
        topProducts,
        categoryBreakdown,
        userGrowth,
      },
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load analytics data.' });
  }
});

/**
 * @route   GET /api/analytics/products/low-stock
 * @desc    Get all products with stock below a threshold (default: 10)
 * @access  Private/Admin
 */
router.get('/products/low-stock', protect, admin, async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const lowStockItems = await Product.find({ countInStock: { $lte: threshold } })
      .select('name category countInStock price imageUrl')
      .sort({ countInStock: 1 });

    res.json({
      success: true,
      count: lowStockItems.length,
      threshold,
      products: lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch low stock items.' });
  }
});

module.exports = router;
