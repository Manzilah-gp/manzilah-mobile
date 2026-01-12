// Mosque Admin Profile Component - displays mosque information and statistics
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';

const MosqueAdminProfileSection = ({ mosqueAdminData }) => {
  const navigation = useNavigation();

  // Check if mosque admin data exists
  if (!mosqueAdminData || !mosqueAdminData.mosques) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Mosque Admin Profile</Text>
        <Text style={styles.emptyText}>No mosque assigned</Text>
      </View>
    );
  }

  const { mosques = [] } = mosqueAdminData;
  const mosque = mosques[0]; // Get first mosque (admin typically manages one mosque)

  // If no mosque found
  if (!mosque) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Mosque Admin Profile</Text>
        <Text style={styles.emptyText}>No mosque assigned</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Mosque Admin Profile</Text>

      {/* Mosque Information Card */}
      <View style={styles.mosqueCard}>
        <View style={styles.mosqueHeader}>
          <MaterialCommunityIcons name="mosque" size={40} color={theme.colors.primary} />
          <View style={styles.mosqueInfo}>
            <Text style={styles.mosqueName}>{mosque.name}</Text>
            <View style={styles.mosqueLocationRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.mosqueLocation}>
                {mosque.governorate}, {mosque.region}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Mosque contact number if available */}
        {mosque.contact_number && (
          <View style={styles.mosqueContactRow}>
            <MaterialCommunityIcons name="phone" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.mosqueContact}>{mosque.contact_number}</Text>
          </View>
        )}
      </View>

      {/* Mosque Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="book-multiple" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{mosque.total_courses || 0}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>{mosque.total_students || 0}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
      </View>

      {/* Quick Action Buttons for mosque management */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyMosque')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="cog" size={20} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Manage</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CourseList')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="book-multiple" size={20} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TeachersManagement')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="account-tie" size={20} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Teachers</Text>
        </TouchableOpacity>
      </View>

      {/* Additional Management Options */}
      <View style={styles.managementSection}>
        <Text style={styles.subsectionTitle}>Management</Text>
        
        <TouchableOpacity
          style={styles.managementCard}
          onPress={() => navigation.navigate('Statistics')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chart-bar" size={32} color={theme.colors.primary} />
          <View style={styles.managementInfo}>
            <Text style={styles.managementTitle}>View Statistics</Text>
            <Text style={styles.managementDesc}>Detailed mosque analytics</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.managementCard}
          onPress={() => navigation.navigate('AddCourse')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus-circle" size={32} color={theme.colors.success} />
          <View style={styles.managementInfo}>
            <Text style={styles.managementTitle}>Add New Course</Text>
            <Text style={styles.managementDesc}>Create a new course</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.managementCard}
          onPress={() => navigation.navigate('Events')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="calendar-star" size={32} color={theme.colors.warning} />
          <View style={styles.managementInfo}>
            <Text style={styles.managementTitle}>Manage Events</Text>
            <Text style={styles.managementDesc}>Create and manage mosque events</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
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
  mosqueCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mosqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  mosqueInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  mosqueName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  mosqueLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mosqueLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  mosqueContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mosqueContact: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
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
  managementSection: {
    marginTop: theme.spacing.md,
  },
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  managementInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  managementTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  managementDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },
});

export default MosqueAdminProfileSection;