import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('user');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'Admin' ? '/admin-dashboard' : '/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate admin code if admin login
    if (loginType === 'admin') {
      if (!adminCode.trim()) {
        setError('Admin secret code is required');
        return;
      }
      if (adminCode !== 'ADMIN2024') {
        setError('Invalid admin secret code');
        return;
      }
    }

    try {
      setLoading(true);
      const loggedInUser = await login(email, password);
      
      // Check role matches login type
      if (loginType === 'admin' && loggedInUser.role !== 'Admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      
      if (loginType === 'user' && loggedInUser.role === 'Admin') {
        setError('Please use Admin Login for admin accounts.');
        setLoading(false);
        return;
      }

      // Navigation will be handled by useEffect when user context updates
      setLoading(false);
      
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        {/* Login Type Selection */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginType('user');
              setError('');
              setAdminCode('');
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              loginType === 'user'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('admin');
              setError('');
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              loginType === 'admin'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Admin Login
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                loginType === 'admin'
                  ? 'focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                loginType === 'admin'
                  ? 'focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
              required
            />
          </div>

          {loginType === 'admin' && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Admin Secret Code
              </label>
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                placeholder="Enter admin code"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 sm:py-3 rounded-lg font-semibold text-white transition-all ${
              loginType === 'admin'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Loading...' : loginType === 'admin' ? 'Admin Login' : 'User Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;