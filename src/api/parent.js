// Parent API - exports parent-related functions
// Location: /src/api/parent.js
import apiClient from './client';

// Get parent's verified children
export const getParentChildren = async () => {
  try {
    const response = await apiClient.get('/api/parent/my-children');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get children progress summary
export const getChildrenProgressSummary = async () => {
  try {
    const response = await apiClient.get('/api/parent-progress/summary');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get specific child's overview
export const getChildOverview = async (childId) => {
  try {
    const response = await apiClient.get(`/api/parent-progress/children/${childId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all enrollments for all children
export const getAllChildrenEnrollments = async () => {
  try {
    const response = await apiClient.get('/api/parent-progress/enrollments');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get progress for specific enrollment
export const getChildProgress = async (enrollmentId) => {
  try {
    const response = await apiClient.get(`/api/parent-progress/progress/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get progress history for enrollment
export const getChildProgressHistory = async (enrollmentId) => {
  try {
    const response = await apiClient.get(`/api/parent-progress/history/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Request parent-child relationship
export const requestRelationship = async (childEmail) => {
  try {
    const response = await apiClient.post('/api/parent/request-relationship', { childEmail });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};