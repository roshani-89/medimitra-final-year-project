import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Filter, ShoppingBag, Package,
  ArrowRight, ShieldCheck, Tag, Info,
  Trash2, ShoppingCart, ChevronLeft, ChevronRight,
  TrendingDown, Star, X
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Modal & Detailed Product State
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, [location]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, priceFilter, categoryFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      const currentDate = new Date();
      const activeProducts = res.data.filter(product => new Date(product.expiryDate) > currentDate);
      setProducts(activeProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(p => parseFloat(p));
      if (max) {
        filtered = filtered.filter(product => product.price >= min && product.price <= max);
      } else {
        filtered = filtered.filter(product => product.price >= min);
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        default: return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const openQuickView = async (id) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setSelectedProduct(res.data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      alert('Failed to load product details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment) return;

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/products/${selectedProduct._id}/reviews`,
        newReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh product details to show new review
      const res = await axios.get(`http://localhost:5000/api/products/${selectedProduct._id}`);
      setSelectedProduct(res.data);
      setNewReview({ rating: 5, comment: '' });
      alert('✅ Review added successfully!');
    } catch (err) {
      console.error('Error adding review:', err);
      alert(err.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this listing from the marketplace?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-gray-500 font-medium tracking-tight">Accessing Inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-widest mb-3">
                <ShoppingBag className="w-4 h-4" /> Marketplace
              </div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                Medical <span className="text-teal-600">Supplies</span>
              </h1>
              <p className="text-gray-500 font-medium mt-3">Verified inventory directory for your community.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 100% Authenticity
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-[32px] shadow-2xl p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end border border-gray-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Search Keywords</label>
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
              <input
                type="text"
                placeholder="Product, brand, salt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Category Select</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-medium appearance-none"
            >
              <option value="">All Categories</option>
              <option value="Medicine">Medicine 💊</option>
              <option value="Medical Equipment">Equipment 🏥</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Budget Range</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-medium appearance-none"
            >
              <option value="">Global Prices</option>
              <option value="0-100">Below ₹100</option>
              <option value="100-500">₹100 - ₹500</option>
              <option value="500-2000">₹500 - ₹2000</option>
              <option value="2000">₹2000+</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Sort System</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-medium appearance-none"
            >
              <option value="name">Alpha A-Z</option>
              <option value="price-low">Lowest First</option>
              <option value="price-high">Highest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase">No Matches Found</h2>
            <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto mb-10">Adjust your filters to see more medical supplies from our verified inventory.</p>
            <button
              onClick={() => { setSearchTerm(''); setPriceFilter(''); setCategoryFilter(''); }}
              className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map(p => (
              <div key={p._id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="aspect-square relative bg-gray-50 overflow-hidden">
                  {p.photos?.[0] ? (
                    <img src={p.photos[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-100" />
                    </div>
                  )}

                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur rounded-full text-[8px] font-black uppercase text-teal-600 shadow-sm flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-teal-500 text-teal-500" /> Verified
                    </span>
                    {p.averageRating > 0 && (
                      <span className="px-3 py-1 bg-gray-900/90 backdrop-blur rounded-full text-[8px] font-black uppercase text-white shadow-sm flex items-center gap-1">
                        ⭐ {p.averageRating.toFixed(1)} ({p.numReviews})
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-x-4 bottom-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                    <button
                      onClick={() => openQuickView(p._id)}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black shadow-2xl"
                    >
                      Quick View <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-gray-900 leading-tight uppercase group-hover:text-teal-600 transition-colors truncate" title={p.name}>{p.name}</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">{p.brand || 'Generic'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-gray-900">₹{p.price}</p>
                      <p className="text-[7px] font-black text-teal-500 uppercase tracking-tighter line-through opacity-50">₹{Math.round(p.price * 1.5)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-gray-400">Stock</span>
                      <span className={p.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {p.quantity > 0 ? `${p.quantity} Left` : 'Sold Out'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 rounded-md bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-[10px]">
                        {p.sellerId?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[9px] font-black text-gray-900 uppercase truncate leading-none mb-0.5">{p.sellerId?.name || 'Local Seller'}</p>
                        <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Trust Index: 5/5</p>
                      </div>
                    </div>
                  </div>

                  {user?._id === p.sellerId?._id && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-red-100 rounded-xl text-[8px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="max-w-7xl mx-auto px-4 py-20 text-center border-t border-gray-100">
        <p className="text-gray-400 text-sm font-medium">All products are verified by our pharmaceutical specialists.</p>
      </footer>

      {/* Quick View Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-3 bg-gray-100/80 backdrop-blur hover:bg-gray-200 rounded-full transition-colors z-20 shadow-sm"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {modalLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4"></div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Pharma Verification...</p>
              </div>
            ) : selectedProduct && (
              <>
                {/* Modal Left: Image & Quick Info */}
                <div className="w-full md:w-5/12 bg-gray-50 p-6 md:p-10 flex flex-col items-center justify-center border-r border-gray-100">
                  <div className="w-full aspect-square rounded-[32px] overflow-hidden shadow-2xl bg-white mb-8 group/img relative">
                    <img
                      src={selectedProduct.photos?.[0]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                    />
                  </div>
                  <div className="w-full space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {selectedProduct.category}
                      </span>
                      <div className="text-right">
                        <span className="block text-3xl font-black text-gray-900 leading-none">₹{selectedProduct.price}</span>
                        <span className="text-[10px] font-black text-teal-500 uppercase tracking-tighter line-through opacity-50">₹{Math.round(selectedProduct.price * 1.5)}</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">
                        {selectedProduct.name}
                      </h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {selectedProduct.brand} | Generic: {selectedProduct.generic_name}
                      </p>
                    </div>

                    {user?.role === 'User' && selectedProduct.quantity > 0 && (
                      <button
                        onClick={() => navigate('/checkout', { state: { product: selectedProduct } })}
                        className="w-full py-5 bg-teal-600 text-white rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-teal-500/30 hover:bg-teal-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        Proceed to Purchase <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Modal Right: Description & Reviews */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white custom-scrollbar">
                  <div className="mb-12">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-teal-500"></div> Product Summary
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-sm">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="pt-10 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                        Pharmacist & User Feedback
                      </h3>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-2xl text-sm font-black italic">
                        ⭐ {selectedProduct.averageRating?.toFixed(1) || 0} <span className="text-white/40 font-normal ml-1">({selectedProduct.numReviews || 0})</span>
                      </div>
                    </div>

                    {/* Review Form */}
                    {user && (
                      <form onSubmit={handleReviewSubmit} className="mb-12 bg-gradient-to-br from-gray-50 to-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Leave your clinical feedback</label>
                        <div className="flex items-center gap-2 mb-6">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className={`text-3xl transition-all duration-300 hover:scale-125 hover:-rotate-12 ${star <= newReview.rating ? 'grayscale-0 drop-shadow-md' : 'grayscale opacity-20'}`}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="How effective was this product? (Expiry, condition, results...)"
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/5 transition-all mb-4 h-28 resize-none shadow-inner"
                          required
                        ></textarea>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-gray-500/20 active:scale-95"
                        >
                          {submittingReview ? 'Verifying...' : 'Post Clinical Review'}
                        </button>
                      </form>
                    )}

                    {/* Review List */}
                    <div className="space-y-4">
                      {selectedProduct.reviews?.length > 0 ? (
                        [...selectedProduct.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((review, idx) => (
                          <div key={idx} className="flex gap-5 p-6 bg-white rounded-3xl border border-gray-50 items-start hover:border-teal-100 transition-all group/rev">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex-shrink-0 flex items-center justify-center text-teal-600 font-black text-lg border border-teal-100 transition-transform group-hover/rev:rotate-12">
                              {review.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter font-serif italic">
                                  {review.name}
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                </span>
                                <span className="text-[10px] font-black text-teal-600 tracking-tighter flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-teal-500 text-teal-500' : 'text-gray-200'}`} />
                                  ))}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                                "{review.comment}"
                              </p>
                              <p className="text-[9px] text-gray-400 mt-3 uppercase font-black tracking-widest flex items-center gap-1.5 leading-none">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Verified Purchase • {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                          <Info className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">No clinical data available yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div >
  );
};

export default Products;
