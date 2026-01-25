import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      // Get latest 8 products
      const latest = res.data.slice(0, 8);
      setFeaturedProducts(latest);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(res.data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    navigate('/products');
  };

  const quickActions = [
    {
      title: 'Browse Products',
      description: 'Find affordable medical supplies',
      icon: '🛍️',
      link: '/products',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Add Product',
      description: 'Sell your surplus medicines',
      icon: '➕',
      link: '/add-product',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Health Assistant',
      description: 'Get AI-powered health advice',
      icon: '🤖',
      link: '/health-assistant',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Emergency',
      description: 'Need immediate help?',
      icon: '🚨',
      link: '/emergency-contacts',
      color: 'from-rose-500 to-rose-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Meesho Style */}
      <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Welcome to <span className="text-white drop-shadow-lg">MediMitra</span> 
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-white/90">
                India's Most Affordable Medical Marketplace
              </p>
              {user && (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 inline-block mb-6">
                  <p className="text-2xl font-semibold text-teal-700">
                    Welcome, {user.name}! 👋
                  </p>
                  <p className="text-sm text-teal-600">{user.role}</p>
                </div>
              )}
              <div className="flex gap-4 flex-wrap">
                <Link
                  to="/products"
                  className="bg-white text-teal-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🛍️ Shop Now
                </Link>
                <Link
                  to="/add-product"
                  className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  💰 Sell Now
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <svg className="w-80 h-80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Medical Cross Background */}
                <circle cx="100" cy="100" r="80" fill="#3b82f6" opacity="0.1"/>
                <circle cx="100" cy="100" r="60" fill="#60a5fa" opacity="0.15"/>
                <circle cx="100" cy="100" r="40" fill="#93c5fd" opacity="0.2"/>
                
                {/* Medical Cross */}
                <rect x="85" y="60" width="30" height="80" fill="#ffffff" rx="5">
                  <animate attributeName="opacity" values="1;0.9;1" dur="2s" repeatCount="indefinite"/>
                </rect>
                <rect x="60" y="85" width="80" height="30" fill="#ffffff" rx="5">
                  <animate attributeName="opacity" values="1;0.9;1" dur="2s" repeatCount="indefinite"/>
                </rect>
                
                {/* Medicine Bottle */}
                <g transform="translate(40, 130)">
                  <rect x="0" y="10" width="30" height="40" fill="#2563eb" rx="3"/>
                  <rect x="5" y="5" width="20" height="10" fill="#3b82f6" rx="2"/>
                  <circle cx="10" cy="25" r="3" fill="#dbeafe"/>
                  <circle cx="20" cy="25" r="3" fill="#dbeafe"/>
                  <circle cx="15" cy="35" r="3" fill="#dbeafe"/>
                  <rect x="2" y="12" width="26" height="2" fill="#1e40af" opacity="0.3"/>
                </g>
                
                {/* Pills - Different Blue Shades */}
                <g transform="translate(135, 135)">
                  <ellipse cx="10" cy="10" rx="12" ry="8" fill="#60a5fa"/>
                  <rect x="4" y="5" width="12" height="10" fill="#ffffff" opacity="0.4"/>
                  
                  <ellipse cx="25" cy="20" rx="10" ry="7" fill="#93c5fd"/>
                  <rect x="20" y="16" width="10" height="8" fill="#ffffff" opacity="0.3"/>
                  
                  <ellipse cx="8" cy="28" rx="9" ry="6" fill="#3b82f6"/>
                </g>
                
                {/* Stethoscope */}
                <g transform="translate(130, 60)">
                  <path d="M 10 0 Q 20 10, 20 25" stroke="#1e40af" strokeWidth="3" fill="none"/>
                  <path d="M 30 0 Q 20 10, 20 25" stroke="#1e40af" strokeWidth="3" fill="none"/>
                  <circle cx="20" cy="28" r="8" fill="#2563eb" stroke="#1e40af" strokeWidth="2"/>
                  <circle cx="20" cy="28" r="4" fill="#60a5fa"/>
                </g>
                
                {/* Heartbeat Line - Blue */}
                <path d="M 30 100 L 50 100 L 60 80 L 70 120 L 80 100 L 170 100" 
                      stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" 
                           from="0,1000" to="1000,0" 
                           dur="2s" repeatCount="indefinite"/>
                </path>
                
                {/* Floating Medical Icons */}
                <g opacity="0.7">
                  <text x="160" y="60" fontSize="16" fill="#60a5fa">+</text>
                  <animateTransform attributeName="transform" type="translate"
                                    values="0,0; 0,-10; 0,0" dur="3s" repeatCount="indefinite"/>
                </g>
                
                <g opacity="0.7">
                  <circle cx="180" cy="80" r="6" fill="none" stroke="#93c5fd" strokeWidth="2"/>
                  <rect x="177" y="77" width="6" height="6" fill="#93c5fd"/>
                  <animateTransform attributeName="transform" type="translate"
                                    values="0,0; 0,-8; 0,0" dur="2.5s" repeatCount="indefinite"/>
                </g>
                
                <g opacity="0.7">
                  <circle cx="170" cy="105" r="4" fill="#3b82f6"/>
                  <animateTransform attributeName="transform" type="translate"
                                    values="0,0; 0,-12; 0,0" dur="3.5s" repeatCount="indefinite"/>
                </g>
                
                <g opacity="0.6">
                  <circle cx="50" cy="65" r="3" fill="#60a5fa"/>
                  <animateTransform attributeName="transform" type="translate"
                                    values="0,0; 0,-7; 0,0" dur="4s" repeatCount="indefinite"/>
                </g>
                
                {/* DNA Helix Style Lines */}
                <path d="M 150 140 Q 155 145, 160 140 Q 165 135, 170 140" 
                      stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.5">
                  <animate attributeName="d" 
                           values="M 150 140 Q 155 145, 160 140 Q 165 135, 170 140;
                                   M 150 140 Q 155 135, 160 140 Q 165 145, 170 140;
                                   M 150 140 Q 155 145, 160 140 Q 165 135, 170 140"
                           dur="3s" repeatCount="indefinite"/>
                </path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Cards - Swiggy Style */}
      <section className="py-8 px-4 bg-white shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group"
              >
                <div className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-6 text-center hover:shadow-2xl transition-all transform hover:scale-105`}>
                  <div className="text-5xl mb-3">{action.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Flipkart Style */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            📁 Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${category}`}
                className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-teal-500 group"
              >
                <div className="text-4xl mb-3">
                  {category === 'Medicine' ? '💊' : '🏥'}
                </div>
                <p className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                  {category}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Amazon Style */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              ⭐ Featured Products
            </h2>
            <Link
              to="/products"
              className="text-teal-600 font-semibold hover:text-teal-800 flex items-center gap-2 group"
            >
              View All
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">Be the first one to add products!</p>
              <Link
                to="/add-product"
                className="inline-block bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-all"
              >
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all cursor-pointer group overflow-hidden border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    {product.photos && product.photos.length > 0 ? (
                      <img
                        src={product.photos[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl">📦</div>
                      </div>
                    )}
                    {product.quantity <= 5 && product.quantity > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        Only {product.quantity} left!
                      </div>
                    )}
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-teal-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold text-emerald-600">₹{product.price}</span>
                      </div>
                      {product.quantity > 0 && (
                        <button className="bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700 transition-all text-sm font-semibold">
                          Buy
                        </button>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Seller: <span className="font-semibold">{product.sellerId?.name || 'Unknown'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Benefits */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            🌟 Why Choose MediMitra?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Best Prices</h3>
              <p className="text-gray-600 text-sm">Lowest prices, same quality</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Verified Sellers</h3>
              <p className="text-gray-600 text-sm">Only trusted sellers</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick local delivery</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">AI Health Help</h3>
              <p className="text-gray-600 text-sm">24/7 health assistant</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Services Grid */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            🎯 Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/products" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all group border-2 border-transparent hover:border-blue-500">
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600">Products Marketplace</h3>
              <p className="text-gray-600 mb-4">Browse karo surplus medicines aur equipment</p>
              <div className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Explore →
              </div>
            </Link>

            {user?.role === 'Patient' && (
              <Link to="/orders" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all group border-2 border-transparent hover:border-purple-500">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-purple-600">My Orders</h3>
                <p className="text-gray-600 mb-4">Apne orders track karo easily</p>
                <div className="text-purple-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                  View Orders →
                </div>
              </Link>
            )}

            <Link to="/add-product" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all group border-2 border-transparent hover:border-green-500">
              <div className="text-5xl mb-4">➕</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-green-600">Sell Products</h3>
              <p className="text-gray-600 mb-4">Apne surplus products bechkar paisa kamao</p>
              <div className="text-green-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Add Product →
              </div>
            </Link>

            <Link to="/health-assistant" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all group border-2 border-transparent hover:border-purple-500">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-purple-600">AI Health Assistant</h3>
              <p className="text-gray-600 mb-4">24/7 health advice aur first-aid info</p>
              <div className="text-purple-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Chat Now →
              </div>
            </Link>

            <Link to="/health-tips" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all group border-2 border-transparent hover:border-indigo-500">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-indigo-600">Health Tips</h3>
              <p className="text-gray-600 mb-4">Hygiene, disease prevention aur wellness tips</p>
              <div className="text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Learn More →
              </div>
            </Link>

            <Link to="/emergency-contacts" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all group border-2 border-transparent hover:border-red-500">
              <div className="text-5xl mb-4">🚨</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-red-600">Emergency Contacts</h3>
              <p className="text-gray-600 mb-4">Quick access to emergency services 24/7</p>
              <div className="text-red-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Get Help →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Save Money on Healthcare? 💰
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands using MediMitra for affordable medical supplies
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/products"
              className="bg-white text-teal-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🛍️ Start Shopping
            </Link>
            <Link
              to="/add-product"
              className="bg-teal-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-teal-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white"
            >
              💰 Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Quote */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-light italic mb-4">
            "Your Health, Our Mission. Your Savings, Our Goal."
          </blockquote>
          <p className="text-gray-400">🏥 MediMitra - Your Trusted Healthcare Partner</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;