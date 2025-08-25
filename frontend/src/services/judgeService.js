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
    try {
      const res = await api.get('/judges/profile');
      return res.data?.data?.judge || null;
    } catch (error) {
      const status = error?.response?.status;
      // If no judge profile exists yet, treat as null instead of throwing
      if (status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getEvents() {
    try {
      const res = await api.get('/judges/events');
      return res.data?.data?.assignments || [];
    } catch (error) {
      const status = error?.response?.status;
      const message = String(error?.response?.data?.message || '').toLowerCase();
      // Treat 404 or explicit "no assignments" responses as an empty list, not an error
      if (status === 404 || message.includes('no assignments')) {
        return [];
      }
      throw error;
    }
  },

  async getAnalytics() {
    try {
      const res = await api.get('/judges/analytics');
      return res.data || {};
    } catch (error) {
      const status = error?.response?.status;
      // If analytics isn't available (e.g., none yet), return sensible defaults
      if (status === 404) {
        return {
          totals: { reviews: 0, averageScore: 0 },
          time: { averageMs: 0 },
          completion: { rate: 0, reviewed: 0, assigned: 0 },
          scoreDistribution: {},
          monthlyStats: [],
          recent: [],
        };
      }
      throw error;
    }
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

  // New methods for submission assignment system
  async getAssignedSubmissions(eventId) {
    const res = await api.get(`/judges/submissions/${eventId}`);
    return res.data?.data?.submissions || [];
  },

  async submitReview({ submissionId, score, feedback, criteria, timeSpent }) {
    const res = await api.post('/judges/review', { submissionId, score, feedback, criteria, timeSpent });
    return res.data;
  },

  async assignSubmissionsToJudges(eventId) {
    const res = await api.post(`/judges/assign-submissions/${eventId}`);
    return res.data;
  },

  async getEventResults(eventId) {
    const res = await api.get(`/judges/results/${eventId}`);
    return res.data?.data || {};
  },
};


