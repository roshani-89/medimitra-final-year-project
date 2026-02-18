const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Note: This router is currently not used by server.js as server.js defines
// the chatbot routes directly. This is kept for reference or future refactoring.

router.get('/test', (req, res) => {
  res.json({ message: 'Chatbot router is working' });
});

module.exports = router;