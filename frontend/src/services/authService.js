import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken });
          const { token } = refreshResponse.data;
          localStorage.setItem('token', token);
          
          // Retry original request
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    try {
      console.log('Login attempt for:', credentials.email);
      
      const response = await api.post('/auth/login', credentials);
      const { user, token, refreshToken } = response.data.data;
      
      console.log('Login successful for user:', user.fullName);
      
      return { user, token, refreshToken };
    } catch (error) {
      console.error('Login failed:', error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async loginWithGoogle(googleToken) {
    try {
      console.log('Google OAuth login attempt');
      
      const response = await api.post('/auth/google', { token: googleToken });
      const { user, token, refreshToken } = response.data.data;
      
      console.log('Google login successful for user:', user.fullName);
      
      return { user, token, refreshToken };
    } catch (error) {
      console.error('Google login failed:', error.message);
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  },

  async register(userData) {
    try {
      console.log('Registration attempt for:', userData.email);
      
      const response = await api.post('/auth/register', userData);
      const { user, token, refreshToken } = response.data.data;
      
      console.log('Registration successful for user:', user.fullName);
      
      return { user, token, refreshToken };
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async getCurrentUser() {
    try {
      console.log('Fetching current user');
      
      const response = await api.get('/auth/me');
      const user = response.data;
      
      console.log('Current user fetched:', user.fullName);
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to get current user');
    }
  },

  async updateProfile(userData) {
    try {
      console.log('Updating user profile');
      
      const response = await api.put('/auth/profile', userData);
      const user = response.data;
      
      console.log('Profile updated successfully');
      return user;
    } catch (error) {
      console.error('Profile update failed:', error.message);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },

  async changePassword(passwordData) {
    try {
      console.log('Changing password');
      
      const response = await api.put('/auth/change-password', passwordData);
      
      console.log('Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('Password change failed:', error.message);
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  },

  async forgotPassword(email) {
    try {
      console.log('Forgot password request for:', email);
      
      const response = await api.post('/auth/forgot-password', { email });
      
      console.log('Password reset email sent to:', email);
      return response.data;
    } catch (error) {
      console.error('Forgot password failed:', error.message);
      throw new Error(error.response?.data?.message || 'Forgot password failed');
    }
  },

  async resetPassword(token, password) {
    try {
      console.log('Resetting password');
      
      const response = await api.post('/auth/reset-password', { token, password });
      
      console.log('Password reset successfully');
      return response.data;
    } catch (error) {
      console.error('Password reset failed:', error.message);
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  async refreshToken() {
    try {
      console.log('Refreshing token');
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      
      console.log('Token refreshed successfully');
      return { token };
    } catch (error) {
      console.error('Token refresh failed:', error.message);
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  async logout() {
    try {
      console.log('Logging out user');
      
      await api.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      console.log('Logout successful');
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout failed:', error.message);
      // Still clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  // Helper method to check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Helper method to get user roles from token
  getUserRoles() {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    try {
      const payload = JSON.parse(atob(token.split('.')[0]));
      return payload.roles || [];
    } catch {
      return [];
    }
  }
};
