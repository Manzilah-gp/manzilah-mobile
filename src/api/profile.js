// Complete Profile API matching your backend endpoints
// No donor endpoints included as per requirements
// src/api/profile.js
import apiClient from './client';

// Get complete user profile with role-specific data
// Returns: { success, user, roleSpecificData }
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/api/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user basic information (name, email, phone, dob, gender)
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/api/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user location (governorate, region, address, postal code)
export const updateUserLocation = async (locationData) => {
  try {
    const response = await apiClient.put('/api/profile/location', locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== STUDENT ENDPOINTS ====================

// Get student enrollments with progress
export const getStudentEnrollments = async () => {
  try {
    const response = await apiClient.get('/api/student/enrollments');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get student progress for specific enrollment
export const getStudentProgress = async (enrollmentId) => {
  try {
    const response = await apiClient.get(`/api/progress/enrollment/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== TEACHER ENDPOINTS ====================

// Get teacher courses
export const getTeacherCourses = async () => {
  try {
    const response = await apiClient.get('/api/teacher/my-courses');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get teacher students
export const getTeacherStudents = async () => {
  try {
    const response = await apiClient.get('/api/teacher/students');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== PARENT ENDPOINTS ====================

// Get parent children with their progress
export const getParentChildren = async () => {
  try {
    const response = await apiClient.get('/api/parent/children');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get specific child progress details
export const getChildProgress = async (childId) => {
  try {
    const response = await apiClient.get(`/api/progress/student/${childId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Link a child to parent account
export const linkChild = async (childData) => {
  try {
    const response = await apiClient.post('/api/parent/link-child', childData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== MOSQUE ADMIN ENDPOINTS ====================

// Get mosque admin dashboard data
export const getMosqueAdminData = async () => {
  try {
    const response = await apiClient.get('/api/mosque-admin/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mosque statistics
export const getMosqueStatistics = async (mosqueId) => {
  try {
    const response = await apiClient.get(`/api/statistics/mosque/${mosqueId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== MINISTRY ADMIN ENDPOINTS ====================

// Get ministry admin system-wide statistics
export const getMinistryAdminData = async () => {
  try {
    const response = await apiClient.get('/api/statistics/ministry');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all mosques (for ministry admin)
export const getAllMosques = async () => {
  try {
    const response = await apiClient.get('/api/mosques');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== EXPORT ALL FUNCTIONS ====================

export default {
  // Profile
  getUserProfile,
  updateUserProfile,
  updateUserLocation,
  
  // Student
  getStudentEnrollments,
  getStudentProgress,
  
  // Teacher
  getTeacherCourses,
  getTeacherStudents,
  
  // Parent
  getParentChildren,
  getChildProgress,
  linkChild,
  
  // Mosque Admin
  getMosqueAdminData,
  getMosqueStatistics,
  
  // Ministry Admin
  getMinistryAdminData,
  getAllMosques,
};