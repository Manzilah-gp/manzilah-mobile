// Child Details Screen - shows complete child overview with enrollments
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
import { getChildOverview } from '../../api';
import { theme } from '../../styles/theme';

const ChildDetailsScreen = ({ route }) => {
  const { childId } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);

  // Load child overview on mount
  useEffect(() => {
    loadChildOverview();
  }, []);

  // Fetch child overview from API
  const loadChildOverview = async () => {
    try {
      setLoading(true);
      const response = await getChildOverview(childId);
      setChild(response.data);
    } catch (error) {
      console.error('Error loading child overview:', error);
      Alert.alert('Error', 'Failed to load child details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Get progress color based on percentage
  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="Child Details">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  if (!child) {
    return (
      <MainLayout title="Child Details">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Child not found</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={child.name}>
      <ScrollView style={styles.container}>
        {/* Child Info Card */}
        <View style={styles.childInfoCard}>
          <View style={styles.childAvatar}>
            <MaterialCommunityIcons name="account" size={48} color={theme.colors.white} />
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.name}</Text>
            <View style={styles.childMetaRow}>
              <MaterialCommunityIcons name="cake-variant" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.childAge}>{child.age} years old</Text>
            </View>
            {child.email && (
              <View style={styles.childMetaRow}>
                <MaterialCommunityIcons name="email" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.childEmail}>{child.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Overview</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="book-multiple" size={28} color={theme.colors.primary} />
              <Text style={styles.statValue}>{child.enrollments?.length || 0}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="chart-line" size={28} color={theme.colors.success} />
              <Text style={styles.statValue}>{Math.round(child.overall_progress || 0)}%</Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="calendar-check" size={28} color={theme.colors.warning} />
              <Text style={styles.statValue}>{Math.round(child.attendance_rate || 0)}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>

          {/* Overall Progress Bar */}
          <View style={styles.overallProgressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={[styles.progressValue, { color: getProgressColor(child.overall_progress) }]}>
                {Math.round(child.overall_progress || 0)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${child.overall_progress || 0}%`,
                    backgroundColor: getProgressColor(child.overall_progress)
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Enrollments List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Enrollments</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProgressReports', { childId })}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {child.enrollments && child.enrollments.length > 0 ? (
            child.enrollments.map((enrollment) => (
              <TouchableOpacity
                key={enrollment.enrollment_id}
                style={styles.enrollmentCard}
                onPress={() => navigation.navigate('EnrollmentDetails', { 
                  enrollmentId: enrollment.enrollment_id 
                })}
                activeOpacity={0.7}
              >
                <View style={styles.enrollmentHeader}>
                  <View style={styles.courseIconContainer}>
                    <MaterialCommunityIcons 
                      name={enrollment.course_type_name === 'memorization' ? 'book-open-variant' : 'book-open'} 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.enrollmentInfo}>
                    <Text style={styles.courseName}>{enrollment.course_name}</Text>
                    <Text style={styles.courseType}>{enrollment.course_type_name}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </View>

                {enrollment.status === 'active' && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={[styles.progressValue, { color: getProgressColor(enrollment.progress) }]}>
                        {Math.round(enrollment.progress || 0)}%
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${enrollment.progress || 0}%`,
                            backgroundColor: getProgressColor(enrollment.progress)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyEnrollments}>
              <MaterialCommunityIcons name="book-open-outline" size={48} color={theme.colors.textLight} />
              <Text style={styles.emptyEnrollmentsText}>No enrollments yet</Text>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        {child.recent_progress && child.recent_progress.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {child.recent_progress.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <MaterialCommunityIcons 
                    name={activity.type === 'progress' ? 'chart-line' : 'calendar-check'} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.course_name}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityDate}>
                    {new Date(activity.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  childInfoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  childAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  childMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  childAge: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  childEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.lightGray,
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
  overallProgressContainer: {
    marginTop: theme.spacing.md,
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
    height: 10,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  enrollmentCard: {
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  courseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 2,
  },
  courseType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  progressSection: {
    marginTop: theme.spacing.sm,
  },
  emptyEnrollments: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyEnrollmentsText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
});

export default ChildDetailsScreen;