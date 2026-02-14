import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, User, Send, Trash2, RefreshCw,
  Sparkles, Heart, AlertCircle, ShieldCheck,
  ChevronRight, ArrowLeft, MessageSquare,
  Activity, Info, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HealthAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      text: "Hello! 👋 I'm your AI-powered Health Companion. How can I assist you in your wellness journey today?",
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
    setBackendStatus('checking');
    try {
      const response = await fetch('http://localhost:5000/api/chatbot/test');
      if (response.ok) {
        setBackendStatus('connected');
        setError(null);
      } else {
        throw new Error();
      }
    } catch (err) {
      setBackendStatus('error');
      // No longer setting global error here, we'll handle it in the chat
    }
  };

  const getFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();

    const responses = [
      {
        keywords: ['emergency', 'accident', 'serious', 'help', 'ambulance', 'hospital'],
        response: "🚨 IF THIS IS A MEDICAL EMERGENCY, PLEASE CALL 108 (IN INDIA) OR YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY. You can also visit our Emergency Contacts page for more information."
      },
      {
        keywords: ['buy', 'order', 'purchase', 'get', 'product', 'medicine'],
        response: "To buy medical supplies, please navigate to the 'Products' section. You can search for items, add them to your cart, and proceed to checkout with our secure payment system."
      },
      {
        keywords: ['payment', 'pay', 'cash', 'card', 'razorpay', 'cod'],
        response: "We support multiple secure payment methods including Online Payments (Razorpay), Credit/Debit Cards, UPI, and Cash on Delivery (COD)."
      },
      {
        keywords: ['track', 'where', 'order status', 'delivery'],
        response: "You can track your orders in the 'Order History' section of your profile. Each order has a live tracking timeline with its current status."
      },
      {
        keywords: ['hi', 'hello', 'hey', 'greetings'],
        response: "Hello! I'm currently in Offline Support Mode due to a network issue, but I can still help with common questions about orders, payments, and emergencies. How can I assist you?"
      },
      {
        keywords: ['account', 'profile', 'login', 'register'],
        response: "You can manage your personal details, delivery addresses, and order history in your Profile section. If you need to change your password, check the Security tab."
      }
    ];

    for (const item of responses) {
      if (item.keywords.some(keyword => input.includes(keyword))) {
        return item.response;
      }
    }

    return "I'm currently having trouble connecting to my primary knowledge core, but I'm here in Offline Mode. I can help with general information about orders, payments, and emergency protocols. Could you please rephrase or try again in a few minutes?";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    // Try API first
    if (backendStatus === 'connected') {
      try {
        const response = await fetch('http://localhost:5000/api/chatbot/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: currentInput,
            conversationHistory: messages
          })
        });

        if (!response.ok) throw new Error('API Sync Failed');

        const data = await response.json();
        setMessages(prev => [...prev, {
          text: data.response,
          sender: 'bot',
          isEmergency: data.isEmergency || false
        }]);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Chatbot API Error:', error);
        // Fall through to local fallback
      }
    }

    // Fallback logic for offline or API error
    setTimeout(() => {
      const fallbackText = getFallbackResponse(currentInput);
      setMessages(prev => [...prev, {
        text: fallbackText,
        sender: 'bot',
        isOfflineMode: true,
        isEmergency: currentInput.toLowerCase().includes('emergency')
      }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Premium Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Health <span className="text-teal-600">Assistant</span></h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">
                    {backendStatus === 'connected' ? 'Core Active' : 'System Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={checkBackend}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-200"
            >
              <RefreshCw className={`w-4 h-4 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} /> Sync System
            </button>
            <button
              onClick={() => setMessages([{ text: "Session Reset. How can I help?", sender: 'bot' }])}
              className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 overflow-y-auto">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-3 text-sm font-bold animate-in bounce-in">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="space-y-8 pb-20">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`flex gap-4 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-white font-bold shadow-lg ${m.sender === 'user' ? 'bg-gray-900' : m.isEmergency ? 'bg-red-600' : 'bg-teal-600'
                  }`}>
                  {m.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-sm ${m.sender === 'user'
                  ? 'bg-gray-900 text-white rounded-tr-none'
                  : m.isEmergency
                    ? 'bg-red-50 text-red-900 border border-red-100 rounded-tl-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                  {m.text}
                  {m.isOfflineMode && (
                    <div className="mt-4 pt-4 border-t border-teal-50 flex items-center gap-2 text-teal-600 font-black uppercase text-[9px] tracking-widest">
                      <Zap className="w-3.5 h-3.5" /> Local System Response (Offline Mode)
                    </div>
                  )}
                  {m.isEmergency && (
                    <div className="mt-4 pt-4 border-t border-red-200 flex items-center gap-2 text-red-600 font-black uppercase text-[10px] tracking-widest">
                      <AlertCircle className="w-4 h-4" /> Immediate Medical Attention Required
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="px-6 py-4 bg-white border border-gray-100 rounded-[32px] rounded-tl-none text-gray-400 text-xs font-black uppercase tracking-widest">
                  Processing Query...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Console */}
      <div className="bg-white border-t border-gray-100 p-6 sticky bottom-0 z-40">
        <div className="max-w-5xl mx-auto flex gap-4">
          <div className="relative flex-1 group">
            <MessageSquare className="absolute left-6 top-5 w-5 h-5 text-gray-300 group-focus-within:text-teal-600 transition-colors" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query health data, symptoms, or first-aid protocols..."
              className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-sm"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-10 bg-teal-600 text-white rounded-[32px] font-black uppercase tracking-tighter shadow-2xl shadow-teal-500/30 hover:bg-teal-700 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            Execute <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3 h-3 text-teal-500" /> AI Consultation is for informational purposes only.
        </p>
      </div>
    </div>
  );
};

export default HealthAssistant;