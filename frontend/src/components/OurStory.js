import React, { useEffect, useRef, useState } from 'react';

const OurStory = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gray-100">
      <h2 className="text-3xl font-bold mb-12 text-center">Our Story</h2>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12 px-4">
        <div
          className={`md:w-1/2 text-gray-700 text-lg leading-relaxed transition-opacity duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <p>
            Every year, tons of medicines go to waste — left unused or expired — while countless people struggle to afford even basic health supplies. We realized that there was a need for a simple, reliable platform to connect those who have excess medicines or medical equipment with those who need them the most.

That’s how MediMitra was born — a place where donors, buyers, and NGOs come together to make healthcare accessible and affordable for everyone. From leftover medicines to essential equipment, we ensure that nothing goes to waste, and every life gets the care it deserves.

Our mission is simple: reduce wastage, help people, and build a healthier community.</p>
        </div>
        <div
          className={`md:w-1/2 transition-opacity duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <img
            src="/ourstory.jpg"
            alt="Our Story"
            className="rounded-lg shadow-lg object-cover w-full max-h-96"
          />
        </div>
      </div>
    </section>
  );
};

export default OurStory;
