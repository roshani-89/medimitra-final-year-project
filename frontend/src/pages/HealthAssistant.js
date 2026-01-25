import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Trash2, RefreshCw, Sparkles, Heart, AlertCircle } from 'lucide-react';

const HealthAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! 👋 I'm your AI-powered health assistant. How can I help you today?", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chatbot/test', {
        method: 'GET',
      });
      
      if (response.ok) {
        setBackendStatus('connected');
        setError(null);
      } else {
        setBackendStatus('error');
        setError('Backend is not responding properly');
      }
    } catch (err) {
      setBackendStatus('error');
      setError('Cannot connect to backend. Make sure server is running on port 5000');
      console.error('Backend connection error:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (backendStatus === 'error') {
      alert('Backend server is not running. Please start the server first.');
      return;
    }

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Server error: ' + response.status);
      }

      const data = await response.json();
      const botMessage = { 
        text: data.response, 
        sender: 'bot',
        isEmergency: data.isEmergency || false
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      let errorMsg = '';
      if (error.message.includes('Failed to fetch')) {
        errorMsg = 'Cannot connect to server. Please ensure backend is running on http://localhost:5000';
        setBackendStatus('error');
      } else {
        errorMsg = 'Sorry, I encountered an error. Please try again later.';
      }
      
      setError(errorMsg);
      const errorMessage = { 
        text: errorMsg, 
        sender: 'bot',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        text: "Chat cleared! How can I help you today?", 
        sender: 'bot' 
      }
    ]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 py-8 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-t-3xl shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                <Bot className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold flex items-center gap-2">
                  AI Health Assistant
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                </h2>
                <p className="text-sm mt-1 text-teal-100 flex items-center gap-2">
                  <span className="font-medium">Powered by OpenAI</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      backendStatus === 'connected' ? 'bg-green-300 animate-pulse' : 
                      backendStatus === 'error' ? 'bg-red-300' : 
                      'bg-yellow-300 animate-pulse'
                    }`}></span>
                    <span className="text-xs">
                      {backendStatus === 'connected' && '✓ Connected'}
                      {backendStatus === 'error' && '✗ Disconnected'}
                      {backendStatus === 'checking' && '⟳ Connecting...'}
                    </span>
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={checkBackend}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 backdrop-blur-sm"
                title="Check connection"
              >
                <RefreshCw className="w-4 h-4" />
                Reconnect
              </button>
              <button
                onClick={clearChat}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 backdrop-blur-sm"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800">Connection Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={checkBackend}
                className="mt-2 bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-all transform hover:scale-105 font-medium"
              >
                Try Reconnecting
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-white shadow-2xl h-[500px] overflow-y-auto p-6 space-y-4 scroll-smooth">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`flex gap-3 max-w-2xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-500' 
                    : message.isEmergency 
                    ? 'bg-gradient-to-br from-red-500 to-pink-500'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`px-5 py-3 rounded-2xl shadow-md ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-tr-none'
                    : message.isEmergency
                    ? 'bg-red-50 text-red-900 border-2 border-red-300 rounded-tl-none'
                    : message.isError
                    ? 'bg-yellow-50 text-yellow-900 border border-yellow-300 rounded-tl-none'
                    : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.text}</p>
                  {message.isEmergency && (
                    <div className="mt-2 pt-2 border-t border-red-300">
                      <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Emergency Alert - Seek immediate medical attention
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start animate-slide-in">
              <div className="flex gap-3 max-w-2xl">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-200 px-5 py-3 rounded-2xl rounded-tl-none shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-6 rounded-b-3xl shadow-2xl border-t-2 border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your health question here..."
              className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
              disabled={loading || backendStatus === 'error'}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || backendStatus === 'error'}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2 transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Heart className="w-3 h-3 text-red-400" />
              This AI provides general health information only. Always consult healthcare professionals.
            </p>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-6 bg-white p-6 rounded-3xl shadow-xl">
          <p className="text-sm text-gray-700 mb-3 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            Quick Questions to Try:
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { text: '🤒 What should I do for fever?', icon: '🤒' },
              { text: '🤧 Home remedies for cold', icon: '🤧' },
              { text: '🩹 First aid for minor cuts', icon: '🩹' },
              { text: '💧 How to stay hydrated?', icon: '💧' }
            ].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setInput(suggestion.text)}
                className="group px-4 py-2.5 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 text-teal-700 text-sm rounded-xl border-2 border-teal-200 hover:border-teal-300 transition-all transform hover:scale-105 font-medium shadow-sm hover:shadow-md"
                disabled={loading || backendStatus === 'error'}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-out;
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default HealthAssistant;