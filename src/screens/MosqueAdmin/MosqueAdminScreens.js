// ================================================================
// COMPLETE ADMIN SCREENS FILE
// Contains: FundraisingEventsScreen, MyMosqueScreen, EventsManagementScreen
// ================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import styles from '../MinistryAdmin/styles'
import { 
  getEvents, 
  approveEvent, 
  rejectEvent, 
  getEventDonationStats,
  getMosqueById,
  getMosqueStatistics,
  getMyMosqueEvents,
  deleteEvent,
} from '../../api';
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';


// ================================================================
// FIXED MY MOSQUE SCREEN (Mosque Admin)
// With debug logs and multiple mosque ID detection methods


export const MyMosqueScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [mosque, setMosque] = useState(null);
  const [statistics, setStatistics] = useState({});

  // Load mosque data on mount
  useEffect(() => {
    loadMosqueData();
  }, []);

  // Fetch mosque data from API
  const loadMosqueData = async () => {
    try {
      setLoading(true);
      
      // ✅ DEBUG: Log user object to see what we have
      console.log('=== MY MOSQUE DEBUG ===');
      console.log('Full user object:', JSON.stringify(user, null, 2));
      console.log('User roles:', user?.roles);
      console.log('User activeRoles:', user?.activeRoles);
      
      // ✅ FIX: Try multiple ways to get mosque ID
      let mosqueId = null;
      
      // Method 1: From roleSpecificData (structure from your screens)
      mosqueId = user?.roleSpecificData?.mosque_admin?.mosques?.[0]?.id;
      console.log('Method 1 (roleSpecificData):', mosqueId);
      
      // Method 2: From mosques array directly
      if (!mosqueId && user?.mosques && user.mosques.length > 0) {
        mosqueId = user.mosques[0].id;
        console.log('Method 2 (mosques array):', mosqueId);
      }
      
      // Method 3: From mosque_id field directly
      if (!mosqueId && user?.mosque_id) {
        mosqueId = user.mosque_id;
        console.log('Method 3 (mosque_id field):', mosqueId);
      }
      
      // Method 4: From roleData (alternative structure)
      if (!mosqueId && user?.roleData?.mosque_admin?.mosque_id) {
        mosqueId = user.roleData.mosque_admin.mosque_id;
        console.log('Method 4 (roleData):', mosqueId);
      }
      
      console.log('Final mosque ID found:', mosqueId);
      console.log('======================');
      
      if (!mosqueId) {
        Alert.alert(
          'Error', 
          'No mosque assigned to your account.\n\nPlease check the console log for details and contact support.',
          [
            { 
              text: 'OK',
              onPress: () => {
                console.log('User needs mosque assignment');
                console.log('User structure:', user);
              }
            }
          ]
        );
        setLoading(false);
        return;
      }
      
      // Fetch mosque data and statistics
      console.log('Fetching mosque data for ID:', mosqueId);
      
      const [mosqueResponse, statsResponse] = await Promise.all([
        getMosqueById(mosqueId),
        getMosqueStatistics(mosqueId)
      ]);
      
      console.log('Mosque response:', mosqueResponse.data);
      console.log('Statistics response:', statsResponse.data);
      
      setMosque(mosqueResponse.data);
      setStatistics(statsResponse.data || {});
    } catch (error) {
      console.error('Error loading mosque data:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to load mosque data: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="My Mosque">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading mosque data...</Text>
        </View>
      </MainLayout>
    );
  }

  if (!mosque) {
    return (
      <MainLayout title="My Mosque">
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="mosque" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>No mosque assigned</Text>
          <Text style={styles.emptySubtext}>
            Please contact your administrator to assign a mosque to your account.
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadMosqueData}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.white} />
            <Text style={styles.refreshButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Mosque">
      <ScrollView style={styles.container}>
        {/* Mosque Info Card */}
        <View style={styles.mosqueInfoCard}>
          <View style={styles.mosqueIconContainer}>
            <MaterialCommunityIcons name="mosque" size={48} color={theme.colors.primary} />
          </View>
          <View style={styles.mosqueDetails}>
            <Text style={styles.mosqueName}>{mosque.name}</Text>
            <View style={styles.mosqueMetaRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.mosqueLocation}>
                {mosque.governorate}, {mosque.region}
              </Text>
            </View>
            {mosque.contact_number && (
              <View style={styles.mosqueMetaRow}>
                <MaterialCommunityIcons name="phone" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.mosqueContact}>{mosque.contact_number}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="book-multiple" size={28} color={theme.colors.primary} />
              <Text style={styles.statValue}>{statistics.total_courses || 0}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account-group" size={28} color={theme.colors.success} />
              <Text style={styles.statValue}>{statistics.total_students || 0}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account-tie" size={28} color={theme.colors.warning} />
              <Text style={styles.statValue}>{statistics.total_teachers || 0}</Text>
              <Text style={styles.statLabel}>Teachers</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Statistics')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="chart-bar" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>View Statistics</Text>
              <Text style={styles.quickActionDesc}>Detailed mosque analytics</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('CourseList')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="book-multiple" size={32} color={theme.colors.success} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Manage Courses</Text>
              <Text style={styles.quickActionDesc}>View and manage courses</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('TeachersManagement')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="account-tie" size={32} color={theme.colors.warning} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Manage Teachers</Text>
              <Text style={styles.quickActionDesc}>View teacher information</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('EventsManagement')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="calendar-star" size={32} color={theme.colors.error} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Manage Events</Text>
              <Text style={styles.quickActionDesc}>Create and manage events</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </MainLayout>
  );
};



export default MyMosqueScreen;
// ================================================================
// 3. EVENTS MANAGEMENT SCREEN (Mosque Admin)
// ================================================================
export const EventsManagementScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all'); // all, regular, fundraising

  // Load events on mount and when filter changes
  useEffect(() => {
    loadEvents();
  }, [filter]);

  // Fetch mosque events from API
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getMyMosqueEvents();
      
      let filteredEvents = response.data || [];
      if (filter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.type === filter);
      }
      
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  // Handle delete event
  const handleDelete = (eventId, eventName) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${eventName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(eventId);
              Alert.alert('Success', 'Event deleted successfully');
              loadEvents();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  // Render filter tabs
  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {['all', 'regular', 'fundraising'].map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.filterTab,
            filter === type && styles.filterTabActive
          ]}
          onPress={() => setFilter(type)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterTabText,
            filter === type && styles.filterTabTextActive
          ]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render single event card
  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <MaterialCommunityIcons 
            name={item.type === 'fundraising' ? 'cash-multiple' : 'calendar-star'} 
            size={32} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>{item.name}</Text>
          <View style={styles.eventMetaRow}>
            <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.eventDate}>
              {new Date(item.event_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.eventMetaRow}>
            <MaterialCommunityIcons name="clock" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.eventTime}>{item.event_time}</Text>
          </View>
        </View>
      </View>

      {item.description && (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditEvent', { eventId: item.id })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pencil" size={18} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id, item.name)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="delete" size={18} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="eye" size={18} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="calendar-blank" size={64} color={theme.colors.textLight} />
      <Text style={styles.emptyText}>No events found</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateEvent')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
        <Text style={styles.createButtonText}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="Events Management">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Events Management">
      <View style={styles.container}>
        {renderFilterTabs()}

        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        {/* Floating Action Button */}
        {events.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateEvent')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={28} color={theme.colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </MainLayout>
  );
};
