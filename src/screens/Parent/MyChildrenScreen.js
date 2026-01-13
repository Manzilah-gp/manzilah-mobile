// ================================================
// BATCH 1: Parent Screens + Enrollment Details
// ================================================

// ============================================
// PARENT: MyChildrenScreen.js
// ============================================
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import { getParentChildren, getChildrenProgressSummary } from '../../api/parent';
import { theme } from '../../styles/theme';

export const MyChildrenScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState([]);
  const [summary, setSummary] = useState({});

  // Load children data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Fetch children and summary data from API
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [childrenResponse, summaryResponse] = await Promise.all([
        getParentChildren(),
        getChildrenProgressSummary()
      ]);
      
      setChildren(childrenResponse.data || []);
      setSummary(summaryResponse.data || {});
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children data');
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

  // Render summary statistics at top
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

  // Render single child card
  const renderChild = ({ item }) => (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => navigation.navigate('ChildDetails', { childId: item.id })}
      activeOpacity={0.7}
    >
      {/* Child Header */}
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

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
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

      {/* Course Count */}
      <View style={styles.courseCountRow}>
        <MaterialCommunityIcons name="book-multiple" size={18} color={theme.colors.primary} />
        <Text style={styles.courseCountText}>
          Enrolled in {item.courses || 0} course{item.courses !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('ChildProgress', { childId: item.id })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chart-line" size={16} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>View Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('ChildEnrollments', { childId: item.id })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="book-open" size={16} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>View Courses</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
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
  );

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="My Children">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Children">
      <View style={styles.container}>
        {children.length > 0 && renderSummary()}

        <FlatList
          data={children}
          renderItem={renderChild}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        {/* Floating Action Button to Link Child */}
        {children.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('LinkChild')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={28} color={theme.colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </MainLayout>
  );
};

// ============================================
// STYLES FOR ALL SCREENS IN THIS BATCH
// ============================================
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
  listContainer: {
    padding: theme.spacing.md,
  },
  childCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
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
    marginBottom: theme.spacing.sm,
  },
  courseCountText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.lightGray,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginLeft: 4,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.large,
  },
});