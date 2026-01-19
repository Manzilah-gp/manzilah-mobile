import apiClient from './client';

/** 
 * Parent Progress API - All methods for tracking children's progress
 * Endpoints for parents to monitor their children's course progress,
 * achievements, enrollments, and overall learning statistics
 * 
 * ⚠️ IMPORTANT: Backend route is /api/parent-progress
 * Make sure your backend has this route configured!
 */

// Get all children registered under the logged-in parent
export const getMyChildren = () => {
    console.log('📡 Fetching parent\'s children...');
    return apiClient.get('/api/parent-progress/children');
};

// Get detailed progress for a specific child's enrollment
export const getChildProgress = (enrollmentId) => {
    console.log('📡 Fetching child progress for enrollment:', enrollmentId);
    return apiClient.get(`/api/parent-progress/progress/${enrollmentId}`);
};

// Get progress history/timeline for a child's enrollment
export const getChildProgressHistory = (enrollmentId) => {
    console.log('📡 Fetching progress history for enrollment:', enrollmentId);
    return apiClient.get(`/api/parent-progress/history/${enrollmentId}`);
};

// Get all enrollments across all children
export const getAllChildrenEnrollments = () => {
    console.log('📡 Fetching all children enrollments...');
    return apiClient.get('/api/parent-progress/enrollments');
};

// Get progress summary dashboard for all children
export const getChildrenProgressSummary = () => {
    console.log('📡 Fetching children progress summary...');
    return apiClient.get('/api/parent-progress/summary');
};

// Get complete overview for a specific child
export const getChildOverview = (childId) => {
    console.log('📡 Fetching child overview for ID:', childId);
    return apiClient.get(`/api/parent-progress/children/${childId}`);
};