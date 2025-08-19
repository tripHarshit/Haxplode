import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

// Mock data for development
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['participant'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    roles: ['organizer'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-10T14:30:00Z'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    roles: ['judge'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-05T09:15:00Z'
  }
];

// Simulate API delay
const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock authentication responses
const generateMockToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    roles: user.roles,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  return btoa(JSON.stringify(payload)) + '.mock.signature';
};

export const authService = {
  async login(credentials) {
    try {
      console.log('Login attempt for:', credentials.email);
      
      // Simulate API call
      await simulateDelay(1500);
      
      // Find user in mock data
      const user = mockUsers.find(u => u.email === credentials.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Mock password validation (in real app, this would be server-side)
      if (credentials.password !== 'password123') {
        throw new Error('Invalid email or password');
      }
      
      const token = generateMockToken(user);
      const refreshToken = 'mock.refresh.token.' + Date.now();
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      console.log('Login successful for user:', user.name);
      
      return { user, token, refreshToken };
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  },

  async loginWithGoogle(idToken) {
    try {
      console.log('Google OAuth login attempt');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          role: 'Participant' // Default role, can be made configurable
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Google authentication failed');
      }

      const { user, tokens } = data.data;
      
      // Store tokens
      localStorage.setItem('token', tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }
      
      console.log('Google login successful for user:', user.fullName);
      
      return { user, token: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch (error) {
      console.error('Google login failed:', error.message);
      throw error;
    }
  },

  async register(userData) {
    try {
      console.log('Registration attempt for:', userData.email);
      
      // Simulate API call
      await simulateDelay(2000);
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: mockUsers.length + 1,
        name: userData.name,
        email: userData.email,
        roles: [userData.role],
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face&${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      // Add to mock users
      mockUsers.push(newUser);
      
      const token = generateMockToken(newUser);
      const refreshToken = 'new.refresh.token.' + Date.now();
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      console.log('Registration successful for user:', newUser.name);
      
      return { user: newUser, token, refreshToken };
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      console.log('Fetching current user');
      
      // Simulate API call
      await simulateDelay(800);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Decode mock token (in real app, this would be server-side)
      try {
        const payload = JSON.parse(atob(token.split('.')[0]));
        const user = mockUsers.find(u => u.id === payload.userId);
        
        if (!user) {
          throw new Error('User not found');
        }
        
        console.log('Current user fetched:', user.name);
        return user;
      } catch (decodeError) {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Failed to get current user:', error.message);
      throw error;
    }
  },

  async updateProfile(userData) {
    try {
      console.log('Updating user profile');
      
      // Simulate API call
      await simulateDelay(1000);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Find and update user
      const payload = JSON.parse(atob(token.split('.')[0]));
      const userIndex = mockUsers.findIndex(u => u.id === payload.userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user data
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
      
      console.log('Profile updated successfully');
      return mockUsers[userIndex];
    } catch (error) {
      console.error('Profile update failed:', error.message);
      throw error;
    }
  },

  async changePassword(passwordData) {
    try {
      console.log('Changing password');
      
      // Simulate API call
      await simulateDelay(1000);
      
      // Mock password change validation
      if (passwordData.currentPassword !== 'password123') {
        throw new Error('Current password is incorrect');
      }
      
      if (passwordData.newPassword === passwordData.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      
      console.log('Password changed successfully');
      return { message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change failed:', error.message);
      throw error;
    }
  },

  async forgotPassword(email) {
    try {
      console.log('Forgot password request for:', email);
      
      // Simulate API call
      await simulateDelay(1500);
      
      // Check if user exists
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('No user found with this email address');
      }
      
      console.log('Password reset email sent to:', email);
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Forgot password failed:', error.message);
      throw error;
    }
  },

  async resetPassword(token, password) {
    try {
      console.log('Resetting password');
      
      // Simulate API call
      await simulateDelay(1000);
      
      // Mock token validation
      if (!token || token.length < 10) {
        throw new Error('Invalid reset token');
      }
      
      console.log('Password reset successfully');
      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset failed:', error.message);
      throw error;
    }
  },

  async refreshToken() {
    try {
      console.log('Refreshing token');
      
      // Simulate API call
      await simulateDelay(500);
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      // Mock token refresh
      const newToken = 'refreshed.token.' + Date.now();
      localStorage.setItem('token', newToken);
      
      console.log('Token refreshed successfully');
      return { token: newToken };
    } catch (error) {
      console.error('Token refresh failed:', error.message);
      throw error;
    }
  },

  async logout() {
    try {
      console.log('Logging out user');
      
      // Simulate API call
      await simulateDelay(500);
      
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
      throw error;
    }
  },

  // Helper method to check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[0]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
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
