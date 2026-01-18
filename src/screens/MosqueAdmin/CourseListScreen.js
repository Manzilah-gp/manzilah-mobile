// CourseListScreen.js - FIXED VERSION
// Handles missing user session gracefully
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
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const CourseListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [mosqueId, setMosqueId] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    format: 'all',
    scheduleType: 'all',
    courseType: 'all'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, courses]);

  /**
   * ⭐ FIXED: Better user session handling
   */
  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      console.log('========================================');
      console.log('🔍 FETCHING COURSES FOR MOBILE');
      console.log('========================================');
      
      // ⭐ Check if user exists in storage (using 'userData' key to match AuthContext)
      const userStr = await AsyncStorage.getItem('userData');
      console.log('📦 Raw user string from storage:', userStr);
      
      if (!userStr) {
        console.error('❌ No user found in AsyncStorage');
        Alert.alert(
          'Session Expired',
          'Please login again to continue.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Clear any remaining auth data (match AuthContext keys)
                await AsyncStorage.multiRemove(['userData', 'authToken']);
                // Just go back - user will need to re-login
                navigation.goBack();
              }
            }
          ]
        );
        setLoading(false);
        return;
      }
      
      // ⭐ Parse user with error handling
      let user;
      try {
        user = JSON.parse(userStr);
        console.log('✅ Parsed user object:', user);
      } catch (parseError) {
        console.error('❌ Failed to parse user JSON:', parseError);
        Alert.alert(
          'Invalid Session',
          'Please login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await AsyncStorage.multiRemove(['userData', 'authToken']);
                navigation.goBack();
              }
            }
          ]
        );
        setLoading(false);
        return;
      }
      
      // ⭐ Get admin ID with multiple field checks
      const adminId = user?.id || user?.userId || user?.user_id;
      
      console.log('User ID extraction:', {
        'user.id': user?.id,
        'user.userId': user?.userId,
        'user.user_id': user?.user_id,
        'Selected adminId': adminId
      });
      
      if (!adminId) {
        console.error('❌ No ID found in user object');
        console.error('Full user object:', JSON.stringify(user, null, 2));
        Alert.alert(
          'Invalid User Data',
          'Unable to determine your admin ID. Please logout and login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await AsyncStorage.multiRemove(['userData', 'authToken']);
                navigation.goBack();
              }
            }
          ]
        );
        setLoading(false);
        return;
      }
      
      console.log('✅ Admin ID:', adminId);
      
      try {
        // ⭐ Get mosque ID for logged-in admin
        console.log('📡 Calling:', `/api/courses/mosque-admin/${adminId}`);
        const mosqueIdRes = await apiClient.get(`/api/courses/mosque-admin/${adminId}`);
        
        console.log('📥 Mosque ID Response:', mosqueIdRes.data);
        
        // ⭐ Handle different response structures
        let adminMosqueId = null;
        
        if (mosqueIdRes.data?.data?.mosqueId) {
          adminMosqueId = mosqueIdRes.data.data.mosqueId;
        } else if (mosqueIdRes.data?.mosqueId) {
          adminMosqueId = mosqueIdRes.data.mosqueId;
        } else if (mosqueIdRes.data?.data?.id) {
          adminMosqueId = mosqueIdRes.data.data.id;
        } else if (mosqueIdRes.data?.id) {
          adminMosqueId = mosqueIdRes.data.id;
        }
        
        if (!adminMosqueId) {
          console.error('❌ No mosque ID found in response');
          console.error('Response data:', JSON.stringify(mosqueIdRes.data, null, 2));
          Alert.alert(
            'No Mosque Found',
            'You are not assigned to any mosque yet. Please contact the administrator.'
          );
          setCourses([]);
          setFilteredCourses([]);
          return;
        }
        
        console.log('✅ Mosque ID:', adminMosqueId);
        setMosqueId(adminMosqueId);
        
        // ⭐ Load courses for this mosque
        console.log('📚 Fetching courses for mosque:', adminMosqueId);
        const coursesResponse = await apiClient.get(`/api/courses/mosque/${adminMosqueId}`);
        
        console.log('📥 Courses Response:', {
          status: coursesResponse.status,
          isArray: Array.isArray(coursesResponse.data),
          dataType: typeof coursesResponse.data,
          keys: Object.keys(coursesResponse.data || {})
        });
        
        // ⭐ Handle different response structures
        let coursesData = [];
        
        if (Array.isArray(coursesResponse.data)) {
          coursesData = coursesResponse.data;
        } else if (coursesResponse.data?.data && Array.isArray(coursesResponse.data.data)) {
          coursesData = coursesResponse.data.data;
        } else if (coursesResponse.data?.courses && Array.isArray(coursesResponse.data.courses)) {
          coursesData = coursesResponse.data.courses;
        }
        
        console.log('✅ Courses loaded:', coursesData.length);
        console.log('First course sample:', coursesData[0]);
        
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        
      } catch (apiError) {
        console.error('❌ API Error:', {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data
        });
        
        if (apiError.response?.status === 404) {
          Alert.alert(
            'No Mosque Found',
            'You are not assigned to any mosque. Please contact the administrator.'
          );
          setCourses([]);
          setFilteredCourses([]);
        } else if (apiError.response?.status === 401 || apiError.response?.status === 403) {
          Alert.alert(
            'Authentication Error',
            'Your session has expired. Please login again.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await AsyncStorage.multiRemove(['userData', 'authToken']);
                  navigation.goBack();
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Error',
            apiError.response?.data?.message || 'Failed to load courses. Please try again.'
          );
        }
      }
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      console.log('========================================');
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.format !== 'all') {
      filtered = filtered.filter(c => c.course_format === filters.format);
    }

    if (filters.scheduleType !== 'all') {
      filtered = filtered.filter(c => c.schedule_type === filters.scheduleType);
    }

    if (filters.courseType !== 'all') {
      filtered = filtered.filter(c => 
        c.course_type?.toLowerCase() === filters.courseType.toLowerCase()
      );
    }

    setFilteredCourses(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ format: 'all', scheduleType: 'all', courseType: 'all' });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const handleDeleteCourse = (courseId, courseName) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${courseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/courses/${courseId}`);
              Alert.alert('Success', `${courseName} has been deleted successfully`);
              fetchCourses();
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert('Error', 'Failed to delete course');
            }
          }
        }
      ]
    );
  };

  const formatPrice = (priceCents) => {
    return priceCents === 0 ? 'Free' : `₪${(priceCents / 100).toFixed(0)}`;
  };

  const getScheduleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'online':
        return 'laptop';
      case 'onsite':
        return 'home';
      case 'hybrid':
        return 'earth';
      default:
        return 'home';
    }
  };

  const getDifficultyLabel = (level) => {
    if (!level) return 'Beginner';
    if (level <= 2) return 'Beginner';
    if (level <= 4) return 'Intermediate';
    return 'Advanced';
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <MaterialCommunityIcons 
        name="magnify" 
        size={20} 
        color={theme.colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search courses..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholderTextColor={theme.colors.textSecondary}
      />
      {searchTerm.length > 0 && (
        <TouchableOpacity onPress={() => setSearchTerm('')}>
          <MaterialCommunityIcons 
            name="close-circle" 
            size={20} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
    </View>
  );

 

  const renderCourse = ({ item }) => {
    const difficultyLevel = getDifficultyLabel(item.course_level);

    return (
      <TouchableOpacity
        style={[
          styles.courseCard,
          !item.is_active && styles.courseCardInactive
        ]}
        onPress={() => navigation.navigate('AddCourse', { courseId: item.id })}
        activeOpacity={0.7}
      >
        {!item.is_active && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>Inactive</Text>
          </View>
        )}

        <View style={styles.courseHeader}>
          <View style={styles.courseHeaderLeft}>
            <Text style={styles.courseName}>{item.name}</Text>
            
            <View style={styles.badgesRow}>
              <View style={[
                styles.badge,
                { backgroundColor: item.course_format === 'short' ? '#dbeafe' : '#f3e8ff' }
              ]}>
                <Text style={[
                  styles.badgeText,
                  { color: item.course_format === 'short' ? '#1e40af' : '#7c3aed' }
                ]}>
                  {item.course_format === 'short' ? 'Short Course' : 'Long Course'}
                </Text>
              </View>

              <View style={[styles.badge, { backgroundColor: '#f3f4f6' }]}>
                <Text style={[styles.badgeText, { color: '#374151' }]}>{difficultyLevel}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.coursePrice}>{formatPrice(item.price_cents)}</Text>
        </View>

        {item.description && (
          <Text style={styles.courseDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.detailsGrid}>
          {item.duration_weeks && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{item.duration_weeks} weeks</Text>
            </View>
          )}

          {item.total_sessions && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{item.total_sessions} sessions</Text>
            </View>
          )}

          {item.max_students && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>Max {item.max_students}</Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name={getScheduleIcon(item.schedule_type)} 
              size={16} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.detailText}>{item.schedule_type || 'Onsite'}</Text>
          </View>
        </View>

        <View style={styles.courseFooter}>
          <View style={styles.enrollmentInfo}>
            <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.enrollmentText}>
              {item.enrolled_students || 0} enrolled
            </Text>
          </View>

          {item.target_age_group && (
            <Text style={styles.ageGroupText}>Ages: {item.target_age_group}</Text>
          )}

          {item.course_level && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Level {item.course_level}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteCourse(item.id, item.name);
          }}
        >
          <MaterialCommunityIcons name="delete" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (filteredCourses.length === 0 && courses.length > 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="filter-remove" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>No courses match your filters</Text>
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="book-off" size={64} color={theme.colors.textLight} />
        <Text style={styles.emptyText}>No Courses Found</Text>
        <Text style={styles.emptySubtext}>
          You haven't created any courses yet. Create your first course to get started.
        </Text>
        <TouchableOpacity
          style={styles.createFirstButton}
          onPress={() => navigation.navigate('AddCourse')}
        >
          <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
          <Text style={styles.createFirstButtonText}>Create First Course</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <MainLayout title="All Courses">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="All Courses">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Course Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage your mosque's courses and teacher assignments
          </Text>
        </View>

        {renderSearchBar()}

      

        <Text style={styles.resultsCount}>
          Showing {filteredCourses.length} of {courses.length} courses
        </Text>

        <FlatList
          data={filteredCourses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
    backgroundColor: '#f0f9ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.textSecondary,
  },
  header: {
    backgroundColor: theme.colors.white,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 6,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.error,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterPickerContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    minWidth: 140,
  },
  filterPicker: {
    height: 44,
  },
  createButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 8,
  },
  resultsCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  courseCardInactive: {
    opacity: 0.75,
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  inactiveBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.white,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  courseHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  coursePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  courseDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  enrollmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  enrollmentText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  ageGroupText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  levelBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 50,
    padding: 8,
    zIndex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  createFirstButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 8,
  },
});

export default CourseListScreen;