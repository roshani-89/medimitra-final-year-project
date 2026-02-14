import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import {
  ShoppingBag,
  PlusCircle,
  Bot,
  Activity,
  Heart,
  AlertCircle,
  TrendingUp,
  Users,
  Package,
  ChevronRight,
  Star,
  Clock,
  ShieldCheck,
  ArrowRight,
  Zap,
  Target,
  Stethoscope
} from 'lucide-react';

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
      setFeaturedProducts(res.data.slice(0, 8));
      const uniqueCategories = [...new Set(res.data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { title: 'Marketplace', desc: 'Browse medicines', icon: ShoppingBag, link: '/products', color: 'bg-blue-500' },
    { title: 'Sell Surplus', desc: 'Help others & earn', icon: PlusCircle, link: '/add-product', color: 'bg-emerald-500' },
    { title: 'AI Assistant', desc: 'Health guidance', icon: Bot, link: '/health-assistant', color: 'bg-purple-500' },
    { title: 'Emergency', desc: 'Quick help 24/7', icon: AlertCircle, link: '/emergency-contacts', color: 'bg-red-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Preparing your health center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full backdrop-blur-md mb-6 border border-white/20 animate-fade-in">
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-xs font-black uppercase tracking-widest text-white/90">Trusted by 10k+ Families</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
            Your Health, <span className="text-teal-100">Our Priority.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-teal-50 max-w-3xl mx-auto font-medium opacity-90">
            India's most innovative medical marketplace. Buy verified medicines
            at up to 70% lower prices or sell your surplus to help those in need.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/products"
              className="px-10 py-5 bg-white text-teal-600 rounded-2xl font-black text-lg shadow-2xl hover:bg-teal-50 transition-all transform hover:scale-105"
            >
              BROWSE MARKETPLACE
            </Link>
            <Link
              to="/add-product"
              className="px-10 py-5 bg-teal-700/50 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-black text-lg hover:bg-teal-700/70 transition-all transform hover:scale-105"
            >
              SELL NOW
            </Link>
          </div>
        </div>
      </section>

      {/* Main Action Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 mb-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <Link
              key={idx}
              to={service.link}
              className="group bg-white p-8 rounded-[32px] shadow-xl hover:shadow-2xl transition-all border border-gray-100 flex flex-col items-center text-center"
            >
              <div className={`p-4 ${service.color} rounded-2xl text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                <service.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tight">{service.title}</h3>
              <p className="text-sm text-gray-500 font-medium mb-4">{service.desc}</p>
              <div className="mt-auto flex items-center gap-2 text-teal-600 font-bold group-hover:gap-4 transition-all uppercase text-xs">
                Learn More <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Featured <span className="text-teal-600">Inventory</span></h2>
            <p className="text-gray-500 font-medium mt-1">Verified supplies available in your vicinity</p>
          </div>
          <Link to="/products" className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 uppercase">Marketplace is quiet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Be the first to list surplus medicines and help your community save lives.</p>
            <Link to="/add-product" className="px-10 py-5 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-teal-700 transition-all">
              START SELLING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p) => (
              <div key={p._id} className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all">
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {p.photos?.[0] ? (
                    <img src={p.photos[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase text-teal-600 shadow-sm">
                      {p.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-teal-600 transition-colors uppercase truncate">{p.name}</h3>
                  <p className="text-sm text-gray-400 font-bold mb-4 uppercase tracking-widest">{p.brand}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-gray-900">₹{p.price}</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Verified Seller</p>
                    </div>
                    <button
                      onClick={() => navigate('/products')}
                      className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-y border-gray-100 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-teal-500 mb-4" />
            <h3 className="text-xl font-black text-gray-800 uppercase">100% Verified</h3>
            <p className="text-sm text-gray-500 px-8">All medicines go through rigorous verification before listing.</p>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp className="w-12 h-12 text-teal-500 mb-4" />
            <h3 className="text-xl font-black text-gray-800 uppercase">70% Savings</h3>
            <p className="text-sm text-gray-500 px-8">Join the redistribution revolution and save big on medicine costs.</p>
          </div>
          <div className="flex flex-col items-center">
            <Target className="w-12 h-12 text-teal-500 mb-4" />
            <h3 className="text-xl font-black text-gray-800 uppercase">Local Access</h3>
            <p className="text-sm text-gray-500 px-8">Connect with people in your neighborhood for the fastest delivery.</p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-20 px-4 text-center bg-gray-900 text-white">
        <Stethoscope className="w-12 h-12 text-teal-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">MediMitra</h2>
        <p className="text-gray-500 font-medium max-w-sm mx-auto">India's Leading Collaborative Healthcare Platform.</p>
      </footer>
    </div>
  );
};

export default Dashboard;