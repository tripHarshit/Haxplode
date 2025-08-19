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

export const submissionService = {
  // Get all submissions
  async getSubmissions(filters = {}) {
    try {
      const response = await api.get('/submissions', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
    }
  },

  // Get submission by ID
  async getSubmission(id) {
    try {
      const response = await api.get(`/submissions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submission');
    }
  },

  // Create new submission
  async createSubmission(submissionData) {
    try {
      const response = await api.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create submission');
    }
  },

  // Update submission
  async updateSubmission(id, submissionData) {
    try {
      const response = await api.put(`/submissions/${id}`, submissionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update submission');
    }
  },

  // Delete submission
  async deleteSubmission(id) {
    try {
      const response = await api.delete(`/submissions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete submission');
    }
  },

  // Get submission reviews
  async getSubmissionReviews(submissionId) {
    try {
      const response = await api.get(`/submissions/${submissionId}/reviews`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submission reviews');
    }
  },

  // Get submission summary
  async getSubmissionSummary(submissionId) {
    try {
      const response = await api.get(`/submissions/${submissionId}/summary`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submission summary');
    }
  },

  // Upload submission file
  async uploadSubmissionFile(submissionId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/submissions/${submissionId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload submission file');
    }
  },

  // Delete submission file
  async deleteSubmissionFile(submissionId, fileUrl) {
    try {
      const response = await api.delete(`/submissions/${submissionId}/files`, {
        data: { fileUrl }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete submission file');
    }
  },

  // Judge submission (judge only)
  async judgeSubmission(submissionId, judgeData) {
    try {
      const response = await api.post(`/submissions/${submissionId}/judge`, judgeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to judge submission');
    }
  },
};
