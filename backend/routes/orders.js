const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Place new order (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity, society, pincode, mobile, paymentMethod } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if enough quantity is available
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Generate unique order ID (simple example, can be improved)
    const orderId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Create order
    const order = new Order({
      buyerId: req.user._id,
      productId,
      quantity,
      totalPrice,
      deliveryAddress: { society, pincode, mobile },
      paymentMethod,
      orderId,
    });

    await order.save();

    // Update product quantity
    product.quantity -= quantity;
    await product.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders (protected)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('productId', 'name price description photos')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get orders for seller's products (protected)
router.get('/seller-orders', auth, async (req, res) => {
  try {
    // Find products owned by the seller
    const products = await Product.find({ sellerId: req.user._id });
    const productIds = products.map(product => product._id);

    // Find orders for these products
    const orders = await Order.find({ productId: { $in: productIds } })
      .populate('productId', 'name price description')
      .populate('buyerId', 'name email mobile')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (protected, only seller can update)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate('productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the seller of the product
    if (order.productId.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('productId', 'name price description photos')
      .populate('buyerId', 'name email mobile');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is buyer or seller
    if (order.buyerId._id.toString() !== req.user._id.toString() &&
        order.productId.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
