import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['polling', 'websocket'], path: '/api/socket.io/', reconnection: true });
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      s.emit('auth:join', { userId: user?._id, role: user?.role });
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

    return () => { s.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket && connected) socket.emit('auth:join', { userId: user?._id, role: user?.role });
  }, [user, socket, connected]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
