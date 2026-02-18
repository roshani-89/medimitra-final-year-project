const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('Using API Key:', apiKey);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('Sending prompt...');
        const result = await model.generateContent('Hello, are you working?');
        const response = await result.response;
        const text = response.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Gemini Error:', error.message);
        if (error.response) {
            console.error('Details:', error.response);
        }
    }
}

testGemini();
