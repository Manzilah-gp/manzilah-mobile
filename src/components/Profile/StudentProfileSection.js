// Complete Student Profile Component matching backend data exactly
// Displays enrollments, progress, attendance, and statistics
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';

const StudentProfileSection = ({ studentData }) => {
  const navigation = useNavigation();

  if (!studentData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Student Profile</Text>
        <Text style={styles.emptyText}>No student data available</Text>
      </View>
    );
  }

  const { enrollments = [], averageProgress = 0, attendanceRate = 0, activeCourses = 0 } = studentData;

  // Calculate progress color
  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  // Format course type name
  const formatCourseType = (type) => {
    return type?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Course';
  };

  // Render enrollment card
  const renderEnrollment = ({ item }) => {
    const isMemorization = item.course_type === 'memorization';
    
    return (
      <TouchableOpacity
        style={styles.enrollmentCard}
        onPress={() => navigation.navigate('CourseDetails', { enrollmentId: item.enrollment_id })}
        activeOpacity={0.7}
      >
        {/* Course Header */}
        <View style={styles.enrollmentHeader}>
          <View style={styles.courseIconContainer}>
            <MaterialCommunityIcons 
              name={isMemorization ? 'book-open-variant' : 'book-open'} 
              size={28} 
              color={theme.colors.primary} 
            />
          </View>
          <View style={styles.enrollmentInfo}>
            <Text style={styles.courseName}>{item.course_name}</Text>
            <View style={styles.courseMetaRow}>
              <MaterialCommunityIcons name="tag" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.courseType}>{formatCourseType(item.course_type)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, item.status === 'active' && styles.statusActive]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Teacher Info */}
        {item.teacher_name && (
          <View style={styles.teacherRow}>
            <MaterialCommunityIcons name="account-tie" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.teacherText}>{item.teacher_name}</Text>
          </View>
        )}

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressValue, { color: getProgressColor(item.progress) }]}>
              {Math.round(item.progress)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${item.progress}%`,
                  backgroundColor: getProgressColor(item.progress)
                }
              ]} 
            />
          </View>
        </View>

        {/* Memorization-specific details */}
        {isMemorization && item.current_level && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="trophy" size={16} color={theme.colors.warning} />
            <Text style={styles.detailText}>Level: {item.current_level}</Text>
          </View>
        )}

        {/* Page progress for memorization */}
        {isMemorization && item.current_page && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="book-open-page-variant" size={16} color={theme.colors.primary} />
            <Text style={styles.detailText}>
              Page {item.current_page} of {item.level_end_page}
            </Text>
          </View>
        )}

        {/* Attendance for non-memorization courses */}
        {!isMemorization && item.total_attendance_records > 0 && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar-check" size={16} color={theme.colors.success} />
            <Text style={styles.detailText}>
              Attendance: {item.present_count}/{item.total_attendance_records} sessions
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Enrollments</Text>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="book-multiple" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{activeCourses}</Text>
          <Text style={styles.statLabel}>Active Courses</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>{Math.round(averageProgress)}%</Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.warning} />
          <Text style={styles.statValue}>{Math.round(attendanceRate)}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
      </View>

      {/* Enrollments List */}
      {enrollments.length > 0 ? (
        <FlatList
          data={enrollments}
          renderItem={renderEnrollment}
          keyExtractor={(item) => item.enrollment_id?.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="book-open-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>No active enrollments</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('BrowseCourses')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.white} />
            <Text style={styles.browseButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: theme.spacing.md,
  },
  enrollmentCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  courseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  enrollmentInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray,
  },
  statusActive: {
    backgroundColor: theme.colors.success,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  teacherText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  progressSection: {
    marginVertical: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  browseButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  browseButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
});

export default StudentProfileSection;