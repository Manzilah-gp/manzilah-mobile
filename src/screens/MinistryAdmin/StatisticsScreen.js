// Ministry Admin Statistics Screen - System-wide statistics and charts
// Exactly matches the working web version's API implementation
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    mosques: 0,
    students: 0,
    teachers: 0,
    courses: 0,
    activeEnrollments: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentMosques, setRecentMosques] = useState([]);
  const [error, setError] = useState(null);

  // Load data when component mounts
  useEffect(() => {
    fetchMinistryData();
  }, []);

  /**
   * Fetch ministry-level statistics
   * This matches EXACTLY how the web version does it in Statistics.jsx
   */
  const fetchMinistryData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Starting Ministry Data Fetch...');
      console.log('🔐 Auth token exists:', !!apiClient.defaults.headers.common['Authorization']);

      // Fetch both statistics and chart data in parallel
      // This is EXACTLY the same as the web version
      const [statsResponse, chartResponse] = await Promise.all([
        apiClient.get('/api/dashboard/ministry-statistics'),
        apiClient.get('/api/dashboard/governorate-stats')
      ]);

      console.log('✅ Stats Response:', {
        status: statsResponse.status,
        success: statsResponse.data.success,
        hasData: !!statsResponse.data.data
      });

      console.log('✅ Chart Response:', {
        status: chartResponse.status,
        success: chartResponse.data.success,
        dataLength: chartResponse.data.data?.length
      });

      const statsData = statsResponse.data.data;
      const chartData = chartResponse.data.data;

      // Set statistics for cards (matching web version structure)
      setStatistics({
        mosques: statsData.totalMosques || 0,
        students: statsData.totalStudents || 0,
        teachers: statsData.totalTeachers || 0,
        courses: statsData.totalCourses || 0,
        activeEnrollments: statsData.activeEnrollments || 0
      });

      // Set chart data for governorate distribution
      setChartData(chartData || []);

      // Set additional data like recent mosques
      setRecentMosques(statsData.recentMosques || []);

      console.log('✅ Data loaded successfully');

    } catch (error) {
      console.error('❌ Error in fetchMinistryData:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });

      setError(error.response?.data?.message || error.message || 'Failed to load statistics');

      // Show detailed error message
      const errorDetails = error.response?.status === 404 
        ? 'Routes not found (404). Please verify:\n1. Routes are registered in server.js\n2. Server is running\n3. Base URL is correct'
        : error.response?.status === 401
        ? 'Unauthorized (401). Please verify:\n1. You are logged in\n2. Token is valid\n3. Token is being sent in headers'
        : error.response?.status === 403
        ? 'Forbidden (403). Please verify:\n1. User has ministry_admin role\n2. Role is active in database'
        : `Error: ${error.message}`;

      Alert.alert('Error Loading Statistics', errorDetails, [{ text: 'OK' }]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMinistryData();
    setRefreshing(false);
  };

  /**
   * Render main statistics cards (2x2 grid)
   */
  const renderMainStats = () => {
    const mainStats = [
      {
        key: 'mosques',
        icon: 'mosque',
        label: 'Total Mosques',
        value: statistics.mosques,
        color: '#1890ff',
        bgColor: '#E3F2FD'
      },
      {
        key: 'students',
        icon: 'account-group',
        label: 'Students',
        value: statistics.students,
        color: '#52c41a',
        bgColor: '#E8F5E9'
      },
      {
        key: 'teachers',
        icon: 'account-tie',
        label: 'Teachers',
        value: statistics.teachers,
        color: '#722ed1',
        bgColor: '#F3E5F5'
      },
      {
        key: 'courses',
        icon: 'book-open-variant',
        label: 'Courses',
        value: statistics.courses,
        color: '#fa8c16',
        bgColor: '#FFF3E0'
      },
    ];

    return (
      <View style={styles.mainStatsGrid}>
        {mainStats.map((stat) => (
          <View key={stat.key} style={[styles.mainStatCard, { backgroundColor: stat.bgColor }]}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
              <MaterialCommunityIcons name={stat.icon} size={28} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  /**
   * Render active enrollments card
   */
  const renderActiveEnrollments = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Statistics</Text>
        
        <View style={styles.activeEnrollmentCard}>
          <MaterialCommunityIcons 
            name="account-check" 
            size={40} 
            color="#13c2c2" 
          />
          <View style={styles.activeEnrollmentInfo}>
            <Text style={[styles.activeEnrollmentValue, { color: '#13c2c2' }]}>
              {statistics.activeEnrollments}
            </Text>
            <Text style={styles.activeEnrollmentLabel}>
              Active Enrollments
            </Text>
            <Text style={styles.activeEnrollmentSubtext}>
              Students currently enrolled in courses
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render governorate distribution chart
   */
  const renderGovernorateStats = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mosque Distribution by Governorate</Text>
          <Text style={styles.emptyText}>No governorate data available</Text>
        </View>
      );
    }

    const sortedStats = [...chartData].sort((a, b) => b.value - a.value);
    const maxMosques = Math.max(...sortedStats.map(s => s.value));
    const total = sortedStats.reduce((sum, g) => sum + g.value, 0);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mosque Distribution by Governorate</Text>
        <Text style={styles.sectionSubtitle}>
          Total: {total} mosques across {sortedStats.length} governorates
        </Text>
        
        {sortedStats.map((gov, index) => {
          const barWidth = maxMosques > 0 ? (gov.value / maxMosques) * 100 : 0;
          
          return (
            <View key={index} style={styles.govStatItem}>
              <View style={styles.govStatHeader}>
                <Text style={styles.govStatName}>{gov.label}</Text>
                <View style={styles.govCountBadge}>
                  <Text style={styles.govStatCount}>{gov.value}</Text>
                </View>
              </View>
              
              <View style={styles.govStatBar}>
                <View 
                  style={[
                    styles.govStatBarFill,
                    { 
                      width: `${barWidth}%`,
                      backgroundColor: index === 0 ? '#1890ff' : '#52c41a'
                    }
                  ]} 
                />
              </View>
              
              <Text style={styles.govStatPercentage}>
                {gov.percentage}% of total mosques
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  /**
   * Render recently added mosques list
   */
  const renderRecentMosques = () => {
    if (!recentMosques || recentMosques.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Added Mosques</Text>
        
        {recentMosques.map((mosque, index) => {
          const createdDate = new Date(mosque.created_at);
          const now = new Date();
          const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
          const isNew = daysDiff <= 7;
          
          return (
            <View key={mosque.id || index} style={styles.recentMosqueItem}>
              <View style={styles.mosqueIconContainer}>
                <MaterialCommunityIcons 
                  name="mosque" 
                  size={24} 
                  color="#1890ff" 
                />
              </View>
              
              <View style={styles.recentMosqueInfo}>
                <Text style={styles.recentMosqueName}>{mosque.name}</Text>
                <Text style={styles.recentMosqueDetails}>
                  {mosque.region || ''}{mosque.region && mosque.governorate ? ', ' : ''}
                  {mosque.governorate?.toUpperCase() || ''}
                </Text>
                <Text style={styles.recentMosqueAdmin}>
                  Admin: {mosque.admin_name || 'Not assigned'}
                </Text>
              </View>
              
              <View style={styles.recentMosqueRight}>
                {isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
                <Text style={styles.recentMosqueDate}>
                  {new Date(mosque.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  /**
   * Render error state
   */
  const renderError = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons 
        name="alert-circle-outline" 
        size={64} 
        color="#ff4d4f" 
      />
      <Text style={styles.errorTitle}>Failed to Load Statistics</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchMinistryData}>
        <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
      
      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugTitle}>Debug Information:</Text>
        <Text style={styles.debugText}>Base URL: {apiClient.defaults.baseURL}</Text>
        <Text style={styles.debugText}>
          Token: {apiClient.defaults.headers.common['Authorization'] ? '✓ Present' : '✗ Missing'}
        </Text>
      </View>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <MainLayout title="Ministry Dashboard">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      </MainLayout>
    );
  }

  // Error state
  if (error && statistics.mosques === 0) {
    return (
      <MainLayout title="Ministry Dashboard">
        {renderError()}
      </MainLayout>
    );
  }

  // Main render
  return (
    <MainLayout title="Ministry Dashboard">
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#1890ff']}
          />
        }
      >
        <View style={styles.headerSubtitle}>
          <Text style={styles.subtitleText}>
            Overview of all mosques and activities across the system
          </Text>
        </View>

        {renderMainStats()}
        {renderActiveEnrollments()}
        {renderGovernorateStats()}
        {renderRecentMosques()}
        
        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8c8c8c',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#262626',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#8c8c8c',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1890ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#262626',
  },
  debugText: {
    fontSize: 12,
    color: '#595959',
    marginBottom: 4,
  },
  headerSubtitle: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  subtitleText: {
    fontSize: 16,
    color: '#8c8c8c',
  },
  mainStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  mainStatCard: {
    width: (width - 48) / 2,
    minWidth: 150,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8c8c8c',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8c8c8c',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8c8c8c',
    textAlign: 'center',
    paddingVertical: 32,
  },
  activeEnrollmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#13c2c2',
  },
  activeEnrollmentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  activeEnrollmentValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  activeEnrollmentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#262626',
    marginTop: 2,
  },
  activeEnrollmentSubtext: {
    fontSize: 12,
    color: '#8c8c8c',
    marginTop: 2,
  },
  govStatItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  govStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  govStatName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#262626',
    flex: 1,
  },
  govCountBadge: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  govStatCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  govStatBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 4,
    overflow: 'hidden',
  },
  govStatBarFill: {
    height: '100%',
    borderRadius: 6,
    minWidth: 2,
  },
  govStatPercentage: {
    fontSize: 12,
    color: '#8c8c8c',
    fontWeight: '500',
  },
  recentMosqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mosqueIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recentMosqueInfo: {
    flex: 1,
  },
  recentMosqueName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#262626',
    marginBottom: 2,
  },
  recentMosqueDetails: {
    fontSize: 14,
    color: '#8c8c8c',
    marginBottom: 2,
  },
  recentMosqueAdmin: {
    fontSize: 12,
    color: '#8c8c8c',
    fontStyle: 'italic',
  },
  recentMosqueRight: {
    alignItems: 'flex-end',
  },
  recentMosqueDate: {
    fontSize: 12,
    color: '#8c8c8c',
    marginTop: 4,
  },
  newBadge: {
    backgroundColor: '#52c41a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StatisticsScreen;