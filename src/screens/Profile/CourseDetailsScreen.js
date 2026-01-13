// FINAL FIXED Course Details - Matches Backend Field Names Exactly
// Backend uses: max_students, enrolled_count (not capacity, current_enrollment)
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
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const CourseDetailsScreen = ({ route }) => {
  const { courseId } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  useEffect(() => {
    loadCourseDetails();
    checkEligibility();
  }, []);

  // Fetch course details
  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/public/courses/${courseId}`);
      
      console.log('📚 Full API response:', response.data);
      
      const courseData = response.data.data;
      setCourse(courseData);
      
      // ⭐ Log the actual field names backend returns
      console.log('✅ Course loaded with fields:', {
        name: courseData.name,
        max_students: courseData.max_students,        // ← Backend uses this
        enrolled_count: courseData.enrolled_count,    // ← Backend uses this
        capacity: courseData.capacity,                // ← Check if exists
        current_enrollment: courseData.current_enrollment, // ← Check if exists
        price_cents: courseData.price_cents
      });
      
    } catch (error) {
      console.error('❌ Error loading course:', error);
      Alert.alert('Error', 'Failed to load course details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Check eligibility
  const checkEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const response = await apiClient.post('/api/enrollment/check-eligibility', {
        courseId: courseId
      });
      
      console.log('✅ Eligibility:', response.data);
      setEligibility(response.data.data || response.data);
      
    } catch (error) {
      console.error('❌ Eligibility error:', error);
      setEligibility({ eligible: true, success: true });
    } finally {
      setCheckingEligibility(false);
    }
  };

  // Handle enrollment
  const handleEnroll = async () => {
    // ⭐ Use correct field names from backend
    const capacity = course.max_students;           // Backend field name
    const currentEnrollment = course.enrolled_count || 0;  // Backend field name
    
    console.log('🔍 Checking capacity:', {
      max_students: capacity,
      enrolled_count: currentEnrollment,
      isFull: capacity && currentEnrollment >= capacity
    });
    
    if (capacity && currentEnrollment >= capacity) {
      Alert.alert('Course Full', 'This course has reached maximum capacity');
      return;
    }

    if (eligibility && eligibility.eligible === false) {
      Alert.alert('Cannot Enroll', eligibility.message || 'Cannot enroll in this course');
      return;
    }

    Alert.alert(
      'Confirm Enrollment',
      `Do you want to enroll in "${course.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enroll', onPress: () => processEnrollment() }
      ]
    );
  };

  // Process enrollment
  const processEnrollment = async () => {
    try {
      setEnrolling(true);

      if (course.price_cents === 0) {
        // FREE COURSE
        console.log('💚 Enrolling in FREE course');
        
        const response = await apiClient.post('/api/enrollment/enroll-free', {
          courseId: courseId
        });

        console.log('✅ Enrolled:', response.data);

        Alert.alert(
          'Success! 🎉',
          'You have been enrolled in this course',
          [
            {
              text: 'View My Enrollments',
              onPress: () => navigation.navigate('MyEnrollments')
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
        
      } else {
        // PAID COURSE - Stripe
        console.log('💳 Creating Stripe session');
        
        const response = await apiClient.post('/api/enrollment/enroll-paid', {
          courseId: courseId
        });

        console.log('✅ Stripe response:', response.data);

        // Extract URL and sessionId
        const stripeUrl = response.data.data?.url || response.data.url;
        const sessionId = response.data.data?.sessionId || response.data.sessionId;

        console.log('🔗 Stripe URL:', stripeUrl);
        console.log('🆔 Session ID:', sessionId);

        if (!stripeUrl) {
          throw new Error('No payment URL received');
        }

        // Navigate to Payment screen
        navigation.navigate('Payment', {
          sessionUrl: stripeUrl,
          sessionId: sessionId,
          courseId: courseId,
          courseName: course.name
        });
      }
    } catch (error) {
      console.error('❌ Enrollment error:', error);
      console.error('Error response:', error.response?.data);
      
      Alert.alert(
        'Enrollment Failed',
        error.response?.data?.message || error.message || 'Failed to enroll'
      );
    } finally {
      setEnrolling(false);
    }
  };

  // Get button state
  const getEnrollmentButton = () => {
    if (enrolling) {
      return {
        text: 'Processing...',
        disabled: true,
        style: styles.enrollButtonDisabled,
        showIcon: false
      };
    }

    if (checkingEligibility) {
      return {
        text: 'Checking...',
        disabled: true,
        style: styles.enrollButtonDisabled,
        showIcon: false
      };
    }

    // ⭐ Use correct field names
    const capacity = course.max_students;
    const currentEnrollment = course.enrolled_count || 0;
    const isFull = capacity && currentEnrollment >= capacity;
    
    if (isFull) {
      return {
        text: 'Course Full',
        disabled: true,
        style: styles.enrollButtonDisabled,
        showIcon: false
      };
    }

    if (eligibility && eligibility.eligible === false) {
      return {
        text: eligibility.message || 'Cannot Enroll',
        disabled: true,
        style: styles.enrollButtonDisabled,
        showIcon: false
      };
    }

    if (course.price_cents === 0) {
      return {
        text: 'Enroll for FREE',
        disabled: false,
        style: styles.enrollButtonFree,
        showIcon: true,
        icon: 'check-circle'
      };
    }

    return {
      text: `Enroll - ₪${(course.price_cents / 100).toFixed(0)}`,
      disabled: false,
      style: styles.enrollButtonPaid,
      showIcon: true,
      icon: 'cash'
    };
  };

  if (loading) {
    return (
      <MainLayout title="Course Details">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout title="Course Details">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Course not found</Text>
        </View>
      </MainLayout>
    );
  }

  const enrollButton = getEnrollmentButton();
  
  // ⭐ Use correct field names for display
  const capacity = course.max_students;
  const currentEnrollment = course.enrolled_count || 0;
  const capacityText = capacity ? `${currentEnrollment}/${capacity}` : `${currentEnrollment}/∞`;
  const isFull = capacity && currentEnrollment >= capacity;

  return (
    <MainLayout title={course.name}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.courseIconLarge}>
            <MaterialCommunityIcons 
              name={course.course_type === 'memorization' ? 'book-open-variant' : 'book-open'} 
              size={48} 
              color={theme.colors.primary} 
            />
          </View>
          
          <Text style={styles.courseName}>{course.name}</Text>

          <View style={[
            styles.priceBadgeLarge,
            { backgroundColor: course.price_cents === 0 ? theme.colors.success : theme.colors.primary }
          ]}>
            <Text style={styles.priceLargeText}>
              {course.price_cents === 0 ? 'FREE COURSE' : `₪${(course.price_cents / 100).toFixed(0)}`}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Course Information</Text>

          {/* Mosque */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="mosque" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mosque</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MosqueDetails', { mosqueId: course.mosque_id })}>
                <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
                  {course.mosque_name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Type */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="tag" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Course Type</Text>
              <Text style={styles.infoValue}>{course.course_type || 'General Course'}</Text>
            </View>
          </View>

          {/* Teacher */}
          {course.teacher_name && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-tie" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teacher</Text>
                <Text style={styles.infoValue}>{course.teacher_name}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{course.governorate}</Text>
            </View>
          </View>

          {/* Duration */}
          {(course.start_date || course.end_date) && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-range" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>
                  {course.start_date && new Date(course.start_date).toLocaleDateString()}
                  {course.start_date && course.end_date && ' - '}
                  {course.end_date && new Date(course.end_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {/* Capacity - FIXED with correct field names */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-group" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Enrollment</Text>
              <Text style={[styles.infoValue, isFull && { color: theme.colors.error }]}>
                {capacityText} students {isFull && '(Full)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {course.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Course</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>
        )}

        {/* Schedule */}
        {course.schedule && course.schedule.length > 0 && (
          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>Class Schedule</Text>
            {course.schedule.map((item, index) => (
              <View key={index} style={styles.scheduleItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleDay}>{item.day_of_week}</Text>
                  <Text style={styles.scheduleTime}>
                    {item.start_time} - {item.end_time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Warning */}
        {eligibility && eligibility.eligible === false && eligibility.message && (
          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="alert-circle" size={24} color={theme.colors.warning} />
            <Text style={styles.warningText}>{eligibility.message}</Text>
          </View>
        )}

        {/* Enroll Button */}
        <TouchableOpacity
          style={[styles.enrollButton, enrollButton.style]}
          onPress={handleEnroll}
          disabled={enrollButton.disabled}
          activeOpacity={0.7}
        >
          {enrolling ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              {enrollButton.showIcon && (
                <MaterialCommunityIcons 
                  name={enrollButton.icon} 
                  size={20} 
                  color={theme.colors.white} 
                />
              )}
              <Text style={styles.enrollButtonText}>{enrollButton.text}</Text>
            </>
          )}
        </TouchableOpacity>

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
  headerCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  courseIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  courseName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  priceBadgeLarge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  priceLargeText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
  },
  infoSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  descriptionSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  scheduleSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF4E5',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  enrollButton: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollButtonFree: {
    backgroundColor: theme.colors.success,
  },
  enrollButtonPaid: {
    backgroundColor: theme.colors.primary,
  },
  enrollButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
  enrollButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
});

export default CourseDetailsScreen;