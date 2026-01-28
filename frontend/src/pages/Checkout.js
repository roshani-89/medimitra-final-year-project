import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};
  
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    society: '',
    pincode: '',
    mobile: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit/Debit Card');

  useEffect(() => {
    if (!product) {
      alert('No product selected');
      navigate('/products');
      return;
    }
    
    loadRazorpayScript();
  }, [product, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.society || !deliveryAddress.pincode || !deliveryAddress.mobile) {
      alert('Please fill in all delivery details');
      return;
    }

    if (deliveryAddress.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    if (deliveryAddress.mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (quantity < 1 || quantity > product.quantity) {
      alert('Invalid quantity');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to place order');
        navigate('/login');
        return;
      }

      console.log('🚀 Initiating payment...');

      const orderResponse = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      const { orderId, amount, currency, keyId, productName } = orderData;
      
      console.log('✅ Order created:', orderId);

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: currency,
        name: 'MediMitra',
        description: `Purchase: ${productName}`,
        order_id: orderId,
        handler: async function (response) {
          console.log('✅ Payment successful:', response);
          
          try {
            const verifyResponse = await fetch('http://localhost:5000/api/payment/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productId: product._id,
                quantity: quantity,
                deliveryAddress: deliveryAddress
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert('🎉 Payment Successful! Your order has been placed.');
              navigate('/dashboard');
            }
          } catch (verifyError) {
            console.error('❌ Payment verification failed:', verifyError);
            alert('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          contact: deliveryAddress.mobile
        },
        notes: {
          address: deliveryAddress.society,
          pincode: deliveryAddress.pincode
        },
        theme: {
          color: '#14b8a6'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setLoading(false);
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        alert('Payment failed: ' + response.error.description);
        setLoading(false);
      });

      razorpay.open();

    } catch (error) {
      console.error('❌ Order error:', error);
      setLoading(false);
      
      if (error.message.includes('401')) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        alert('Failed to create order: ' + error.message);
      }
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-2xl font-bold text-gray-800 mb-6">No Product Selected</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">🛒</span>
            Checkout
          </h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📦 Order Details
              </h2>
              
              <div className="flex items-start gap-4">
                {product.photos && product.photos[0] && (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                    <img
                      src={product.photos[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-3xl font-bold text-emerald-600">₹{product.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                      Available: {product.quantity} units
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="font-semibold text-gray-700">Quantity:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-all"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(product.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📍 Delivery Address
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">🏘️ Society/Area *</label>
                  <input
                    type="text"
                    value={deliveryAddress.society}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, society: e.target.value})}
                    placeholder="Enter your society or area name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">📮 Pincode *</label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value.replace(/\D/g, '')})}
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">📱 Phone Number *</label>
                  <input
                    type="tel"
                    value={deliveryAddress.mobile}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, mobile: e.target.value.replace(/\D/g, '')})}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                💳 Payment Method
              </h2>
              
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-semibold transition-all"
              >
                <option>💳 Credit/Debit Card</option>
                <option>📱 UPI</option>
                <option>🏦 Net Banking</option>
                <option>👛 Wallets</option>
              </select>

              <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl flex items-center gap-3 border border-teal-200">
                <div className="text-2xl">🔒</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Secure Payment</p>
                  <p className="text-sm text-gray-600">Powered by Razorpay - 100% Safe & Encrypted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                💰 Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Product Price:</span>
                  <span className="font-semibold">₹{product.price}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Quantity:</span>
                  <span className="font-semibold">× {quantity}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <span>🎉</span>
                    Delivery:
                  </span>
                  <span className="font-semibold">FREE</span>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                    <span className="text-3xl font-bold text-teal-600">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🔐</span>
                    Proceed to Payment
                  </span>
                )}
              </button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>100% Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>Easy Returns & Refunds</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span>Fast Local Delivery</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  🔒 Your payment information is protected with industry-standard encryption
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-4xl">🔒</div>
              <p className="font-semibold text-gray-800">Secure Payment</p>
              <p className="text-xs text-gray-600">SSL Encrypted</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">📦</div>
              <p className="font-semibold text-gray-800">Fast Delivery</p>
              <p className="text-xs text-gray-600">Same Day</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">💯</div>
              <p className="font-semibold text-gray-800">100% Authentic</p>
              <p className="text-xs text-gray-600">Verified Products</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">🔄</div>
              <p className="font-semibold text-gray-800">Easy Returns</p>
              <p className="text-xs text-gray-600">7 Days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;