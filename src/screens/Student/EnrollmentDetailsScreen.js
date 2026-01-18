// EnrollmentDetailsScreen.js - FINAL FIXED VERSION
// Correctly displays progress matching backend data
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import { getEnrollmentDetails, withdrawFromCourse } from '../../api';
import { theme } from '../../styles/theme';

const EnrollmentDetailsScreen = ({ route }) => {
  const { enrollmentId } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    loadEnrollmentDetails();
  }, []);

  const loadEnrollmentDetails = async () => {
    try {
      setLoading(true);
      const response = await getEnrollmentDetails(enrollmentId);
      console.log('📋 Enrollment details:', response.data);
      setEnrollment(response.data);
    } catch (error) {
      console.error('Error loading enrollment details:', error);
      Alert.alert('Error', 'Failed to load enrollment details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgress = () => {
    navigation.navigate('ProgressDetails', { enrollmentId: enrollmentId });
  };

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw from Course',
      'Are you sure you want to withdraw from this course? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawFromCourse(enrollmentId);
              Alert.alert('Success', 'Successfully withdrawn from course');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to withdraw from course');
            }
          }
        }
      ]
    );
  };

  // ⭐ UNIFIED PROGRESS CALCULATION - Matches backend exactly
  const calculateProgress = (enrollment) => {
    if (!enrollment) return 0;
    
    const courseType = (enrollment.course_type_name || enrollment.course_type || '').toLowerCase();
    const isMemorization = courseType === 'memorization';
    
    if (isMemorization) {
      // For memorization: use completion_percentage (already 0-100)
      return Math.round(enrollment.completion_percentage || 0);
    }
    
    // For non-memorization: calculate from attendance
    const totalRecords = enrollment.total_attendance_records || 0;
    const presentCount = enrollment.present_count || 0;
    
    if (totalRecords > 0) {
      return Math.round((presentCount / totalRecords) * 100);
    }
    
    // Fallback to completion_percentage
    return Math.round(enrollment.completion_percentage || 0);
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  if (loading) {
    return (
      <MainLayout title="Enrollment Details">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  if (!enrollment) {
    return (
      <MainLayout title="Enrollment Details">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Enrollment not found</Text>
        </View>
      </MainLayout>
    );
  }

  const courseType = (enrollment.course_type_name || enrollment.course_type || '').toLowerCase();
  const isMemorization = courseType === 'memorization';
  const progress = calculateProgress(enrollment);
  const progressColor = getProgressColor(progress);

  return (
    <MainLayout title="Enrollment Details">
      <ScrollView style={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.courseIconContainer}>
            <MaterialCommunityIcons 
              name={isMemorization ? 'book-open-variant' : 'book-open'} 
              size={40} 
              color={theme.colors.primary} 
            />
          </View>
          <View style={styles.courseHeaderInfo}>
            <Text style={styles.courseName}>{enrollment.course_name}</Text>
            <View style={styles.courseMetaRow}>
              <MaterialCommunityIcons name="tag" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.courseType}>{enrollment.course_type_name || enrollment.course_type}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: enrollment.status === 'active' ? theme.colors.success : theme.colors.gray }]}>
              <Text style={styles.statusText}>{enrollment.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Information</Text>
          
          {enrollment.mosque_name ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="mosque" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mosque</Text>
                <Text style={styles.infoValue}>{enrollment.mosque_name}</Text>
              </View>
            </View>
          ) : null}

          {enrollment.teacher_name ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-tie" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teacher</Text>
                <Text style={styles.infoValue}>{enrollment.teacher_name}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Enrolled On</Text>
              <Text style={styles.infoValue}>
                {new Date(enrollment.enrollment_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {enrollment.status === 'active' ? (
          <View style={styles.section}>
            <View style={styles.progressSectionHeader}>
              <Text style={styles.sectionTitle}>Progress Overview</Text>
              
              <TouchableOpacity
                style={styles.viewProgressButton}
                onPress={handleViewProgress}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="chart-line" size={18} color={theme.colors.primary} />
                <Text style={styles.viewProgressText}>View Details</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={[styles.progressValue, { color: progressColor }]}>
                  {progress}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: progressColor
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
              <Text style={styles.infoBoxText}>
                Tap "View Details" for complete progress tracking with attendance, history timeline, and detailed analytics.
              </Text>
            </View>

            {/* MEMORIZATION DETAILS */}
            {isMemorization && enrollment.current_page ? (
              <View style={styles.memorizationDetails}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Current Page</Text>
                  <Text style={styles.detailValue}>{enrollment.current_page || 'N/A'}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Level</Text>
                  <Text style={styles.detailValue}>{enrollment.current_level || 'N/A'}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Page Range</Text>
                  <Text style={styles.detailValue}>
                    {enrollment.level_start_page || 'N/A'} - {enrollment.level_end_page || 'N/A'}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* ATTENDANCE DETAILS FOR NON-MEMORIZATION */}
            {!isMemorization && enrollment.total_attendance_records > 0 ? (
              <View style={styles.attendanceDetails}>
                <View style={styles.attendanceCard}>
                  <MaterialCommunityIcons name="check-circle" size={32} color={theme.colors.success} />
                  <Text style={styles.attendanceValue}>{enrollment.present_count || 0}</Text>
                  <Text style={styles.attendanceLabel}>Present</Text>
                </View>
                <View style={styles.attendanceCard}>
                  <MaterialCommunityIcons name="calendar-clock" size={32} color={theme.colors.primary} />
                  <Text style={styles.attendanceValue}>{enrollment.total_attendance_records || 0}</Text>
                  <Text style={styles.attendanceLabel}>Total Sessions</Text>
                </View>
                <View style={styles.attendanceCard}>
                  <MaterialCommunityIcons name="percent" size={32} color={theme.colors.warning} />
                  <Text style={styles.attendanceValue}>
                    {progress}%
                  </Text>
                  <Text style={styles.attendanceLabel}>Attendance Rate</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {enrollment.schedule && enrollment.schedule.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            {enrollment.schedule.map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleDay}>{schedule.day_of_week}</Text>
                  <Text style={styles.scheduleTime}>
                    {schedule.start_time} - {schedule.end_time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {enrollment.status === 'active' ? (
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={handleWithdraw}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="exit-to-app" size={20} color={theme.colors.white} />
            <Text style={styles.withdrawButtonText}>Withdraw from Course</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  courseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  courseHeaderInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  courseType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  progressSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  viewProgressText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoBoxText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  memorizationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCard: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  attendanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendanceCard: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  attendanceValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginVertical: 4,
  },
  attendanceLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  scheduleContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  scheduleDay: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  scheduleTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  withdrawButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.error,
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
});

export default EnrollmentDetailsScreen;