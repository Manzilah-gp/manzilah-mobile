/**
 * NotificationBell Component for Expo
 * Bell icon with badge count for header
 * Place in: src/components/Notifications/NotificationBell.js
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const NotificationBell = ({ navigation, color = '#FFFFFF' }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);

  /**
   * Get user ID from storage
   */
  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
      console.log('👤 User ID for notifications:', id);
    };
    getUserId();
  }, []);

  /**
   * Listen to unread notifications from Firestore
   */
  useEffect(() => {
    if (!userId) return;

    console.log('🔔 Setting up notification listener for user:', userId);

    // Create query for unread notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId.toString()),
      where('isRead', '==', false)
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const count = snapshot.size;
        console.log('📊 Unread notifications:', count);
        setUnreadCount(count);
      },
      (error) => {
        console.error('❌ Firestore listener error:', error);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up notification listener');
      unsubscribe();
    };
  }, [userId]);

  /**
   * Navigate to notifications screen
   */
  const handlePress = () => {
    navigation.navigate('Notifications');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.bellContainer}>
        <Ionicons name="notifications-outline" size={24} color={color} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  bellContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default NotificationBell;