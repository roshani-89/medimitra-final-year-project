const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Test script for expired product functionality
async function testExpiredProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimitra');
    console.log('✅ Connected to MongoDB');

    // Create a test expired product
    const expiredProduct = new Product({
      name: 'Test Expired Medicine',
      brand: 'TestBrand',
      generic_name: 'TestGeneric',
      price: 100,
      quantity: 10,
      expiryDate: new Date('2020-01-01'), // Past date
      description: 'Test expired product',
      sellerId: '507f1f77bcf86cd799439011', // Dummy ObjectId
      category: 'Medicine',
      location: { society: 'Test Society', pincode: '123456' }
    });

    await expiredProduct.save();
    console.log('✅ Created expired test product');

    // Create a test valid product
    const validProduct = new Product({
      name: 'Test Valid Medicine',
      brand: 'TestBrand',
      generic_name: 'TestGeneric',
      price: 100,
      quantity: 10,
      expiryDate: new Date('2030-01-01'), // Future date
      description: 'Test valid product',
      sellerId: '507f1f77bcf86cd799439011', // Dummy ObjectId
      category: 'Medicine',
      location: { society: 'Test Society', pincode: '123456' }
    });

    await validProduct.save();
    console.log('✅ Created valid test product');

    // Test GET products query (simulating the route logic)
    const currentDate = new Date();
    const products = await Product.find({ expiryDate: { $gte: currentDate } });
    console.log(`📊 Found ${products.length} non-expired products`);

    // Check that expired product is not in results and valid product is present
    const hasExpiredProduct = products.some(p => p.name === 'Test Expired Medicine');
    const hasValidProduct = products.some(p => p.name === 'Test Valid Medicine');

    if (!hasExpiredProduct && hasValidProduct) {
      console.log('✅ GET products filtering works correctly');
    } else {
      console.log('❌ GET products filtering failed');
      console.log(`   Expired product present: ${hasExpiredProduct}`);
      console.log(`   Valid product present: ${hasValidProduct}`);
    }

    // Test cron job logic (delete expired products)
    const deleteResult = await Product.deleteMany({ expiryDate: { $lt: currentDate } });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} expired products`);

    // Verify expired product was deleted
    const remainingExpired = await Product.find({ expiryDate: { $lt: currentDate } });
    if (remainingExpired.length === 0) {
      console.log('✅ Cron job logic works correctly');
    } else {
      console.log('❌ Cron job logic failed');
    }

    // Check remaining products
    const allProducts = await Product.find();
    console.log(`📦 Total products remaining: ${allProducts.length}`);

    // Clean up test products
    await Product.deleteMany({ name: { $in: ['Test Expired Medicine', 'Test Valid Medicine'] } });
    console.log('🧹 Cleaned up test products');

    await mongoose.disconnect();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.disconnect();
  }
}

testExpiredProducts();
