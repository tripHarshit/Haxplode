import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const judgeService = {
  async getProfile() {
    const res = await api.get('/judges/profile');
    return res.data?.data?.judge || null;
  },

  async getEvents() {
    const res = await api.get('/judges/events');
    return res.data?.data?.assignments || [];
  },

  async getAnalytics() {
    const res = await api.get('/judges/analytics');
    return res.data || {};
  },

  async submitScore({ submissionId, score, feedback, criteria }) {
    const res = await api.post('/judges/score', { submissionId, score, feedback, criteria });
    return res.data;
  },

  async getSubmissionsByEvent(eventId) {
    const res = await api.get(`/submissions/event/${eventId}`);
    return res.data?.data?.submissions || [];
  },

  async getJudgesForEvent(eventId) {
    const res = await api.get(`/judges/event/${eventId}`);
    const list = res.data?.data?.judges || res.data?.judges || [];
    // Normalize to simple array of { id, user: { fullName, email } }
    return list.map((row) => {
      const user = row?.judge?.user || row?.user || {};
      return {
        id: row?.judgeId || row?.id,
        user,
        role: row?.role,
        assignedAt: row?.assignedAt,
      };
    });
  },

  async assignJudgeByEmail({ eventId, email, role = 'Secondary' }) {
    const res = await api.post('/judges/assign', { eventId, email, role });
    return res.data;
  },
};


