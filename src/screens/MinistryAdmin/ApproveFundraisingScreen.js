// Ministry Admin Approve Fundraising Screen - Approve/reject fundraising events
// Matches the web FundraisingApprovalsPage implementation
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');

const ApproveFundraisingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Separate arrays for each status (matches web version)
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  
  // Modals state
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchFundraisingEvents();
  }, []);

  /**
   * Fetch all fundraising events
   * Matches the web version's API call exactly
   */
  const fetchFundraisingEvents = async () => {
    try {
      setLoading(true);

      console.log('=== FETCHING FUNDRAISING EVENTS ===');

      // Same API call as web version
      const response = await apiClient.get('/api/events', {
        params: { event_type: 'fundraising' }
      });

      console.log('Response success:', response.data.success);
      console.log('Total events:', response.data.events?.length);

      if (response.data.success) {
        const allEvents = response.data.events || [];

        // Filter events by approval status (same as web)
        const pending = allEvents.filter(e => e.approval_status === 'pending');
        const approved = allEvents.filter(e => e.approval_status === 'approved');
        const rejected = allEvents.filter(e => e.approval_status === 'rejected');

        console.log('Pending:', pending.length);
        console.log('Approved:', approved.length);
        console.log('Rejected:', rejected.length);

        setPendingEvents(pending);
        setApprovedEvents(approved);
        setRejectedEvents(rejected);
      }

    } catch (error) {
      console.error('❌ Error fetching fundraising events:', error);
      Alert.alert('Error', 'Failed to load fundraising events');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFundraisingEvents();
    setRefreshing(false);
  };

  /**
   * Approve event
   * Matches web version's handleApprove function
   */
  const handleApprove = async (eventId) => {
    Alert.alert(
      'Approve Fundraising Event',
      'Are you sure you want to approve this fundraising event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setActionLoading(true);

              const response = await apiClient.put(`/api/events/${eventId}/approve`);

              if (response.data.success) {
                Alert.alert('Success', 'Fundraising event approved successfully!');
                await fetchFundraisingEvents(); // Reload data
              } else {
                Alert.alert('Error', response.data.message || 'Failed to approve event');
              }
            } catch (error) {
              console.error('❌ Error approving event:', error);
              Alert.alert('Error', 'Failed to approve event');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  /**
   * Open reject modal
   * Matches web version's openRejectModal function
   */
  const openRejectModal = (event) => {
    setSelectedEvent(event);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  /**
   * Reject event with reason
   * Matches web version's handleReject function
   */
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);

      const response = await apiClient.put(`/api/events/${selectedEvent.id}/reject`, {
        reason: rejectionReason
      });

      if (response.data.success) {
        Alert.alert('Success', 'Fundraising event rejected');
        setRejectModalVisible(false);
        setSelectedEvent(null);
        setRejectionReason('');
        await fetchFundraisingEvents(); // Reload data
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reject event');
      }
    } catch (error) {
      console.error('❌ Error rejecting event:', error);
      Alert.alert('Error', 'Failed to reject event');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Open view details modal
   */
  const openViewModal = (event) => {
    setSelectedEvent(event);
    setViewModalVisible(true);
  };

  /**
   * Format date helper (matches web version)
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Get status badge configuration
   */
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#faad14', icon: 'clock-outline', text: 'Pending' },
      approved: { color: '#52c41a', icon: 'check-circle', text: 'Approved' },
      rejected: { color: '#ff4d4f', icon: 'close-circle', text: 'Rejected' }
    };
    return badges[status] || badges.pending;
  };

  /**
   * Render tabs (matches web version's tabs)
   */
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
        onPress={() => setActiveTab('pending')}
      >
        <MaterialCommunityIcons 
          name="clock-outline" 
          size={20} 
          color={activeTab === 'pending' ? theme.colors.primary : theme.colors.textSecondary} 
        />
        <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
          Pending ({pendingEvents.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'approved' && styles.tabActive]}
        onPress={() => setActiveTab('approved')}
      >
        <MaterialCommunityIcons 
          name="check-circle" 
          size={20} 
          color={activeTab === 'approved' ? theme.colors.success : theme.colors.textSecondary} 
        />
        <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
          Approved ({approvedEvents.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'rejected' && styles.tabActive]}
        onPress={() => setActiveTab('rejected')}
      >
        <MaterialCommunityIcons 
          name="close-circle" 
          size={20} 
          color={activeTab === 'rejected' ? theme.colors.error : theme.colors.textSecondary} 
        />
        <Text style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}>
          Rejected ({rejectedEvents.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render single event card (matches web renderEventCard)
   */
  const renderEventCard = (event, showActions = false) => {
    const statusBadge = getStatusBadge(event.approval_status);

    return (
      <View key={event.id} style={styles.eventCard}>
        {/* Header with tags */}
        <View style={styles.eventHeader}>
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: '#fff7e6' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={16} color="#fa8c16" />
              <Text style={[styles.tagText, { color: '#fa8c16' }]}>Fundraising</Text>
            </View>
            
            <View style={[styles.tag, { backgroundColor: statusBadge.color + '20' }]}>
              <MaterialCommunityIcons name={statusBadge.icon} size={16} color={statusBadge.color} />
              <Text style={[styles.tagText, { color: statusBadge.color }]}>{statusBadge.text}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.eventTitle}>{event.title}</Text>

        {/* Event info */}
        <View style={styles.eventInfo}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="mosque" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{event.mosque_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Created by: {event.creator_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{formatDate(event.event_date)}</Text>
          </View>

          {event.event_time && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{event.event_time}</Text>
            </View>
          )}

          {event.location && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {event.description}
        </Text>

        {/* Rejection reason (if rejected) */}
        {event.rejection_reason && (
          <View style={styles.rejectionReasonBox}>
            <Text style={styles.rejectionReasonLabel}>Rejection Reason:</Text>
            <Text style={styles.rejectionReasonText}>{event.rejection_reason}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => openViewModal(event)}
          >
            <MaterialCommunityIcons name="eye-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>

          {showActions && event.approval_status === 'pending' && (
            <View style={styles.approvalButtons}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApprove(event.id)}
                disabled={actionLoading}
              >
                <MaterialCommunityIcons name="check" size={20} color={theme.colors.white} />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => openRejectModal(event)}
                disabled={actionLoading}
              >
                <MaterialCommunityIcons name="close" size={20} color={theme.colors.white} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="cash-off" size={64} color={theme.colors.textLight} />
      <Text style={styles.emptyText}>
        {activeTab === 'pending' && 'No pending fundraising events'}
        {activeTab === 'approved' && 'No approved fundraising events'}
        {activeTab === 'rejected' && 'No rejected fundraising events'}
      </Text>
    </View>
  );

  /**
   * Get events for current tab
   */
  const getCurrentTabEvents = () => {
    switch (activeTab) {
      case 'pending':
        return pendingEvents;
      case 'approved':
        return approvedEvents;
      case 'rejected':
        return rejectedEvents;
      default:
        return [];
    }
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout title="Fundraising Events Approval">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading fundraising events...</Text>
        </View>
      </MainLayout>
    );
  }

  const currentEvents = getCurrentTabEvents();

  return (
    <MainLayout title="Fundraising Events Approval">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={styles.titleSection}>
            <MaterialCommunityIcons name="cash-multiple" size={32} color={theme.colors.success} />
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>Fundraising Events Approval</Text>
              <Text style={styles.subtitle}>Review and approve fundraising events from mosques</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        {renderTabs()}

        {/* Events list */}
        <ScrollView
          style={styles.eventsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {currentEvents.length > 0 ? (
            currentEvents.map(event => 
              renderEventCard(event, activeTab === 'pending')
            )
          ) : (
            renderEmptyState()
          )}
        </ScrollView>

        {/* View Details Modal */}
        <Modal
          visible={viewModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setViewModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event Details</Text>
                <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {selectedEvent && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Title:</Text>
                      <Text style={styles.detailValue}>{selectedEvent.title}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mosque:</Text>
                      <Text style={styles.detailValue}>{selectedEvent.mosque_name}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created By:</Text>
                      <Text style={styles.detailValue}>{selectedEvent.creator_name}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedEvent.event_date)}</Text>
                    </View>

                    {selectedEvent.event_time && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time:</Text>
                        <Text style={styles.detailValue}>{selectedEvent.event_time}</Text>
                      </View>
                    )}

                    {selectedEvent.location && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Location:</Text>
                        <Text style={styles.detailValue}>{selectedEvent.location}</Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusBadge(selectedEvent.approval_status).color }]}>
                        <Text style={styles.statusBadgeText}>{getStatusBadge(selectedEvent.approval_status).text}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRowFull}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValueFull}>{selectedEvent.description}</Text>
                    </View>

                    {selectedEvent.rejection_reason && (
                      <View style={styles.detailRowFull}>
                        <Text style={styles.detailLabel}>Rejection Reason:</Text>
                        <Text style={[styles.detailValueFull, { color: theme.colors.error }]}>
                          {selectedEvent.rejection_reason}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>

              {selectedEvent?.approval_status === 'pending' && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalApproveButton]}
                    onPress={() => {
                      handleApprove(selectedEvent.id);
                      setViewModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalRejectButton]}
                    onPress={() => {
                      setViewModalVisible(false);
                      openRejectModal(selectedEvent);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Reject Modal */}
        <Modal
          visible={rejectModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setRejectModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlayCenter}
          >
            <TouchableOpacity 
              style={styles.modalOverlayCenter} 
              activeOpacity={1}
              onPress={() => setRejectModalVisible(false)}
            >
              <TouchableOpacity 
                activeOpacity={1} 
                onPress={(e) => e.stopPropagation()}
                style={styles.modalContentCenter}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Reject Fundraising Event</Text>
                  <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBodyScrollable}>
                  {selectedEvent && (
                    <>
                      <Text style={styles.rejectLabel}>Event: <Text style={styles.rejectValue}>{selectedEvent.title}</Text></Text>
                      <Text style={styles.rejectLabel}>Mosque: <Text style={styles.rejectValue}>{selectedEvent.mosque_name}</Text></Text>
                      
                      <Text style={[styles.rejectLabel, { marginTop: 16 }]}>Reason for Rejection:</Text>
                      <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={4}
                        placeholder="Please provide a reason for rejecting this fundraising event..."
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        textAlignVertical="top"
                        autoFocus={true}
                      />
                    </>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setRejectModalVisible(false)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalRejectButtonFinal]}
                    onPress={handleReject}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color={theme.colors.white} size="small" />
                    ) : (
                      <Text style={styles.modalButtonText}>Reject Event</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
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
  loadingText: {
    marginTop: 12,
    color: theme.colors.textSecondary,
  },
  pageHeader: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.small,
  },
  eventHeader: {
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  eventInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  rejectionReasonBox: {
    backgroundColor: '#fff1f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
  },
  rejectionReasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  actionButtons: {
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 6,
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: theme.colors.success,
    borderRadius: 8,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 6,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalContentCenter: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalBodyScrollable: {
    padding: 20,
    maxHeight: 300,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailRowFull: {
    marginBottom: 16,
  },
  detailValueFull: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  statusBadgeSmall: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalApproveButton: {
    backgroundColor: theme.colors.success,
  },
  modalRejectButton: {
    backgroundColor: theme.colors.error,
  },
  modalCancelButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalRejectButtonFinal: {
    backgroundColor: theme.colors.error,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rejectLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  rejectValue: {
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    marginTop: 8,
  },
});

export default ApproveFundraisingScreen;