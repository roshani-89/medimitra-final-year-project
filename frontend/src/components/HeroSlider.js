import React, { useState, useEffect } from 'react';

const slides = [
  {
    title: 'Saving Medicines, Saving Lives',
    description: 'Affordable medicines & medical equipment — from donors to those who need them most.',
    image: '/s1.jpg',
    ctaText: 'Join as Donor or Buyer',
    ctaLink: '/register',
  },
  {
    title: 'AI-Powered Health Chatbot',
    description: 'Get personalized health advice and support anytime with our intelligent chatbot.',
    image: '/s2.jpg',
    ctaText: 'Try Chatbot',
    ctaLink: '/health-assistant',
  },
  {
    title: 'Emergency Support When You Need It',
    description: 'Quick access to emergency contacts and services to keep you safe.',
    image: '/s3.jpg',
    ctaText: 'Learn More',
    ctaLink: '/emergency-contacts',
  },
];

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const { title, description, image, ctaText, ctaLink } = slides[currentIndex];

  return (
    <section
      className="relative min-h-screen flex items-center w-full bg-white px-8"
    >
      <div className="flex justify-between items-center w-full">
        <div className="text-blue-700 max-w-xl">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">{title}</h1>
          <p className="text-lg mb-8">{description}</p>
          <a
            href={ctaLink}
            className="inline-block bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-800 transition"
          >
            {ctaText}
          </a>
        </div>
        <div>
          <img
            src={image}
            alt={title}
            className="w-80 h-70 rounded-full object-cover shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
