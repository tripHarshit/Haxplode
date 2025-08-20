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
      console.log(`Attempting to download certificate ${certificateId}`);
      
      const response = await api.get(`/certificates/download/${certificateId}`, {
        responseType: 'blob'
      });
      
      // Check if the response is actually a PDF
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        // If not a PDF, try to parse the error message
        const text = await response.data.text();
        let errorMessage = 'Failed to download certificate';
        
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use the text as is
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
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
      
      console.log(`Certificate ${certificateId} downloaded successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error downloading certificate:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to download certificate';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          errorMessage = 'Certificate not found';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied to this certificate';
        } else if (error.response.status === 400) {
          errorMessage = 'Certificate not ready for download';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error while downloading certificate';
        }
        
        // Try to get error message from response
        if (error.response.data) {
          try {
            const errorData = JSON.parse(await error.response.data.text());
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If we can't parse the error response, use the status-based message
          }
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error - please check your connection';
      } else {
        // Other error
        errorMessage = error.message || errorMessage;
      }
      
      throw new Error(errorMessage);
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
