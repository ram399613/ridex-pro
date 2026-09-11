import axios from 'axios';

const raw = (process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/$/, '');
const BASE = raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
// An empty value deliberately uses the current origin: this is correct for the
// Render service, while the development .env points to localhost.
export const API_BASE = BASE ? `${BASE}/api` : '/api';
export const SOCKET_URL = BASE || undefined;

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ridex_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
