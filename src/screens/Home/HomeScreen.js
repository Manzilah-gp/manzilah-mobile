// Home screen with layout and navigation
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

const HomeScreen = () => {
  const navigation = useNavigation();

  // Mock user data for testing
  const mockUser = {
    name: 'Test User',
    email: 'test@manzilah.com',
    full_name: 'Test User',
    activeRoles: ['student', 'parent'],
  };

  return (
    <MainLayout title="Home" user={mockUser} showFooter={true}>
      <View style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <MaterialCommunityIcons 
            name="hand-wave" 
            size={48} 
            color={theme.colors.primary} 
          />
          <Text style={styles.title}>Welcome to Manzilah Mobile!</Text>
          <Text style={styles.subtitle}>Islamic Education Platform</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <MaterialCommunityIcons 
            name="check-circle" 
            size={32} 
            color={theme.colors.success} 
          />
          <Text style={styles.statusText}>✅ App is running successfully!</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="account" 
              size={24} 
              color={theme.colors.white} 
            />
            <Text style={styles.actionButtonText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => alert('Courses feature coming soon!')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="book-open" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Browse Courses
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          Tap the menu icon (☰) to see navigation options
        </Text>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  welcomeCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  statusText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  secondaryButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;