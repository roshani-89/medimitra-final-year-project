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

// Check OpenAI setup
let OpenAI, openai;
try {
  OpenAI = require('openai');

  if (!process.env.OPENAI_API_KEY) {
    console.error('\n❌ CRITICAL: OPENAI_API_KEY not found in .env file!');
    console.error('   Add this line to .env: OPENAI_API_KEY=sk-your-key-here\n');
  } else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.error('\n❌ CRITICAL: Invalid OPENAI_API_KEY format!');
    console.error('   Key should start with "sk-"\n');
  } else {
    openai = new OpenAI({
      apiKey: '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',
      baseURL: 'https://openrouter.ai/api/v1'
    });
    console.log('✅ OpenAI initialized successfully');
  }
} catch (e) {
  console.error('\n❌ OpenAI package not installed!');
  console.error('   Run: npm install openai\n');
}

// Chatbot test endpoint
app.get('/api/chatbot/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({
    message: '✅ Chatbot endpoint is reachable',
    openaiPackageInstalled: !!OpenAI,
    apiKeyConfigured: !!process.env.OPENAI_API_KEY,
    apiKeyValid: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
    ready: !!openai,
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

    // Check OpenAI setup
    if (!openai) {
      console.error('❌ OpenAI not configured');
      return res.status(500).json({
        error: 'OpenAI not configured',
        response: '⚠️ AI service is not configured properly. Please check server setup.',
        details: {
          packageInstalled: !!OpenAI,
          apiKeySet: !!process.env.OPENAI_API_KEY,
          apiKeyValid: process.env.OPENAI_API_KEY?.startsWith('sk-')
        }
      });
    }

    // Emergency check
    const emergencyWords = ['chest pain', 'heart attack', 'stroke', 'unconscious', 'severe bleeding'];
    if (emergencyWords.some(w => message.toLowerCase().includes(w))) {
      console.log('🚨 Emergency detected');
      return res.json({
        response: '🚨 EMERGENCY! This needs immediate attention. Call 112 (Emergency Services) right now!',
        isEmergency: true,
        success: true
      });
    }

    // Prepare messages
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful health assistant for MediMitra. Provide general health information only. Always remind users to consult healthcare professionals for medical advice.'
      }
    ];

    // Add history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-4).forEach(msg => {
        if (msg.sender === 'user' && msg.text) {
          messages.push({ role: 'user', content: msg.text });
        }
        if (msg.sender === 'bot' && msg.text) {
          messages.push({ role: 'assistant', content: msg.text });
        }
      });
    }

    messages.push({ role: 'user', content: message });

    console.log('   Calling OpenAI API...');

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('✅ Response generated successfully');

    res.json({
      response: aiResponse,
      success: true,
      model: 'gpt-4o-mini'
    });

  } catch (error) {
    console.error('\n❌ OpenAI API Error:');
    console.error('   Status:', error.status);
    console.error('   Message:', error.message);

    // Handle specific errors
    if (error.status === 401) {
      return res.status(500).json({
        error: 'Invalid API key',
        response: '⚠️ The AI service API key is invalid. Please contact administrator.',
        details: 'Authentication failed - check your OpenAI API key'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit',
        response: '⚠️ Too many requests. Please wait a moment and try again.',
        details: 'OpenAI rate limit exceeded'
      });
    }

    if (error.status === 500 || error.status === 503) {
      return res.status(500).json({
        error: 'Service unavailable',
        response: '⚠️ AI service is temporarily unavailable. Please try again in a moment.',
        details: 'OpenAI service error'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Internal error',
      response: '⚠️ Sorry, I encountered an error. Please try again.',
      details: error.message
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
    chatbotReady: !!openai,
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
  console.log(`📊 Status:       OpenAI ${openai ? 'Ready ✅' : 'Not Configured ❌'}`);
  console.log('='.repeat(60) + '\n');
});