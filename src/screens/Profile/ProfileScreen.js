// src/screens/Profile/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MainLayout from '../../components/Layout/MainLayout';
import { getUserProfile } from '../../api/profile';
import { theme } from '../../styles/theme';

// Import all role-specific components
import ProfileHeader from '../../components/Profile/ProfileHeader';
import StudentProfileSection from '../../components/Profile/StudentProfileSection';
import TeacherProfileSection from '../../components/Profile/TeacherProfileSection';
import ParentProfileSection from '../../components/Profile/ParentProfileSection';
import MosqueAdminProfileSection from '../../components/Profile/MosqueAdminProfileSection';
import MinistryAdminProfileSection from '../../components/Profile/Ministryadminprofilesection ';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [roleData, setRoleData] = useState({});

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Fetch profile data from backend
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      
      // Backend returns: { success, user, roleSpecificData }
      setUserData(response.user);
      setRoleData(response.roleSpecificData || {});
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="Profile" user={userData}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Profile" user={userData}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header - Common for all users */}
        <ProfileHeader user={userData} />

        {/* Role-Specific Sections - Only show for active roles */}
        
        {/* STUDENT SECTION */}
        {userData?.activeRoles?.includes('student') && (
          <StudentProfileSection studentData={roleData.student} />
        )}

        {/* TEACHER SECTION */}
        {userData?.activeRoles?.includes('teacher') && (
          <TeacherProfileSection teacherData={roleData.teacher} />
        )}

        {/* PARENT SECTION */}
        {userData?.activeRoles?.includes('parent') && (
          <ParentProfileSection parentData={roleData.parent} />
        )}

        {/* MOSQUE ADMIN SECTION */}
        {userData?.activeRoles?.includes('mosque_admin') && (
          <MosqueAdminProfileSection mosqueAdminData={roleData.mosque_admin} />
        )}

        {/* MINISTRY ADMIN SECTION */}
        {userData?.activeRoles?.includes('ministry_admin') && (
          <MinistryAdminProfileSection ministryAdminData={roleData.ministry_admin} />
        )}
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
});

export default ProfileScreen;