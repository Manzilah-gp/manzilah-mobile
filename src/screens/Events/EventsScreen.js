// FINAL FIXED Events Screen - Correct API endpoints and response handling
// "All" = ALL events in system, "Upcoming/Past" = From enrolled mosques
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
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const EventsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('upcoming'); // all, upcoming, past

  // Load events on mount and when filter changes
  useEffect(() => {
    loadEvents();
  }, [filter]);

  // Fetch events from API with correct endpoint
  const loadEvents = async () => {
    try {
      setLoading(true);
      
      let response;
      let eventsData;
      
      if (filter === 'all') {
        // ✅ Get ALL events in the system
        console.log('📅 Loading ALL events from system...');
        response = await apiClient.get('/api/events');
        console.log('All events API response:', response.data);
        
        // Extract events - handle multiple response structures
        eventsData = response.data.data || response.data.events || response.data || [];
        
      } else {
        // ✅ Get events from enrolled mosques only (upcoming or past)
        console.log(`📅 Loading ${filter} events from enrolled mosques...`);
        response = await apiClient.get('/api/events/my-enrolled-mosques', {
          params: { filter: filter }
        });
        console.log('Enrolled mosques events API response:', response.data);
        
        // Extract events - handle multiple response structures
        eventsData = response.data.data || response.data.events || response.data || [];
      }
      
      // Ensure eventsData is an array
      if (!Array.isArray(eventsData)) {
        console.warn('Events data is not an array:', eventsData);
        eventsData = [];
      }
      
      console.log(`✅ Loaded ${eventsData.length} ${filter} events`);
      setEvents(eventsData);
      
    } catch (error) {
      console.error('❌ Error loading events:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      Alert.alert('Error', `Failed to load events: ${error.response?.data?.message || error.message}`);
      setEvents([]); // Set empty array on error
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

  // Handle RSVP
  const handleRSVP = async (eventId, status) => {
    try {
      await apiClient.post(`/api/events/${eventId}/rsvp`, {
        status: status // 'going', 'maybe', 'not_going'
      });
      
      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, user_rsvp_status: status }
            : event
        )
      );
      
      Alert.alert('Success', `RSVP updated to: ${status.replace('_', ' ')}`);
    } catch (error) {
      console.error('RSVP error:', error);
      Alert.alert('Error', 'Failed to update RSVP');
    }
  };

  // Handle Like
  const handleLike = async (eventId, isLiked) => {
    try {
      if (isLiked) {
        await apiClient.delete(`/api/events/${eventId}/like`);
      } else {
        await apiClient.post(`/api/events/${eventId}/like`);
      }
      
      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { 
                ...event, 
                user_liked: !isLiked,
                likes_count: isLiked ? (event.likes_count || 1) - 1 : (event.likes_count || 0) + 1
              }
            : event
        )
      );
      
    } catch (error) {
      console.error('Like error:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  // Navigate to event details
  const navigateToEventDetails = (eventId) => {
    navigation.navigate('EventDetails', { eventId });
  };

  // Render filter tabs
  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {['upcoming', 'past', 'all'].map((status) => (
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

  // Get event status color and text
  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    
    if (eventDate > now) {
      return { text: 'Upcoming', color: theme.colors.success };
    } else if (event.completed) {
      return { text: 'Completed', color: theme.colors.gray };
    } else {
      return { text: 'Past', color: theme.colors.textSecondary };
    }
  };

  // Render RSVP buttons
  const renderRSVPButtons = (event) => (
    <View style={styles.rsvpContainer}>
      <Text style={styles.rsvpLabel}>Going?</Text>
      <View style={styles.rsvpButtons}>
        <TouchableOpacity
          style={[
            styles.rsvpButton,
            event.user_rsvp_status === 'going' && styles.rsvpButtonActive
          ]}
          onPress={() => handleRSVP(event.id, 'going')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="check-circle" 
            size={18} 
            color={event.user_rsvp_status === 'going' ? theme.colors.white : theme.colors.success} 
          />
          <Text style={[
            styles.rsvpButtonText,
            event.user_rsvp_status === 'going' && styles.rsvpButtonTextActive
          ]}>
            Going
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rsvpButton,
            event.user_rsvp_status === 'maybe' && styles.rsvpButtonActive
          ]}
          onPress={() => handleRSVP(event.id, 'maybe')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="help-circle" 
            size={18} 
            color={event.user_rsvp_status === 'maybe' ? theme.colors.white : theme.colors.warning} 
          />
          <Text style={[
            styles.rsvpButtonText,
            event.user_rsvp_status === 'maybe' && styles.rsvpButtonTextActive
          ]}>
            Maybe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rsvpButton,
            event.user_rsvp_status === 'not_going' && styles.rsvpButtonActive
          ]}
          onPress={() => handleRSVP(event.id, 'not_going')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="close-circle" 
            size={18} 
            color={event.user_rsvp_status === 'not_going' ? theme.colors.white : theme.colors.error} 
          />
          <Text style={[
            styles.rsvpButtonText,
            event.user_rsvp_status === 'not_going' && styles.rsvpButtonTextActive
          ]}>
            Can't Go
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render single event card
  const renderEvent = ({ item }) => {
    const status = getEventStatus(item);
    const isFundraising = item.type === 'fundraising';

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigateToEventDetails(item.id)}
        activeOpacity={0.7}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.eventIconContainer}>
            <MaterialCommunityIcons 
              name={isFundraising ? 'cash-multiple' : 'calendar-star'} 
              size={32} 
              color={theme.colors.primary} 
            />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{item.name}</Text>
            <View style={styles.eventMetaRow}>
              <MaterialCommunityIcons name="mosque" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.eventMetaText}>{item.mosque_name}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>

        {/* Event Date & Time */}
        <View style={styles.eventDateTime}>
          <View style={styles.dateTimeItem}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.primary} />
            <Text style={styles.dateTimeText}>
              {new Date(item.event_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          {item.start_time && (
            <View style={styles.dateTimeItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.dateTimeText}>
                {item.start_time}
                {item.end_time && ` - ${item.end_time}`}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Fundraising Progress */}
        {isFundraising && item.fundraising_goal_cents > 0 && (
          <View style={styles.fundraisingSection}>
            <View style={styles.fundraisingHeader}>
              <Text style={styles.fundraisingLabel}>Fundraising Goal</Text>
              <Text style={styles.fundraisingAmount}>
                ₪{(item.total_raised || 0).toFixed(0)} / ₪{(item.fundraising_goal_cents / 100).toFixed(0)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${Math.min(((item.total_raised || 0) / (item.fundraising_goal_cents / 100)) * 100, 100)}%` 
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* RSVP Buttons - Only for upcoming events */}
        {status.text === 'Upcoming' && renderRSVPButtons(item)}

        {/* Social Stats & Actions */}
        <View style={styles.socialSection}>
          {/* Stats */}
          <View style={styles.socialStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="thumb-up" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{item.likes_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="comment" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{item.comments_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-check" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{item.rsvp_going_count || 0} going</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.socialActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id, item.user_liked)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name={item.user_liked ? 'thumb-up' : 'thumb-up-outline'} 
                size={20} 
                color={item.user_liked ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.actionButtonText,
                item.user_liked && { color: theme.colors.primary }
              ]}>
                Like
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigateToEventDetails(item.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="comment-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.actionButtonText}>Comment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    let message = '';
    if (filter === 'all') {
      message = 'No events available in the system';
    } else if (filter === 'upcoming') {
      message = 'No upcoming events from your enrolled mosques';
    } else {
      message = 'No past events from your enrolled mosques';
    }

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="calendar-blank" size={64} color={theme.colors.textLight} />
        <Text style={styles.emptyText}>{message}</Text>
        {filter !== 'all' && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllButtonText}>View All Events</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="Events">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Events">
      <View style={styles.container}>
        {renderFilterTabs()}

        {/* Filter explanation */}
        <View style={styles.filterInfoBanner}>
          <MaterialCommunityIcons name="information" size={16} color={theme.colors.primary} />
          <Text style={styles.filterInfoText}>
            {filter === 'all' 
              ? 'Showing all events in the system' 
              : `Showing ${filter} events from your enrolled mosques`}
          </Text>
        </View>

        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  filterInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  filterInfoText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  eventCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
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
    marginBottom: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
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
  },
  eventDateTime: {
    marginBottom: theme.spacing.sm,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateTimeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginLeft: 4,
  },
  eventDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  fundraisingSection: {
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  fundraisingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fundraisingLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  fundraisingAmount: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.white,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  rsvpContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  rsvpLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  rsvpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
    marginHorizontal: 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  rsvpButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rsvpButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    marginLeft: 4,
    fontWeight: '500',
  },
  rsvpButtonTextActive: {
    color: theme.colors.white,
  },
  socialSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    paddingTop: theme.spacing.sm,
  },
  socialStats: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  socialActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  viewAllButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  viewAllButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

export default EventsScreen;