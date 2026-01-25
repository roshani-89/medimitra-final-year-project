const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('\n🚀 Starting MediMitra Backend...\n');

// CORS - Allow all origins for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/medimitra';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err.message));

// Import routes with error handling
console.log('\n📁 Loading routes...\n');

let authRoute, productsRoute, ordersRoute, uploadRoute, chatbotRoute;

try {
  authRoute = require('./routes/auth');
  console.log('✅ Auth route loaded');
} catch (e) {
  console.log('⚠️  Auth route not found');
}

try {
  productsRoute = require('./routes/products');
  console.log('✅ Products route loaded');
} catch (e) {
  console.log('⚠️  Products route not found');
}

try {
  ordersRoute = require('./routes/orders');
  console.log('✅ Orders route loaded');
} catch (e) {
  console.log('⚠️  Orders route not found');
}

try {
  uploadRoute = require('./routes/upload');
  console.log('✅ Upload route loaded');
} catch (e) {
  console.log('⚠️  Upload route not found');
}

try {
  chatbotRoute = require('./routes/chatbot');
  console.log('✅ Chatbot route loaded');
} catch (e) {
  console.error('❌ Chatbot route ERROR:', e.message);
  console.log('   Make sure ./routes/chatbot.js exists');
}

console.log('\n📌 Registering routes...\n');

// Register routes
if (authRoute) app.use('/api/auth', authRoute);
if (productsRoute) app.use('/api/products', productsRoute);
if (ordersRoute) app.use('/api/orders', ordersRoute);
if (uploadRoute) app.use('/api/upload', uploadRoute);

if (chatbotRoute) {
  app.use('/api/chatbot', chatbotRoute);
  console.log('✅ Chatbot registered at /api/chatbot');
} else {
  console.error('❌ Chatbot route NOT registered');
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '✅ MediMitra Backend API',
    status: 'running',
    port: PORT,
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      upload: '/api/upload',
      chatbot: '/api/chatbot'
    },
    routes_status: {
      auth: authRoute ? '✅' : '❌',
      products: productsRoute ? '✅' : '❌',
      orders: ordersRoute ? '✅' : '❌',
      upload: uploadRoute ? '✅' : '❌',
      chatbot: chatbotRoute ? '✅' : '❌'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ MediMitra Backend Server Started Successfully!');
  console.log('='.repeat(60));
  console.log(`🌐 Server URL:        http://localhost:${PORT}`);
  console.log(`🤖 Chatbot Test:      http://localhost:${PORT}/api/chatbot/test`);
  console.log(`📊 Health Check:      http://localhost:${PORT}/api/health`);
  console.log(`📁 API Root:          http://localhost:${PORT}/`);
  console.log('='.repeat(60) + '\n');
});