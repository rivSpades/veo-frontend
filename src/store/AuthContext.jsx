import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../data/api';

// Auth action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');

      if (storedUser && token) {
        try {
          // Verify token is still valid by fetching current user
          const response = await authAPI.getCurrentUser();

          if (response.success) {
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data });
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    const response = await authAPI.register(userData);

    if (response.success) {
      // If registration includes tokens, automatically log in the user
      if (response.data.access_token && response.data.refresh_token && response.data.user) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      }
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } else {
      // Don't set error in context - let the component handle it
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: response.error };
    }
  }, []);

  // Request magic link function
  const requestMagicLink = useCallback(async (email) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    const response = await authAPI.requestMagicLink(email);

    if (response.success) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } else {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: response.error.message || 'Failed to send magic link',
      });
      return { success: false, error: response.error };
    }
  }, []);

  // Verify magic link function
  const verifyMagicLink = useCallback(async (token) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    const response = await authAPI.verifyMagicLink(token);

    if (response.success) {
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      return { success: true, data: response.data };
    } else {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: response.error.message || 'Invalid or expired token',
      });
      return { success: false, error: response.error };
    }
  }, []);

  // Login function with email and password
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    const response = await authAPI.login(email, password);

    if (response.success) {
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      return { success: true, data: response.data };
    } else {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: response.error.message || 'Login failed',
      });
      return { success: false, error: response.error };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    await authAPI.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    const response = await authAPI.updateProfile(profileData);

    if (response.success) {
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      return { success: true, data: response.data };
    } else {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: response.error.message || 'Failed to update profile',
      });
      return { success: false, error: response.error };
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!state.user && !!localStorage.getItem('access_token');
  }, [state.user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return state.user?.is_staff || state.user?.is_superuser || false;
  }, [state.user]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Refresh user data from backend
  const refreshUser = useCallback(async () => {
    try {
      console.log('AuthContext: Refreshing user data...');
      const response = await authAPI.getCurrentUser();
      console.log('AuthContext: API response:', response);
      
      if (response.success) {
        console.log('AuthContext: Setting user data:', response.data);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data });
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('AuthContext: User data updated in state and localStorage');
        return { success: true, data: response.data };
      } else {
        console.log('AuthContext: Failed to get user data:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.log('AuthContext: Error refreshing user data:', error);
      return { success: false, error: { message: 'Failed to refresh user data' } };
    }
  }, []);

  const value = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    register,
    login,
    requestMagicLink,
    verifyMagicLink,
    logout,
    updateProfile,
    refreshUser,
    isAuthenticated,
    isAdmin,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
