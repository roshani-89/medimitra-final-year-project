import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import {
  Package, Truck, CheckCircle, Clock,
  XCircle, ChevronRight, ArrowLeft, ShieldCheck,
  Search, Filter, MapPin, Calendar, Info, X, ShoppingCart
} from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTracker, setShowTracker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    mobile: '',
    pincode: '',
    society: '',
    landmark: '',
    addressType: 'Home'
  });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://medimitra-final-year-project-3.onrender.com/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (order) => {
    setSelectedOrder(order);
    setEditFormData({
      fullName: order.deliveryAddress.fullName || '',
      mobile: order.deliveryAddress.mobile || '',
      pincode: order.deliveryAddress.pincode || '',
      society: order.deliveryAddress.society || '',
      landmark: order.deliveryAddress.landmark || '',
      addressType: order.deliveryAddress.addressType || 'Home'
    });
    setShowEditModal(true);
  };

  const handleUpdateAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`https://medimitra-final-year-project-3.onrender.com/api/orders/my-orders/${selectedOrder.orderId}/address`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setShowEditModal(false);
        fetchOrders(); // Refresh orders
      }
    } catch (err) {
      console.error('Error updating address:', err);
      alert(err.response?.data?.message || 'Failed to update address');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Confirmed': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Processing': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Shipped': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'Delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const trackingSteps = [
    { status: 'Confirmed', label: 'Placed', icon: Clock },
    { status: 'Confirmed', label: 'Confirmed', icon: ShieldCheck },
    { status: 'Processing', label: 'Processing', icon: Package },
    { status: 'Shipped', label: 'Shipped', icon: Truck },
    { status: 'Delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    const index = trackingSteps.findIndex(step => step.status === status);
    if (index !== -1) return index;
    // Fallback logic for intermediate states
    if (status === 'Pending') return 0;
    return 1;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4"></div>
      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Retrieving Your Purchases...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-widest mb-3">
              <Package className="w-4 h-4" /> My Account
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Order <span className="text-teal-600">History</span>
            </h1>
            <p className="text-gray-500 font-medium mt-3">Track and manage your medical supplies and equipment.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-xs font-bold text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Last 30 Days
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase">No Orders Yet</h2>
            <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto mb-10">Start your healthcare journey by browsing our verified marketplace.</p>
            <button
              onClick={() => navigate('/products')}
              className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {orders.map(order => (
              <div key={order._id} className="group bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">#{order.orderId?.slice(-6)}</span>
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-teal-600 transition-colors leading-none">
                        {order.productId?.name}
                      </h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{order.productId?.brand || 'Medical Supply'}</p>
                    </div>
                  </div>

                  <div className="aspect-square w-24 h-24 bg-gray-50 rounded-3xl overflow-hidden mb-6 border border-gray-100">
                    <img src={order.productId?.photos?.[0]} alt={order.productId?.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pricing</span>
                      <span className="text-lg font-black text-emerald-600">₹{order.totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Placement</span>
                      <span className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setSelectedOrder(order); setShowTracker(true); }}
                        className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-500/20 active:scale-95"
                      >
                        Track Order <ChevronRight className="w-4 h-4" />
                      </button>
                      <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                    {['Pending', 'Confirmed'].includes(order.status) && (
                      <button
                        onClick={() => handleEditAddress(order)}
                        className="w-full py-4 bg-teal-50 text-teal-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4" /> Edit Delivery Address
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {showTracker && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowTracker(false)}></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-in zoom-in fade-in duration-500">
            <button
              onClick={() => setShowTracker(false)}
              className="absolute top-8 right-8 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Left: Product Info */}
            <div className="w-full md:w-5/12 bg-gray-50 p-10 border-r border-gray-100 flex flex-col">
              <div className="aspect-square bg-white rounded-[40px] shadow-xl overflow-hidden mb-8 border border-gray-100">
                <img src={selectedOrder.productId?.photos?.[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6 inline-block ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-3">
                  {selectedOrder.productId?.name}
                </h2>
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Delivery Target</p>
                      <p className="text-xs text-gray-600 font-bold leading-relaxed">
                        {selectedOrder.deliveryAddress?.fullName}<br />
                        {selectedOrder.deliveryAddress?.society}, {selectedOrder.deliveryAddress?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Tracking Steps */}
            <div className="flex-1 p-10 md:p-14 overflow-y-auto bg-white custom-scrollbar">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Live Journey</h3>
              </div>

              {selectedOrder.status === 'Cancelled' ? (
                <div className="p-10 bg-rose-50 rounded-[32px] border border-rose-100 text-center">
                  <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h4 className="text-xl font-black text-rose-900 uppercase">Order Terminated</h4>
                  <p className="text-rose-600 font-bold text-sm mt-1">{selectedOrder.cancellationReason || 'The order was cancelled.'}</p>
                </div>
              ) : (
                <div className="relative pl-8 border-l-2 border-gray-100 ml-4 space-y-12">
                  {trackingSteps.map((step, idx) => {
                    const currentIndex = getStepIndex(selectedOrder.status);
                    const isCompleted = idx <= currentIndex;
                    const isActive = idx === currentIndex + 1;
                    const isPast = idx < currentIndex;
                    const StepIcon = step.icon;

                    return (
                      <div key={idx} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-teal-600 scale-125' : 'bg-gray-200 grayscale opacity-50'
                          }`}>
                          <StepIcon className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                        </div>

                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCompleted ? 'text-teal-600' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          <h4 className={`text-lg font-black tracking-tighter uppercase ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                            {step.status === selectedOrder.status ? 'Aktive Status' : step.label}
                          </h4>
                          {isCompleted && (
                            <p className="text-xs text-gray-500 font-medium mt-1">
                              {selectedOrder.statusHistory?.find(h => h.status === step.status)?.message ||
                                `The product has reached the ${step.label} stage of its pharmaceutical journey.`}
                            </p>
                          )}
                          {isCompleted && selectedOrder.statusHistory?.find(h => h.status === step.status) && (
                            <span className="inline-block mt-3 px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              {new Date(selectedOrder.statusHistory.find(h => h.status === step.status).timestamp).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-14 pt-10 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Support ID</p>
                  <p className="text-xs font-bold text-gray-900">MED-{selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <button className="px-8 py-3 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                  Help Center
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Address Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowEditModal(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in fade-in duration-500 p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Update Delivery Address</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recipient Name</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mobile</label>
                  <input
                    type="tel"
                    value={editFormData.mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pincode</label>
                  <input
                    type="text"
                    value={editFormData.pincode}
                    onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Address</label>
                <textarea
                  value={editFormData.society}
                  onChange={(e) => setEditFormData({ ...editFormData, society: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Landmark (Optional)</label>
                <input
                  type="text"
                  value={editFormData.landmark}
                  onChange={(e) => setEditFormData({ ...editFormData, landmark: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpdateAddress}
                  className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-100 active:scale-95 transition-all text-sm"
                >
                  Save New Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
