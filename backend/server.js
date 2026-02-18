const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');
const Product = require('./models/Product');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimitra', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Cron job to remove expired products daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🗑️ Running daily expired products cleanup...');
    const currentDate = new Date();
    const result = await Product.deleteMany({ expiryDate: { $lt: currentDate } });
    console.log(`✅ Deleted ${result.deletedCount} expired products`);
  } catch (error) {
    console.error('❌ Error during expired products cleanup:', error);
  }
});

// Check Google Gemini setup
let GoogleGenerativeAI, genAI, model;
try {
  const { GoogleGenerativeAI: GeminiAI } = require('@google/generative-ai');
  GoogleGenerativeAI = GeminiAI;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('\n❌ CRITICAL: GEMINI_API_KEY (Google API Key) not found in .env file!');
    console.error('   Add this line to .env: GEMINI_API_KEY=your-google-api-key\n');
  } else {
    genAI = new GoogleGenerativeAI(apiKey);

    // Try to get a working model
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-1.5-flash'
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const testModel = genAI.getGenerativeModel({ model: modelName });
        // We can't easily test it without making an API call, but we'll try to initialize
        model = testModel;
        console.log(`✅ Google Gemini (${modelName}) initialized`);
        break;
      } catch (err) {
        lastError = err;
        console.error(`⚠️ Failed to initialize ${modelName}:`, err.message);
      }
    }

    if (!model) {
      throw lastError || new Error('No models could be initialized');
    }
  }
} catch (e) {
  console.error('\n❌ Google Generative AI initialization failed!');
  console.error('   Error:', e.message);
}

// Chatbot test endpoint
app.get('/api/chatbot/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({
    message: '✅ Chatbot endpoint is reachable',
    geminiPackageInstalled: !!GoogleGenerativeAI,
    apiKeyConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    ready: !!model,
    activeModel: model ? model.model : 'none',
    timestamp: new Date().toISOString()
  });
});

// Chatbot ask endpoint
app.post('/api/chatbot/ask', async (req, res) => {
  try {
    console.log('\n📩 Chatbot request received');

    const { message, conversationHistory } = req.body;

    if (!message) {
      console.log('❌ No message provided');
      return res.status(400).json({
        error: 'Message is required',
        response: 'Please provide a message.'
      });
    }

    console.log(`   Message: "${message.substring(0, 50)}..."`);

    // Check Gemini setup
    if (!model) {
      console.error('❌ Gemini not configured');
      return res.status(503).json({
        error: 'AI service unavailable',
        response: '⚠️ I am currently in offline mode. How can I help you with orders or payments?',
        isOffline: true
      });
    }

    // Emergency check
    const emergencyWords = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'severe bleeding', 'breathing difficulty'];
    if (emergencyWords.some(w => message.toLowerCase().includes(w))) {
      console.log('🚨 Emergency detected');
      return res.json({
        response: '🚨 EMERGENCY! This needs immediate medical attention. Please call emergency services (108/112) right now!',
        isEmergency: true,
        success: true
      });
    }

    // Prepare prompt
    let contextPrompt = "You are MediMitra, a helpful health assistant. Provide concise, helpful health information. Always advise consulting a doctor for serious concerns. Keep responses professional and friendly.\n\n";

    // Add history if available
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-5).forEach(msg => {
        const role = msg.sender === 'user' ? 'User' : 'Assistant';
        contextPrompt += `${role}: ${msg.text}\n`;
      });
    }

    contextPrompt += `User: ${message}\nAssistant:`;

    console.log('   Calling Gemini API...');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const response = await result.response;
    const aiResponse = response.text();

    console.log('✅ Response generated');

    res.json({
      response: aiResponse,
      success: true,
      model: model ? model.model : 'unknown'
    });

  } catch (error) {
    console.error('\n❌ Chatbot API Error:', error.message);

    const userMessage = req.body?.message || '';
    let fallbackMsg = "I'm having trouble connecting to my AI core right now. I can help with general questions about our products, orders, and payments. What would you like to know?";

    if (userMessage.toLowerCase().includes('order')) {
      fallbackMsg = "I can't access my AI features right now, but you can track your orders in the 'My Orders' section of your profile.";
    } else if (userMessage.toLowerCase().includes('payment')) {
      fallbackMsg = "Online payments are processed securely via Razorpay. We also support Cash on Delivery.";
    }

    res.json({
      response: fallbackMsg,
      success: true,
      isFallback: true,
      error: error.message
    });
  }
});

console.log('✅ Chatbot routes registered\n');

// Other routes
console.log('📦 Registering API routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payment', require('./routes/payment'));
console.log('✅ All API routes registered');

// Root
app.get('/', (req, res) => {
  res.json({
    message: '✅ MediMitra Backend',
    status: 'running',
    chatbotReady: !!model,
    aiProvider: 'Google Gemini',
    port: PORT
  });
});

// 404
app.use((req, res) => {
  console.log(`❌ 404: ${req.path}`);
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Start
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ MediMitra Backend Server Started');
  console.log('='.repeat(60));
  console.log(`🌐 Server:       http://localhost:${PORT}`);
  console.log(`🤖 Chatbot Test: http://localhost:${PORT}/api/chatbot/test`);
  console.log(`📊 Status:       Google Gemini ${model ? 'Ready ✅' : 'Not Configured ❌'}`);
  console.log('='.repeat(60) + '\n');
});