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

export const participantService = {
  // Get participant dashboard data
  async getDashboardData() {
    try {
      const response = await api.get('/participant/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },

  // Get participant's registered events
  async getRegisteredEvents() {
    try {
      const response = await api.get('/participant/events/registered');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch registered events');
    }
  },

  // Get participant's teams
  async getParticipantTeams() {
    try {
      const response = await api.get('/participant/teams');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams');
    }
  },

  // Get participant's submissions
  async getParticipantSubmissions() {
    try {
      const response = await api.get('/participant/submissions');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
    }
  },

  // Team Management
  async createTeam(teamData) {
    try {
      const response = await api.post('/teams', teamData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create team');
    }
  },

  async joinTeam(invitationCode) {
    try {
      const response = await api.post('/teams/join', { invitationCode });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join team');
    }
  },

  async leaveTeam(teamId) {
    try {
      const response = await api.delete(`/teams/${teamId}/leave`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to leave team');
    }
  },

  async inviteTeamMember(teamId, email) {
    try {
      const response = await api.post(`/teams/${teamId}/invite`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to invite team member');
    }
  },

  async getTeamDetails(teamId) {
    try {
      const response = await api.get(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team details');
    }
  },

  // Submissions
  async submitProject(hackathonId, submissionData) {
    try {
      const response = await api.post(`/hackathons/${hackathonId}/submissions`, submissionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit project');
    }
  },

  async updateSubmission(hackathonId, submissionId, submissionData) {
    try {
      const response = await api.put(`/hackathons/${hackathonId}/submissions/${submissionId}`, submissionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update submission');
    }
  },

  async getSubmission(hackathonId, submissionId) {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submission');
    }
  },

  // Event Registration
  async registerForEvent(eventId) {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register for event');
    }
  },

  async unregisterFromEvent(eventId) {
    try {
      const response = await api.delete(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unregister from event');
    }
  },

  // File Upload
  async uploadFile(file, type = 'submission') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  },

  // Get participant activities
  async getActivities() {
    try {
      const response = await api.get('/participant/activities');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activities');
    }
  },

  // Get upcoming deadlines
  async getUpcomingDeadlines() {
    try {
      const response = await api.get('/participant/deadlines');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch deadlines');
    }
  },
};
