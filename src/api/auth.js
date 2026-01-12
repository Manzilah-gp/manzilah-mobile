// Authentication API endpoints - FINAL VERSION
// Backend routes are mounted at: app.use("/api/users", authRoutes)
import apiClient from './client';

// Login user
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/api/users/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Register new user
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/api/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Register teacher
export const registerTeacher = async (userData) => {
  try {
    const response = await apiClient.post('/api/users/register-teacher', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await apiClient.post('/api/users/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify token
export const verifyToken = async () => {
  try {
    const response = await apiClient.get('/api/users/verify');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};