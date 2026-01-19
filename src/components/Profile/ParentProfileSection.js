// Parent Profile Component - displays children with progress and course enrollment
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

const ParentProfileSection = ({ parentData }) => {
  const navigation = useNavigation();

  // Check if parent has children data
  if (!parentData || !parentData.children) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Parent Profile</Text>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="human-child" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>No children linked yet</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('LinkChild')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="link-plus" size={20} color={theme.colors.white} />
            <Text style={styles.linkButtonText}>Link a Child</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { children = [] } = parentData;

  // Calculate overall statistics from all children
  const totalChildren = children.length;
  const totalCourses = children.reduce((sum, child) => sum + (child.courses || 0), 0);
  const avgProgress = children.length > 0
    ? Math.round(children.reduce((sum, child) => sum + (child.progress || 0), 0) / children.length)
    : 0;

  // Get progress bar color based on percentage
  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  // Render individual child card
  const renderChild = ({ item }) => (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => navigation.navigate('ChildDetails', { childId: item.id })}
      activeOpacity={0.7}
    >
      {/* Child Header with avatar and basic info */}
      <View style={styles.childHeader}>
        <View style={styles.childAvatar}>
          <MaterialCommunityIcons name="account" size={32} color={theme.colors.white} />
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{item.name}</Text>
          <View style={styles.childMetaRow}>
            <MaterialCommunityIcons name="cake-variant" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.childAge}>{item.age} years old</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ChildDetails', { childId: item.id })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress Section with bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <Text style={[styles.progressValue, { color: getProgressColor(item.progress) }]}>
            {Math.round(item.progress)}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${item.progress}%`,
                backgroundColor: getProgressColor(item.progress)
              }
            ]} 
          />
        </View>
      </View>

      {/* Course enrollment count */}
      <View style={styles.courseCountRow}>
        <MaterialCommunityIcons name="book-multiple" size={18} color={theme.colors.primary} />
        <Text style={styles.courseCountText}>
          Enrolled in {item.courses || 0} course{item.courses !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>My Children</Text>

      {/* Statistics Cards showing overall parent dashboard */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="human-child" size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>{totalChildren}</Text>
          <Text style={styles.statLabel}>Children</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="book-multiple" size={24} color={theme.colors.success} />
          <Text style={styles.statValue}>{totalCourses}</Text>
          <Text style={styles.statLabel}>Total Courses</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.warning} />
          <Text style={styles.statValue}>{avgProgress}%</Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>
      </View>

      {/* List of all children */}
      <FlatList
        data={children}
        renderItem={renderChild}
        keyExtractor={(item) => item.id?.toString()}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Quick Actions for parent */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyChildren')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="link-plus" size={20} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>My Children</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ProgressReports')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="file-chart" size={20} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>View Reports</Text>
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
  listContainer: {
    paddingBottom: theme.spacing.md,
  },
  childCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  childMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAge: {
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
  courseCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseCountText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  linkButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
});

export default ParentProfileSection;