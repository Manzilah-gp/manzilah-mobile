// Admin profile section for both mosque and ministry admins
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

const AdminProfileSection = ({ type, mosque = {}, statistics = {} }) => {
  const navigation = useNavigation();
  const isMosqueAdmin = type === 'mosque';
  const isMinistryAdmin = type === 'ministry';

  // Render mosque admin view
  if (isMosqueAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Mosque Administration</Text>

        {/* Mosque Info Card */}
        {mosque.mosque_name && (
          <View style={styles.mosqueCard}>
            <View style={styles.mosqueHeader}>
              <MaterialCommunityIcons 
                name="mosque" 
                size={32} 
                color={theme.colors.primary} 
              />
              <Text style={styles.mosqueName}>{mosque.mosque_name}</Text>
            </View>
            {mosque.location && (
              <View style={styles.mosqueDetail}>
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={16} 
                  color={theme.colors.textSecondary} 
                />
                <Text style={styles.mosqueDetailText}>{mosque.location}</Text>
              </View>
            )}
          </View>
        )}

        {/* Statistics Grid */}
        <Text style={styles.subTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons 
              name="book-open-variant" 
              size={32} 
              color={theme.colors.primary} 
            />
            <Text style={styles.statNumber}>{statistics.totalCourses || 0}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons 
              name="account-tie" 
              size={32} 
              color={theme.colors.success} 
            />
            <Text style={styles.statNumber}>{statistics.totalTeachers || 0}</Text>
            <Text style={styles.statLabel}>Teachers</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons 
              name="account-group" 
              size={32} 
              color={theme.colors.warning} 
            />
            <Text style={styles.statNumber}>{statistics.totalStudents || 0}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons 
              name="hand-heart" 
              size={32} 
              color={theme.colors.error} 
            />
            <Text style={styles.statNumber}>{statistics.totalDonors || 0}</Text>
            <Text style={styles.statLabel}>Donors</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.subTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CourseManagement')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="book-cog" 
              size={28} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionText}>Manage Courses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TeacherManagement')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="account-tie" 
              size={28} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionText}>Manage Teachers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('StudentManagement')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="account-group" 
              size={28} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionText}>Manage Students</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reports')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="chart-bar" 
              size={28} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render ministry admin view
  if (isMinistryAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Ministry Administration</Text>

        {/* System Statistics Grid */}
        <Text style={styles.subTitle}>System Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons 
              name="domain" 
              size={32} 
              color={theme.colors.primary} 
            />
            <Text style={styles.statNumber}>{statistics.totalMosques || 0}</Text>
            <Text style={styles.statLabel}>Mosques</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons 
              name="book-multiple" 
              size={32} 
              color={theme.colors.success} 
            />
            <Text style={styles.statNumber}>{statistics.totalCourses || 0}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons 
              name="account-tie" 
              size={32} 
              color={theme.colors.warning} 
            />
            <Text style={styles.statNumber}>{statistics.totalTeachers || 0}</Text>
            <Text style={styles.statLabel}>Teachers</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons 
              name="account-group" 
              size={32} 
              color={theme.colors.error} 
            />
            <Text style={styles.statNumber}>{statistics.totalStudents || 0}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.subTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('MosqueManagement')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="mosque" 
              size={28} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionText}>Manage Mosques</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SystemReports')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="chart-line" 
              size={28} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionText}>System Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Statistics')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="chart-bar" 
              size={28} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="cog" 
              size={28} 
              color={theme.colors.primary} 
            />
            <Text style={styles.actionText}>System Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  mosqueCard: {
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  mosqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  mosqueName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  mosqueDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  mosqueDetailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statBox: {
    width: '48%',
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statNumber: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginVertical: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

export default AdminProfileSection;