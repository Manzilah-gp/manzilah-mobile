import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Verse Overlay Component
 * Displays verses over the Mushaf image with highlighting for current playing verse
 */
const VerseOverlay = ({ verses, currentPlayingVerse, onVersePress, visible }) => {
  if (!visible || !verses || verses.length === 0) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {verses.map((verse, index) => (
          <TouchableOpacity
            key={verse.number}
            style={[
              styles.verseContainer,
              currentPlayingVerse === verse.number && styles.verseContainerActive,
            ]}
            onPress={() => onVersePress && onVersePress(verse, index)}
          >
            <View style={styles.verseHeader}>
              <Text style={styles.verseNumber}>
                {verse.numberInSurah}
              </Text>
              <Text style={styles.suraName}>{verse.surahName}</Text>
            </View>
            <Text 
              style={[
                styles.verseText,
                currentPlayingVerse === verse.number && styles.verseTextActive,
              ]}
            >
              {verse.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(247, 244, 238, 0.95)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  verseContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verseContainerActive: {
    borderColor: '#006D4E',
    backgroundColor: '#E8F5E9',
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  verseNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#006D4E',
    backgroundColor: '#E8F5E9',
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  suraName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  verseText: {
    fontSize: 20,
    lineHeight: 36,
    color: '#333',
    textAlign: 'right',
    fontFamily: 'System',
  },
  verseTextActive: {
    color: '#006D4E',
    fontWeight: '600',
  },
});

export default VerseOverlay;