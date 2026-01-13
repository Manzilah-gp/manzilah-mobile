// FINAL FIXED My Enrollments Screen - Matches Backend Response
// Backend returns: id, status, enrollment_date, course_id, course_name, course_type, mosque_name, completion_percentage
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const MyEnrollmentsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load enrollments on mount and when filter changes
  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Fetch enrollments from API
  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await apiClient.get('/api/enrollment/my-enrollments', { params });
      
      console.log('📚 My Enrollments API response:', response.data);
      
      const enrollmentsData = response.data.data || [];
      setEnrollments(enrollmentsData);
      
      console.log(`✅ Loaded ${enrollmentsData.length} enrollments`);
      
    } catch (error) {
      console.error('❌ Error loading enrollments:', error);
      Alert.alert('Error', 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadData();
  };

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'completed':
        return theme.colors.primary;
      case 'dropped':
        return theme.colors.error;
      default:
        return theme.colors.gray;
    }
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.textSecondary} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search courses..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(); }}>
          <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Render status filter tabs
  const renderStatusFilters = () => (
    <View style={styles.filterContainer}>
      {['all', 'active', 'completed', 'dropped'].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterTab,
            statusFilter === status && styles.filterTabActive
          ]}
          onPress={() => setStatusFilter(status)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterTabText,
            statusFilter === status && styles.filterTabTextActive
          ]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render single enrollment card
  const renderEnrollment = ({ item }) => {
    // ⭐ Backend returns: completion_percentage directly
    const progress = Math.round(item.completion_percentage || 0);
    
    return (
      <TouchableOpacity
        style={styles.enrollmentCard}
        onPress={() => navigation.navigate('EnrollmentDetails', { enrollmentId: item.id })}
        activeOpacity={0.7}
      >
        {/* Course Header */}
        <View style={styles.enrollmentHeader}>
          <View style={styles.courseIconContainer}>
            <MaterialCommunityIcons 
              name={item.course_type === 'memorization' ? 'book-open-variant' : 'book-open'} 
              size={28} 
              color={theme.colors.primary} 
            />
          </View>
          <View style={styles.enrollmentInfo}>
            <Text style={styles.courseName}>{item.course_name}</Text>
            <View style={styles.courseMetaRow}>
              <MaterialCommunityIcons name="tag" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.courseType}>{item.course_type}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Mosque Info */}
        {item.mosque_name && (
          <View style={styles.mosqueRow}>
            <MaterialCommunityIcons name="mosque" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.mosqueText}>{item.mosque_name}</Text>
          </View>
        )}

        {/* Progress Section */}
        {item.status === 'active' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={[styles.progressValue, { color: getProgressColor(progress) }]}>
                {progress}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: getProgressColor(progress)
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Course Duration */}
        {(item.course_start_date || item.course_end_date) && (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar-range" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>
                {item.course_start_date && new Date(item.course_start_date).toLocaleDateString()}
                {item.course_start_date && item.course_end_date && ' - '}
                {item.course_end_date && new Date(item.course_end_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Enrollment Date */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              Enrolled: {new Date(item.enrollment_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="book-open-outline" size={64} color={theme.colors.textLight} />
      <Text style={styles.emptyText}>
        {searchQuery ? 'No courses found' : 'No enrollments yet'}
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('BrowseCourses')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.white} />
        <Text style={styles.browseButtonText}>Browse Courses</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <MainLayout title="My Enrollments">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Enrollments">
      <View style={styles.container}>
        {renderSearchBar()}
        {renderStatusFilters()}

        <FlatList
          data={enrollments}
          renderItem={renderEnrollment}
          keyExtractor={(item, index) => `enrollment-${item.id || index}`}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  filterTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
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
  statusBadge: {
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
  mosqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  mosqueText: {
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
    marginTop: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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

export default MyEnrollmentsScreen; 