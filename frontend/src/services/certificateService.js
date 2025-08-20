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
  return config;
});

export const certificateService = {
  // Get user certificates
  async getUserCertificates(userId) {
    try {
      const response = await api.get(`/certificates/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch certificates');
    }
  },

  // Download certificate PDF
  async downloadCertificate(certificateId) {
    try {
      const response = await api.get(`/certificates/download/${certificateId}`, {
        responseType: 'blob'
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw new Error(error.response?.data?.message || 'Failed to download certificate');
    }
  },

  // Generate certificates for an event (Organizer only)
  async generateEventCertificates(eventId) {
    try {
      const response = await api.post(`/certificates/generate/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error generating certificates:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate certificates');
    }
  }
};
