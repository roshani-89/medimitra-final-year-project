const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'name email');
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's products - IMPORTANT: This must come BEFORE /:id route
router.get('/user/my-products', auth, async (req, res) => {
  try {
    console.log('=== Fetching user products ===');
    console.log('User ID:', req.user._id);
    
    const products = await Product.find({ sellerId: req.user._id }).populate('sellerId', 'name email');
    
    console.log('Found products:', products.length);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new product (protected)
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== Add Product Request ===');
    console.log('User:', req.user._id);
    console.log('Body:', req.body);
    
    const { name, brand, generic_name, keywords, expiryDate, price, quantity, description, photos, category, society, pincode, mobile } = req.body;
    
    // Validation
    if (!name || !brand || !generic_name || !price || !quantity || !expiryDate || !category) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    
    const product = new Product({
      name,
      brand,
      generic_name,
      keywords: keywords || [],
      expiryDate,
      price,
      quantity,
      description,
      photos: photos || [],
      sellerId: req.user._id,
      category,
      location: { society, pincode },
      mobile: mobile || req.user.mobile || ''
    });
    
    await product.save();
    
    console.log('Product saved successfully:', product._id);
    
    res.status(201).json({ 
      message: 'Product added successfully', 
      product,
      success: true 
    });
    
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (protected, only seller can update)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('=== Update Product Request ===');
    console.log('Product ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });
    
    await product.save();
    
    console.log('Product updated successfully');
    
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product - FIXED VERSION
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('=== Delete Product Request ===');
    console.log('Product ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('User:', req.user);
    
    // Validate MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid product ID format');
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('Product not found in database');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Product found:', {
      id: product._id,
      name: product.name,
      sellerId: product.sellerId.toString()
    });
    
    // Check authorization
    if (product.sellerId.toString() !== req.user._id.toString()) {
      console.log('Authorization failed:', {
        productSeller: product.sellerId.toString(),
        currentUser: req.user._id.toString()
      });
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    // Delete the product
    await Product.findByIdAndDelete(req.params.id);
    
    console.log('Product deleted successfully');
    
    res.json({ 
      message: 'Product deleted successfully', 
      success: true,
      deletedId: req.params.id
    });
    
  } catch (error) {
    console.error('=== Delete Error ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error while deleting product', 
      error: error.message,
      errorType: error.name
    });
  }
});

module.exports = router;