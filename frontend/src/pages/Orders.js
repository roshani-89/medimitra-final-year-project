import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Confirmed': return 'text-blue-600 bg-blue-100';
      case 'Shipped': return 'text-purple-600 bg-purple-100';
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{order.productId?.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{order.productId?.description}</p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                <p className="text-lg font-bold text-green-600">Total: ${order.totalPrice}</p>
                <p className="text-sm text-gray-500">
                  Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Delivery Address:</h3>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress?.society}, {order.deliveryAddress?.pincode}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
