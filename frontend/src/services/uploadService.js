import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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

export const uploadService = {
  // Upload file
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

  // Upload multiple files
  async uploadMultipleFiles(files, type = 'submission') {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      formData.append('type', type);

      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload files');
    }
  },

  // Delete file
  async deleteFile(fileUrl) {
    try {
      const response = await api.delete('/upload', {
        data: { fileUrl }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
  },

  // Get file info
  async getFileInfo(fileUrl) {
    try {
      const response = await api.get('/upload/info', {
        params: { fileUrl }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get file info');
    }
  },
};
