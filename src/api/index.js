// Main API file - exports admin and events functions
// Location: /src/api/index.js
import apiClient from './client';

// ================================================================
// EVENTS ENDPOINTS
// ================================================================

// Get all events with optional filters
export const getEvents = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/events', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get events from user's enrolled mosques
export const getMyEnrolledMosquesEvents = async () => {
  try {
    const response = await apiClient.get('/api/events/my-enrolled-mosques');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get detailed enrollment information
export const getEnrollmentDetails = async (enrollmentId) => {
  try {
    const response = await apiClient.get(`/api/enrollment/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mosque admin's events
export const getMyMosqueEvents = async () => {
  try {
    const response = await apiClient.get('/api/events/my-mosque-events');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get specific event details
export const getEventById = async (eventId) => {
  try {
    const response = await apiClient.get(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new event (mosque admin only)
export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/api/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update event (mosque admin only)
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await apiClient.put(`/api/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete event (mosque admin only)
export const deleteEvent = async (eventId) => {
  try {
    const response = await apiClient.delete(`/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve event (ministry admin only)
export const approveEvent = async (eventId) => {
  try {
    const response = await apiClient.put(`/api/events/${eventId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject event (ministry admin only)
export const rejectEvent = async (eventId, reason) => {
  try {
    const response = await apiClient.put(`/api/events/${eventId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// RSVP to event
export const rsvpEvent = async (eventId, status) => {
  try {
    const response = await apiClient.post(`/api/events/${eventId}/rsvp`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Like event
export const likeEvent = async (eventId) => {
  try {
    const response = await apiClient.post(`/api/events/${eventId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unlike event
export const unlikeEvent = async (eventId) => {
  try {
    const response = await apiClient.delete(`/api/events/${eventId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Comment on event
export const commentOnEvent = async (eventId, comment) => {
  try {
    const response = await apiClient.post(`/api/events/${eventId}/comment`, { comment });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ================================================================
// FUNDRAISING / DONATION ENDPOINTS
// ================================================================

// Get donations for specific event
export const getEventDonations = async (eventId) => {
  try {
    const response = await apiClient.get(`/api/donations/event/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get donation statistics for event
export const getEventDonationStats = async (eventId) => {
  try {
    const response = await apiClient.get(`/api/donations/event/${eventId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update fundraising goal (admin only)
export const updateFundraisingGoal = async (eventId, goal) => {
  try {
    const response = await apiClient.put(`/api/donations/event/${eventId}/goal`, { goal });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create payment intent for donation
export const createDonationPaymentIntent = async (donationData) => {
  try {
    const response = await apiClient.post('/api/donations/create-payment-intent', donationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Confirm donation after payment
export const confirmDonation = async (paymentIntentId, donationData) => {
  try {
    const response = await apiClient.post('/api/donations/confirm', {
      paymentIntentId,
      ...donationData
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ================================================================
// MOSQUE ENDPOINTS
// ================================================================

// Get all mosques
export const getAllMosques = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/mosques', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get specific mosque details
export const getMosqueById = async (mosqueId) => {
  try {
    const response = await apiClient.get(`/api/mosques/${mosqueId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search mosques
export const searchMosques = async (query) => {
  try {
    const response = await apiClient.get('/api/mosques/search', { params: { query } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mosque statistics
export const getMosqueStatistics = async (mosqueId) => {
  try {
    const response = await apiClient.get(`/api/statistics/mosque/${mosqueId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update mosque (ministry admin only)
export const updateMosque = async (mosqueId, mosqueData) => {
  try {
    const response = await apiClient.put(`/api/mosques/${mosqueId}`, mosqueData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ================================================================
// PROFILE ENDPOINTS
// ================================================================

// Get complete user profile with role-specific data
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/api/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user basic information
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/api/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user location
export const updateUserLocation = async (locationData) => {
  try {
    const response = await apiClient.put('/api/profile/location', locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};