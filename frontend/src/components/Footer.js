import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Left Section */}
        <div className="md:w-1/3">
          <div className="flex items-center mb-4">
            <svg
              className="w-10 h-10 text-blue-600 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 3.87 7 13 7 13s7-9.13 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.66-1.67 4.5-5 9.58C8.67 13.5 7 10.66 7 9z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="text-2xl font-bold">MediMitra</span>
          </div>
          <p className="mb-6 text-gray-300">
           Donate your unused medicines and medical equipment to those in need, while reducing health resource wastage </p>
          <div className="flex flex-col space-y-2 text-gray-400 mb-6">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0 4 4 0 018 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
              </svg>
              <span>hello@medimitra.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 18h18" />
              </svg>
              <span>Location, City, Country</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.06 9.06 0 01-2.88 1.1A4.52 4.52 0 0016.67 0c-2.5 0-4.5 2.24-4.5 5 0 .39.04.77.12 1.13A12.94 12.94 0 013 1.64a4.93 4.93 0 00-.61 2.52c0 1.74.87 3.28 2.2 4.18a4.48 4.48 0 01-2.04-.56v.06c0 2.43 1.7 4.46 3.95 4.92a4.52 4.52 0 01-2.03.08c.57 1.8 2.22 3.12 4.18 3.16A9.06 9.06 0 012 19.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-7.1 12.85-13.25 0-.2 0-.42-.02-.63A9.22 9.22 0 0023 3z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 2A3.75 3.75 0 004 7.75v8.5A3.75 3.75 0 007.75 20h8.5a3.75 3.75 0 003.75-3.75v-8.5A3.75 3.75 0 0016.25 4h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm4.5-3a1 1 0 110 2 1 1 0 010-2z"/></svg>
            </a>
            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.5 9.87v-6.99h-2.1v-2.88h2.1v-2.2c0-2.07 1.23-3.22 3.12-3.22.9 0 1.84.16 1.84.16v2.02h-1.04c-1.03 0-1.35.64-1.35 1.3v1.94h2.3l-.37 2.88h-1.93v6.99A10 10 0 0022 12z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 3a2 2 0 110 4 2 2 0 010-4z"/></svg>
            </a>
          </div>
        </div>

       

        {/* Company Links */}
        <div className="md:w-1/5">
          <h3 className="text-lg font-semibold mb-6"></h3>
          <ul className="space-y-3 text-gray-300">
            <li><a href="#" className="hover:text-white transition">About Us</a></li>
            <li><a href="#" className="hover:text-white transition">Our Works</a></li>
            <li><a href="#" className="hover:text-white transition">ChatBot</a></li>
            <li><a href="#" className="hover:text-white transition">Our Story</a></li>
            <li><a href="#" className="hover:text-white transition"></a></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className="md:w-1/5">
          <h3 className="text-lg font-semibold mb-6">Legal</h3>
          <ul className="space-y-3 text-gray-300">
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
