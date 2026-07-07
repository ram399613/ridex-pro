import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ridex_user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const persist = (u, token) => {
    if (u) localStorage.setItem('ridex_user', JSON.stringify(u));
    else localStorage.removeItem('ridex_user');
    if (token) localStorage.setItem('ridex_token', token);
    setUser(u);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, ...userData } = data;
    persist(userData, token);
    return userData;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const { token, ...userData } = data;
    persist(userData, token);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('ridex_token');
    localStorage.removeItem('ridex_user');
    setUser(null);
  };

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem('ridex_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      persist(data, token);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshMe(); }, [refreshMe]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
