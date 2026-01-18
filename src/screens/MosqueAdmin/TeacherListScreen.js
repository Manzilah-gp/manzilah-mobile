// Mosque Admin Teacher List Screen - Manage teachers with search and filters
// Matches the web TeacherListPage functionality
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const TeacherListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teachers, setTeachers] = useState([]);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  
  // Delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  /**
   * Fetch teachers list
   * Matches backend: GET /teacher-management
   */
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/api/teachers');
      
      console.log('Teachers loaded:', response.data?.length);
      
      setTeachers(response.data || []);
      
    } catch (error) {
      console.error('Error fetching teachers:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      Alert.alert('Error', 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
    setRefreshing(false);
  };

  /**
   * Handle status toggle
   * Matches backend: PATCH /teacher-management/:teacherId/status
   */
  const handleStatusChange = async (checked, teacher) => {
    const newStatus = checked ? 1 : 0;
    
    try {
      await apiClient.patch(`/api/teachers/${teacher.id}/status`, { 
        is_active: newStatus 
      });
      
      Alert.alert('Success', `Teacher ${checked ? 'activated' : 'deactivated'} successfully`);
      
      // Optimistic update
      setTeachers(prev => prev.map(t =>
        t.id === teacher.id ? { ...t, is_active: newStatus } : t
      ));
      
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
      fetchTeachers(); // Revert on failure
    }
  };

  /**
   * Handle delete teacher
   */
  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;

    try {
      await apiClient.delete(`/api/teachers/${selectedTeacher.id}`);
      
      Alert.alert('Success', 'Teacher removed successfully');
      
      setDeleteModalVisible(false);
      setSelectedTeacher(null);
      fetchTeachers();
      
    } catch (error) {
      console.error('Error removing teacher:', error);
      Alert.alert('Error', 'Failed to remove teacher');
    }
  };

  /**
   * Navigate to teacher details
   */
  const handleViewDetails = (teacherId) => {
    navigation.navigate('TeacherDetails', { teacherId });
  };

  /**
   * Filtered teachers (matches web filtering logic)
   */
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch =
        teacher.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.phone?.includes(searchText);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && teacher.is_active) ||
        (statusFilter === 'inactive' && !teacher.is_active);

      const matchesGender =
        genderFilter === 'all' ||
        teacher.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [teachers, searchText, statusFilter, genderFilter]);

  /**
   * Calculate statistics (matches web stats)
   */
  const stats = useMemo(() => {
    return {
      total: teachers.length,
      active: teachers.filter(t => t.is_active).length,
      inactive: teachers.filter(t => !t.is_active).length
    };
  }, [teachers]);

  /**
   * Render statistics cards
   */
  const renderStatistics = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, styles.statCardTotal]}>
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Teachers</Text>
      </View>
      
      <View style={[styles.statCard, styles.statCardActive]}>
        <Text style={styles.statNumber}>{stats.active}</Text>
        <Text style={styles.statLabel}>Active Teachers</Text>
      </View>
      
      <View style={[styles.statCard, styles.statCardInactive]}>
        <Text style={styles.statNumber}>{stats.inactive}</Text>
        <Text style={styles.statLabel}>Inactive Teachers</Text>
      </View>
    </View>
  );

  /**
   * Render search and filters
   */
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={20} 
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email or phone"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={theme.colors.textSecondary}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialCommunityIcons 
              name="close-circle" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>

    

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchTeachers}
        disabled={loading}
      >
        <MaterialCommunityIcons 
          name="refresh" 
          size={20} 
          color={theme.colors.white} 
        />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render single teacher card
   */
  const renderTeacher = ({ item }) => (
    <View style={styles.teacherCard}>
      {/* Header */}
      <View style={styles.teacherHeader}>
        <View style={styles.teacherIconContainer}>
          <MaterialCommunityIcons 
            name={item.gender === 'male' ? 'account' : 'account-outline'} 
            size={32} 
            color={item.gender === 'male' ? '#1890ff' : '#eb2f96'} 
          />
        </View>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{item.full_name}</Text>
          <View style={styles.genderBadge}>
            <Text style={[
              styles.genderText,
              { color: item.gender === 'male' ? '#1890ff' : '#eb2f96' }
            ]}>
              {item.gender ? item.gender.charAt(0).toUpperCase() + item.gender.slice(1) : '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Details */}
      <View style={styles.teacherDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="email" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        
        {item.phone && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
        )}
      </View>

      {/* Status Toggle */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View style={styles.statusSwitchContainer}>
          <Text style={[
            styles.statusText,
            item.is_active ? styles.statusTextActive : styles.statusTextInactive
          ]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
          <Switch
            value={!!item.is_active}
            onValueChange={(checked) => handleStatusChange(checked, item)}
            trackColor={{ false: '#d9d9d9', true: '#52c41a' }}
            thumbColor={theme.colors.white}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewDetails(item.id)}
        >
          <MaterialCommunityIcons name="eye" size={18} color={theme.colors.primary} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteClick(item)}
        >
          <MaterialCommunityIcons name="delete" size={18} color={theme.colors.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="account-off" size={64} color={theme.colors.textLight} />
      <Text style={styles.emptyText}>
        {searchText || statusFilter !== 'all' || genderFilter !== 'all'
          ? 'No teachers match your filters'
          : 'No teachers found'}
      </Text>
      {(searchText || statusFilter !== 'all' || genderFilter !== 'all') && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={() => {
            setSearchText('');
            setStatusFilter('all');
            setGenderFilter('all');
          }}
        >
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <MainLayout title="Teacher Management">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading teachers...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Teacher Management">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Teacher Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage teachers detailed information and status
          </Text>
        </View>

        {/* Statistics */}
        {renderStatistics()}

        {/* Filters */}
        {renderFilters()}

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </Text>

        {/* Teachers List */}
        <FlatList
          data={filteredTeachers}
          renderItem={renderTeacher}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

        {/* Delete Confirmation Modal */}
        <Modal
          visible={deleteModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={48} 
                  color={theme.colors.error} 
                />
                <Text style={styles.modalTitle}>Confirm Removal</Text>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Are you sure you want to remove{' '}
                  <Text style={styles.modalTextBold}>{selectedTeacher?.full_name}</Text>
                  {' '}from this mosque?
                </Text>
                <Text style={styles.modalSubtext}>
                  This action will remove their role assignment but not delete their user account.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleConfirmDelete}
                >
                  <Text style={styles.modalConfirmButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
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
  header: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 4,
    minHeight: 100,
    ...theme.shadows.small,
  },
  statCardTotal: {
    borderLeftColor: '#1890ff',
  },
  statCardActive: {
    borderLeftColor: '#52c41a',
  },
  statCardInactive: {
    borderLeftColor: '#d9d9d9',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    ...theme.shadows.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterColumn: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#1f4788',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 8,
  },
  resultsCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  teacherCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teacherIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1890ff',
    marginBottom: 6,
  },
  genderBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  teacherDetails: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: 10,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#52c41a',
  },
  statusTextInactive: {
    color: '#8c8c8c',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  viewButton: {
    borderColor: '#1890ff',
    backgroundColor: '#e6f7ff',
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1890ff',
    marginLeft: 6,
  },
  deleteButton: {
    borderColor: '#ff4d4f',
    backgroundColor: '#fff1f0',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff4d4f',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 20,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#1890ff',
  },
  clearFiltersText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1890ff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    ...theme.shadows.small,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
  },
  modalBody: {
    padding: 24,
  },
  modalText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalTextBold: {
    fontWeight: '700',
    color: '#1890ff',
  },
  modalSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalConfirmButton: {
    backgroundColor: '#ff4d4f',
    ...theme.shadows.small,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

export default TeacherListScreen;