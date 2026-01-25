import React from 'react';

const OutWork = () => {
  const cards = [
    {
      title: 'Donate Medicines & Equipment',
      icon: (
        <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-6 3h12a2 2 0 002-2v-3a2 2 0 00-2-2H6a2 2 0 00-2 2v3a2 2 0 002 2z"></path>
        </svg>
      ),
      content: [
        'Easily list unused medicines & medical equipment.',
        'Add details: name, expiry date, quantity, price, photos.',
        'Help those in need and reduce wastage.',
      ],
      ctaText: 'Post Now',
    },
    {
      title: 'Find Affordable Health Supplies',
      icon: (
        <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9"></path>
        </svg>
      ),
      content: [
        'Search for nearby medicines or equipment.',
        'Filter by category, price, or distance.',
        'Get discounted or donated items quickly.',
      ],
      ctaText: 'Shop Nearby',
    },
    {
      title: 'Support Communities',
      icon: (
        <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9"></path>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16"></path>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h9"></path>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h9"></path>
        </svg>
      ),
      content: [
        'Connect with donors and patients.',
        'Distribute medicines & equipment to those in need.',
        'Track donations and impact.',
      ],
      ctaText: 'Partner with Us',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 text-center">
      <h2 className="text-3xl font-bold mb-12">How MediMitra Works</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
        {cards.map(({ title, icon, content, ctaText }, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
            style={{ minHeight: '320px' }}
          >
            <div>
              <div className="flex justify-center">{icon}</div>
              <h3 className="text-xl font-semibold mb-4">{title}</h3>
              <ul className="text-gray-700 text-left list-disc list-inside space-y-2 mb-6">
                {content.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
            <button
              className="mt-auto bg-blue-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-700 transform hover:scale-105 transition-transform duration-300"
              type="button"
            >
              {ctaText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OutWork;
