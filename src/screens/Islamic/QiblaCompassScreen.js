// src/screens/Islamic/QiblaCompassScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { getQiblaDirection } from '../../api/islamicService';

// Screen for displaying Qibla compass direction
const QiblaCompassScreen = ({ navigation }) => {
  
  // Add back button handler
  const handleGoBack = () => {
    navigation.goBack();
  };
  const [loading, setLoading] = useState(true);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [heading, setHeading] = useState(0);
  const [location, setLocation] = useState(null);
  const [subscription, setSubscription] = useState(null);
  
  const rotateValue = new Animated.Value(0);

  // Initialize compass and location
  useEffect(() => {
    initializeQibla();
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Update compass rotation when heading changes
  useEffect(() => {
    rotateCompass();
  }, [heading, qiblaAngle]);

  // Initialize Qibla finder
  const initializeQibla = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for Qibla direction.');
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });

      // Fetch Qibla direction from API
      const response = await getQiblaDirection(latitude, longitude);
      if (response.success) {
        setQiblaAngle(response.data.direction);
      }

      // Start magnetometer for compass
      startMagnetometer();
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing Qibla:', error);
      Alert.alert('Error', 'Failed to initialize Qibla compass.');
      setLoading(false);
    }
  };

  // Start listening to device magnetometer
  const startMagnetometer = () => {
    Magnetometer.setUpdateInterval(100);
    
    const sub = Magnetometer.addListener((data) => {
      const angle = calculateHeading(data);
      setHeading(angle);
    });
    
    setSubscription(sub);
  };

  // Calculate heading from magnetometer data
  const calculateHeading = (magnetometerData) => {
    const { x, y } = magnetometerData;
    
    if (x === 0 && y === 0) return 0;
    
    // Calculate angle: atan2 gives angle from positive x-axis
    let angle = Math.atan2(-y, x) * (180 / Math.PI);
    
    // Convert to 0-360 range (0 = North, 90 = East, 180 = South, 270 = West)
    angle = (angle + 360) % 360;
    
    return angle;
  };

  // Rotate compass needle smoothly
  const rotateCompass = () => {
    // Calculate the shortest rotation path to Qibla
    let direction = (qiblaAngle - heading + 360) % 360;
    
    // If rotation is more than 180°, go the shorter way
    if (direction > 180) {
      direction = direction - 360;
    }
    
    Animated.spring(rotateValue, {
      toValue: direction,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Calculate relative Qibla direction
  const getRelativeDirection = () => {
    const diff = (qiblaAngle - heading + 360) % 360;
    
    if (diff < 10 || diff > 350) return 'Straight ahead';
    if (diff > 10 && diff < 80) return 'Slightly right';
    if (diff >= 80 && diff <= 100) return 'Right';
    if (diff > 100 && diff < 170) return 'Far right';
    if (diff >= 170 && diff <= 190) return 'Behind you';
    if (diff > 190 && diff < 260) return 'Far left';
    if (diff >= 260 && diff <= 280) return 'Left';
    if (diff > 280 && diff < 350) return 'Slightly left';
    
    return 'Calculating...';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Calibrating compass...</Text>
      </View>
    );
  }

  const rotation = rotateValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Qibla Direction</Text>
        <Text style={styles.subtitle}>Face towards Mecca</Text>
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Compass Container */}
      <View style={styles.compassContainer}>
        {/* Compass Circle */}
        <View style={styles.compassCircle}>
          {/* Cardinal Directions */}
          <Text style={[styles.cardinalDirection, styles.north]}>N</Text>
          <Text style={[styles.cardinalDirection, styles.east]}>E</Text>
          <Text style={[styles.cardinalDirection, styles.south]}>S</Text>
          <Text style={[styles.cardinalDirection, styles.west]}>W</Text>
          
          {/* Qibla Needle */}
          <Animated.View
            style={[
              styles.needle,
              { transform: [{ rotate: rotation }] },
            ]}
          >
            <View style={styles.needlePoint} />
            <View style={styles.needleBase} />
          </Animated.View>
        </View>
        
        {/* Center Kaaba Icon */}
        <View style={styles.centerIcon}>
          <Text style={styles.kaabaEmoji}>🕋</Text>
        </View>
      </View>

      {/* Direction Info */}
      <View style={styles.directionInfo}>
        <Text style={styles.directionLabel}>Qibla Direction:</Text>
        <Text style={styles.directionValue}>{getRelativeDirection()}</Text>
        <Text style={styles.angleText}>{qiblaAngle.toFixed(1)}° from North</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>How to use:</Text>
        <Text style={styles.instructionText}>
          1. Hold your device flat{'\n'}
          2. Rotate slowly until the needle points up{'\n'}
          3. Face the direction indicated{'\n'}
          4. Calibrate by moving in a figure-8 pattern
        </Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Compass accuracy depends on device sensors and magnetic interference.
          Please verify with local mosque.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a5298',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3c72',
  },
  subtitle: {
    fontSize: 16,
    color: '#595959',
    marginTop: 4,
  },
  locationContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  compassCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#2a5298',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardinalDirection: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  north: {
    top: 10,
  },
  east: {
    right: 20,
  },
  south: {
    bottom: 10,
  },
  west: {
    left: 20,
  },
  needle: {
    position: 'absolute',
    width: 6,
    height: 120,
    alignItems: 'center',
  },
  needlePoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#00cc66',
  },
  needleBase: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    marginTop: 44,
  },
  centerIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a5298',
  },
  kaabaEmoji: {
    fontSize: 30,
  },
  directionInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  directionLabel: {
    fontSize: 16,
    color: '#595959',
    marginBottom: 8,
  },
  directionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a5298',
    marginBottom: 4,
  },
  angleText: {
    fontSize: 14,
    color: '#8c8c8c',
  },
  instructions: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#52c41a',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
});

export default QiblaCompassScreen;