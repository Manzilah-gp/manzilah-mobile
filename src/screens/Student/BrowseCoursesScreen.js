// Browse Courses Screen - Student can browse all available courses with filters
// Matches website with filters: search, course type, price (free/paid), governorate
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
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const BrowseCoursesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all'); // all, free, paid
  const [selectedGovernorate, setSelectedGovernorate] = useState('all');
  
  // Filter options from backend
  const [courseTypes, setCourseTypes] = useState([]);
  const [governorates, setGovernorates] = useState([]);

  // Load courses on mount and when filters change
  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [selectedType, selectedPrice, selectedGovernorate]);

  // Fetch filter options
  const loadFilterOptions = async () => {
    try {
      const response = await apiClient.get('/api/public/filter-options');
      setCourseTypes(response.data.data.course_types || []);
      setGovernorates(response.data.data.governorates || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // Fetch courses from API
  const loadCourses = async () => {
    try {
      setLoading(true);
      
      const params = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (selectedType !== 'all') {
        params.course_type = selectedType;
      }
      
      if (selectedPrice !== 'all') {
        params.price_filter = selectedPrice; // 'free' or 'paid'
      }
      
      if (selectedGovernorate !== 'all') {
        params.governorate = selectedGovernorate;
      }
      
      const response = await apiClient.get('/api/public/courses', { params });
      setCourses(response.data.data || []);
      
    } catch (error) {
      console.error('Error loading courses:', error);
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  // Handle search
  const handleSearch = () => {
    loadCourses();
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    loadCourses();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedPrice('all');
    setSelectedGovernorate('all');
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.textSecondary} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search courses..."
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

  // Render filters
  const renderFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filtersScrollContainer}
      contentContainerStyle={styles.filtersContainer}
    >
      {/* Course Type Filter */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Type</Text>
        <View style={styles.filterPickerContainer}>
          <Picker
            selectedValue={selectedType}
            onValueChange={setSelectedType}
            style={styles.filterPicker}
          >
            <Picker.Item label="All Types" value="all" />
            {courseTypes.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Price Filter */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Price</Text>
        <View style={styles.filterPickerContainer}>
          <Picker
            selectedValue={selectedPrice}
            onValueChange={setSelectedPrice}
            style={styles.filterPicker}
          >
            <Picker.Item label="All Prices" value="all" />
            <Picker.Item label="Free" value="free" />
            <Picker.Item label="Paid" value="paid" />
          </Picker>
        </View>
      </View>

      {/* Governorate Filter */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Location</Text>
        <View style={styles.filterPickerContainer}>
          <Picker
            selectedValue={selectedGovernorate}
            onValueChange={setSelectedGovernorate}
            style={styles.filterPicker}
          >
            <Picker.Item label="All Locations" value="all" />
            {governorates.map((gov) => (
              <Picker.Item key={gov} label={gov} value={gov} />
            ))}
          </Picker>
        </View>
      </View>
    </ScrollView>
  );

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedPrice !== 'all' || selectedGovernorate !== 'all';

  // Render active filters summary
  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {searchQuery && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>Search: {searchQuery}</Text>
            </View>
          )}
          {selectedType !== 'all' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>Type: {selectedType}</Text>
            </View>
          )}
          {selectedPrice !== 'all' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                {selectedPrice === 'free' ? 'Free Only' : 'Paid Only'}
              </Text>
            </View>
          )}
          {selectedGovernorate !== 'all' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>Location: {selectedGovernorate}</Text>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render single course card
  const renderCourse = ({ item }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
      activeOpacity={0.7}
    >
      {/* Course Icon */}
      <View style={styles.courseIconContainer}>
        <MaterialCommunityIcons 
          name={item.course_type === 'memorization' ? 'book-open-variant' : 'book-open'} 
          size={32} 
          color={theme.colors.primary} 
        />
      </View>

      {/* Course Info */}
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        
        {/* Mosque */}
        <View style={styles.courseMetaRow}>
          <MaterialCommunityIcons name="mosque" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.courseMetaText}>{item.mosque_name}</Text>
        </View>

        {/* Course Type */}
        <View style={styles.courseMetaRow}>
          <MaterialCommunityIcons name="tag" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.courseMetaText}>{item.course_type_name || item.course_type}</Text>
        </View>

        {/* Teacher */}
        {item.teacher_name && (
          <View style={styles.courseMetaRow}>
            <MaterialCommunityIcons name="account-tie" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.courseMetaText}>{item.teacher_name}</Text>
          </View>
        )}

        {/* Location */}
        <View style={styles.courseMetaRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.courseMetaText}>{item.governorate}</Text>
        </View>

        {/* Footer with Price & Capacity */}
        <View style={styles.courseFooter}>
          {/* Price */}
          <View style={[
            styles.priceBadge,
            { backgroundColor: item.price_cents === 0 ? theme.colors.success : theme.colors.primary }
          ]}>
            <Text style={styles.priceText}>
              {item.price_cents === 0 ? 'FREE' : `₪${(item.price_cents / 100).toFixed(0)}`}
            </Text>
          </View>

          {/* Capacity */}
          {item.current_enrollment !== undefined && (
            <View style={styles.capacityInfo}>
              <MaterialCommunityIcons name="account-group" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.capacityText}>
                {item.current_enrollment}/{item.capacity || '∞'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow */}
      <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="book-open-outline" size={64} color={theme.colors.textLight} />
      <Text style={styles.emptyText}>
        {hasActiveFilters ? 'No courses match your filters' : 'No courses available'}
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Show loading indicator
  if (loading && !refreshing) {
    return (
      <MainLayout title="Browse Courses">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Browse Courses">
      <View style={styles.container}>
        {renderSearchBar()}
        {renderFilters()}
        {renderActiveFilters()}

        <FlatList
          data={courses}
          renderItem={renderCourse}
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
  filtersScrollContainer: {
    marginBottom: theme.spacing.sm,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  filterItem: {
    marginRight: theme.spacing.sm,
    minWidth: 120,
  },
  filterLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  filterPickerContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  filterPicker: {
    height: 40,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
  },
  activeFilterText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '600',
  },
  clearFiltersButton: {
    marginLeft: theme.spacing.sm,
  },
  clearFiltersText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  courseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  courseMetaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  priceBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  priceText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.white,
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
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
    textAlign: 'center',
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

export default BrowseCoursesScreen;