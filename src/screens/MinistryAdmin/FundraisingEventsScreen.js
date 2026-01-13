// Fundraising Events Screen - Ministry Admin only
// Location: /src/screens/MinistryAdmin/FundraisingEventsScreen.js
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
import { 
  getEvents, 
  approveEvent, 
  rejectEvent, 
  getEventDonationStats,
} from '../../api';
import { theme } from '../../styles/theme';

const FundraisingEventsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

  // Load events on mount and when filter changes
  useEffect(() => {
    loadEvents();
  }, [filter]);

  // Fetch fundraising events from API
  const loadEvents = async () => {
    try {
      setLoading(true);
      
      const params = {
        type: 'fundraising',
      };
      
      if (filter !== 'all') {
        params.approval_status = filter;
      }
      
      const response = await getEvents(params);
      
      // Fetch donation stats for each event
      const eventsWithStats = await Promise.all(
        (response.data || []).map(async (event) => {
          try {
            const stats = await getEventDonationStats(event.id);
            return { ...event, ...stats.data };
          } catch (error) {
            return event;
          }
        })
      );
      
      setEvents(eventsWithStats);
    } catch (error) {
      console.error('Error loading fundraising events:', error);
      Alert.alert('Error', 'Failed to load fundraising events');
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

  // Handle approve event
  const handleApprove = async (eventId, eventName) => {
    Alert.alert(
      'Approve Event',
      `Are you sure you want to approve "${eventName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await approveEvent(eventId);
              Alert.alert('Success', 'Event approved successfully');
              loadEvents();
            } catch (error) {
              Alert.alert('Error', 'Failed to approve event');
            }
          }
        }
      ]
    );
  };

  // Handle reject event
  const handleReject = async (eventId, eventName) => {
    Alert.prompt(
      'Reject Event',
      `Please provide a reason for rejecting "${eventName}":`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason || reason.trim() === '') {
              Alert.alert('Error', 'Please provide a reason for rejection');
              return;
            }
            try {
              await rejectEvent(eventId, reason);
              Alert.alert('Success', 'Event rejected');
              loadEvents();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject event');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // Render filter tabs
  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {['pending', 'approved', 'rejected', 'all'].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterTab,
            filter === status && styles.filterTabActive
          ]}
          onPress={() => setFilter(status)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterTabText,
            filter === status && styles.filterTabTextActive
          ]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render single event card
  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      {/* Event Header */}
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <MaterialCommunityIcons name="cash-multiple" size={32} color={theme.colors.primary} />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>{item.name}</Text>
          <View style={styles.eventMetaRow}>
            <MaterialCommunityIcons name="mosque" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.mosqueName}>{item.mosque_name}</Text>
          </View>
          <View style={styles.eventMetaRow}>
            <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.eventDate}>
              {new Date(item.event_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {item.approval_status && (
          <View style={[
            styles.statusBadge,
            { backgroundColor: 
              item.approval_status === 'approved' ? theme.colors.success :
              item.approval_status === 'pending' ? theme.colors.warning :
              theme.colors.error
            }
          ]}>
            <Text style={styles.statusText}>{item.approval_status}</Text>
          </View>
        )}
      </View>

      {/* Fundraising Progress */}
      <View style={styles.fundraisingSection}>
        <View style={styles.fundraisingHeader}>
          <Text style={styles.fundraisingLabel}>Fundraising Progress</Text>
          <Text style={styles.fundraisingAmount}>
            ₪{item.total_raised || 0} / ₪{(item.fundraising_goal_cents || 0) / 100}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill,
              { 
                width: `${Math.min(((item.total_raised || 0) / ((item.fundraising_goal_cents || 1) / 100)) * 100, 100)}%`,
                backgroundColor: theme.colors.success
              }
            ]} 
          />
        </View>
        <Text style={styles.donationsCount}>
          {item.donation_count || 0} donation{item.donation_count !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Action Buttons */}
      {item.approval_status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id, item.name)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item.id, item.name)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View Donations Button */}
      <TouchableOpacity
        style={styles.viewDonationsButton}
        onPress={() => navigation.navigate('EventDonations', { eventId: item.id })}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="eye" size={18} color={theme.colors.primary} />
        <Text style={styles.viewDonationsText}>View Donations</Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="cash-multiple" size={64} color={theme.colors.textLight} />
      <Text style={styles.emptyText}>No fundraising events found</Text>
    </View>
  );

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="Fundraising Events">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Fundraising Events">
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
      </View>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  filterTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  eventCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mosqueName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  eventDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  fundraisingSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  fundraisingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fundraisingLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  fundraisingAmount: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  donationsCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
  },
  viewDonationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  viewDonationsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});

export default FundraisingEventsScreen;