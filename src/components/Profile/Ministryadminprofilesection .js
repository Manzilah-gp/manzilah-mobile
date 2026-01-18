// Ministry Admin Profile Component - displays system-wide statistics and management options
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

const MinistryAdminProfileSection = ({ ministryAdminData }) => {
  const navigation = useNavigation();

  // Check if ministry admin data exists
  if (!ministryAdminData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Ministry Admin Profile</Text>
        <Text style={styles.emptyText}>No ministry admin data available</Text>
      </View>
    );
  }

  const { system_stats = {} } = ministryAdminData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Ministry Admin Profile</Text>

      {/* System-wide Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="mosque" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{system_stats.total_mosques || 0}</Text>
          <Text style={styles.statLabel}>Mosques</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="book-open" size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>{system_stats.total_courses || 0}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="school" size={24} color={theme.colors.warning} />
          <Text style={styles.statValue}>{system_stats.active_enrollments || 0}</Text>
          <Text style={styles.statLabel}>Enrollments</Text>
        </View>
      </View>

      {/* Management Section with action cards */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Management</Text>
        
      
        {/* Statistics Card */}
        <TouchableOpacity
          style={styles.managementCard}
          onPress={() => navigation.navigate('Statistics')}
          activeOpacity={0.7}
        >
          <View style={styles.managementIconContainer}>
            <MaterialCommunityIcons name="chart-bar" size={32} color={theme.colors.warning} />
          </View>
          <View style={styles.managementInfo}>
            <Text style={styles.managementTitle}>Statistics</Text>
            <Text style={styles.managementDesc}>View system statistics</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Fundraising Events Card */}
        <TouchableOpacity
          style={styles.managementCard}
          onPress={() => navigation.navigate('ApproveFundraising')}
          activeOpacity={0.7}
        >
          <View style={styles.managementIconContainer}>
            <MaterialCommunityIcons name="cash-multiple" size={32} color={theme.colors.error} />
          </View>
          <View style={styles.managementInfo}>
            <Text style={styles.managementTitle}>Fundraising Events</Text>
            <Text style={styles.managementDesc}>Approve and manage fundraising campaigns</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions Section */}
   
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
    width: '31%',
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
  managementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  managementInfo: {
    flex: 1,
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
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    marginTop: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },
});

export default MinistryAdminProfileSection;