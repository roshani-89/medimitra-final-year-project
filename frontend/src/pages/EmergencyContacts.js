import React, { useState } from 'react';
import { Phone, AlertCircle, Heart, Users, Shield, Info, PhoneCall, Ambulance, Flame } from 'lucide-react';

const emergencyContacts = [
  {
    category: "Emergency Services",
    icon: AlertCircle,
    color: "from-red-500 to-rose-500",
    bgColor: "from-red-50 to-rose-50",
    contacts: [
      { name: "Ambulance", number: "108", description: "Medical emergency", icon: Ambulance },
      { name: "Police", number: "100", description: "Law enforcement", icon: Shield },
      { name: "Fire Brigade", number: "101", description: "Fire emergency", icon: Flame },
    ]
  },
  {
    category: "Medical Services",
    icon: Heart,
    color: "from-teal-500 to-cyan-500",
    bgColor: "from-teal-50 to-cyan-50",
    contacts: [
      { name: "Blood Bank", number: "104", description: "Blood donation & emergency", icon: Heart },
      { name: "Mental Health Helpline", number: "1800-599-0019", description: "Mental health support", icon: Heart },
      { name: "Women Helpline", number: "1091", description: "Women's safety & support", icon: Shield },
      { name: "Child Helpline", number: "1098", description: "Child protection", icon: Shield },
    ]
  },
  {
    category: "NGOs & Support",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50",
    contacts: [
      { name: "Red Cross", number: "011-23716441", description: "Disaster relief & medical aid", icon: Heart },
      { name: "Helpage India", number: "1800-11-2000", description: "Elder care support", icon: Users },
      { name: "Cancer Helpline", number: "1800-121-3636", description: "Cancer support", icon: Heart },
      { name: "HIV/AIDS Helpline", number: "1800-180-1104", description: "HIV/AIDS support", icon: Heart },
    ]
  }
];

const EmergencyContacts = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 py-12 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-150"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex p-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl shadow-lg mb-4">
            <AlertCircle className="w-12 h-12 text-white animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 mb-4">
            Emergency Contacts
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Quick access to essential emergency services
          </p>
        </div>

        {/* Emergency Alert Box */}
        <div className="mb-8 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-2xl p-6 shadow-xl animate-slide-in">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-red-500 rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800 mb-2">🚨 Emergency Numbers</h3>
              <p className="text-red-700 leading-relaxed">
                For life-threatening emergencies, call the appropriate service immediately. These numbers are available 24/7 across India.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Categories */}
        <div className="space-y-8">
          {emergencyContacts.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            return (
              <div 
                key={categoryIndex} 
                className="animate-slide-in"
                style={{ animationDelay: `${categoryIndex * 0.1}s` }}
              >
                <div className={`bg-gradient-to-r ${category.bgColor} rounded-3xl p-8 shadow-xl border-2 border-white`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 bg-gradient-to-r ${category.color} rounded-xl shadow-lg`}>
                      <CategoryIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{category.category}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.contacts.map((contact, contactIndex) => {
                      const ContactIcon = contact.icon;
                      const isHovered = hoveredCard === `${categoryIndex}-${contactIndex}`;
                      
                      return (
                        <div
                          key={contactIndex}
                          className={`bg-white rounded-2xl p-5 shadow-md transition-all duration-300 transform ${
                            isHovered ? 'scale-105 shadow-2xl -translate-y-2' : 'scale-100'
                          }`}
                          onMouseEnter={() => setHoveredCard(`${categoryIndex}-${contactIndex}`)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2 bg-gradient-to-r ${category.color} rounded-lg flex-shrink-0 transform transition-transform ${
                              isHovered ? 'rotate-6 scale-110' : 'rotate-0'
                            }`}>
                              <ContactIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg text-gray-800 truncate">{contact.name}</h4>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{contact.description}</p>
                          
                          <button
                            onClick={() => handleCall(contact.number)}
                            className={`w-full bg-gradient-to-r ${category.color} text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105`}
                          >
                            <PhoneCall className="w-5 h-5" />
                            <span className="text-lg">{contact.number}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-2xl p-6 shadow-xl animate-slide-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Info className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                💡 Important Safety Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Keep these numbers saved in your phone for quick access",
                  "Share this information with family and friends",
                  "Learn basic first aid and CPR techniques",
                  "Have a family emergency plan ready",
                  "Keep important medical information handy",
                  "Stay calm during emergencies and speak clearly"
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-xl shadow-sm">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-blue-700 text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" />
            Stay safe and help others in need
            <Heart className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" />
          </p>
        </div>
      </div>


    </div>
  );
};

export default EmergencyContacts;
