// Browse Mosques Screen - Student can browse all mosques with filters
// Matches website functionality with search and governorate filter
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const BrowseMosquesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mosques, setMosques] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('all');
  const [governorates, setGovernorates] = useState([]);

  // Load mosques on mount and when filters change
  useEffect(() => {
    loadMosques();
  }, [selectedGovernorate]);

  // Fetch mosques from API
  const loadMosques = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (selectedGovernorate !== 'all') {
        params.governorate = selectedGovernorate;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await apiClient.get('/api/public/mosques', { params });
      
      setMosques(response.data.data || []);
      
      // Extract unique governorates for filter
      if (response.data.data) {
        const uniqueGovernorates = [...new Set(response.data.data.map(m => m.governorate))];
        setGovernorates(uniqueGovernorates);
      }
      
    } catch (error) {
      console.error('Error loading mosques:', error);
      Alert.alert('Error', 'Failed to load mosques');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMosques();
    setRefreshing(false);
  };

  // Handle search
  const handleSearch = () => {
    loadMosques();
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    loadMosques();
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.textSecondary} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search mosques..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={clearSearch}>
          <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Render governorate filter
  const renderFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Governorate:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedGovernorate}
          onValueChange={(value) => setSelectedGovernorate(value)}
          style={styles.picker}
        >
          <Picker.Item label="All Governorates" value="all" />
          {governorates.map((gov) => (
            <Picker.Item key={gov} label={gov} value={gov} />
          ))}
        </Picker>
      </View>
    </View>
  );

  // Render single mosque card
  const renderMosque = ({ item }) => (
    <TouchableOpacity
      style={styles.mosqueCard}
      onPress={() => navigation.navigate('MosqueDetails', { mosqueId: item.id })}
      activeOpacity={0.7}
    >
      {/* Mosque Icon */}
      <View style={styles.mosqueIconContainer}>
        <MaterialCommunityIcons name="mosque" size={40} color={theme.colors.primary} />
      </View>

      {/* Mosque Info */}
      <View style={styles.mosqueInfo}>
        <Text style={styles.mosqueName}>{item.name}</Text>
        
        {/* Location */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            {item.governorate}, {item.region}
          </Text>
        </View>

        {/* Contact */}
        {item.contact_number && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{item.contact_number}</Text>
          </View>
        )}

        {/* Courses Count */}
        {item.courses_count > 0 && (
          <View style={styles.coursesCountBadge}>
            <MaterialCommunityIcons name="book-multiple" size={16} color={theme.colors.primary} />
            <Text style={styles.coursesCountText}>
              {item.courses_count} course{item.courses_count !== 1 ? 's' : ''} available
            </Text>
          </View>
        )}
      </View>

      {/* Arrow */}
      <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="mosque" size={64} color={theme.colors.textLight} />
      <Text style={styles.emptyText}>
        {searchQuery ? 'No mosques found' : 'No mosques available'}
      </Text>
      {searchQuery && (
        <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
          <Text style={styles.clearButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Show loading indicator
  if (loading) {
    return (
      <MainLayout title="Browse Mosques">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Browse Mosques">
      <View style={styles.container}>
        {renderSearchBar()}
        {renderFilter()}

        <FlatList
          data={mosques}
          renderItem={renderMosque}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  filterContainer: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  filterLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  mosqueCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  mosqueIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  mosqueInfo: {
    flex: 1,
  },
  mosqueName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  coursesCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  coursesCountText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  clearButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  clearButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

export default BrowseMosquesScreen;