// Mosque Details Screen - Shows mosque information and available courses
// Student can view mosque details and browse courses from this mosque
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const MosqueDetailsScreen = ({ route }) => {
  const { mosqueId } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [mosque, setMosque] = useState(null);
  const [courses, setCourses] = useState([]);

  // Load mosque details on mount
  useEffect(() => {
    loadMosqueDetails();
  }, []);

  // Fetch mosque details and courses from API
  const loadMosqueDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/public/mosques/${mosqueId}`);
      
      setMosque(response.data.data);
      setCourses(response.data.data.courses || []);
      
    } catch (error) {
      console.error('Error loading mosque details:', error);
      Alert.alert('Error', 'Failed to load mosque details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Handle call mosque
  const handleCall = () => {
    if (mosque.contact_number) {
      Linking.openURL(`tel:${mosque.contact_number}`);
    }
  };

  // Navigate to course details
  const navigateToCourse = (courseId) => {
    navigation.navigate('CourseDetails', { courseId });
  };

  // Render course card
  const renderCourse = (course) => (
    <TouchableOpacity
      key={course.id}
      style={styles.courseCard}
      onPress={() => navigateToCourse(course.id)}
      activeOpacity={0.7}
    >
      {/* Course Icon */}
      <View style={styles.courseIconContainer}>
        <MaterialCommunityIcons 
          name={course.course_type === 'memorization' ? 'book-open-variant' : 'book-open'} 
          size={32} 
          color={theme.colors.primary} 
        />
      </View>

      {/* Course Info */}
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{course.name}</Text>
        
        {/* Course Type */}
        <View style={styles.courseMetaRow}>
          <MaterialCommunityIcons name="tag" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.courseMetaText}>{course.course_type_name || course.course_type}</Text>
        </View>

        {/* Teacher */}
        {course.teacher_name && (
          <View style={styles.courseMetaRow}>
            <MaterialCommunityIcons name="account-tie" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.courseMetaText}>{course.teacher_name}</Text>
          </View>
        )}

        {/* Price & Capacity */}
        <View style={styles.courseFooter}>
          {/* Price Badge */}
          <View style={[
            styles.priceBadge,
            { backgroundColor: course.price_cents === 0 ? theme.colors.success : theme.colors.primary }
          ]}>
            <Text style={styles.priceText}>
              {course.price_cents === 0 ? 'FREE' : `₪${(course.price_cents / 100).toFixed(0)}`}
            </Text>
          </View>

          {/* Capacity */}
          {course.current_enrollment !== undefined && (
            <View style={styles.capacityInfo}>
              <MaterialCommunityIcons name="account-group" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.capacityText}>
                {course.current_enrollment}/{course.capacity || '∞'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow */}
      <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="Mosque Details">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  if (!mosque) {
    return (
      <MainLayout title="Mosque Details">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Mosque not found</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={mosque.name}>
      <ScrollView style={styles.container}>
        {/* Mosque Info Card */}
        <View style={styles.mosqueInfoCard}>
          <View style={styles.mosqueIconLarge}>
            <MaterialCommunityIcons name="mosque" size={56} color={theme.colors.primary} />
          </View>
          
          <Text style={styles.mosqueName}>{mosque.name}</Text>

          {/* Location */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {mosque.governorate}, {mosque.region}
              </Text>
            </View>
          </View>

          {/* Contact */}
          {mosque.contact_number && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>{mosque.contact_number}</Text>
              </View>
            </View>
          )}

          {/* Call Button */}
          {mosque.contact_number && (
            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="phone" size={20} color={theme.colors.white} />
              <Text style={styles.callButtonText}>Call Mosque</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Courses</Text>
            <View style={styles.coursesCountBadge}>
              <Text style={styles.coursesCountText}>{courses.length} courses</Text>
            </View>
          </View>

          {courses.length > 0 ? (
            courses.map(course => renderCourse(course))
          ) : (
            <View style={styles.noCoursesContainer}>
              <MaterialCommunityIcons name="book-open-outline" size={48} color={theme.colors.textLight} />
              <Text style={styles.noCoursesText}>No courses available at this mosque yet</Text>
            </View>
          )}
        </View>
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
  },
  mosqueInfoCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  mosqueIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  mosqueName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
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
  callButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  callButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  coursesSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  coursesCountBadge: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  coursesCountText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  courseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  courseMetaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  priceBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  priceText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.white,
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  noCoursesContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  noCoursesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});

export default MosqueDetailsScreen;