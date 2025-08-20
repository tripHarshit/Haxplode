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

export const chatService = {
  async sendMessage({ eventId, message, messageType = 'Text', parentMessageId = undefined, tags = [] }) {
    const payload = { eventId, message, messageType, tags };
    if (typeof parentMessageId === 'string' && parentMessageId.trim().length > 0) {
      payload.parentMessageId = parentMessageId.trim();
    }
    const res = await api.post('/chats', payload);
    return res.data?.data?.message || res.data?.message;
  },
  async getMessages(eventId, { page = 1, limit = 50, messageType, parentMessageId } = {}) {
    const params = { page, limit };
    if (messageType) params.messageType = messageType;
    if (parentMessageId) params.parentMessageId = parentMessageId;
    const res = await api.get(`/chats/event/${eventId}`, { params });
    return res.data?.data?.messages || [];
  },
  async getQuestions(eventId, { page = 1, limit = 20 } = {}) {
    const res = await api.get(`/chats/event/${eventId}/questions`, { params: { page, limit } });
    return res.data?.data?.questions || [];
  },
  async getAnswers(questionId) {
    const res = await api.get(`/chats/question/${questionId}/answers`);
    return res.data?.data?.answers || [];
  },
  async updateMessage(id, payload) {
    const res = await api.put(`/chats/${id}`, payload);
    return res.data?.data?.message || null;
  },
  async deleteMessage(id) {
    await api.delete(`/chats/${id}`);
  },
  async addReaction(id, reactionType) {
    await api.post(`/chats/${id}/reactions`, { reactionType });
  },
  async removeReaction(id) {
    await api.delete(`/chats/${id}/reactions`);
  },
  async markAsRead(id) {
    await api.post(`/chats/${id}/read`);
  },
  async togglePin(id) {
    await api.patch(`/chats/${id}/pin`);
  },
}; 