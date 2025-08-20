import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Hackathon API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

// Handle response errors with token refresh
api.interceptors.response.use(
  (response) => {
    console.log('Hackathon API Response:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('Hackathon API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          console.log('Attempting token refresh for hackathon service...');
          const refreshResponse = await api.post('/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = refreshResponse.data.data;
          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Retry original request
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed in hackathon service:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          // Don't redirect here, let the calling component handle it
          throw new Error('Session expired. Please login again.');
        }
      } else {
        localStorage.removeItem('token');
        throw new Error('No refresh token available. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

export const hackathonService = {
  // Organizer: get events created by the logged-in user
  async getMyEvents({ page = 1, limit = 100 } = {}) {
    try {
      console.log('Fetching organizer events from backend...', { page, limit });
      const response = await api.get('/events/user/events', { params: { page, limit } });
      console.log('Fetched organizer events response:', response.data);
      // Expected shape: { success, data: { createdEvents: { events, pagination }, participatingEvents } }
      const created = response.data?.data?.createdEvents?.events || [];
      return created;
    } catch (error) {
      console.error('Failed to fetch organizer events:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to load your events');
    }
  },

  // Get both created and participating events for current user
  async getUserEvents({ page = 1, limit = 100 } = {}) {
    try {
      const response = await api.get('/events/user/events', { params: { page, limit } });
      const createdEvents = response.data?.data?.createdEvents?.events || [];
      const participatingEvents = response.data?.data?.participatingEvents || [];
      return { createdEvents, participatingEvents };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to load user events');
    }
  },
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

  // Update event via events controller (strict validation)
  async updateEvent(id, eventData) {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data?.data?.event || response.data?.event || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
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

  // Get hackathon stats (participants, teams, submissions, averageScore, totalReviews)
  async getHackathonStats(hackathonId) {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stats');
    }
  },
};
