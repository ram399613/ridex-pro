import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../services/api';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ridex_token');
    const options = { transports: ['polling', 'websocket'], path: '/api/socket.io/', reconnection: true, auth: token ? { token } : {} };
    const s = SOCKET_URL ? io(SOCKET_URL, options) : io(options);
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
    });
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    s.on('notification', (payload) => {
      showToast(payload.message, payload.type || 'info');
      window.dispatchEvent(new CustomEvent('ridex:notification', { detail: payload }));
    });
    s.on('vehicle:updated', (v) => window.dispatchEvent(new CustomEvent('ridex:vehicle-updated', { detail: v })));
    s.on('vehicle:created', (v) => window.dispatchEvent(new CustomEvent('ridex:vehicle-created', { detail: v })));
    s.on('vehicle:deleted', (v) => window.dispatchEvent(new CustomEvent('ridex:vehicle-deleted', { detail: v })));
    s.on('admin:stats:refresh', () => window.dispatchEvent(new CustomEvent('ridex:admin-refresh')));
    s.on('admin:booking:new', (b) => window.dispatchEvent(new CustomEvent('ridex:admin-booking', { detail: b })));
    s.on('admin:booking:updated', (b) => window.dispatchEvent(new CustomEvent('ridex:admin-booking', { detail: b })));
    s.on('admin:contact:new', (m) => window.dispatchEvent(new CustomEvent('ridex:admin-contact', { detail: m })));

    const handleAuthChange = () => {
      const newToken = localStorage.getItem('ridex_token');
      s.auth = newToken ? { token: newToken } : {};
      if (s.connected) s.disconnect().connect();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('ridex:auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('ridex:auth-change', handleAuthChange);
      s.disconnect();
    };
  }, [showToast]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
