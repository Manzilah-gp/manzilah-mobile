import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    RefreshControl,
    Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getCourseStudents } from '../../api/Teachercourses';

// Get device dimensions for responsive design
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const CourseStudentsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { courseId } = route.params;

    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseType, setCourseType] = useState('');

    // Fetch data when component mounts
    useEffect(() => {
        fetchStudents();
    }, [courseId]);

    // Filter students based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(s =>
                s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phone?.includes(searchTerm)
            );
            setFilteredStudents(filtered);
        }
    }, [searchTerm, students]);

    // Fetch all students enrolled in this course
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await getCourseStudents(courseId);
            console.log('👥 Students response:', response.data);

            if (response.data.success) {
                const studentsData = response.data.data;
                setStudents(studentsData);
                setFilteredStudents(studentsData);

           
            
            } else {
                Alert.alert('Error', 'Failed to load students');
            }
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            Alert.alert('Error', 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    // Handle pull-to-refresh functionality
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStudents();
        setRefreshing(false);
    };

    // Navigate to view detailed student progress
    const handleViewProgress = (enrollmentId) => {
        navigation.navigate('StudentProgress', { enrollmentId });
    };

    // Get appropriate color for enrollment status tag
    const getStatusColor = (status) => {
        const colors = {
            active: '#10b981',
            completed: '#3b82f6',
            dropped: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    // Get appropriate color for progress percentage
    const getProgressColor = (percentage) => {
        if (percentage >= 80) return '#10b981';
        if (percentage >= 50) return '#f59e0b';
        return '#ef4444';
    };

    // Calculate progress based on course type
    const calculateProgress = (student) => {
        const isMemorization = courseType.toLowerCase() === 'memorization';

        // Memorization: use direct completion percentage
        if (isMemorization) {
            return student.completion_percentage || student.progress || 0;
        }

        // Non-memorization: calculate from attendance
        const totalRecords = student.total_attendance_records || 0;
        const presentCount = student.present_count || 0;

        if (totalRecords > 0) {
            return (presentCount / totalRecords) * 100;
        }

        // Fallback to completion percentage if available
        return student.completion_percentage || student.progress || 0;
    };

    // Calculate attendance rate percentage
    const calculateAttendanceRate = (presentCount, totalRecords) => {
        if (totalRecords === 0) return 'N/A';
        return `${Math.round((presentCount / totalRecords) * 100)}%`;
    };

    // Count how many exams the student passed (score >= 90)
    const countPassedExams = (student) => {
        const examScores = [
            student.exam_1_score,
            student.exam_2_score,
            student.exam_3_score,
            student.exam_4_score,
            student.exam_5_score
        ];
        return examScores.filter(score => score >= 90).length;
    };

    // Render loading spinner
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading students...</Text>
            </View>
        );
    }

    // Render empty state when no students
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>
                {students.length === 0 ? 'No students found' : 'No matching students'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {students.length === 0 
                    ? 'Students will appear here once enrolled'
                    : 'Try adjusting your search'
                }
            </Text>
        </View>
    );

    // Render individual student card
    const renderStudentCard = (student) => {
        // Calculate progress using proper logic based on course type
        const progressPercentage = Math.round(calculateProgress(student));
        const progressColor = getProgressColor(progressPercentage);
        const statusColor = getStatusColor(student.enrollment_status);

        return (
            <View key={student.enrollment_id} style={styles.studentCard}>
                {/* Student Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.studentAvatar}>
                        <Text style={styles.avatarText}>
                            {student.full_name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.studentHeaderInfo}>
                        <Text style={styles.studentName}>{student.full_name}</Text>
                        <View style={[styles.statusTag, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusText}>
                                {student.enrollment_status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.contactSection}>
                    <View style={styles.contactItem}>
                        <Ionicons name="mail-outline" size={16} color="#6b7280" />
                        <Text style={styles.contactText}>{student.email}</Text>
                    </View>
                    {student.phone && (
                        <View style={styles.contactItem}>
                            <Ionicons name="call-outline" size={16} color="#6b7280" />
                            <Text style={styles.contactText}>{student.phone}</Text>
                        </View>
                    )}
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={[styles.progressValue, { color: progressColor }]}>
                            {progressPercentage}%
                        </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { width: `${progressPercentage}%`, backgroundColor: progressColor }
                            ]} 
                        />
                    </View>
                </View>

                {/* Stats - Different for memorization vs other courses */}
                <View style={styles.statsGrid}>
                    {courseType === 'memorization' ? (
                        <>
                            {/* Memorization Course Stats */}
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Current Page</Text>
                                <Text style={styles.statValue}>{student.current_page || 0}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Exams Passed</Text>
                                <Text style={styles.statValue}>
                                    {countPassedExams(student)}/5
                                </Text>
                            </View>
                            <View style={[styles.statItem, styles.fullWidth]}>
                                <Text style={styles.statLabel}>Graduation Status</Text>
                                {student.is_graduated ? (
                                    <Text style={styles.graduatedText}>🎓 Graduated</Text>
                                ) : (
                                    <Text style={styles.statValue}>Not Graduated</Text>
                                )}
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Regular Course Stats */}
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Present</Text>
                                <Text style={styles.statValue}>{student.present_count || 0}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Total Sessions</Text>
                                <Text style={styles.statValue}>
                                    {student.total_attendance_records || 0}
                                </Text>
                            </View>
                            <View style={[styles.statItem, styles.fullWidth]}>
                                <Text style={styles.statLabel}>Attendance Rate</Text>
                                <Text style={styles.statValue}>
                                    {calculateAttendanceRate(
                                        student.present_count || 0,
                                        student.total_attendance_records || 0
                                    )}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewProgress(student.enrollment_id)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>👥 Course Students</Text>
                    <View style={styles.courseInfo}>
                        <Text style={styles.courseName}>{courseName}</Text>
                        <View style={styles.courseTypeBadge}>
                            <Text style={styles.courseTypeText}>{courseType}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, email, or phone..."
                        placeholderTextColor="#9ca3af"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.resultCount}>
                    {filteredStudents.length} of {students.length} students
                </Text>
            </View>

            {/* Students List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredStudents.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <View style={styles.studentsGrid}>
                        {filteredStudents.map((student) => renderStudentCard(student))}
                    </View>
                )}
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
        paddingTop: 40,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    backText: {
        fontSize: 16,
        color: '#1f2937',
        marginLeft: 8,
        fontWeight: '500',
    },
    headerInfo: {
        marginTop: 8,
    },
    headerTitle: {
        fontSize: isSmallDevice ? 22 : 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    courseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    courseName: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
    },
    courseTypeBadge: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    courseTypeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    searchSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
    },
    resultCount: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    studentsGrid: {
        gap: 16,
    },
    studentCard: {
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
        alignItems: 'center',
        marginBottom: 16,
    },
    studentAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    studentHeaderInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 6,
    },
    statusTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'capitalize',
    },
    contactSection: {
        marginBottom: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 8,
    },
    progressSection: {
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    progressValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
    },
    statItem: {
        flex: 1,
        minWidth: '45%',
    },
    fullWidth: {
        minWidth: '100%',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    graduatedText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
    },
    viewButton: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    viewButtonText: {
        fontSize: 16,
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

export default CourseStudentsScreen;