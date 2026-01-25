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
    
    // Load Razorpay script
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
    // Validate inputs
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

      // Step 1: Create Razorpay order
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

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount * 100, // Amount in paise
        currency: currency,
        name: 'MediMitra',
        description: `Purchase: ${productName}`,
        order_id: orderId,
        handler: async function (response) {
          console.log('✅ Payment successful:', response);
          
          try {
            // Step 3: Verify payment on backend
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
          name: '',
          email: '',
          contact: deliveryAddress.mobile
        },
        notes: {
          address: deliveryAddress.society,
          pincode: deliveryAddress.pincode
        },
        theme: {
          color: '#2563eb'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No product selected</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            {product.photos && product.photos[0] && (
              <img
                src={product.photos[0]}
                alt={product.name}
                className="w-32 h-32 object-cover rounded"
              />
            )}
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-green-600 text-2xl font-bold mb-2">₹{product.price}</p>
              <p className="text-gray-600 mb-4">Available Quantity: {product.quantity}</p>
              
              <div className="flex items-center gap-4">
                <label className="font-semibold">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Society:</label>
              <input
                type="text"
                value={deliveryAddress.society}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, society: e.target.value})}
                placeholder="Enter your society/area"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Pincode:</label>
              <input
                type="text"
                value={deliveryAddress.pincode}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                placeholder="6-digit pincode"
                maxLength="6"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Phone Number:</label>
              <input
                type="tel"
                value={deliveryAddress.mobile}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, mobile: e.target.value})}
                placeholder="10-digit mobile number"
                maxLength="10"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Payment Method</h2>
          
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Credit/Debit Card</option>
            <option>UPI</option>
            <option>Net Banking</option>
            <option>Wallets</option>
          </select>

          <div className="mt-4 p-4 bg-blue-50 rounded flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700">
              Secure payment powered by Razorpay
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Price:</span>
              <span>₹{product.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span className="text-blue-600">₹{totalPrice}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Processing Payment...' : 'Place Order'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;