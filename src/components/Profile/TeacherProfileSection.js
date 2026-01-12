// Complete Teacher Profile Component matching backend data exactly
// Displays courses, students, certifications, expertise, and availability
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

const TeacherProfileSection = ({ teacherData }) => {
  const navigation = useNavigation();

  if (!teacherData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Teacher Profile</Text>
        <Text style={styles.emptyText}>No teacher data available</Text>
      </View>
    );
  }

  const {
    courses = [],
    current_students = 0,
    completed_courses = 0,
    certifications = {},
    expertise = [],
    availability = []
  } = teacherData;

  // Format day name
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM
  };

  // Render course card
  const renderCourse = ({ item }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseManagement', { courseId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.courseHeader}>
        <View style={styles.courseIcon}>
          <MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.white} />
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{item.name}</Text>
          <Text style={styles.courseType}>{item.course_type_name}</Text>
        </View>
        {item.is_active && (
          <View style={styles.activeBadge}>
            <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.white} />
          </View>
        )}
      </View>

      <View style={styles.courseStats}>
        <View style={styles.courseStat}>
          <MaterialCommunityIcons name="account-group" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.courseStatText}>{item.enrolled_count || 0} Students</Text>
        </View>
        <View style={styles.courseStat}>
          <MaterialCommunityIcons name="calendar-clock" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.courseStatText}>{item.total_sessions || 0} Sessions</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render expertise card
  const renderExpertise = ({ item }) => (
    <View style={styles.expertiseCard}>
      <View style={styles.expertiseHeader}>
        <MaterialCommunityIcons name="school" size={20} color={theme.colors.primary} />
        <Text style={styles.expertiseTitle}>{item.course_type}</Text>
      </View>
      {item.years_experience > 0 && (
        <View style={styles.expertiseDetail}>
          <Text style={styles.expertiseLabel}>Experience:</Text>
          <Text style={styles.expertiseValue}>{item.years_experience} years</Text>
        </View>
      )}
      {item.max_level && (
        <View style={styles.expertiseDetail}>
          <Text style={styles.expertiseLabel}>Max Level:</Text>
          <Text style={styles.expertiseValue}>{item.max_level}</Text>
        </View>
      )}
      {item.hourly_rate_cents > 0 && (
        <View style={styles.expertiseDetail}>
          <Text style={styles.expertiseLabel}>Rate:</Text>
          <Text style={styles.expertiseValue}>
            ₪{(item.hourly_rate_cents / 100).toFixed(2)}/hr
          </Text>
        </View>
      )}
    </View>
  );

  // Group availability by day
  const groupedAvailability = availability.reduce((acc, slot) => {
    const day = formatDay(slot.day_of_week);
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Teacher Profile</Text>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="book-multiple" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{courses.length}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>{current_students}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.warning} />
          <Text style={styles.statValue}>{completed_courses}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        {certifications.experience_years > 0 && (
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trophy" size={24} color={theme.colors.error} />
            <Text style={styles.statValue}>{certifications.experience_years}</Text>
            <Text style={styles.statLabel}>Years Exp</Text>
          </View>
        )}
      </View>

      {/* Certifications Section */}
      {(certifications.has_tajweed_certificate || certifications.has_sharea_certificate) && (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Certifications</Text>
          <View style={styles.certificationsContainer}>
            {certifications.has_tajweed_certificate && (
              <View style={styles.certificationBadge}>
                <MaterialCommunityIcons name="certificate" size={20} color={theme.colors.success} />
                <Text style={styles.certificationText}>Tajweed Certificate</Text>
              </View>
            )}
            {certifications.has_sharea_certificate && (
              <View style={styles.certificationBadge}>
                <MaterialCommunityIcons name="certificate" size={20} color={theme.colors.success} />
                <Text style={styles.certificationText}>Sharea Certificate</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Expertise Section */}
      {expertise.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Expertise</Text>
          <FlatList
            data={expertise}
            renderItem={renderExpertise}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.expertiseRow}
          />
        </View>
      )}

      {/* My Courses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.subsectionTitle}>My Courses</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MyCourses')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {courses.length > 0 ? (
          <FlatList
            data={courses.slice(0, 3)}
            renderItem={renderCourse}
            keyExtractor={(item) => item.id?.toString()}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No courses assigned yet</Text>
        )}
      </View>

      {/* Availability Section */}
      {availability.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Availability</Text>
          {Object.entries(groupedAvailability).map(([day, slots]) => (
            <View key={day} style={styles.availabilityDay}>
              <Text style={styles.dayName}>{day}</Text>
              {slots.map((slot, index) => (
                <View key={index} style={styles.timeSlot}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.timeText}>
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyCourses')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="book-open" size={20} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Manage Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TeacherStudents')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="account-group" size={20} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>View Students</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  subsectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  certificationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
  },
  expertiseRow: {
    justifyContent: 'space-between',
  },
  expertiseCard: {
    width: '48%',
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  expertiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  expertiseTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  expertiseDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  expertiseLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  expertiseValue: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    fontWeight: '600',
  },
  courseCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  courseInfo: {
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
  },
  activeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseStatText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  availabilityDay: {
    marginBottom: theme.spacing.md,
  },
  dayName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  timeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});

export default TeacherProfileSection;