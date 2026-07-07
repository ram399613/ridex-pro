import axios from 'axios';

const raw = process.env.REACT_APP_BACKEND_URL || '';
// Render may inject the host without a scheme (e.g. "ridex-backend.onrender.com")
// so we normalise here.
const BASE = raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
export const API_BASE = `${BASE}/api`;
export const SOCKET_URL = BASE;

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ridex_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
