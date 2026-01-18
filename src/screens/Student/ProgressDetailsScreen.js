// COMPLETELY FIXED Progress Details Screen
// Uses correct nested attendance structure: progress.attendance.completionPercentage
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const ProgressDetailsScreen = ({ route }) => {
  const { enrollmentId } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [progressRes, historyRes] = await Promise.all([
        apiClient.get(`/api/student-progress/my-progress/${enrollmentId}`),
        apiClient.get(`/api/student-progress/my-progress-history/${enrollmentId}`)
      ]);
      
      console.log('📊 Progress data:', progressRes.data);
      console.log('📜 History data:', historyRes.data);
      
      setProgress(progressRes.data.data);
      setHistory(historyRes.data.data || []);
      
    } catch (error) {
      console.error('Error loading progress:', error);
      Alert.alert('Error', 'Failed to load progress details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return theme.colors.success;
    if (percentage >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  // ⭐ FIXED: Calculate progress using correct nested structure
  const calculateProgress = () => {
    if (!progress) return 0;
    
    const isMemorization = progress.course_type === 'memorization' || progress.course_type_name === 'memorization';
    
    // For memorization courses: use completion_percentage
    if (isMemorization) {
      return Math.round(progress.completion_percentage || 0);
    }
    
    // ⭐ FIXED: For non-memorization, use nested attendance.completionPercentage
    if (progress.attendance && progress.attendance.completionPercentage !== undefined) {
      return Math.round(progress.attendance.completionPercentage);
    }
    
    // Fallback: calculate from attendance counts
    if (progress.total_attendance && progress.total_attendance > 0) {
      const rate = (progress.present_count || 0) / progress.total_attendance;
      return Math.round(rate * 100);
    }
    
    // Default
    return Math.round(progress.completion_percentage || 0);
  };

  const renderOverview = () => {
    if (!progress) return null;

    const progressPercent = calculateProgress();
    const progressColor = getProgressColor(progressPercent);

    return (
      <View style={styles.overviewCard}>
        <Text style={styles.cardTitle}>Progress Overview</Text>
        
        {/* Circular Progress */}
        <View style={styles.circularProgressContainer}>
          <View style={[styles.circularProgress, { borderColor: progressColor }]}>
            <Text style={[styles.progressPercentage, { color: progressColor }]}>
              {progressPercent}%
            </Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Attendance */}
          {progress.total_attendance !== undefined ? (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{progress.present_count || 0}/{progress.total_attendance || 0}</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          ) : null}

          {/* Current Page (for memorization) */}
          {progress.current_page ? (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="book-open-page-variant" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>Page {progress.current_page}</Text>
              <Text style={styles.statLabel}>Current</Text>
            </View>
          ) : null}

          {/* Pages Completed (for memorization) */}
          {progress.pages_memorized !== undefined ? (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color={theme.colors.success} />
              <Text style={styles.statValue}>{progress.pages_memorized}</Text>
              <Text style={styles.statLabel}>Pages Done</Text>
            </View>
          ) : null}

          {/* Course Grade */}
          {progress.grade ? (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={24} color={theme.colors.warning} />
              <Text style={styles.statValue}>{progress.grade}</Text>
              <Text style={styles.statLabel}>Grade</Text>
            </View>
          ) : null}
        </View>

        {/* Course Info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{progress.course_name}</Text>
          <Text style={styles.courseType}>{progress.course_type_name || progress.course_type}</Text>
          {progress.teacher_name ? (
            <View style={styles.teacherRow}>
              <MaterialCommunityIcons name="account-tie" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.teacherText}>{progress.teacher_name}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const renderHistory = () => {
    if (history.length === 0) {
      return (
        <View style={styles.emptyHistory}>
          <MaterialCommunityIcons name="history" size={48} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>No progress history yet</Text>
        </View>
      );
    }

    return (
      <View style={styles.historyCard}>
        <Text style={styles.cardTitle}>Progress History</Text>
        
        {history.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.timelineDot} />
            {index < history.length - 1 ? <View style={styles.timelineLine} /> : null}
            
            <View style={styles.historyContent}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>
                  {item.update_type === 'progress_update' ? '📈 Progress Updated' : null}
                  {item.update_type === 'attendance' ? '✅ Attended Class' : null}
                  {item.update_type === 'grade_update' ? '⭐ Grade Updated' : null}
                  {item.update_type === 'page_completed' ? '📖 Page Completed' : null}
                  {!item.update_type ? '📝 Update' : null}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(item.created_at || item.update_date).toLocaleDateString()}
                </Text>
              </View>
              
              {item.notes ? (
                <Text style={styles.historyNotes}>{item.notes}</Text>
              ) : null}
              
              {item.completion_percentage !== undefined ? (
                <View style={styles.historyProgress}>
                  <View style={styles.historyProgressBar}>
                    <View 
                      style={[
                        styles.historyProgressFill,
                        { 
                          width: `${item.completion_percentage}%`,
                          backgroundColor: getProgressColor(item.completion_percentage)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.historyProgressText}>
                    {Math.round(item.completion_percentage)}%
                  </Text>
                </View>
              ) : null}

              {item.updated_by_name ? (
                <Text style={styles.updatedBy}>
                  Updated by: {item.updated_by_name}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <MainLayout title="Progress Details">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Progress Details">
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderOverview()}
        {renderHistory()}
        
        <View style={{ height: theme.spacing.xl }} />
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
  overviewCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  circularProgress: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    width: '48%',
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  courseInfo: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  courseName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  courseType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: theme.spacing.xs,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  historyCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    bottom: -theme.spacing.lg,
    width: 1,
    backgroundColor: theme.colors.border,
  },
  historyContent: {
    flex: 1,
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  historyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
  historyDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  historyNotes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    lineHeight: 20,
  },
  historyProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  historyProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.white,
    borderRadius: 3,
    marginRight: theme.spacing.sm,
  },
  historyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  historyProgressText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.text,
    width: 40,
    textAlign: 'right',
  },
  updatedBy: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  emptyHistory: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

export default ProgressDetailsScreen;