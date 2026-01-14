import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Dimensions } from 'react-native';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

/**
 * Component to display a single Quran page image
 * Fixed to ensure images are visible when loaded
 */
const MushafPageImage = ({ uri, pageNumber }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Log the URL being loaded
  console.log(`Loading page ${pageNumber} from:`, uri);

  /**
   * Handle successful image load
   */
  const handleLoadEnd = () => {
    console.log(`✓ Page ${pageNumber} loaded successfully`);
    setLoading(false);
    setError(false);
  };

  /**
   * Handle image loading errors
   */
  const handleError = (e) => {
    console.error(`✗ Failed to load page ${pageNumber}:`, e.nativeEvent?.error || 'Unknown error');
    setLoading(false);
    setError(true);
  };

  /**
   * Retry loading the image
   */
  const handleRetry = () => {
    console.log(`Retrying page ${pageNumber}...`);
    setLoading(true);
    setError(false);
    setRetryCount(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* Always render the image, hide with opacity when loading */}
      <Image
        source={{ uri }}
        style={[styles.image, { opacity: loading ? 0 : 1 }]}
        resizeMode="contain"
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        key={`${uri}-${retryCount}`}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#006D4E" />
          <Text style={styles.loadingText}>Loading page {pageNumber}...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to load page</Text>
          <Text style={styles.errorSubtext}>Page {pageNumber}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: '100%',
    backgroundColor: '#F7F4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    padding: 20,
    zIndex: 10,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 4,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#006D4E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MushafPageImage;