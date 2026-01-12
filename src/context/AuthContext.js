// Authentication context for managing user state and login/logout
// Updated for backend at /api/users
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginAPI, logout as logoutAPI } from '../api/auth';
import apiClient from '../api/client';

// Create the context
const AuthContext = createContext();

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        // Get user profile
        const profileResponse = await apiClient.get('/api/users/profile');
        
        // Handle response format
        if (profileResponse.data.user) {
          setUser(profileResponse.data.user);
          // Map 'roles' to 'activeRoles' for consistency
          if (profileResponse.data.user.roles) {
            setUser({
              ...profileResponse.data.user,
              activeRoles: profileResponse.data.user.roles,
            });
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Call login API
      const response = await loginAPI(email, password);

      // Save token
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }

      // Save user data
      if (response.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        
        // Map roles to activeRoles
        const userData = {
          ...response.user,
          activeRoles: response.user.roles || [],
        };
        
        setUser(userData);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Try to call logout API (may fail if already expired)
      try {
        await logoutAPI();
      } catch (err) {
        console.log('Logout API call failed (token may be expired)');
      }
      
      // Clear local state and storage
      await clearAuth();
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local auth
      await clearAuth();
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  // Clear authentication data
  const clearAuth = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
    setUserProfile(null);
    setError(null);
  };

  // Refresh user profile
  const refreshProfile = async () => {
    try {
      const profileResponse = await apiClient.get('/api/users/profile');
      
      if (profileResponse.data.user) {
        const userData = {
          ...profileResponse.data.user,
          activeRoles: profileResponse.data.user.roles || [],
        };
        setUser(userData);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Profile refresh failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Context value
  const value = {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;