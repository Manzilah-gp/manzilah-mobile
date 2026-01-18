// MyEnrollmentsScreen.js - FIXED & MATCHES PROFILE LOGIC
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';
import { StyleSheet } from 'react-native';

const MyEnrollmentsScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await apiClient.get('/api/enrollment/my-enrollments', {
        params,
      });

      setEnrollments(response.data.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  /* ===============================
     ✅ SAME LOGIC AS PROFILE SCREEN
     =============================== */
  const calculateProgress = (enrollment) => {
  const courseType = (
    enrollment.course_type ||
    enrollment.course_type_name ||
    ''
  ).toLowerCase();

  const isMemorization = courseType === 'memorization';

  // ✅ Memorization → completion_percentage فقط
  if (isMemorization) {
    return Math.round(enrollment.completion_percentage || 0);
  }

  // ✅ 1. attendance_rate (جاهزة من backend)
  if (typeof enrollment.attendance_rate === 'number') {
    return Math.round(enrollment.attendance_rate);
  }

  // ✅ 2. attendance_percentage
  if (typeof enrollment.attendance_percentage === 'number') {
    return Math.round(enrollment.attendance_percentage);
  }

  // ✅ 3. present_count / total_attendance_records
  const present =
    enrollment.present_count ??
    enrollment.attended_sessions ??
    0;

  const total =
    enrollment.total_attendance_records ??
    enrollment.total_sessions ??
    0;

  if (total > 0) {
    return Math.round((present / total) * 100);
  }

  // ❌ non-memorization should NOT rely on completion_percentage
  return 0;
};


  const getProgressColor = (progress) => {
    if (progress >= 75) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'completed':
        return theme.colors.primary;
      case 'dropped':
        return theme.colors.error;
      default:
        return theme.colors.gray;
    }
  };

  const renderEnrollment = ({ item }) => {
    const progress = calculateProgress(item);
    const progressColor = getProgressColor(progress);

    const courseType = (
      item.course_type ||
      item.course_type_name ||
      ''
    ).toLowerCase();
    const isMemorization = courseType === 'memorization';

    return (
      <TouchableOpacity
        style={styles.enrollmentCard}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('EnrollmentDetails', {
            enrollmentId: item.id,
          })
        }
      >
        {/* Header */}
        <View style={styles.enrollmentHeader}>
          <View style={styles.courseIcon}>
            <MaterialCommunityIcons
              name={isMemorization ? 'book-open-variant' : 'book-open'}
              size={26}
              color={theme.colors.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.courseName}>{item.course_name}</Text>
            <Text style={styles.courseType}>
              {item.course_type || item.course_type_name}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Progress */}
        {item.status === 'active' && (
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={[styles.progressValue, { color: progressColor }]}>
                {progress}%
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>

            {/* Attendance or Level */}
            {!isMemorization && item.total_attendance_records > 0 ? (
              <Text style={styles.metaText}>
                📅 {item.present_count}/{item.total_attendance_records} sessions
              </Text>
            ) : isMemorization && item.current_level ? (
              <Text style={styles.metaText}>
                🏆 Level: {item.current_level}
              </Text>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <MainLayout title="My Enrollments">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Enrollments">
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderEnrollment}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            No enrollments found
          </Text>
        }
      />
    </MainLayout>
  );
};

export default MyEnrollmentsScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  enrollmentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIcon: {
    marginRight: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  courseType: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  progressSection: {
    marginTop: 14,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metaText: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
