import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';

/**
 * Audio Player Component
 * Controls for playing Quran audio with play/pause/skip functionality
 */
const AudioPlayer = ({ 
  audioUrl, 
  onFinish, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious,
  currentVerse 
}) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  /**
   * Initialize audio mode for playback
   */
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  /**
   * Load new audio when URL changes
   */
  useEffect(() => {
    loadAudio();
  }, [audioUrl]);

  /**
   * Load and prepare audio file
   */
  const loadAudio = async () => {
    try {
      setIsLoading(true);
      
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      if (!audioUrl) {
        setIsLoading(false);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handle playback status updates
   */
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      // Auto-play next verse when finished
      if (status.didJustFinish) {
        setIsPlaying(false);
        if (onFinish) {
          onFinish();
        }
      }
    }
  };

  /**
   * Toggle play/pause
   */
  const togglePlayback = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  /**
   * Skip to previous verse
   */
  const handlePrevious = async () => {
    if (sound) {
      await sound.stopAsync();
    }
    setIsPlaying(false);
    if (onPrevious) {
      onPrevious();
    }
  };

  /**
   * Skip to next verse
   */
  const handleNext = async () => {
    if (sound) {
      await sound.stopAsync();
    }
    setIsPlaying(false);
    if (onNext) {
      onNext();
    }
  };

  /**
   * Format time in MM:SS
   */
  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Current Verse Info */}
      {currentVerse && (
        <View style={styles.verseInfo}>
          <Text style={styles.verseText}>
            {currentVerse.surahName} - آية {currentVerse.numberInSurah}
          </Text>
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
            ]} 
          />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Playback Controls */}
      <View style={styles.controls}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[styles.controlButton, !hasPrevious && styles.controlButtonDisabled]}
          onPress={handlePrevious}
          disabled={!hasPrevious || isLoading}
        >
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity
          style={[styles.playButton, isLoading && styles.playButtonDisabled]}
          onPress={togglePlayback}
          disabled={isLoading || !audioUrl}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          )}
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.controlButton, !hasNext && styles.controlButtonDisabled]}
          onPress={handleNext}
          disabled={!hasNext || isLoading}
        >
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  verseInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  verseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#006D4E',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  controlIcon: {
    fontSize: 20,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#006D4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});

export default AudioPlayer;