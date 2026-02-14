import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  ShoppingBag, ShieldCheck, MapPin,
  Phone, CreditCard, ChevronLeft, Check,
  AlertCircle, ArrowRight, Package, Truck,
  Lock, Zap, Star, Info, Tag, Calendar
} from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { product } = location.state || {};

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Start at Review step
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    society: '',
    pincode: '',
    mobile: '',
    landmark: '',
    addressType: 'Home'
  });
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const hasSyncedRef = useRef(false);

  // Sync address from user data when it loads - only once
  useEffect(() => {
    if (user && !hasSyncedRef.current) {
      setDeliveryAddress({
        fullName: user.name || '',
        society: user.society || user.address || '',
        pincode: user.pincode || '',
        mobile: user.mobile || '',
        landmark: user.landmark || '',
        addressType: 'Home'
      });
      hasSyncedRef.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (!product) {
      navigate('/products');
      return;
    }
    loadRazorpayScript();
  }, [product, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!deliveryAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!deliveryAddress.society.trim()) newErrors.society = 'Address is required';
    if (!deliveryAddress.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(deliveryAddress.pincode)) newErrors.pincode = 'Enter valid 6-digit pincode';
    if (!deliveryAddress.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(deliveryAddress.mobile)) newErrors.mobile = 'Enter valid 10-digit mobile number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      setCurrentStep(1); // Go back to review if errors
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Optionally update profile with the current address
      if (saveToProfile) {
        try {
          await axios.put('http://localhost:5000/api/auth/update-profile', {
            name: deliveryAddress.fullName,
            society: deliveryAddress.society,
            pincode: deliveryAddress.pincode,
            mobile: deliveryAddress.mobile,
            landmark: deliveryAddress.landmark
          }, { headers: { Authorization: `Bearer ${token}` } });
          console.log('✅ Profile updated with new address');
        } catch (profileErr) {
          console.error('Failed to update profile:', profileErr);
          // Don't block order placement if profile update fails
        }
      }
      const res = await axios.post('http://localhost:5000/api/payment/create-order',
        { productId: product._id, quantity, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId, productName, isDemo: demoStatus } = res.data;

      if (demoStatus) {
        setIsDemo(true);
        setTimeout(async () => {
          try {
            const verifyRes = await axios.post('http://localhost:5000/api/payment/verify-payment', {
              razorpay_order_id: orderId,
              productId: product._id,
              quantity,
              deliveryAddress,
              paymentMethod,
              isDemo: true
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (verifyRes.data.success) {
              setSuccess(true);
              setTimeout(() => navigate('/order-confirmation', { state: { order: verifyRes.data.order } }), 2000);
            }
          } catch (err) {
            alert('Demo verification failed: ' + (err.response?.data?.message || err.message));
            setLoading(false);
          }
        }, 1500);
        return;
      }

      if (paymentMethod === 'online') {
        const options = {
          name: 'MediMitra',
          description: `Order for ${productName}`,
          order_id: orderId,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post('http://localhost:5000/api/payment/verify-payment', {
                ...response,
                productId: product._id,
                quantity,
                deliveryAddress,
                paymentMethod,
                isDemo: false
              }, { headers: { Authorization: `Bearer ${token}` } });

              if (verifyRes.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/order-confirmation', { state: { order: verifyRes.data.order } }), 2000);
              }
            } catch (err) {
              alert('Payment verification failed: ' + (err.response?.data?.message || err.message));
            } finally {
              setLoading(false);
            }
          },
          prefill: { name: deliveryAddress.fullName, contact: deliveryAddress.mobile },
          theme: { color: '#0d9488' }, // Teal 600
          modal: { ondismiss: () => setLoading(false) }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const verifyRes = await axios.post('http://localhost:5000/api/payment/verify-payment', {
          razorpay_order_id: orderId,
          productId: product._id,
          quantity,
          deliveryAddress,
          paymentMethod: 'cod',
          isDemo: false
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (verifyRes.data.success) {
          setSuccess(true);
          setTimeout(() => navigate('/order-confirmation', { state: { order: verifyRes.data.order } }), 2000);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Order Error:', err);
      alert(err.response?.data?.message || 'Failed to initiate order.');
      setLoading(false);
    }
  };

  if (!product) return null;

  const subtotal = product.price * quantity;
  const discount = Math.round(subtotal * 0.2); // Simulated discount
  const deliveryFee = 0;
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <h1 className="text-4xl font-black text-teal-600 tracking-tighter italic cursor-pointer" onClick={() => navigate('/')}>MediMitra</h1>

            {/* Step Indicator */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${currentStep >= 1 ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 text-gray-400'}`}>
                  {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>Review</span>
              </div>
              <div className={`w-16 h-0.5 rounded-full ${currentStep > 1 ? 'bg-teal-600' : 'bg-gray-100'}`}></div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${currentStep >= 2 ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-200 text-gray-400'}`}>
                  2
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>Payment</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">100% Safe Payments</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {success ? (
          <div className="max-w-md mx-auto text-center py-20 animate-in zoom-in duration-500 bg-white rounded-[40px] shadow-lg">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Yay! Order Placed</h2>
            <p className="text-gray-500 font-bold mt-2">Preparing your medical supplies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Forms */}
            <div className="lg:col-span-8 space-y-10">

              {/* Content based on Step */}
              {currentStep === 1 ? (
                <div className="space-y-10">
                  {/* 1. Product Review */}
                  <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Item Summary
                    </h3>
                    <div className="flex gap-8 items-center">
                      <div className="w-28 h-28 bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden shrink-0">
                        {product.photos?.[0] ? (
                          <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">{product.brand}</p>
                        <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter leading-tight mb-4">{product.name}</h4>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 flex items-center justify-center font-black text-gray-400 hover:text-gray-900">-</button>
                            <span className="text-sm font-black text-gray-900 w-4 text-center">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))} className="w-6 h-6 flex items-center justify-center font-black text-gray-400 hover:text-gray-900">+</button>
                          </div>
                          <span className="text-xl font-black text-teal-600">₹{product.price * quantity}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. Delivery Address */}
                  <section className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-10 flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-teal-600" />
                      </div>
                      Delivery Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recipient's Full Name</label>
                        <input
                          type="text"
                          value={deliveryAddress.fullName}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, fullName: e.target.value })}
                          className={`w-full bg-gray-50/50 border ${errors.fullName ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-100'} rounded-[24px] p-5 text-sm font-bold focus:ring-4 focus:ring-pink-100 focus:bg-white outline-none transition-all`}
                          placeholder="Receiver's name"
                        />
                        {errors.fullName && <p className="text-[10px] font-black text-red-500 uppercase mt-2 italic ml-2">{errors.fullName}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Mobile Number</label>
                        <input
                          type="tel"
                          value={deliveryAddress.mobile}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, mobile: e.target.value })}
                          className={`w-full bg-gray-50/50 border ${errors.mobile ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-100'} rounded-[24px] p-5 text-sm font-bold focus:ring-4 focus:ring-pink-100 focus:bg-white outline-none transition-all`}
                          placeholder="10-digit mobile"
                        />
                        {errors.mobile && <p className="text-[10px] font-black text-red-500 uppercase mt-2 italic ml-2">{errors.mobile}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Delivery Pincode</label>
                        <input
                          type="text"
                          value={deliveryAddress.pincode}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                          className={`w-full bg-gray-50/50 border ${errors.pincode ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-100'} rounded-[24px] p-5 text-sm font-bold focus:ring-4 focus:ring-pink-100 focus:bg-white outline-none transition-all`}
                          placeholder="6-digit PIN"
                        />
                        {errors.pincode && <p className="text-[10px] font-black text-red-500 uppercase mt-2 italic ml-2">{errors.pincode}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Full Address (Society / Street)</label>
                        <textarea
                          value={deliveryAddress.society}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, society: e.target.value })}
                          className={`w-full bg-gray-50/50 border ${errors.society ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-100'} rounded-[24px] p-5 text-sm font-bold focus:ring-4 focus:ring-pink-100 focus:bg-white outline-none h-32 resize-none transition-all`}
                          placeholder="Flat, House No, Building, Area"
                        />
                        {errors.society && <p className="text-[10px] font-black text-red-500 uppercase mt-2 italic ml-2">{errors.society}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Landmark (Optional)</label>
                        <input
                          type="text"
                          value={deliveryAddress.landmark}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-[24px] p-5 text-sm font-bold focus:ring-4 focus:ring-pink-100 focus:bg-white outline-none transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Address Type</label>
                        <div className="flex gap-6">
                          {['Home', 'Office'].map((at) => (
                            <button
                              key={at}
                              type="button"
                              onClick={() => setDeliveryAddress({ ...deliveryAddress, addressType: at })}
                              className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-3 ${deliveryAddress.addressType === at ? 'border-[#9d174d] bg-pink-50 text-teal-600 shadow-lg shadow-pink-100' : 'border-gray-100 text-gray-400 bg-white hover:border-gray-200'}`}
                            >
                              <div className={`w-3 h-3 rounded-full border-2 ${deliveryAddress.addressType === at ? 'border-[#9d174d] bg-[#9d174d]' : 'border-gray-200'}`}></div>
                              {at}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Save to Profile Option */}
                      <div className="md:col-span-2 pt-4">
                        <label className="flex items-center gap-4 cursor-pointer group">
                          <div
                            onClick={() => setSaveToProfile(!saveToProfile)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${saveToProfile ? 'bg-[#9d174d] border-[#9d174d]' : 'bg-gray-50 border-gray-100 group-hover:border-pink-200'}`}
                          >
                            {saveToProfile && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className="text-sm font-bold text-gray-600">Save this as my permanent delivery address</span>
                        </label>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Header for Payment Step */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Select Payment Method</h2>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                    >
                      Change Address
                    </button>
                  </div>

                  {/* 3. Payment Mode */}
                  <section className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        className={`cursor-pointer p-8 rounded-[32px] border-2 transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'border-teal-600 bg-teal-50/30' : 'border-gray-100 bg-white'}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-emerald-500 font-black text-2xl">₹</div>
                          <p className="text-lg font-black text-gray-900 uppercase tracking-tight">Cash on Delivery</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#9d174d]' : 'border-gray-200'}`}>
                          {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-[#9d174d] rounded-full"></div>}
                        </div>
                      </div>
                      <div
                        onClick={() => setPaymentMethod('online')}
                        className={`cursor-pointer p-8 rounded-[32px] border-2 transition-all flex items-center justify-between ${paymentMethod === 'online' ? 'border-teal-600 bg-teal-50/30' : 'border-gray-100 bg-white'}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-blue-500">
                            <Lock className="w-6 h-6" />
                          </div>
                          <p className="text-lg font-black text-gray-900 uppercase tracking-tight">Pay Online</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-[#9d174d]' : 'border-gray-200'}`}>
                          {paymentMethod === 'online' && <div className="w-2.5 h-2.5 bg-teal-600 rounded-full"></div>}
                        </div>
                      </div>
                    </div>

                    {/* Online Payment Benefits */}
                    {paymentMethod === 'online' && (
                      <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                        <Tag className="w-5 h-5 text-emerald-600" />
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Extra ₹15 discount on online payments</p>
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#9d174d] opacity-[0.02] rounded-bl-[100px] -mr-10 -mt-10"></div>

                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-10">Price Summary</h3>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <span>Base Price</span>
                    <span className="text-gray-900">+ ₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <span>Savings</span>
                    <span className="text-emerald-500 font-black">- ₹{discount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <span>Delivery</span>
                    <span className="text-emerald-500 font-black">FREE</span>
                  </div>
                </div>

                <div className="pt-10 border-t border-gray-100 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-gray-900 uppercase tracking-tighter">Amount Payable</span>
                    <span className="text-3xl font-black text-teal-600">₹{total}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 mb-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-emerald-800 uppercase leading-tight">Yay! You saved ₹{discount} on this order</p>
                </div>

                <button
                  disabled={loading}
                  onClick={() => {
                    if (currentStep === 1) {
                      if (validateForm()) setCurrentStep(2);
                    } else {
                      handlePlaceOrder();
                    }
                  }}
                  className="w-full py-6 bg-gray-900 text-white rounded-[32px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm hover:bg-black"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    currentStep === 1 ? 'Continue to Payment' : 'Place Order Now'
                  )}
                </button>

                <div className="mt-10 pt-10 border-t border-gray-50 flex items-center justify-center gap-8 opacity-30 grayscale">
                  <ShieldCheck className="w-8 h-8" />
                  <CreditCard className="w-8 h-8" />
                  <Zap className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-16 py-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              SSL Secured
            </span>
            <span>|</span>
            <span>Razorpay Payment Gateway</span>
            <span>|</span>
            <span>PCI DSS Compliant</span>
            <span>|</span>
            <span>100% Safe & Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;