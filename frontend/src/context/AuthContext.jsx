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
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && refreshToken) {
          dispatch({ type: 'AUTH_START' });
          const userData = await authService.getCurrentUser();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: userData, token, refreshToken },
          });
        }
      } catch (error) {
        // Token might be expired, try to refresh
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const newToken = await authService.refreshToken();
            if (newToken) {
              const userData = await authService.getCurrentUser();
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: { 
                  user: userData, 
                  token: newToken, 
                  refreshToken 
                },
              });
            }
          }
        } catch (refreshError) {
          // Both tokens are invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Role-based redirect logic
  const getRedirectPath = useCallback((user, intendedPath) => {
    if (!user || !user.role) {
      return '/dashboard';
    }
    
    const role = user.role.toLowerCase();
    
    // If user has specific role, redirect to role-specific dashboard
    if (role === 'organizer') {
      return '/organizer';
    } else if (role === 'judge') {
      return '/judge';
    } else if (role === 'participant') {
      return '/participant';
    }
    
    // Default dashboard
    return '/dashboard';
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { user, token, refreshToken } = await authService.login(credentials);
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(user, location.state?.from?.pathname);
      navigate(redirectPath, { replace: true });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await authService.loginWithGoogle(googleToken);
      if (result?.requiresRegistration) {
        dispatch({ type: 'SET_LOADING', payload: false });
        // Navigate to Google registration form with prefill and carry idToken
        navigate('/register/google', { replace: true, state: { prefill: result.prefill, idToken: result.idToken } });
        return { success: true, requiresRegistration: true };
      }

      const { user, token, refreshToken } = result;
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(user, location.state?.from?.pathname);
      navigate(redirectPath, { replace: true });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  // Start Google Sign-In using Google Identity Services, available from any screen
  const startGoogleSignIn = useCallback(async () => {
    return new Promise((resolve, reject) => {
      const onScriptLoad = () => {
        if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          reject(new Error('Google Sign-In not configured'));
          return;
        }
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: async (response) => {
              try {
                const result = await loginWithGoogle(response.credential);
                resolve(result);
              } catch (err) {
                reject(err);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Still allow popup-based flow via `google.accounts.id.prompt` callback later
            }
          });
        } catch (e) {
          reject(e);
        }
      };

      // Load script once
      if (!document.getElementById('google-gsi-script')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = onScriptLoad;
        script.onerror = () => reject(new Error('Failed to load Google script'));
        document.head.appendChild(script);
      } else {
        onScriptLoad();
      }
    });
  }, [loginWithGoogle]);

  const completeGoogleRegistration = async ({ idToken, name, dateOfBirth, role }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user, token, refreshToken } = await authService.completeGoogleRegistration({ idToken, name, dateOfBirth, role });
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token, refreshToken } });
      const redirectPath = getRedirectPath(user, '/dashboard');
      navigate(redirectPath, { replace: true });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { user, token, refreshToken } = await authService.register(userData);
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(user, '/dashboard');
      navigate(redirectPath, { replace: true });
      
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const logout = useCallback(async () => {
    try {
      // Clear tokens immediately to prevent refresh loops
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      dispatch({ type: 'LOGOUT' });
      
      // Try to call logout API, but don't wait for it
      try {
        await authService.logout();
      } catch (error) {
        // Continue with local logout
      }
      
      navigate('/', { replace: true });
    } catch (error) {
      // Still logout locally even if everything fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const updateUser = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedUser = await authService.updateProfile(userData);
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return { success: true };
    } catch (error) {
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
    if (!state.user || !state.user.role) return false;
    return state.user.role.toLowerCase() === requiredRole.toLowerCase();
  }, [state.user]);

  const hasAnyRole = useCallback((roles) => {
    if (!state.user || !state.user.role) return false;
    return roles.some(role => state.user.role.toLowerCase() === role.toLowerCase());
  }, [state.user]);

  const isRole = useCallback((role) => {
    if (!state.user || !state.user.roles) return false;
    return state.user.roles.includes(role);
  }, [state.user]);

  // Auto-logout when token expires
  useEffect(() => {
    if (state.token && !authService.isAuthenticated()) {
      logout();
    }
  }, [state.token, logout]);

  const value = {
    ...state,
    login,
    loginWithGoogle,
    completeGoogleRegistration,
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
    startGoogleSignIn,
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
