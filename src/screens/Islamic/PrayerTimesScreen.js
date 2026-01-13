// src/screens/Islamic/PrayerTimesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { getPrayerTimes, getHijriDate } from '../../api/islamicService';
import PrayerTimeCard from '../../components/Islamic/PrayerTimeCard';

// Main screen for displaying prayer times
const PrayerTimesScreen = ({ navigation }) => {
  
  // Add back button handler
  const handleGoBack = () => {
    navigation.goBack();
  };
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prayerData, setPrayerData] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [location, setLocation] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);

  // Request location permissions and fetch data
  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  // Calculate which prayer is next based on current time
  useEffect(() => {
    if (prayerData) {
      calculateNextPrayer();
    }
  }, [prayerData]);

  // Request location permission and fetch prayer times
  const requestLocationAndFetch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show accurate prayer times.'
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });

      await fetchPrayerData(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
      setLoading(false);
    }
  };

  // Fetch prayer times and Hijri date
  const fetchPrayerData = async (lat, lon) => {
    try {
      const [prayerResponse, hijriResponse] = await Promise.all([
        getPrayerTimes(lat, lon),
        getHijriDate(),
      ]);

      if (prayerResponse.success) {
        setPrayerData(prayerResponse.data);
      }

      if (hijriResponse.success) {
        setHijriDate(hijriResponse.data.hijri);
      }
    } catch (error) {
      console.error('Error fetching prayer data:', error);
      Alert.alert('Error', 'Failed to fetch prayer times. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Determine which prayer is next
  const calculateNextPrayer = () => {
    if (!prayerData) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerData.prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerData.prayerTimes.dhuhr },
      { name: 'Asr', time: prayerData.prayerTimes.asr },
      { name: 'Maghrib', time: prayerData.prayerTimes.maghrib },
      { name: 'Isha', time: prayerData.prayerTimes.isha },
    ];

    // Convert prayer times to minutes
    const prayerMinutes = prayers.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      return { ...prayer, minutes: hours * 60 + minutes };
    });

    // Find next prayer
    const next = prayerMinutes.find(p => p.minutes > currentTime);
    setNextPrayer(next ? next.name : 'Fajr'); // If no prayer left today, next is Fajr tomorrow
  };

  // Check if a prayer has passed
  const isPrayerPassed = (time) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [hours, minutes] = time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    return prayerTime < currentTime;
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await fetchPrayerData(location.latitude, location.longitude);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Fetching prayer times...</Text>
      </View>
    );
  }

  if (!prayerData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load prayer times</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestLocationAndFetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Times</Text>
        {hijriDate && (
          <Text style={styles.hijriDate}>
            {hijriDate.day} {hijriDate.month.en} {hijriDate.year} {hijriDate.designation}
          </Text>
        )}
        <Text style={styles.gregorianDate}>
          {prayerData.date.gregorian}
        </Text>
        <Text style={styles.location}>
          📍 {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
        </Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Prayer times are approximate and based on your location.
          Please verify with your local mosque.
        </Text>
      </View>

      {/* Prayer Times List */}
      <View style={styles.prayerList}>
        <PrayerTimeCard
          name="Fajr"
          time={prayerData.prayerTimes.fajr}
          isNext={nextPrayer === 'Fajr'}
          isPassed={isPrayerPassed(prayerData.prayerTimes.fajr)}
        />
        <PrayerTimeCard
          name="Dhuhr"
          time={prayerData.prayerTimes.dhuhr}
          isNext={nextPrayer === 'Dhuhr'}
          isPassed={isPrayerPassed(prayerData.prayerTimes.dhuhr)}
        />
        <PrayerTimeCard
          name="Asr"
          time={prayerData.prayerTimes.asr}
          isNext={nextPrayer === 'Asr'}
          isPassed={isPrayerPassed(prayerData.prayerTimes.asr)}
        />
        <PrayerTimeCard
          name="Maghrib"
          time={prayerData.prayerTimes.maghrib}
          isNext={nextPrayer === 'Maghrib'}
          isPassed={isPrayerPassed(prayerData.prayerTimes.maghrib)}
        />
        <PrayerTimeCard
          name="Isha"
          time={prayerData.prayerTimes.isha}
          isNext={nextPrayer === 'Isha'}
          isPassed={isPrayerPassed(prayerData.prayerTimes.isha)}
        />
      </View>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Sunrise:</Text>
        <Text style={styles.infoValue}>{prayerData.prayerTimes.sunrise}</Text>
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoLabel}>Calculation Method:</Text>
        <Text style={styles.infoValue}>{prayerData.method}</Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('QiblaCompass')}
        >
          <Text style={styles.navButtonText}>🧭 Qibla Direction</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('HijriCalendar')}
        >
          <Text style={styles.navButtonText}>📅 Hijri Calendar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 32,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1e3c72',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1e3c72',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    marginTop: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  hijriDate: {
    fontSize: 16,
    color: '#52c41a',
    fontWeight: '600',
    marginBottom: 4,
  },
  gregorianDate: {
    fontSize: 14,
    color: '#d9d9d9',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#8c8c8c',
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  prayerList: {
    marginBottom: 16,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  navigationButtons: {
    marginTop: 16,
    gap: 12,
  },
  navButton: {
    backgroundColor: '#2a5298',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrayerTimesScreen;