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

export const hackathonService = {
  // Get all hackathons
  async getHackathons(filters = {}) {
    try {
      const response = await api.get('/hackathons', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hackathons');
    }
  },

  // Get hackathon by ID
  async getHackathon(id) {
    try {
      const response = await api.get(`/hackathons/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hackathon');
    }
  },

  // Create new hackathon (organizer only)
  async createHackathon(hackathonData) {
    try {
      const response = await api.post('/hackathons', hackathonData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create hackathon');
    }
  },

  // Update hackathon (organizer only)
  async updateHackathon(id, hackathonData) {
    try {
      const response = await api.put(`/hackathons/${id}`, hackathonData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update hackathon');
    }
  },

  // Delete hackathon (organizer only)
  async deleteHackathon(id) {
    try {
      const response = await api.delete(`/hackathons/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete hackathon');
    }
  },

  // Register for hackathon (participant only)
  async registerForHackathon(hackathonId) {
    try {
      const response = await api.post(`/hackathons/${hackathonId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register for hackathon');
    }
  },

  // Unregister from hackathon (participant only)
  async unregisterFromHackathon(hackathonId) {
    try {
      const response = await api.delete(`/hackathons/${hackathonId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unregister from hackathon');
    }
  },

  // Get hackathon participants
  async getHackathonParticipants(hackathonId) {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/participants`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch participants');
    }
  },

  // Get hackathon submissions
  async getHackathonSubmissions(hackathonId) {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/submissions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
    }
  },

  // Submit project (participant only)
  async submitProject(hackathonId, submissionData) {
    try {
      const response = await api.post(`/hackathons/${hackathonId}/submissions`, submissionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit project');
    }
  },

  // Update submission (participant only)
  async updateSubmission(hackathonId, submissionId, submissionData) {
    try {
      const response = await api.put(`/hackathons/${hackathonId}/submissions/${submissionId}`, submissionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update submission');
    }
  },

  // Judge submission (judge only)
  async judgeSubmission(hackathonId, submissionId, judgeData) {
    try {
      const response = await api.post(`/hackathons/${hackathonId}/submissions/${submissionId}/judge`, judgeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to judge submission');
    }
  },

  // Get hackathon leaderboard
  async getHackathonLeaderboard(hackathonId) {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/leaderboard`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  },
};
