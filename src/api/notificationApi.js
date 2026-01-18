/**
 * Notification API Functions
 * All REST API calls for notifications
 * Place in: src/api/notificationApi.js
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

// Helper: Get auth token
const getAuthToken = async () => {
  return await AsyncStorage.getItem('token');
};

// Helper: Create headers
const getHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Save FCM token to backend
 */
export const saveFCMToken = async (fcmToken) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(
      `${API_BASE_URL}/firebase-notifications/fcm-token`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ fcmToken }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error('❌ Save FCM token error:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(
      `${API_BASE_URL}/firebase-notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers,
      }
    );
    return await response.json();
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(
      `${API_BASE_URL}/firebase-notifications/read-all`,
      {
        method: 'PATCH',
        headers,
      }
    );
    return await response.json();
  } catch (error) {
    console.error('❌ Mark all as read error:', error);
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(
      `${API_BASE_URL}/firebase-notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers,
      }
    );
    return await response.json();
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    throw error;
  }
};