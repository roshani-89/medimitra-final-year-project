import React from 'react';

const ChatbotSection = () => {
  return (
    <section className="py-20 bg-white text-center">
      <h2 className="text-3xl font-bold mb-8">AI-Powered Health Chatbot</h2>
      <p className="max-w-3xl mx-auto mb-8">
        Get personalized health advice and support anytime with our intelligent chatbot.
      </p>
      <a
        href="/health-assistant"
        className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition"
      >
        Try Chatbot
      </a>
    </section>
  );
};

export default ChatbotSection;
