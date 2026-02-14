const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

// Check if running in demo mode (no valid Razorpay keys)
const isDemoMode = !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_KEY_ID.includes('YourKeyHere') ||
    process.env.RAZORPAY_KEY_ID === 'rzp_test_xxxx' ||
    process.env.RAZORPAY_KEY_SECRET === 'your_secret_here';

let razorpay;
if (!isDemoMode) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log('✅ Razorpay initialized successfully');
    } catch (error) {
        console.error('❌ Razorpay initialization failed:', error.message);
    }
}

// Create Order (Razorpay/Demo/COD)
router.post('/create-order', auth, async (req, res) => {
    try {
        const { productId, quantity, paymentMethod = 'online' } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock available' });
        }

        const amount = product.price * quantity;

        // Handle Cash on Delivery
        if (paymentMethod === 'cod') {
            const orderId = `COD_ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            return res.json({
                isDemo: false,
                isCOD: true,
                orderId: orderId,
                amount: amount,
                currency: "INR",
                productName: product.name,
                message: "Cash on Delivery order created"
            });
        }

        // Handle Demo Mode (No Razorpay keys)
        if (isDemoMode) {
            console.log('🧪 Running in DEMO MODE - No valid Razorpay keys found');
            const demoOrderId = `DEMO_ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            return res.json({
                isDemo: true,
                orderId: demoOrderId,
                amount: amount,
                currency: "INR",
                productName: product.name,
                message: "Demo Payment Environment Active - No actual payment will be processed"
            });
        }

        // Real Razorpay Order Creation
        try {
            const options = {
                amount: amount * 100, // Convert to paise
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                notes: {
                    productId: product._id.toString(),
                    productName: product.name,
                    quantity: quantity
                }
            };

            const order = await razorpay.orders.create(options);

            return res.json({
                isDemo: false,
                orderId: order.id,
                amount: amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                productName: product.name,
                message: "Razorpay order created successfully"
            });
        } catch (razorpayError) {
            console.error('Razorpay Order Creation Error:', razorpayError);
            return res.status(500).json({
                message: 'Failed to create Razorpay order',
                error: razorpayError.message
            });
        }

    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(500).json({
            message: 'Failed to initiate order',
            error: error.message
        });
    }
});

// Verify Payment and Create Final Order
router.post('/verify-payment', auth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            productId,
            quantity,
            deliveryAddress,
            paymentMethod = 'razorpay',
            isDemo
        } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Product out of stock' });
        }

        const totalPrice = product.price * quantity;
        const tax = Math.round(totalPrice * 0.18); // 18% GST
        const finalPrice = totalPrice + tax;

        // Validate delivery address
        if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.mobile || !deliveryAddress.pincode) {
            return res.status(400).json({ message: 'Complete delivery address is required' });
        }

        // Handle Demo Mode Order
        if (isDemo || isDemoMode) {
            console.log('🧪 Creating DEMO order');

            const newOrder = new Order({
                buyerId: req.user._id,
                productId,
                quantity,
                totalPrice: finalPrice,
                deliveryAddress: {
                    fullName: deliveryAddress.fullName,
                    society: deliveryAddress.society,
                    pincode: deliveryAddress.pincode,
                    mobile: deliveryAddress.mobile,
                    landmark: deliveryAddress.landmark || '',
                    addressType: deliveryAddress.addressType || 'home'
                },
                paymentMethod: 'demo',
                paymentStatus: 'Completed',
                razorpay_order_id: razorpay_order_id || `DEMO_PAY_${Date.now()}`,
                orderId: `ORD-DEMO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'Confirmed',
                statusHistory: [{
                    status: 'Confirmed',
                    timestamp: new Date(),
                    message: 'Demo order has been confirmed successfully.'
                }]
            });

            await newOrder.save();

            // Update product quantity
            product.quantity -= quantity;
            await product.save();

            console.log('✅ Demo order created successfully:', newOrder.orderId);

            return res.json({
                success: true,
                message: 'Demo order placed successfully',
                order: newOrder,
                isDemo: true
            });
        }

        // Handle Cash on Delivery
        if (paymentMethod === 'cod') {
            console.log('💰 Creating COD order');

            const newOrder = new Order({
                buyerId: req.user._id,
                productId,
                quantity,
                totalPrice: finalPrice,
                deliveryAddress: {
                    fullName: deliveryAddress.fullName,
                    society: deliveryAddress.society,
                    pincode: deliveryAddress.pincode,
                    mobile: deliveryAddress.mobile,
                    landmark: deliveryAddress.landmark || '',
                    addressType: deliveryAddress.addressType || 'home'
                },
                paymentMethod: 'cod',
                paymentStatus: 'Pending',
                razorpay_order_id: razorpay_order_id,
                orderId: `ORD-COD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'Confirmed',
                statusHistory: [{
                    status: 'Confirmed',
                    timestamp: new Date(),
                    message: 'Your order has been confirmed via Cash on Delivery.'
                }]
            });

            await newOrder.save();

            // Update product quantity
            product.quantity -= quantity;
            await product.save();

            console.log('✅ COD order created successfully:', newOrder.orderId);

            return res.json({
                success: true,
                message: 'Order placed successfully. Pay on delivery.',
                order: newOrder,
                isCOD: true
            });
        }

        // Real Razorpay Payment Verification
        if (!razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Payment details are incomplete' });
        }

        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            console.error('❌ Payment signature verification failed');
            return res.status(400).json({
                success: false,
                message: "Payment verification failed. Invalid signature."
            });
        }

        console.log('✅ Payment signature verified successfully');

        // Create verified order
        const newOrder = new Order({
            buyerId: req.user._id,
            productId,
            quantity,
            totalPrice: finalPrice,
            deliveryAddress: {
                fullName: deliveryAddress.fullName,
                society: deliveryAddress.society,
                pincode: deliveryAddress.pincode,
                mobile: deliveryAddress.mobile,
                landmark: deliveryAddress.landmark || '',
                addressType: deliveryAddress.addressType || 'home'
            },
            paymentMethod: 'razorpay',
            paymentStatus: 'Completed',
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: 'Confirmed',
            statusHistory: [{
                status: 'Confirmed',
                timestamp: new Date(),
                message: 'Payment verified and order confirmed.'
            }]
        });

        await newOrder.save();

        // Update product quantity
        product.quantity -= quantity;
        await product.save();

        console.log('✅ Order created successfully:', newOrder.orderId);

        return res.json({
            success: true,
            message: 'Payment verified and order placed successfully',
            order: newOrder
        });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({
            message: 'Payment verification failed',
            error: error.message
        });
    }
});

// Get order details
router.get('/order/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId,
            buyerId: req.user._id
        }).populate('productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Fetch Order Error:', error);
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
});

module.exports = router;