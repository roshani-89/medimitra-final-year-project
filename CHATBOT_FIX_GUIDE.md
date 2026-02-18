# How to Fix Your Chatbot API

## Problem
Your chatbot API is not working because the Google API key in your `.env` file is invalid.

## Solution

### Step 1: Get a Valid Google Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the generated API key (it should start with "AIza...")

### Step 2: Update Your .env File

1. Open `e:\trial\medimitra\backend\.env`
2. Replace the current `OPENAI_API_KEY` value with your new Google API key:

```
OPENAI_API_KEY=YOUR_NEW_GOOGLE_API_KEY_HERE
```

### Step 3: The Server Will Auto-Restart

The backend server is running with `nodemon`, so it will automatically restart when you save the `.env` file.

### Step 4: Test the Chatbot

1. Open your frontend at http://localhost:3000
2. Navigate to the Health Assistant page
3. Send a test message like "Hello" or "What are common cold symptoms?"
4. You should now get AI-powered responses!

## What Was Changed

I've updated your backend to use **Google Gemini** instead of OpenAI because:
- You already had a Google API key in your `.env` file
- The Google Generative AI package was already installed
- Gemini is free to use (with generous limits)

The server now uses:
- **AI Provider**: Google Gemini Pro
- **API Package**: @google/generative-ai
- **Model**: gemini-pro

## Alternative: Use OpenRouter (If you prefer)

If you'd rather use OpenAI's GPT models, you can:
1. Sign up at https://openrouter.ai/
2. Get your API key (starts with "sk-or-v1-...")
3. I can help you switch back to OpenRouter

## Current Status

✅ Backend server is running
✅ Google Gemini integration is configured
❌ API key is invalid - needs to be updated
✅ Frontend is ready to use the chatbot

Once you update the API key, everything will work!
