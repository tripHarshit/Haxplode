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
      // Guard against infinite refresh loops
      const originalRequest = error.config || {};
      if (originalRequest?.url?.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = refreshResponse.data.data;
          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Retry original request
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('token');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // normalize backend user shape to the UI shape expected across the app
  _normalizeUser(raw) {
    if (!raw) return null;
    const name = raw.fullName || raw.name || '';
    const role = raw.role || (Array.isArray(raw.roles) && raw.roles[0]) || undefined;
    const roles = raw.roles || (role ? [role] : []);
    return {
      id: raw.id,
      name,
      fullName: name,
      email: raw.email,
      role,
      roles,
      profilePicture: raw.profilePicture,
      emailVerified: raw.emailVerified,
      lastLoginAt: raw.lastLoginAt,
    };
  },
  async login(credentials) {
    try {
      console.log('Login attempt for:', credentials.email);
      
      const response = await api.post('/auth/login', credentials);
      const { user, token, refreshToken } = response.data.data;
      const normalizedUser = authService._normalizeUser(user);
      
      console.log('Login successful for user:', user.fullName);
      
      return { user: normalizedUser, token, refreshToken };
    } catch (error) {
      console.error('Login failed:', error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async loginWithGoogle(idToken) {
    try {
      console.log('Google OAuth login attempt');

      const response = await api.post('/auth/google', {
        idToken,
        role: 'Participant'
      });

      // New user flow: backend signals requiresRegistration
      if (response.data?.requiresRegistration) {
        const prefill = response.data?.data?.prefill || {};
        console.log('Google account not found. Needs registration.');
        // Caller should navigate to Google registration page
        return { requiresRegistration: true, prefill, provider: 'google', idToken };
      }

      // Existing user flow: tokens present under data or nested tokens
      const data = response.data.data || {};
      const accessToken = data.token || data.accessToken || data.tokens?.accessToken;
      const refreshToken = data.refreshToken || data.tokens?.refreshToken;
      const normalizedUser = authService._normalizeUser(data.user);

      // Store tokens
      if (accessToken) localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      console.log('Google login successful for user:', normalizedUser?.fullName || normalizedUser?.name);

      return { user: normalizedUser, token: accessToken, refreshToken };
    } catch (error) {
      console.error('Google login failed:', error.message);
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  },

  async completeGoogleRegistration({ idToken, name, dateOfBirth, role = 'Participant' }) {
    try {
      const response = await api.post('/auth/google/complete', {
        idToken,
        name,
        dateOfBirth,
        role,
      });
      const data = response.data.data || {};
      const accessToken = data.token || data.accessToken || data.tokens?.accessToken;
      const refreshToken = data.refreshToken || data.tokens?.refreshToken;
      const normalizedUser = authService._normalizeUser(data.user);

      if (accessToken) localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      return { user: normalizedUser, token: accessToken, refreshToken };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete Google registration');
    }
  },

  async register(userData) {
    try {
      console.log('Registration attempt for:', userData.email);
      
      const response = await api.post('/auth/register', userData);
      const { user, token, refreshToken } = response.data.data;
      const normalizedUser = authService._normalizeUser(user);
      
      console.log('Registration successful for user:', user.fullName);
      
      return { user: normalizedUser, token, refreshToken };
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async getCurrentUser() {
    try {
      console.log('Fetching current user');
      
      const response = await api.get('/auth/me');
      const user = response.data?.data?.user || response.data?.user || response.data;
      const normalizedUser = authService._normalizeUser(user);
      
      console.log('Current user fetched:', normalizedUser?.fullName || normalizedUser?.name);
      return normalizedUser;
    } catch (error) {
      console.error('Failed to get current user:', error.message);
      throw new Error(error.response?.data?.message || 'Failed to get current user');
    }
  },

  async updateProfile(userData) {
    try {
      console.log('Updating user profile');
      
      const response = await api.put('/auth/profile', userData);
      const user = response.data?.data?.user || response.data?.user || response.data;
      const normalizedUser = authService._normalizeUser(user);
      
      console.log('Profile updated successfully');
      return normalizedUser;
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
      
      // Add a small delay to prevent rapid calls
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token, refreshToken: newRefreshToken } = response.data.data;
      
      localStorage.setItem('token', token);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      console.log('Token refreshed successfully');
      return { token, refreshToken: newRefreshToken };
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
    if (!token) return false;
    
    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, remove it
        localStorage.removeItem('token');
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token, remove it
      localStorage.removeItem('token');
      return false;
    }
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
