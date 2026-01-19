import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    RefreshControl,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMyCourses } from '../../api/Teachercourses';

// Get device dimensions for responsive design
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const MyCoursesScreen = () => {
    const navigation = useNavigation();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch data when component mounts
    useEffect(() => {
        fetchCourses();
    }, []);

    // Fetch all courses taught by the teacher
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await getMyCourses();
            console.log('📚 My courses response:', response.data);

            if (response.data.success) {
                setCourses(response.data.data);
            } else {
                Alert.alert('Error', 'Failed to load courses');
            }
        } catch (error) {
            console.error('❌ Error fetching courses:', error);
            Alert.alert('Error', 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    // Handle pull-to-refresh functionality
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCourses();
        setRefreshing(false);
    };

    // Navigate to view all students in a course
    const handleViewStudents = (courseId) => {
        navigation.navigate('CourseStudents', { courseId });
    };

    // Navigate to mark attendance for a course
    const handleMarkAttendance = (courseId) => {
        navigation.navigate('MarkAttendance', { courseId });
    };

    // Navigate to track progress for memorization courses
    const handleTrackProgress = (courseId) => {
        navigation.navigate('CourseProgress', { courseId });
    };

    // Navigate to course materials
    const handleViewMaterials = (courseId) => {
        navigation.navigate('CourseMaterials', { courseId });
    };

    // Handle joining online meeting (placeholder)
    const handleJoinMeeting = (courseId) => {
        // TODO: Implement meeting join functionality
        Alert.alert('Join Meeting', 'Meeting feature coming soon!');
    };

    // Get appropriate icon for course type
    const getCourseTypeIcon = (type) => {
        if (type === 'memorization') return 'book';
        if (type === 'tajweed') return 'musical-notes';
        if (type === 'fiqh') return 'school';
        return 'book-outline';
    };

    // Get appropriate color for course type
    const getCourseTypeColor = (type) => {
        if (type === 'memorization') return '#10b981';
        if (type === 'tajweed') return '#3b82f6';
        if (type === 'fiqh') return '#f59e0b';
        return '#6b7280';
    };

    // Format time string (remove seconds)
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.slice(0, 5);
    };

    // Render loading spinner
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading your courses...</Text>
            </View>
        );
    }

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No courses assigned yet</Text>
            <Text style={styles.emptySubtitle}>
                Courses will appear here once assigned by mosque admin
            </Text>
        </View>
    );

    // Render individual course card
    const renderCourseCard = (course) => {
        const typeColor = getCourseTypeColor(course.course_type);
        const typeIcon = getCourseTypeIcon(course.course_type);

        return (
            <View key={course.course_id} style={styles.courseCard}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.courseName}>{course.course_name}</Text>
                        {course.mosque_name && (
                            <Text style={styles.mosqueName}>{course.mosque_name}</Text>
                        )}
                    </View>
                    <View style={[styles.courseTypeBadge, { backgroundColor: typeColor }]}>
                        <Ionicons name={typeIcon} size={14} color="#fff" />
                        <Text style={styles.courseTypeText}>{course.course_type}</Text>
                    </View>
                </View>

                {/* Description */}
                {course.description && (
                    <Text style={styles.courseDescription} numberOfLines={2}>
                        {course.description}
                    </Text>
                )}

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons name="people" size={16} color="#3b82f6" />
                        <Text style={styles.statText}>
                            {course.active_students || 0}/{course.total_students || 0} Students
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="calendar" size={16} color="#3b82f6" />
                        <Text style={styles.statText}>{course.schedule_type}</Text>
                    </View>
                </View>

                {/* Schedule */}
                {course.schedule && course.schedule.length > 0 && (
                    <View style={styles.scheduleContainer}>
                        <Text style={styles.scheduleTitle}>Schedule:</Text>
                        {course.schedule.map((s, idx) => (
                            <View key={idx} style={styles.scheduleItem}>
                                <Ionicons name="time-outline" size={14} color="#6b7280" />
                                <Text style={styles.scheduleText}>
                                    {s.day_of_week}: {formatTime(s.start_time)} - {formatTime(s.end_time)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    {/* View Students Button */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => handleViewStudents(course.course_id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="people" size={18} color="#fff" />
                        <Text style={styles.primaryButtonText}>View Students</Text>
                    </TouchableOpacity>

                    {/* Track Progress OR Mark Attendance */}
                   <Text> {course.course_type === 'memorization' ? (
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => handleTrackProgress(course.course_id)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.secondaryButtonText}>📖 Track Progress</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => handleMarkAttendance(course.course_id)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.secondaryButtonText}>✓ Mark Attendance</Text>
                        </TouchableOpacity>
                    )}</Text>

                    {/* Materials Button */}
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => handleViewMaterials(course.course_id)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryButtonText}>📚 Materials</Text>
                    </TouchableOpacity>

                    {/* Join Meeting Button (if online enabled) */}
                    {course.is_online_enabled && (
                        <TouchableOpacity
                            style={styles.meetingButton}
                            onPress={() => handleJoinMeeting(course.course_id)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="videocam" size={18} color="#fff" />
                            <Text style={styles.meetingButtonText}>Join Meeting</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Page Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📚 My Courses</Text>
                <Text style={styles.headerSubtitle}>Courses you are teaching</Text>
            </View>

            {/* Courses List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
              <Text>  {courses.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <View style={styles.coursesGrid}>
                        {courses.map((course) => renderCourseCard(course))}
                    </View>
                )}</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: isSmallDevice ? 24 : 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    coursesGrid: {
        gap: 16,
    },
    courseCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    courseName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    mosqueName: {
        fontSize: 14,
        color: '#6b7280',
    },
    courseTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    courseTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'capitalize',
    },
    courseDescription: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        color: '#374151',
    },
    scheduleContainer: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    scheduleTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    scheduleText: {
        fontSize: 13,
        color: '#4b5563',
    },
    actionsContainer: {
        gap: 8,
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    secondaryButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    meetingButton: {
        flexDirection: 'row',
        backgroundColor: '#10b981',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    meetingButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});

export default MyCoursesScreen;