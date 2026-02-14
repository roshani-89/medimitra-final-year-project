const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedDemoProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimitra');
        console.log('📦 Connected to database...');

        // Find a real user to be the seller
        let seller = await User.findOne({ role: 'Admin' });
        if (!seller) {
            seller = await User.findOne();
        }

        if (!seller) {
            console.log('⚠️  No users found to assign as seller. Please register an account first.');
            console.log('💡 Tip: Run your app and create a user account, then run this script again.');
            process.exit(1);
        }

        console.log(`✅ Found seller: ${seller.name || seller.email}`);

        // Demo products for testing checkout
        const demoProducts = [
            {
                name: 'Premium Paracetamol 500mg',
                brand: 'MediMitra Labs',
                generic_name: 'Paracetamol',
                description: 'Fast-acting pain relief and fever reducer. Safe and effective for adults and children. Demo product for testing checkout system with prescription requirements.',
                price: 45,
                quantity: 100,
                category: 'Medicine',
                sellerId: seller._id,
                expiryDate: new Date('2026-12-31'),
                photos: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800'],
                location: {
                    society: 'Medical District',
                    pincode: '400001'
                }
            },
            {
                name: 'Digital Thermometer Pro',
                brand: 'HealthTech',
                generic_name: 'Digital Thermometer',
                description: 'Accurate digital thermometer with fast 10-second readings. LCD display, fever alarm, and memory function. Perfect for home healthcare.',
                price: 350,
                quantity: 50,
                category: 'Device',
                sellerId: seller._id,
                expiryDate: new Date('2028-12-31'),
                photos: ['https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=800'],
                location: {
                    society: 'Tech Hub',
                    pincode: '400002'
                }
            },
            {
                name: 'Vitamin D3 Capsules',
                brand: 'NutriHealth',
                generic_name: 'Cholecalciferol',
                description: 'High-potency Vitamin D3 supplement for bone health and immunity. 60 capsules per bottle. Suitable for daily supplementation.',
                price: 599,
                quantity: 75,
                category: 'Supplement',
                sellerId: seller._id,
                expiryDate: new Date('2026-06-30'),
                photos: ['https://images.unsplash.com/photo-1550572017-4814ea1ce845?w=800'],
                location: {
                    society: 'Wellness Center',
                    pincode: '400003'
                }
            },
            {
                name: 'Blood Pressure Monitor',
                brand: 'CardioSafe',
                generic_name: 'BP Monitor',
                description: 'Automatic digital blood pressure monitor with large display and memory storage for 99 readings. Clinically validated accuracy.',
                price: 1899,
                quantity: 30,
                category: 'Device',
                sellerId: seller._id,
                expiryDate: new Date('2029-12-31'),
                photos: ['https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=800'],
                location: {
                    society: 'Healthcare Plaza',
                    pincode: '400004'
                }
            },
            {
                name: 'Antiseptic Liquid 500ml',
                brand: 'SafeGuard',
                generic_name: 'Dettol Alternative',
                description: 'Multi-purpose antiseptic liquid for disinfection of wounds and surfaces. Kills 99.9% germs. Essential for first aid kits.',
                price: 185,
                quantity: 150,
                category: 'Medicine',
                sellerId: seller._id,
                expiryDate: new Date('2027-03-31'),
                photos: ['https://images.unsplash.com/photo-1603560168430-c0b72b42e471?w=800'],
                location: {
                    society: 'Medical Supplies',
                    pincode: '400005'
                }
            },
            {
                name: 'Omega-3 Fish Oil',
                brand: 'OceanPure',
                generic_name: 'EPA & DHA',
                description: 'Premium quality fish oil capsules rich in Omega-3 fatty acids. Supports heart, brain, and joint health. 90 softgels.',
                price: 849,
                quantity: 60,
                category: 'Supplement',
                sellerId: seller._id,
                expiryDate: new Date('2026-09-30'),
                photos: ['https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800'],
                location: {
                    society: 'Nutrition Hub',
                    pincode: '400006'
                }
            }
        ];

        let addedCount = 0;
        let skippedCount = 0;

        for (const productData of demoProducts) {
            // Check if product already exists
            const existing = await Product.findOne({ name: productData.name });

            if (existing) {
                console.log(`⏭️  Skipped: "${productData.name}" (already exists)`);
                skippedCount++;
                continue;
            }

            const product = new Product(productData);
            await product.save();
            console.log(`✅ Added: "${productData.name}" - ₹${productData.price}`);
            addedCount++;
        }

        console.log('\n🎉 Demo Products Seeding Complete!');
        console.log(`📊 Summary: ${addedCount} added, ${skippedCount} skipped`);
        console.log('\n💡 Tips:');
        console.log('   • Browse products at /products');
        console.log('   • Test checkout with different price points');
        console.log('   • Try demo mode, COD, and online payment');
        console.log('   • Products have realistic stock quantities\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding products:', err);
        process.exit(1);
    }
};

seedDemoProducts();