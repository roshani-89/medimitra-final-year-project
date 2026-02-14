import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Package, Truck,
  ChevronRight, ShoppingBag, MapPin,
  Calendar, ShieldCheck, ArrowRight,
  Clock, Info
} from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Order Session Expired</h1>
          <p className="text-gray-500 font-bold mb-10 text-sm">We couldn't retrieve your order details. Please check your dashboard for updates.</p>
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-100 active:scale-95 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const trackingSteps = [
    { status: 'Confirmed', label: 'Order Placed', icon: Clock },
    { status: 'Confirmed', label: 'Confirmed', icon: ShieldCheck },
    { status: 'Processing', label: 'Processing', icon: Package },
    { status: 'Shipped', label: 'Shipped', icon: Truck },
    { status: 'Delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getStepIndex = (status) => {
    const indices = { 'Pending': 0, 'Confirmed': 1, 'Processing': 2, 'Shipped': 3, 'Delivered': 4 };
    return indices[status] !== undefined ? indices[status] : 1;
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <h1 className="text-3xl font-black text-teal-600 tracking-tighter italic">MediMitra</h1>
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verified Order</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-10 space-y-8">
        {/* Success Banner */}
        <section className="bg-gradient-to-br from-teal-600 to-emerald-500 rounded-[48px] p-12 text-center text-white shadow-2xl shadow-teal-100 animate-in zoom-in duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">Yay! Order Placed</h2>
            <p className="text-white/80 font-bold text-lg max-w-sm mx-auto">
              Your items are now part of our pharmaceutical network.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Visual Tracker */}
          <div className="lg:col-span-12">
            <section className="bg-white rounded-[48px] border border-gray-100 p-12 shadow-sm">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Delivery Timeline</h3>
                <div className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Live Tracking
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 relative">
                {/* Line Background */}
                <div className="absolute top-7 left-[10%] right-[10%] h-1 bg-gray-100 z-0 rounded-full">
                  <div className="h-full bg-emerald-500 transition-all duration-1000 rounded-full" style={{ width: `${(currentIndex / 4) * 100}%` }}></div>
                </div>

                {trackingSteps.map((step, idx) => {
                  const isCompleted = idx < currentIndex;
                  const isActive = idx === currentIndex;
                  const StepIcon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center z-10">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 border-4 relative 
                        ${isCompleted ? 'bg-emerald-500 border-white text-white shadow-lg' :
                          isActive ? 'bg-white border-emerald-500 text-emerald-500 shadow-2xl scale-125 ring-8 ring-emerald-50' :
                            'bg-gray-100 border-white text-gray-400 grayscale opacity-40'}`}
                      >
                        <StepIcon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                        {isActive && (
                          <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 -z-10 bg-opacity-50"></div>
                        )}
                      </div>
                      <p className={`mt-5 text-[10px] font-black uppercase tracking-widest text-center leading-tight transition-colors duration-500
                        ${isCompleted ? 'text-gray-900' : isActive ? 'text-emerald-600' : 'text-gray-300'}`}>
                        {step.label}
                      </p>
                      {isActive && <div className="mt-1 w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-16 p-8 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 overflow-hidden flex items-center justify-center">
                      {order.product?.photos?.[0] ? (
                        <img src={order.product.photos[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status Update</p>
                      <p className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {currentIndex === 0 ? 'Awaiting Confirmation' :
                          currentIndex === 1 ? 'Confirmed by Pharmacy' :
                            currentIndex === 2 ? 'Packing your items' :
                              currentIndex === 3 ? 'On the way' : 'Delivered Successfully'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-500 max-w-md">
                    {currentIndex === 1 && "Great news! Our partner pharmacy has verified your prescription (if required) and confirmed the order."}
                    {currentIndex === 2 && "We are carefully packing your medicines for safe delivery."}
                  </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button onClick={() => navigate('/orders')} className="flex-1 md:flex-none px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-gray-200">
                    Track Detailed
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-7">
            <section className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm space-y-10">
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Delivery Details</h3>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-teal-600 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{order.deliveryAddress?.fullName}</p>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed mt-1">
                      {order.deliveryAddress?.society}, {order.deliveryAddress?.pincode}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">Home</div>
                      <p className="text-xs font-bold text-gray-400">{order.deliveryAddress?.mobile}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-50">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Support & Help</h3>
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Info className="w-5 h-5 text-blue-600" />
                    <p className="text-xs font-bold text-blue-900">Need help with this order?</p>
                  </div>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Support ID: MED-{order._id.slice(-6).toUpperCase()}</button>
                </div>
              </div>
            </section>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-5">
            <section className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Purchase Summary</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1">{order.product?.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Quantity: {order.quantity}</p>
                  </div>
                  <span className="text-sm font-black text-gray-900">₹{order.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                  <span>Savings Applied</span>
                  <span>-₹120</span>
                </div>
                <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">Total Paid</span>
                  <span className="text-2xl font-black text-teal-600">₹{order.totalPrice}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/products')}
                className="w-full mt-10 py-5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
              >
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </button>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
