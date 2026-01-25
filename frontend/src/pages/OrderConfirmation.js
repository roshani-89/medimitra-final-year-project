import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p>Please go back to products and try again.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <div className="text-center mb-6">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Order ID:</p>
            <p className="text-gray-600">{order._id}</p>
          </div>
          <div>
            <p className="font-medium">Order Date:</p>
            <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-medium">Status:</p>
            <p className="text-green-600 font-medium">{order.status}</p>
          </div>
          <div>
            <p className="font-medium">Total Amount:</p>
            <p className="text-gray-600">₹{order.totalPrice}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Delivery Address:</h3>
          <p className="text-gray-600">
            {order.deliveryAddress?.society}, {order.deliveryAddress?.pincode}
          </p>
          <p className="text-gray-600">Phone: {order.deliveryAddress?.mobile}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Product Details:</h3>
          <div className="flex items-center gap-4 p-4 border rounded">
            <img
              src={order.product?.photos?.[0] || ''}
              alt={order.product?.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="font-medium">{order.product?.name}</p>
              <p className="text-gray-600">Quantity: {order.quantity}</p>
              <p className="text-gray-600">Price: ₹{order.product?.price} each</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          You will receive an email confirmation shortly. You can also track your order in your profile.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/products')}
            className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
