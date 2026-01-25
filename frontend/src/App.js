import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Orders from './pages/Orders';
import HealthAssistant from './pages/HealthAssistant';
import HealthTips from './pages/HealthTips';
import EmergencyContacts from './pages/EmergencyContacts';
import UserProfile from './pages/UserProfile';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
            <Route path="/add-product" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path="/health-assistant" element={<PrivateRoute><HealthAssistant /></PrivateRoute>} />
            <Route path="/health-tips" element={<PrivateRoute><HealthTips /></PrivateRoute>} />
            <Route path="/emergency-contacts" element={<PrivateRoute><EmergencyContacts /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/order-confirmation" element={<PrivateRoute><OrderConfirmation /></PrivateRoute>} />
          </Routes>
          <main className="container mx-auto px-4 py-8">
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default App;
