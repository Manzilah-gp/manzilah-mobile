// Payment Screen - Handles Stripe payment for paid courses
// Shows Stripe checkout in WebView and verifies payment
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../../components/Layout/MainLayout';
import apiClient from '../../api/client';
import { theme } from '../../styles/theme';

const PaymentScreen = ({ route }) => {
  const { sessionUrl, sessionId, courseId, courseName } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Handle WebView navigation state changes
  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;
    
    console.log('WebView URL:', url);

    // Check if payment was successful (Stripe redirects to success URL)
    if (url.includes('/payment-success') || url.includes('success=true')) {
      setVerifying(true);
      await verifyPayment();
    }

    // Check if payment was cancelled
    if (url.includes('/payment-cancel') || url.includes('cancelled=true')) {
      Alert.alert(
        'Payment Cancelled',
        'You cancelled the payment. You can try again anytime.',
        [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  // Verify payment with backend
  const verifyPayment = async () => {
    try {
      const response = await apiClient.get(`/api/enrollment/verify-payment/${sessionId}`);
      
      if (response.data.success) {
        Alert.alert(
          'Payment Successful! 🎉',
          `You have been enrolled in "${courseName}"`,
          [
            {
              text: 'View My Enrollments',
              onPress: () => {
                // Navigate to enrollments and reset navigation stack
                navigation.reset({
                  index: 1,
                  routes: [
                    { name: 'Home' },
                    { name: 'MyEnrollments' }
                  ]
                });
              }
            }
          ]
        );
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      Alert.alert(
        'Verification Error',
        'Payment may have succeeded but verification failed. Please contact support.',
        [
          {
            text: 'Go to My Enrollments',
            onPress: () => navigation.navigate('MyEnrollments')
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setVerifying(false);
    }
  };

  // Handle WebView errors
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    Alert.alert(
      'Loading Error',
      'Failed to load payment page. Please check your internet connection.',
      [
        {
          text: 'Retry',
          onPress: () => setLoading(true)
        },
        {
          text: 'Cancel',
          onPress: () => navigation.goBack(),
          style: 'cancel'
        }
      ]
    );
  };

  // Show verifying screen
  if (verifying) {
    return (
      <MainLayout title="Payment">
        <View style={styles.verifyingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.verifyingText}>Verifying payment...</Text>
          <Text style={styles.verifyingSubtext}>Please wait while we confirm your enrollment</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Complete Payment">
      <View style={styles.container}>
        {/* Header Info */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="lock" size={24} color={theme.colors.success} />
          <Text style={styles.headerText}>Secure Payment via Stripe</Text>
        </View>

        {/* WebView for Stripe Checkout */}
        <WebView
          source={{ uri: sessionUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading payment page...</Text>
            </View>
          )}
          style={styles.webview}
        />

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            Alert.alert(
              'Cancel Payment',
              'Are you sure you want to cancel this payment?',
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Yes, Cancel',
                  style: 'destructive',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="close" size={20} color={theme.colors.white} />
          <Text style={styles.cancelButtonText}>Cancel Payment</Text>
        </TouchableOpacity>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  verifyingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  verifyingText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  verifyingSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
});

export default PaymentScreen;