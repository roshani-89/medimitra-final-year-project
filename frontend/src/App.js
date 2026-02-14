import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminProfile from './pages/AdminProfile';

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
          <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute allowedRoles={['User']}><Dashboard /></PrivateRoute>} />
              <Route path="/admin-dashboard" element={<PrivateRoute allowedRoles={['Admin']}><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/profile" element={<PrivateRoute allowedRoles={['Admin']}><AdminProfile /></PrivateRoute>} />
              <Route path="/products" element={<PrivateRoute allowedRoles={['User']}><Products /></PrivateRoute>} />
              <Route path="/add-product" element={<PrivateRoute allowedRoles={['User']}><AddProduct /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute allowedRoles={['User']}><Orders /></PrivateRoute>} />
              <Route path="/health-assistant" element={<PrivateRoute allowedRoles={['User']}><HealthAssistant /></PrivateRoute>} />
              <Route path="/health-tips" element={<PrivateRoute allowedRoles={['User']}><HealthTips /></PrivateRoute>} />
              <Route path="/emergency-contacts" element={<PrivateRoute allowedRoles={['User']}><EmergencyContacts /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute allowedRoles={['User']}><Checkout /></PrivateRoute>} />
              <Route path="/order-confirmation" element={<PrivateRoute allowedRoles={['User']}><OrderConfirmation /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = React.useContext(AuthContext);
  const location = React.useRef(window.location.pathname);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const target = user.role === 'Admin' ? '/admin-dashboard' : '/dashboard';
    // Prevent redirection to the current page
    if (window.location.pathname === target) return children;
    return <Navigate to={target} replace />;
  }
  return children;
};

export default App;
