import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
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

    fetchOrders();
  }, []);

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map(order => (
        <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">{order.productId?.name}</h2>
          <p className="text-gray-700 font-medium">
            Status: <span className="capitalize">{order.status}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
