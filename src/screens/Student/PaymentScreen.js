// Payment Screen - Handles Stripe Checkout with proper verification
// Detects success URL and calls backend to verify payment and enroll student
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
  const webViewRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Handle WebView navigation state changes
  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;
    setCurrentUrl(url);
    
    console.log('🌐 WebView URL:', url);

    // ✅ Check if payment was successful
    if (url.includes('/payment/success')) {
      console.log('✅ Payment SUCCESS detected!');
      
      // Extract session_id from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const returnedSessionId = urlParams.get('session_id');
      
      console.log('🆔 Session ID from URL:', returnedSessionId);
      console.log('🆔 Original Session ID:', sessionId);
      
      // Verify payment and enroll
      await handlePaymentSuccess(returnedSessionId || sessionId);
      return;
    }

    // ❌ Check if payment was cancelled
    if (url.includes('payment=cancelled')) {
      console.log('❌ Payment CANCELLED detected');
      handlePaymentCancel();
      return;
    }
  };

  // Verify payment with backend and complete enrollment
  const handlePaymentSuccess = async (verifySessionId) => {
    try {
      setProcessing(true);
      console.log('🔍 Verifying payment with backend...');
      console.log('Session ID:', verifySessionId);

      // Call backend to complete enrollment after payment
      // ⭐ This endpoint: verifies payment, saves to PAYMENT table, enrolls student
      const response = await apiClient.post('/api/enrollment/complete-payment', {
        sessionId: verifySessionId
      });
      
      console.log('✅ Verification response:', response.data);

      if (response.data.success) {
        // Payment verified and student enrolled!
        Alert.alert(
          'Payment Successful! 🎉',
          `You have been enrolled in ${courseName}`,
          [
            {
              text: 'View My Enrollments',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    { name: 'Home' },
                    { name: 'MyEnrollments' }
                  ],
                });
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }

    } catch (error) {
      console.error('❌ Payment verification error:', error);
      console.error('Error response:', error.response?.data);
      
      Alert.alert(
        'Enrollment Error',
        'Payment was successful but enrollment failed. Please contact support.',
        [
          {
            text: 'Contact Support',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Try Again',
            onPress: () => handlePaymentSuccess(verifySessionId)
          }
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    Alert.alert(
      'Payment Cancelled',
      'You have cancelled the payment process.',
      [
        {
          text: 'Try Again',
          onPress: () => webViewRef.current?.reload()
        },
        {
          text: 'Go Back',
          onPress: () => navigation.goBack(),
          style: 'cancel'
        }
      ]
    );
  };

  // Handle WebView errors
  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView error:', nativeEvent);
    
    // Don't show error if we're processing a successful payment
    if (processing) {
      return;
    }

    // Don't show error for localhost URLs (they're expected to fail)
    if (nativeEvent.url && nativeEvent.url.includes('localhost')) {
      console.log('ℹ️ Localhost URL detected, this is expected');
      return;
    }

    Alert.alert(
      'Loading Error',
      'Failed to load payment page. Please check your internet connection.',
      [
        {
          text: 'Retry',
          onPress: () => webViewRef.current?.reload()
        },
        {
          text: 'Cancel',
          onPress: () => navigation.goBack(),
          style: 'cancel'
        }
      ]
    );
  };

  // Handle manual cancel
  const handleManualCancel = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment?',
      [
        {
          text: 'No, Continue',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          onPress: () => navigation.goBack(),
          style: 'destructive'
        }
      ]
    );
  };

  // Show processing overlay
  if (processing) {
    return (
      <MainLayout title="Processing Payment">
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.processingText}>Verifying payment...</Text>
          <Text style={styles.processingSubtext}>Please wait</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Secure Payment">
      <View style={styles.container}>
        {/* Header with security badge */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.success} />
          <Text style={styles.headerText}>Secure Payment via Stripe</Text>
        </View>

        {/* WebView for Stripe Checkout */}
        <WebView
          ref={webViewRef}
          source={{ uri: sessionUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleWebViewError}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading secure payment...</Text>
            </View>
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          style={styles.webview}
        />

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleManualCancel}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="close" size={20} color={theme.colors.error} />
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
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
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
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  processingText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  processingSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    fontWeight: '500',
  },
});

export default PaymentScreen;