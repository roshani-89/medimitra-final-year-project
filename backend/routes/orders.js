const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Place new order (DEPRECATED - Use /api/payment routes instead)
// This route is kept for backward compatibility
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity, deliveryAddress, paymentMethod } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if enough quantity is available
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Calculate total price with tax
    const subtotal = product.price * quantity;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const totalPrice = subtotal + tax;

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Validate delivery address
    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.mobile || !deliveryAddress.pincode) {
      return res.status(400).json({ message: 'Complete delivery address is required' });
    }

    // Create order
    const order = new Order({
      buyerId: req.user._id,
      productId,
      quantity,
      totalPrice,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        society: deliveryAddress.society,
        pincode: deliveryAddress.pincode,
        mobile: deliveryAddress.mobile,
        landmark: deliveryAddress.landmark || '',
        addressType: deliveryAddress.addressType || 'home'
      },
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Completed',
      orderId,
      status: 'Confirmed',
      statusHistory: [{
        status: 'Confirmed',
        timestamp: new Date(),
        message: 'Your order has been confirmed and is being prepared.'
      }]
    });

    await order.save();

    // Update product quantity
    product.quantity -= quantity;
    await product.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders (protected)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('productId', 'name price brand description photos')
      .sort({ createdAt: -1 });

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      canBeCancelled: ['Pending', 'Confirmed'].includes(order.status) && !order.cancelledAt,
      deliveryStatus: getDeliveryStatus(order)
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order details (protected)
router.get('/my-orders/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      buyerId: req.user._id
    })
      .populate('productId', 'name price brand description photos')
      .populate('buyerId', 'name email mobile');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add computed fields
    const orderWithExtras = {
      ...order.toObject(),
      canBeCancelled: ['Pending', 'Confirmed'].includes(order.status) && !order.cancelledAt,
      deliveryStatus: getDeliveryStatus(order),
      isDelivered: order.status === 'Delivered',
      trackingAvailable: !!order.trackingId
    };

    res.json(orderWithExtras);
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel order (protected - buyer only)
router.put('/my-orders/:orderId/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      orderId: req.params.orderId,
      buyerId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!['Pending', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    if (order.cancelledAt) {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Update order
    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      message: reason || 'Order was cancelled by the customer.'
    });

    await order.save();

    // Restore product quantity
    const product = await Product.findById(order.productId);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order delivery address (protected - buyer only)
router.put('/my-orders/:orderId/address', auth, async (req, res) => {
  try {
    const { fullName, society, pincode, mobile, landmark, addressType } = req.body;

    const order = await Order.findOne({
      orderId: req.params.orderId,
      buyerId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be edited (only Pending/Confirmed)
    if (!['Pending', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order address cannot be changed at this stage' });
    }

    // Update address
    order.deliveryAddress = {
      fullName: fullName || order.deliveryAddress.fullName,
      society: society || order.deliveryAddress.society,
      pincode: pincode || order.deliveryAddress.pincode,
      mobile: mobile || order.deliveryAddress.mobile,
      landmark: landmark || order.deliveryAddress.landmark,
      addressType: addressType || order.deliveryAddress.addressType
    };

    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      message: 'Delivery address was updated by the customer.'
    });

    await order.save();

    res.json({
      message: 'Address updated successfully',
      order
    });
  } catch (error) {
    console.error('Update Address Error:', error);
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
      .populate('productId', 'name price brand description photos')
      .populate('buyerId', 'name email mobile')
      .sort({ createdAt: -1 });

    // Add delivery status
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      deliveryStatus: getDeliveryStatus(order)
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Get Seller Orders Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (protected, only seller can update)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, trackingId } = req.body;

    const order = await Order.findById(req.params.id).populate('productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the seller of the product
    if (order.productId.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status transition
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update order
    const oldStatus = order.status;
    order.status = status;

    if (trackingId) {
      order.trackingId = trackingId;
    }

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'Completed'; // Mark COD as completed on delivery
    }

    if (oldStatus !== status) {
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        message: getStatusMessage(status)
      });
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('productId', 'name price brand description photos')
      .populate('buyerId', 'name email mobile');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is buyer or seller
    const isBuyer = order.buyerId._id.toString() === req.user._id.toString();
    const isSeller = order.productId.sellerId && order.productId.sellerId.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add computed fields
    const orderWithExtras = {
      ...order.toObject(),
      canBeCancelled: isBuyer && ['Pending', 'Confirmed'].includes(order.status) && !order.cancelledAt,
      deliveryStatus: getDeliveryStatus(order)
    };

    res.json(orderWithExtras);
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order statistics for buyer (protected)
router.get('/stats/buyer', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id });

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
      totalSpent: orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalPrice, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get Buyer Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order statistics for seller (protected)
router.get('/stats/seller', auth, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id });
    const productIds = products.map(p => p._id);
    const orders = await Order.find({ productId: { $in: productIds } });

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
      totalRevenue: orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalPrice, 0),
      pendingPayments: orders
        .filter(o => o.paymentStatus === 'Pending' && o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalPrice, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get Seller Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { status, paymentMethod, paymentStatus, page = 1, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('productId', 'name price brand category photos')
      .populate('buyerId', 'name email mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        pages: Math.ceil(totalOrders / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to get delivery status message
function getDeliveryStatus(order) {
  if (order.status === 'Cancelled') {
    return 'Order Cancelled';
  }

  if (order.status === 'Delivered') {
    return 'Delivered';
  }

  if (order.status === 'Shipped') {
    return 'Out for delivery';
  }

  if (order.status === 'Processing') {
    return 'Being prepared';
  }

  if (order.status === 'Confirmed') {
    return 'Order confirmed';
  }

  return 'Order placed';
}

// Helper to get status message for history
function getStatusMessage(status) {
  switch (status) {
    case 'Pending': return 'Order is pending payment verification.';
    case 'Confirmed': return 'Order has been confirmed by the seller.';
    case 'Processing': return 'Product is being packed and prepared for shipment.';
    case 'Shipped': return 'Product has been handed over to our delivery partner.';
    case 'Delivered': return 'Product has been successfully delivered.';
    case 'Cancelled': return 'Order has been cancelled.';
    default: return `Status updated to ${status}`;
  }
}

module.exports = router;