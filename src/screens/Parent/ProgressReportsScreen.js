// Progress Reports Screen - shows all children's progress and enrollments
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import { getAllChildrenEnrollments, getChildrenProgressSummary, getParentChildren } from '../../api';
import { theme } from '../../styles/theme';

const ProgressReportsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedChild, setSelectedChild] = useState('all');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [selectedChild]);

  // Fetch all data from API
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [childrenResponse, enrollmentsResponse, summaryResponse] = await Promise.all([
        getParentChildren(),
        getAllChildrenEnrollments(),
        getChildrenProgressSummary()
      ]);
      
      setChildren(childrenResponse.data || []);
      
      // Filter enrollments by selected child
      const allEnrollments = enrollmentsResponse.data || [];
      if (selectedChild === 'all') {
        setEnrollments(allEnrollments);
      } else {
        setEnrollments(allEnrollments.filter(e => e.student_id === parseInt(selectedChild)));
      }
      
      setSummary(summaryResponse.data || {});
    } catch (error) {
      console.error('Error loading progress reports:', error);
      Alert.alert('Error', 'Failed to load progress reports');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get progress color based on percentage
  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  // Render summary statistics
  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="human-child" size={24} color={theme.colors.primary} />
        <Text style={styles.statValue}>{children.length}</Text>
        <Text style={styles.statLabel}>Children</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="book-multiple" size={24} color={theme.colors.success} />
        <Text style={styles.statValue}>{summary.totalCourses || 0}</Text>
        <Text style={styles.statLabel}>Total Courses</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.warning} />
        <Text style={styles.statValue}>{Math.round(summary.avgProgress || 0)}%</Text>
        <Text style={styles.statLabel}>Avg Progress</Text>
      </View>
    </View>
  );

  // Render child filter dropdown
  const renderChildFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filter by Child:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedChild}
          onValueChange={(value) => setSelectedChild(value)}
          style={styles.picker}
        >
          <Picker.Item label="All Children" value="all" />
          {children.map((child) => (
            <Picker.Item key={child.id} label={child.name} value={child.id.toString()} />
          ))}
        </Picker>
      </View>
    </View>
  );

  // Render single enrollment card
  const renderEnrollment = ({ item }) => {
    const isMemorization = item.course_type_name === 'memorization';
    
    return (
      <TouchableOpacity
        style={styles.enrollmentCard}
        onPress={() => navigation.navigate('EnrollmentDetails', { enrollmentId: item.enrollment_id })}
        activeOpacity={0.7}
      >
        {/* Student Name Tag */}
        <View style={styles.studentTag}>
          <MaterialCommunityIcons name="account" size={16} color={theme.colors.primary} />
          <Text style={styles.studentName}>{item.student_name}</Text>
        </View>

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
              <Text style={styles.courseType}>{item.course_type_name}</Text>
            </View>
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
        {item.status === 'active' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={[styles.progressValue, { color: getProgressColor(item.progress) }]}>
                {Math.round(item.progress || 0)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${item.progress || 0}%`,
                    backgroundColor: getProgressColor(item.progress)
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Memorization Details */}
        {isMemorization && item.current_page && (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Current Page:</Text>
              <Text style={styles.detailValue}>{item.current_page}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Level:</Text>
              <Text style={styles.detailValue}>{item.current_level || 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* Attendance Details */}
        {!isMemorization && item.total_attendance_records > 0 && (
          <View style={styles.attendanceRow}>
            <MaterialCommunityIcons name="calendar-check" size={16} color={theme.colors.success} />
            <Text style={styles.attendanceText}>
              Attendance: {item.present_count || 0}/{item.total_attendance_records} 
              ({Math.round((item.present_count / item.total_attendance_records) * 100)}%)
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="file-document-outline" size={64} color={theme.colors.textLight} />
      <Text style={styles.emptyText}>
        {selectedChild === 'all' 
          ? 'No enrollments found for any children'
          : 'This child has no enrollments yet'}
      </Text>
    </View>
  );

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="Progress Reports">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Progress Reports">
      <View style={styles.container}>
        {renderSummary()}
        {renderChildFilter()}

        <FlatList
          data={enrollments}
          renderItem={renderEnrollment}
          keyExtractor={(item) => `${item.enrollment_id}-${item.student_id}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
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
  filterContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  enrollmentCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  studentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  studentName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
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
    backgroundColor: theme.colors.lightGray,
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
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  attendanceText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});

export default ProgressReportsScreen;