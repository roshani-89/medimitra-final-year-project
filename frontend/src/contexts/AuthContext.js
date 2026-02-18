import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      axios.get('https://medimitra-final-year-project-3.onrender.com/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await axios.post('https://medimitra-final-year-project-3.onrender.com/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (name, email, password, mobile, society, pincode, role = 'User') => {
    try {
      const res = await axios.post('https://medimitra-final-year-project-3.onrender.com/api/auth/register', { name, email, password, mobile, society, pincode, role });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    login,
    register,
    logout,
    loading
  }), [user, login, register, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
