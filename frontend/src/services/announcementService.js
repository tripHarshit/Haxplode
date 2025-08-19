import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const announcementService = {
  // Get all announcements
  async getAnnouncements(filters = {}) {
    try {
      const response = await api.get('/announcements', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch announcements');
    }
  },

  // Get announcement by ID
  async getAnnouncement(id) {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch announcement');
    }
  },

  // Create new announcement (organizer only)
  async createAnnouncement(announcementData) {
    try {
      const response = await api.post('/announcements', announcementData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create announcement');
    }
  },

  // Update announcement (organizer only)
  async updateAnnouncement(id, announcementData) {
    try {
      const response = await api.put(`/announcements/${id}`, announcementData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update announcement');
    }
  },

  // Delete announcement (organizer only)
  async deleteAnnouncement(id) {
    try {
      const response = await api.delete(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete announcement');
    }
  },

  // Get announcements by event
  async getEventAnnouncements(eventId) {
    try {
      const response = await api.get(`/announcements/event/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event announcements');
    }
  },
};
