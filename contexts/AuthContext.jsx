'use client';

import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      // For simplicity, we'll decode the user from the token on the client
      // A better approach would be a `/me` endpoint
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username, email: payload.email, _id: payload._id });
      } catch (e) {
        Cookies.remove('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    Cookies.set('token', token, { expires: 7 });
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({ username: payload.username, email: payload.email, _id: payload._id });
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};