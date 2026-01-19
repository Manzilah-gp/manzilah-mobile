import apiClient from './client';



// Get all courses taught by the logged-in teacher
export const getMyCourses = () => {
    console.log('📡 Fetching teacher\'s courses...');
    return apiClient.get('/api/teacher/my-courses');
};

// Get all students enrolled in a specific course
export const getCourseStudents = (courseId) => {
    console.log('📡 Fetching students for course:', courseId);
    return apiClient.get(`/api/teacher/courses/${courseId}/students`);
};

// Get all students across all teacher's courses with optional filters
export const getAllMyStudents = (filters = {}) => {
    console.log('📡 Fetching all students with filters:', filters);
    
    const params = new URLSearchParams();
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.search) params.append('search', filters.search);
    if (filters.minProgress) params.append('minProgress', filters.minProgress);
    if (filters.maxProgress) params.append('maxProgress', filters.maxProgress);

    return apiClient.get(`/api/teacher/students?${params.toString()}`);
};

// Get students for a specific session date (for attendance)
export const getSessionStudents = (courseId, date) => {
    console.log('📡 Fetching session students:', { courseId, date });
    return apiClient.get(`/api/teacher/courses/${courseId}/session-students?date=${date}`);
};

// Bulk mark attendance for multiple students
export const bulkMarkAttendance = (attendanceRecords) => {
    console.log('📡 Marking bulk attendance:', attendanceRecords.length, 'records');
    return apiClient.post('/api/teacher/attendance/bulk', { attendanceRecords });
};

// Get course progress for memorization courses
export const getCourseProgress = (courseId) => {
    console.log('📡 Fetching course progress:', courseId);
    return apiClient.get(`/api/teacher/courses/${courseId}/progress`);
};

// Get course materials
export const getCourseMaterials = (courseId) => {
    console.log('📡 Fetching course materials:', courseId);
    return apiClient.get(`/api/teacher/courses/${courseId}/materials`);
};