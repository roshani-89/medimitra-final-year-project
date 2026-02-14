const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  deliveryAddress: {
    fullName: String,
    society: String,
    pincode: String,
    mobile: String,
    landmark: String,
    addressType: String,
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod', 'razorpay', 'demo', 'online'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  orderId: {
    type: String,
    unique: true,
  },
  trackingId: String,
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    message: String
  }],
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
