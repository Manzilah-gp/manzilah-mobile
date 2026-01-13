// src/screens/Islamic/HijriCalendarScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getHijriDate } from '../../api/islamicService';

// Screen for Hijri calendar and date conversion
const HijriCalendarScreen = ({ navigation }) => {
  
  // Add back button handler
  const handleGoBack = () => {
    navigation.goBack();
  };
  const [loading, setLoading] = useState(true);
  const [currentHijri, setCurrentHijri] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Islamic months in English and Arabic
  const islamicMonths = [
    { en: 'Muharram', ar: 'محرم' },
    { en: 'Safar', ar: 'صفر' },
    { en: "Rabi' al-awwal", ar: 'ربيع الأول' },
    { en: "Rabi' al-thani", ar: 'ربيع الثاني' },
    { en: 'Jumada al-awwal', ar: 'جمادى الأولى' },
    { en: 'Jumada al-thani', ar: 'جمادى الثانية' },
    { en: 'Rajab', ar: 'رجب' },
    { en: "Sha'ban", ar: 'شعبان' },
    { en: 'Ramadan', ar: 'رمضان' },
    { en: 'Shawwal', ar: 'شوال' },
    { en: "Dhu al-Qi'dah", ar: 'ذو القعدة' },
    { en: 'Dhu al-Hijjah', ar: 'ذو الحجة' },
  ];

  // Important Islamic dates and events
  const islamicEvents = {
    Muharram: [{ day: 1, event: 'Islamic New Year' }, { day: 10, event: 'Day of Ashura' }],
    "Rabi' al-awwal": [{ day: 12, event: 'Mawlid al-Nabi (Prophet\'s Birthday)' }],
    Rajab: [{ day: 27, event: 'Isra and Mi\'raj' }],
    "Sha'ban": [{ day: 15, event: 'Mid-Sha\'ban' }],
    Ramadan: [
      { day: 1, event: 'First Day of Ramadan' },
      { day: 27, event: 'Laylat al-Qadr (Night of Power)' },
    ],
    Shawwal: [{ day: 1, event: 'Eid al-Fitr' }],
    'Dhu al-Hijjah': [
      { day: 9, event: 'Day of Arafah' },
      { day: 10, event: 'Eid al-Adha' },
    ],
  };

  // Fetch Hijri date on component mount
  useEffect(() => {
    fetchHijriDate();
  }, [selectedDate]);

  // Fetch Hijri date from API
  const fetchHijriDate = async () => {
    try {
      setLoading(true);
      const formattedDate = formatDateForAPI(selectedDate);
      const response = await getHijriDate(formattedDate);

      if (response.success) {
        setCurrentHijri(response.data.hijri);
      }
    } catch (error) {
      console.error('Error fetching Hijri date:', error);
      Alert.alert('Error', 'Failed to fetch Hijri date.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for API (DD-MM-YYYY)
  const formatDateForAPI = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get events for current Hijri month
  const getCurrentMonthEvents = () => {
    if (!currentHijri) return [];
    
    const monthName = currentHijri.month.en;
    return islamicEvents[monthName] || [];
  };

  if (loading && !currentHijri) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hijri Calendar</Text>
        <Text style={styles.subtitle}>Islamic Date Converter</Text>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={goToNextDay}>
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Current Date Display */}
      {currentHijri && (
        <View style={styles.dateDisplay}>
          {/* Hijri Date */}
          <View style={styles.hijriSection}>
            <Text style={styles.sectionLabel}>Hijri Date</Text>
            <Text style={styles.hijriDateLarge}>
              {currentHijri.day} {currentHijri.month.en}
            </Text>
            <Text style={styles.hijriYear}>
              {currentHijri.year} {currentHijri.designation}
            </Text>
            <Text style={styles.arabicDate}>
              {currentHijri.day} {currentHijri.month.ar} {currentHijri.year}
            </Text>
            <Text style={styles.weekday}>{currentHijri.weekday}</Text>
          </View>

          {/* Gregorian Date */}
          <View style={styles.gregorianSection}>
            <Text style={styles.sectionLabel}>Gregorian Date</Text>
            <Text style={styles.gregorianDate}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Islamic Months Reference */}
      <View style={styles.monthsContainer}>
        <Text style={styles.sectionTitle}>Islamic Months</Text>
        {islamicMonths.map((month, index) => (
          <View
            key={index}
            style={[
              styles.monthItem,
              currentHijri?.month.en === month.en && styles.currentMonth,
            ]}
          >
            <View style={styles.monthNumber}>
              <Text style={styles.monthNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.monthInfo}>
              <Text style={styles.monthNameEn}>{month.en}</Text>
              <Text style={styles.monthNameAr}>{month.ar}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Important Events This Month */}
      {getCurrentMonthEvents().length > 0 && (
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>
            Events in {currentHijri?.month.en}
          </Text>
          {getCurrentMonthEvents().map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>{event.day}</Text>
              </View>
              <Text style={styles.eventName}>{event.event}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>About the Hijri Calendar</Text>
        <Text style={styles.infoText}>
          The Islamic calendar (Hijri calendar) is a lunar calendar consisting of
          12 months in a year of 354 or 355 days. It is used to determine the proper
          days of Islamic holidays and rituals, such as the annual fasting and the
          annual season for the great pilgrimage.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 110,
    left: 16,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#52c41a',
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
    backgroundColor: '#52c41a',
    padding: 24,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2a5298',
    borderRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  todayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#52c41a',
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dateDisplay: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hijriSection: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  hijriDateLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#52c41a',
    marginBottom: 4,
  },
  hijriYear: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  arabicDate: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'System',
    marginBottom: 4,
  },
  weekday: {
    fontSize: 16,
    color: '#999',
  },
  gregorianSection: {
    alignItems: 'center',
  },
  gregorianDate: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  monthsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  monthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  currentMonth: {
    backgroundColor: '#e3f2fd',
  },
  monthNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a5298',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  monthNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  monthInfo: {
    flex: 1,
  },
  monthNameEn: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  monthNameAr: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
  },
  eventsContainer: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 8,
  },
  eventDate: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffc107',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  eventName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  infoContainer: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});

export default HijriCalendarScreen;