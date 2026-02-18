import React, { useState } from 'react';
import { Heart, Droplets, Apple, Activity, Shield, Brain, Stethoscope, Sparkles } from 'lucide-react';

const healthTips = [
  {
    title: "Hand Hygiene",
    description: "Wash your hands regularly with soap and water for at least 20 seconds to prevent infections.",
    icon: Sparkles,
    color: "from-emerald-400 to-teal-500"
  },
  {
    title: "Stay Hydrated",
    description: "Drink plenty of water throughout the day to maintain good health and energy levels.",
    icon: Droplets,
    color: "from-cyan-400 to-blue-500"
  },
  {
    title: "Balanced Diet",
    description: "Eat a variety of foods including fruits, vegetables, whole grains, and lean proteins.",
    icon: Apple,
    color: "from-teal-400 to-emerald-500"
  },
  {
    title: "Regular Exercise",
    description: "Engage in at least 30 minutes of moderate exercise most days of the week.",
    icon: Activity,
    color: "from-blue-400 to-cyan-500"
  },
  {
    title: "Vaccinations",
    description: "Keep up to date with recommended vaccinations to protect yourself and others.",
    icon: Shield,
    color: "from-emerald-500 to-teal-600"
  },
  {
    title: "Mental Health",
    description: "Practice stress management techniques like meditation, deep breathing, and adequate sleep.",
    icon: Brain,
    color: "from-cyan-500 to-blue-600"
  },
  {
    title: "Disease Prevention",
    description: "Use mosquito nets, avoid smoking, and practice safe sex to prevent diseases.",
    icon: Stethoscope,
    color: "from-teal-500 to-cyan-600"
  },
  {
    title: "Women's Health",
    description: "Regular gynecological check-ups and awareness of reproductive health are important.",
    icon: Heart,
    color: "from-blue-500 to-teal-600"
  },
];

const HealthTips = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-150"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-16 h-16 text-teal-500 animate-pulse" fill="currentColor" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 mb-4">
            Health Tips & Awareness
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Your guide to a healthier, happier life
          </p>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {healthTips.map((tip, index) => {
            const Icon = tip.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  animation: `slideUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className={`
                  relative h-full bg-white rounded-2xl shadow-lg overflow-hidden
                  transform transition-all duration-500 ease-out
                  ${isHovered ? 'scale-105 shadow-2xl -translate-y-2' : 'scale-100'}
                `}>
                  {/* Gradient Top Border */}
                  <div className={`h-2 bg-gradient-to-r ${tip.color}`}></div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    <div className={`
                      inline-flex p-4 rounded-xl bg-gradient-to-r ${tip.color} mb-4
                      transform transition-transform duration-500
                      ${isHovered ? 'rotate-6 scale-110' : 'rotate-0 scale-100'}
                    `}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-3 transition-colors duration-300">
                      {tip.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>

                  {/* Hover Shimmer Effect */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0
                    transform -skew-x-12 transition-all duration-700
                    ${isHovered ? 'opacity-20 translate-x-full' : '-translate-x-full'}
                  `}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-lg">
            💚 Take care of yourself, your health matters! 💚
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .delay-75 {
          animation-delay: 1s;
        }

        .delay-150 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default HealthTips;
