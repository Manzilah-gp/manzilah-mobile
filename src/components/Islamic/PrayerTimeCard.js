// src/components/Islamic/PrayerTimeCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Prayer time card component for displaying individual prayer
const PrayerTimeCard = ({ name, time, isNext = false, isPassed = false }) => {
  return (
    <View style={[
      styles.card,
      isNext && styles.nextPrayer,
      isPassed && styles.passedPrayer
    ]}>
      <View style={styles.content}>
        <Text style={[styles.prayerName, isNext && styles.nextText]}>
          {name}
        </Text>
        <Text style={[styles.prayerTime, isNext && styles.nextText]}>
          {time}
        </Text>
      </View>
      {isNext && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Next</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  nextPrayer: {
    backgroundColor: '#0066cc',
    borderColor: '#0052a3',
  },
  passedPrayer: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 16,
    color: '#666',
  },
  nextText: {
    color: '#fff',
  },
  badge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PrayerTimeCard;