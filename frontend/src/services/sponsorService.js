import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const sponsorService = {
  async list() {
    const resp = await api.get('/sponsors');
    return resp.data?.sponsors || [];
  },
  async create(payload) {
    const resp = await api.post('/sponsors', payload);
    return resp.data?.sponsor || resp.data;
  },
  async update(id, payload) {
    const resp = await api.put(`/sponsors/${id}`, payload);
    return resp.data?.sponsor || resp.data;
  },
  async remove(id) {
    const resp = await api.delete(`/sponsors/${id}`);
    return resp.data;
  }
};


