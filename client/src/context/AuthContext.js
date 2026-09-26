// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import axios from '../axios';

export const AuthContext = createContext();

// NOTE on security trade-off: the token and user object are kept in
// localStorage so they survive a page refresh without a separate
// "remember me" flow. localStorage is readable by any JS running on the
// page, so if this app is ever vulnerable to XSS, the token is stealable.
// The most robust fix is to have the backend set the JWT as an httpOnly
// cookie instead (not readable by JS at all) and drop localStorage/token
// state here entirely — that's a backend + frontend change together, so
// it's called out here rather than done silently. If you want that, say so
// and I'll wire it up on both sides.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      // Backend returns { error: "..." } — read that key, with a couple of
      // fallbacks in case an error shape ever differs (network errors, etc).
      return {
        success: false,
        message:
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Login failed. Please try again.',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Registration failed.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
