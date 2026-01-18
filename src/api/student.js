// Student API - exports student-related functions
// Location: /src/api/student.js
import apiClient from './client';

// Get student's enrollments with optional filters
export const getMyEnrollments = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/enrollment/my-enrollments', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get detailed enrollment information
export const getEnrollmentDetails = async (enrollmentId) => {
  try {
    // ⭐ FIXED: Removed backtick, added parentheses
    const response = await apiClient.get(`/api/enrollment/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get student statistics (active courses, avg progress, attendance)
export const getStudentStats = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/student/stats', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Withdraw from a course
export const withdrawFromCourse = async (enrollmentId) => {
  try {
    // ⭐ FIXED: Removed backtick, added parentheses
    const response = await apiClient.post(`/api/student/enrollments/${enrollmentId}/withdraw`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};