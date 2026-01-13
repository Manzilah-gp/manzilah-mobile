// Create/Edit Event Screen - form for creating or editing events
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import { createEvent, updateEvent, getEventById } from '../../api';
import { theme } from '../../styles/theme';

const CreateEventScreen = ({ route }) => {
  const { eventId } = route?.params || {};
  const isEditMode = !!eventId;
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'regular',
    event_date: new Date(),
    event_time: '',
    location: '',
    capacity: '',
    fundraising_goal_cents: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  // Load event data if editing
  useEffect(() => {
    if (isEditMode) {
      loadEvent();
    }
  }, [eventId]);

  // Fetch event data for editing
  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await getEventById(eventId);
      const event = response.data;
      
      setFormData({
        name: event.name || '',
        description: event.description || '',
        type: event.type || 'regular',
        event_date: event.event_date ? new Date(event.event_date) : new Date(),
        event_time: event.event_time || '',
        location: event.location || '',
        capacity: event.capacity?.toString() || '',
        fundraising_goal_cents: event.fundraising_goal_cents 
          ? (event.fundraising_goal_cents / 100).toString() 
          : '',
      });
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Update form field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.event_time.trim()) {
      newErrors.event_time = 'Event time is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.capacity && isNaN(parseInt(formData.capacity))) {
      newErrors.capacity = 'Capacity must be a number';
    }
    
    if (formData.type === 'fundraising') {
      if (!formData.fundraising_goal_cents) {
        newErrors.fundraising_goal_cents = 'Fundraising goal is required';
      } else if (isNaN(parseFloat(formData.fundraising_goal_cents))) {
        newErrors.fundraising_goal_cents = 'Goal must be a valid number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare data for API
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        event_date: formData.event_date.toISOString().split('T')[0],
        event_time: formData.event_time.trim(),
        location: formData.location.trim(),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };
      
      // Add fundraising goal if event is fundraising type
      if (formData.type === 'fundraising' && formData.fundraising_goal_cents) {
        eventData.fundraising_goal_cents = Math.round(parseFloat(formData.fundraising_goal_cents) * 100);
      }
      
      if (isEditMode) {
        await updateEvent(eventId, eventData);
        Alert.alert('Success', 'Event updated successfully');
      } else {
        await createEvent(eventData);
        Alert.alert('Success', 'Event created successfully');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', error.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateField('event_date', selectedDate);
    }
  };

  // Show loading indicator when editing
  if (loading) {
    return (
      <MainLayout title={isEditMode ? 'Edit Event' : 'Create Event'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEditMode ? 'Edit Event' : 'Create Event'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Event Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Event Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter event name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            placeholder="Enter event description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Event Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Type</Text>
          <View style={[styles.pickerContainer, errors.type && styles.inputError]}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(value) => updateField('type', value)}
              style={styles.picker}
            >
              <Picker.Item label="Regular Event" value="regular" />
              <Picker.Item label="Fundraising Event" value="fundraising" />
            </Picker>
          </View>
        </View>

        {/* Event Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.dateButtonText}>
              {formData.event_date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={formData.event_date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Event Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Event Time <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.event_time && styles.inputError]}
            placeholder="e.g. 10:00 AM"
            value={formData.event_time}
            onChangeText={(value) => updateField('event_time', value)}
          />
          {errors.event_time && <Text style={styles.errorText}>{errors.event_time}</Text>}
        </View>

        {/* Location */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.location && styles.inputError]}
            placeholder="Enter event location"
            value={formData.location}
            onChangeText={(value) => updateField('location', value)}
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        {/* Capacity */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Capacity (Optional)</Text>
          <TextInput
            style={[styles.input, errors.capacity && styles.inputError]}
            placeholder="Enter maximum capacity"
            value={formData.capacity}
            onChangeText={(value) => updateField('capacity', value)}
            keyboardType="numeric"
          />
          {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
        </View>

        {/* Fundraising Goal - Only show if type is fundraising */}
        {formData.type === 'fundraising' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Fundraising Goal (₪) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.fundraising_goal_cents && styles.inputError]}
              placeholder="Enter fundraising goal amount"
              value={formData.fundraising_goal_cents}
              onChangeText={(value) => updateField('fundraising_goal_cents', value)}
              keyboardType="decimal-pad"
            />
            {errors.fundraising_goal_cents && (
              <Text style={styles.errorText}>{errors.fundraising_goal_cents}</Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons 
                name={isEditMode ? 'check' : 'plus'} 
                size={20} 
                color={theme.colors.white} 
              />
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update Event' : 'Create Event'}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  scrollContent: {
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  dateButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
});

export default CreateEventScreen;