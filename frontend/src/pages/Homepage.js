import React from 'react';
import HeroSlider from '../components/HeroSlider';
import OutWork from '../components/OutWork';
import ChatbotSection from '../components/ChatbotSection';
import OurStory from '../components/OurStory';
import Footer from '../components/Footer';

const Homepage = () => {
  return (
    <div className="min-h-screen min-w-full bg-white">
      

      {/* Hero Section */}
      <HeroSlider />
      <OutWork />
      <ChatbotSection />
      <OurStory />
      <Footer />
    </div>
  );
};

export default Homepage;
