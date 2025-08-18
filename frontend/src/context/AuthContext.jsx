import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        isInitialized: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true,
      };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        try {
          dispatch({ type: 'AUTH_START' });
          
          // Check if token is valid
          if (authService.isAuthenticated()) {
            const user = await authService.getCurrentUser();
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token, refreshToken },
            });
            console.log('Authentication initialized successfully');
          } else {
            // Token expired, try to refresh
            try {
              const refreshResponse = await authService.refreshToken();
              const user = await authService.getCurrentUser();
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: { 
                  user, 
                  token: refreshResponse.token, 
                  refreshToken 
                },
              });
              console.log('Token refreshed successfully');
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
            }
          }
        } catch (error) {
          console.error('Authentication initialization failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          dispatch({
            type: 'AUTH_FAILURE',
            payload: error.message,
          });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
        console.log('No authentication tokens found');
      }
    };

    initializeAuth();
  }, []);

  // Role-based redirect logic
  const getRedirectPath = useCallback((user, intendedPath) => {
    if (!user || !user.roles) return '/dashboard';
    
    const roles = user.roles;
    
    // If user has specific role, redirect to role-specific dashboard
    if (roles.includes('organizer')) {
      return '/organizer';
    } else if (roles.includes('judge')) {
      return '/judge';
    } else if (roles.includes('participant')) {
      return '/participant';
    }
    
    // Default dashboard
    return '/dashboard';
  }, []);

  const login = async (credentials) => {
    try {
      console.log('Login attempt started');
      dispatch({ type: 'AUTH_START' });
      
      const { user, token, refreshToken } = await authService.login(credentials);
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      
      console.log('Login successful, redirecting...');
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(user, location.state?.from?.pathname);
      navigate(redirectPath, { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      console.log('Google OAuth login attempt started');
      dispatch({ type: 'AUTH_START' });
      
      const { user, token, refreshToken } = await authService.loginWithGoogle(googleToken);
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      
      console.log('Google login successful, redirecting...');
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(user, location.state?.from?.pathname);
      navigate(redirectPath, { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('Google login failed:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registration attempt started');
      dispatch({ type: 'AUTH_START' });
      
      const { user, token, refreshToken } = await authService.register(userData);
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      
      console.log('Registration successful, redirecting...');
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(user, '/dashboard');
      navigate(redirectPath, { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const logout = useCallback(async () => {
    try {
      console.log('Logout attempt started');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await authService.logout();
      
      dispatch({ type: 'LOGOUT' });
      
      console.log('Logout successful, redirecting to home');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still logout locally even if API call fails
      dispatch({ type: 'LOGOUT' });
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const updateUser = useCallback(async (userData) => {
    try {
      console.log('Updating user profile');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedUser = await authService.updateProfile(userData);
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      console.log('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const result = await authService.changePassword(passwordData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const hasRole = useCallback((requiredRole) => {
    if (!state.user || !state.user.roles) return false;
    return state.user.roles.includes(requiredRole);
  }, [state.user]);

  const hasAnyRole = useCallback((roles) => {
    if (!state.user || !state.user.roles) return false;
    return roles.some(role => state.user.roles.includes(role));
  }, [state.user]);

  const isRole = useCallback((role) => {
    if (!state.user || !state.user.roles) return false;
    return state.user.roles.includes(role);
  }, [state.user]);

  // Auto-logout when token expires
  useEffect(() => {
    if (state.token && !authService.isAuthenticated()) {
      console.log('Token expired, logging out user');
      logout();
    }
  }, [state.token, logout]);

  const value = {
    ...state,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    updateProfile,
    changePassword,
    clearError,
    hasRole,
    hasAnyRole,
    isRole,
    getRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
