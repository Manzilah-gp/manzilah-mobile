/**
 * Notification Service for Expo
 * Handles push notifications using expo-notifications
 * Place in: src/services/notificationService.js
 * 
 * INSTALLATION REQUIRED:
 * npx expo install expo-notifications expo-device expo-constants
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { API_BASE_URL } from '../constants/config';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  notificationListener = null;
  responseListener = null;

  /**
   * Initialize notification service
   * Call this in App.js on mount
   */
  async initialize() {
    console.log('🔔 Initializing Expo notification service...');

    // Register for push notifications
    const token = await this.registerForPushNotifications();
    
    if (token) {
      console.log('✅ Push notification token obtained');
      await this.saveFCMTokenToBackend(token);
    } else {
      console.log('❌ Failed to get push notification token');
    }

    // Setup notification listeners
    this.setupNotificationListeners();
  }

  /**
   * Register for push notifications and get Expo Push Token
   */
  async registerForPushNotifications() {
    try {
      // Check if physical device
      if (!Device.isDevice) {
        console.log('⚠️ Must use physical device for push notifications');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permission not granted for notifications');
        return null;
      }

      // Get Expo Push Token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.error('❌ Project ID not found. Make sure you have run "eas build" at least once.');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('🎫 Expo Push Token:', token.data);

      // For Android, set notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token.data;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Save FCM token to backend
   */
  async saveFCMTokenToBackend(fcmToken) {
    try {
      const authToken = await AsyncStorage.getItem('token');
      
      if (!authToken) {
        console.log('⚠️ No auth token, skipping FCM token save');
        return;
      }

      console.log('💾 Saving push token to backend...');

      const response = await fetch(
        `${API_BASE_URL}/firebase-notifications/fcm-token`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fcmToken }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Push token saved to backend');
        await AsyncStorage.setItem('fcm_token', fcmToken);
      } else {
        console.error('❌ Failed to save push token:', data);
      }
    } catch (error) {
      console.error('❌ Save push token error:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received in foreground:', notification);
      // Notification is automatically displayed by Expo
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      this.handleNotificationTap(response);
    });

    console.log('✅ Notification listeners setup complete');
  }

  /**
   * Handle notification tap
   * Navigate to appropriate screen based on notification data
   */
  handleNotificationTap(response) {
    const data = response.notification.request.content.data;
    
    if (data?.link) {
      console.log('🔗 Should navigate to:', data.link);
      // You'll add navigation logic here
      // Example: navigationRef.navigate(data.link);
    }
  }

  /**
   * Schedule a local notification (for testing)
   */
  async scheduleLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
      console.log('✅ Local notification scheduled');
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount() {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      console.error('❌ Get badge count error:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('✅ Badge count set to:', count);
    } catch (error) {
      console.error('❌ Set badge count error:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
      console.log('✅ All notifications cleared');
    } catch (error) {
      console.error('❌ Clear notifications error:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.notificationListener) {
    }
    if (this.responseListener) {
    }
    console.log('🧹 Notification listeners cleaned up');
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;