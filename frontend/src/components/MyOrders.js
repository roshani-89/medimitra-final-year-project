import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, Truck, CheckCircle, Clock,
  XCircle, ChevronRight, ShieldCheck,
  MapPin, Info, X, ShoppingCart
} from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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
    const indices = { 'Pending': 0, 'Confirmed': 1, 'Processing': 2, 'Shipped': 3, 'Delivered': 4 };
    return indices[status] !== undefined ? indices[status] : 1;
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 rounded-[32px] p-16 text-center border border-gray-100">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingCart className="w-8 h-8 text-gray-200" />
        </div>
        <h3 className="text-xl font-black text-gray-900 uppercase">No Orders Yet</h3>
        <p className="text-gray-500 font-medium mt-2 max-w-xs mx-auto mb-8">Your clinical history is empty. Start shopping for medical supplies.</p>
        <a href="/products" className="inline-block px-10 py-4 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-100">
          Browse Marketplace
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map(order => (
          <div key={order._id} className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 p-6">
            <div className="flex gap-6 items-start">
              <div className="aspect-square w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                {order.productId?.photos?.[0] ? (
                  <img src={order.productId.photos[0]} alt={order.productId.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">#{order.orderId?.slice(-6)}</span>
                </div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter truncate leading-tight mb-1">
                  {order.productId?.name}
                </h2>
                <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-4">
                  <span className="text-lg font-black text-teal-600">₹{order.totalPrice}</span>
                  <button
                    onClick={() => { setSelectedOrder(order); setShowTracker(true); }}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-100"
                  >
                    Track <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Modal */}
      {showTracker && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowTracker(false)}></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-in zoom-in fade-in duration-500">
            <button
              onClick={() => setShowTracker(false)}
              className="absolute top-8 right-8 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Left: Product Info */}
            <div className="w-full md:w-5/12 bg-gray-50 p-10 border-r border-gray-100 flex flex-col overflow-y-auto">
              <div className="aspect-square bg-white rounded-[32px] shadow-xl overflow-hidden mb-8 border border-gray-100">
                {selectedOrder.productId?.photos?.[0] ? (
                  <img src={selectedOrder.productId.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-100">
                    <Package className="w-20 h-20" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6 inline-block ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-3">
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
                    const StepIcon = step.icon;

                    return (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-teal-600 scale-125' : 'bg-gray-200 grayscale opacity-50'
                          }`}>
                          <StepIcon className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                        </div>

                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCompleted ? 'text-teal-600' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          <h4 className={`text-lg font-black tracking-tighter uppercase ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                            {step.status === selectedOrder.status ? 'Active Status' : step.label}
                          </h4>
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
    </div>
  );
};

export default MyOrders;
