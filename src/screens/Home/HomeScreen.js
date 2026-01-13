// Home screen with layout and navigation
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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


          {/* Islamic Services Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>🕌 Islamic Services</Text>
            
            {/* Prayer Times Button */}
            <TouchableOpacity
              style={styles.islamicFeatureButton}
              onPress={() => navigation.navigate('PrayerTimes')}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🕌</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Prayer Times</Text>
                <Text style={styles.featureDescription}>
                  View today's prayer schedule
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>

            {/* Qibla Compass Button */}
            <TouchableOpacity
              style={styles.islamicFeatureButton}
              onPress={() => navigation.navigate('QiblaCompass')}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🧭</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Qibla Direction</Text>
                <Text style={styles.featureDescription}>
                  Find the direction to Mecca
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>

            {/* Hijri Calendar Button */}
            <TouchableOpacity
              style={styles.islamicFeatureButton}
              onPress={() => navigation.navigate('HijriCalendar')}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📅</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Hijri Calendar</Text>
                <Text style={styles.featureDescription}>
                  Islamic date and calendar
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            
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
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.xs,
  },
  islamicFeatureButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
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
    marginTop: theme.spacing.md,
  },
});

export default HomeScreen;