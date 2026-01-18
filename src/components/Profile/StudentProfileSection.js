import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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

  const { enrollments = [] } = studentData;

  // ==============================
  // 🔢 PROGRESS CALCULATION LOGIC
  // ==============================
  const calculateProgress = (enrollment) => {
    const courseType =
      enrollment.course_type || enrollment.course_type_name || '';
    const isMemorization = courseType.toLowerCase() === 'memorization';

    // Memorization: direct percentage
    if (isMemorization) {
      return enrollment.completion_percentage || enrollment.progress || 0;
    }

    // Non-memorization: attendance based
    const totalRecords = enrollment.total_attendance_records || 0;
    const presentCount = enrollment.present_count || 0;

    if (totalRecords > 0) {
      return (presentCount / totalRecords) * 100;
    }

    // fallback
    return enrollment.completion_percentage || enrollment.progress || 0;
  };

  // ==============================
  // 📊 STATISTICS CALCULATION
  // ==============================
  const stats = useMemo(() => {
    const activeEnrollments = enrollments.filter(
      (e) => e.status === 'active'
    );

    const activeCourses = activeEnrollments.length;

    if (activeCourses === 0) {
      return {
        activeCourses: 0,
        averageProgress: 0,
        attendanceRate: 0,
      };
    }

    let totalProgress = 0;
    let totalAttendance = 0;
    let attendanceCount = 0;

    activeEnrollments.forEach((enrollment) => {
      const courseType =
        enrollment.course_type || enrollment.course_type_name || '';
      const isMemorization = courseType.toLowerCase() === 'memorization';

      const progress = calculateProgress(enrollment);
      totalProgress += progress;

      if (
        !isMemorization &&
        enrollment.total_attendance_records > 0
      ) {
        const rate =
          (enrollment.present_count /
            enrollment.total_attendance_records) *
          100;

        totalAttendance += rate;
        attendanceCount++;
      }
    });

    return {
      activeCourses,
      averageProgress: Math.round(totalProgress / activeCourses),
      attendanceRate:
        attendanceCount > 0
          ? Math.round(totalAttendance / attendanceCount)
          : 0,
    };
  }, [enrollments]);

  // ==============================
  // 🎨 UI HELPERS
  // ==============================
  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  const formatCourseType = (type) => {
    return (
      type
        ?.split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Course'
    );
  };

  // ==============================
  // 📘 RENDER ENROLLMENT CARD
  // ==============================
  const renderEnrollment = ({ item }) => {
    const isMemorization = item.course_type === 'memorization';
    const progress = Math.round(calculateProgress(item));

    return (
      <TouchableOpacity
        style={styles.enrollmentCard}
        onPress={() =>
          navigation.navigate('CourseDetails', {
            enrollmentId: item.enrollment_id,
          })
        }
        activeOpacity={0.7}
      >
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
              <MaterialCommunityIcons
                name="tag"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.courseType}>
                {formatCourseType(item.course_type)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.status === 'active' && styles.statusActive,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {item.teacher_name && (
          <View style={styles.teacherRow}>
            <MaterialCommunityIcons
              name="account-tie"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.teacherText}>{item.teacher_name}</Text>
          </View>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text
              style={[
                styles.progressValue,
                { color: getProgressColor(progress) },
              ]}
            >
              {progress}%
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: getProgressColor(progress),
                },
              ]}
            />
          </View>
        </View>

        {isMemorization && item.current_level && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="trophy"
              size={16}
              color={theme.colors.warning}
            />
            <Text style={styles.detailText}>
              Level: {item.current_level}
            </Text>
          </View>
        )}

        {!isMemorization &&
          item.total_attendance_records > 0 && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={16}
                color={theme.colors.success}
              />
              <Text style={styles.detailText}>
                Attendance: {item.present_count}/
                {item.total_attendance_records}
              </Text>
            </View>
          )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Enrollments</Text>

      {/* 📊 Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="book-open"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={styles.statValue}>{stats.activeCourses}</Text>
          <Text style={styles.statLabel}>Active Courses</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="chart-line"
            size={32}
            color={theme.colors.success}
          />
          <Text style={styles.statValue}>
            {stats.averageProgress}%
          </Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={32}
            color={theme.colors.warning}
          />
          <Text style={styles.statValue}>
            {stats.attendanceRate}%
          </Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
      </View>

      {enrollments.length > 0 ? (
        <FlatList
          data={enrollments}
          renderItem={renderEnrollment}
          keyExtractor={(item) =>
            item.enrollment_id?.toString()
          }
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>
          No active enrollments
        </Text>
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