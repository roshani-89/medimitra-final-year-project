const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  generic_name: {
    type: String,
    required: true,
  },
  keywords: [{
    type: String,
  }],
  price: {
    type: Number,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  photos: [{
    type: String, // URLs to images
  }],
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['Medicine', 'Medical Equipment'],
    required: true,
  },
  location: {
    society: String,
    pincode: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
