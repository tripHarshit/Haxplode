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

export const teamService = {
  // Get teams by event (public)
  async getTeamsByEvent(eventId, params = {}) {
    try {
      const response = await api.get(`/teams/event/${eventId}`, { params });
      return response.data?.data?.teams || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams for event');
    }
  },

  // Get all teams
  async getTeams(filters = {}) {
    try {
      const response = await api.get('/teams', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams');
    }
  },

  // Get team by ID
  async getTeam(id) {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team');
    }
  },

  // Create new team
  async createTeam(teamData) {
    try {
      const response = await api.post('/teams', teamData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create team');
    }
  },

  // Update team
  async updateTeam(id, teamData) {
    try {
      const response = await api.put(`/teams/${id}`, teamData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update team');
    }
  },

  // Delete team
  async deleteTeam(id) {
    try {
      const response = await api.delete(`/teams/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete team');
    }
  },

  // Invite team member
  async inviteTeamMember(teamId, email) {
    try {
      const response = await api.post(`/teams/${teamId}/invite`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to invite team member');
    }
  },

  // Join team
  async joinTeam(invitationCode) {
    try {
      const response = await api.post('/teams/join', { invitationCode });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join team');
    }
  },

  // Leave team
  async leaveTeam(teamId) {
    try {
      const response = await api.delete(`/teams/${teamId}/leave`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to leave team');
    }
  },

  // Get team members
  async getTeamMembers(teamId) {
    try {
      const response = await api.get(`/teams/${teamId}/members`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team members');
    }
  },

  // Remove team member
  async removeTeamMember(teamId, memberId) {
    try {
      const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove team member');
    }
  },
};
