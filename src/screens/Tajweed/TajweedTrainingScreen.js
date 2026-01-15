import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';

import TajweedText from '../../components/Quran/TajweedText';
import ReciterSelector from '../../components/Quran/ReciterSelector';
import { getVerseAudio } from '../../api/quranAudioApi';
import { getTajweedRuleById } from '../../utils/tajweedUtils';
import { getTrainingVerses } from '../../data/tajweedVerses';
import { getVerseWithTajweed } from '../../api/tajweedApi';

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

/**
 * TajweedTrainingScreen Component
 * 
 * Interactive training screen for learning Tajweed rules with:
 * - Audio recitation with multiple reciters
 * - Color-coded Tajweed highlighting
 * - Practice mode (hide colors)
 * - Repeat mode with configurable repetitions
 * - Verse-by-verse navigation
 * - Progress tracking
 * 
 * @route params.ruleId - The Tajweed rule ID to train
 */
const TajweedTrainingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ruleId } = route.params;

  // Tajweed rule and verses data
  const [rule, setRule] = useState(null);
  const [verses, setVerses] = useState([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Audio playback state
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [showReciterModal, setShowReciterModal] = useState(false);

  // Training modes and settings
  const [showColors, setShowColors] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);
  const [repeatCount, setRepeatCount] = useState(3);
  const [currentRepeat, setCurrentRepeat] = useState(0);

  /**
   * Initialize component when mounted or when ruleId changes
   * Sets up audio mode and loads training content
   */
  useEffect(() => {
    setupAudio();
    initializeTraining();
    
    // Cleanup: unload audio when component unmounts
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [ruleId]);

  /**
   * Load audio whenever verse or reciter changes
   * Skip in practice mode (user should read without audio)
   */
  useEffect(() => {
    if (verses.length > 0 && !practiceMode) {
      loadAudioForCurrentVerse();
    }
  }, [currentVerseIndex, selectedReciter, practiceMode]);

  /**
   * Configure audio settings for optimal playback
   * Enables playback in silent mode (important for iOS)
   */
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,      // Play audio even if phone is on silent
        staysActiveInBackground: false,
        shouldDuckAndroid: true,          // Lower other audio when playing
        playThroughEarpieceAndroid: false,
      });
      console.log('✅ Audio mode set');
    } catch (error) {
      console.error('❌ Audio setup error:', error);
    }
  };

  /**
   * Load the Tajweed rule and its associated training verses
   * Fetches verses with Tajweed markup from API
   */
  const initializeTraining = async () => {
    try {
      setLoading(true);
      console.log('🔄 Initializing training for rule:', ruleId);

      // Get rule information (name, description, color, etc.)
      const tajweedRule = getTajweedRuleById(ruleId);
      if (!tajweedRule) throw new Error('Rule not found');
      setRule(tajweedRule);
      console.log('✅ Rule loaded:', tajweedRule.nameEn);

      // Get list of verses that demonstrate this rule
      const verseKeys = getTrainingVerses(ruleId);
      if (!verseKeys?.length) throw new Error('No verses');
      console.log('✅ Verse keys:', verseKeys);

      // Fetch all verses with Tajweed markup in parallel
      const versesData = await Promise.all(
        verseKeys.map(key => getVerseWithTajweed(key))
      );
      
      setVerses(versesData);
      console.log('✅ Verses loaded:', versesData.length);
      setLoading(false);
    } catch (error) {
      console.error('❌ Init error:', error);
      Alert.alert('Error', 'Failed to load content', [
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]);
      setLoading(false);
    }
  };

  /**
   * Load audio recitation for the current verse
   * Fetches MP3 URL from CDN and creates audio object
   */
  const loadAudioForCurrentVerse = async () => {
    try {
      setIsLoadingAudio(true);
      console.log('🔄 Loading audio...');
      
      // Unload previous audio to free memory
      if (sound) {
        console.log('  Unloading previous audio');
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      const currentVerse = verses[currentVerseIndex];
      if (!currentVerse) {
        console.log('❌ No current verse');
        setIsLoadingAudio(false);
        return;
      }

      console.log('  Verse:', currentVerse.verseKey);
      console.log('  Surah:', currentVerse.surahNumber);
      console.log('  Ayah:', currentVerse.ayahNumber);
      console.log('  Reciter:', selectedReciter);

      // Get audio URL from API
      const audioUrl = await getVerseAudio(
        currentVerse.surahNumber,
        currentVerse.ayahNumber,
        selectedReciter
      );
      
      console.log('✅ Audio URL:', audioUrl);

      // Create audio object with status callback
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onAudioStatusUpdate
      );

      setSound(newSound);
      console.log('✅ Audio loaded successfully');
      setIsLoadingAudio(false);
    } catch (error) {
      console.error('❌ Audio error:', error);
      console.error('  Error details:', JSON.stringify(error, null, 2));
      setIsLoadingAudio(false);
      Alert.alert('Audio Error', error.message || 'Failed to load audio');
    }
  };

  /**
   * Handle audio playback status updates
   * Tracks playing state and handles audio completion
   */
  const onAudioStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      
      // Audio just finished playing
      if (status.didJustFinish && !status.isLooping) {
        console.log('🎵 Audio finished - Repeat mode:', repeatMode, 'Current repeat:', currentRepeat, '/', repeatCount);
        setIsPlaying(false);
        handleAudioFinish();
      }
    } else if (status.error) {
      console.error('❌ Audio playback error:', status.error);
    }
  };

  /**
   * Toggle between play and pause states
   */
  const togglePlayPause = async () => {
    if (!sound) {
      console.log('❌ No sound loaded');
      return;
    }

    try {
      if (isPlaying) {
        console.log('⏸️ Pausing');
        await sound.pauseAsync();
      } else {
        console.log('▶️ Playing');
        await sound.playAsync();
      }
    } catch (error) {
      console.error('❌ Playback error:', error);
    }
  };

  /**
   * Handle what happens when audio finishes playing
   * Either repeat current verse or move to next verse
   */
  const handleAudioFinish = async () => {
    try {
      // Repeat mode: replay current verse multiple times
      if (repeatMode && currentRepeat < repeatCount - 1) {
        console.log(`🔁 Repeat ${currentRepeat + 1}/${repeatCount}`);
        
        if (sound) {
          // Stop current playback
          await sound.stopAsync();
          // Reset to beginning
          await sound.setPositionAsync(0);
          // Play again
          await sound.playAsync();
          // Update repeat counter AFTER starting playback
          setCurrentRepeat(prev => prev + 1);
          console.log('✅ Repeat started successfully');
        }
      } 
      // Move to next verse if not at end
      else if (currentVerseIndex < verses.length - 1) {
        console.log('➡️ Moving to next verse');
        setCurrentRepeat(0);
        setCurrentVerseIndex(currentVerseIndex + 1);
      } 
      // Reached end of verses
      else {
        console.log('✅ Training complete');
        setCurrentRepeat(0);
      }
    } catch (error) {
      console.error('❌ Audio finish handler error:', error);
    }
  };

  /**
   * Navigate to the previous verse
   * Resets repeat counter and stops current audio
   */
  const goToPreviousVerse = async () => {
    if (currentVerseIndex > 0) {
      setCurrentRepeat(0);
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
      setCurrentVerseIndex(currentVerseIndex - 1);
    }
  };

  /**
   * Navigate to the next verse
   * Resets repeat counter and stops current audio
   */
  const goToNextVerse = async () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentRepeat(0);
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
      setCurrentVerseIndex(currentVerseIndex + 1);
    }
  };

  /**
   * Reveal Tajweed colors in practice mode
   * Temporarily shows colors for 3 seconds then hides again
   */
  const revealColors = () => {
    setShowColors(true);
    setTimeout(() => {
      if (practiceMode) {
        setShowColors(false);
      }
    }, 3000);
  };

  /**
   * Toggle practice mode
   * In practice mode: colors are hidden and audio is disabled
   */
  const togglePracticeMode = async (value) => {
    setPracticeMode(value);
    setShowColors(!value); // Hide colors in practice mode
    
    // Stop audio when entering practice mode
    if (value && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  /**
   * Toggle repeat mode
   * When enabled, each verse will replay multiple times
   */
  const toggleRepeatMode = (value) => {
    setRepeatMode(value);
    setCurrentRepeat(0);
  };

  // Get current verse data
  const currentVerse = verses[currentVerseIndex];

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006D4E" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state (no verses loaded)
  if (!verses.length || !rule) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>لا توجد آيات متاحة</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with back button, title, and reciter selector */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{rule.nameAr}</Text>
          <Text style={styles.headerSubtitle}>{rule.nameEn}</Text>
        </View>

        <TouchableOpacity
          style={styles.reciterButton}
          onPress={() => setShowReciterModal(true)}
        >
          <Text style={styles.reciterButtonIcon}>🎙️</Text>
        </TouchableOpacity>
      </View>

      {/* Reciter selection modal */}
      {showReciterModal && (
        <ReciterSelector
          visible={showReciterModal}
          currentReciter={selectedReciter}
          onSelectReciter={(reciter) => {
            setSelectedReciter(reciter);
            setShowReciterModal(false);
          }}
          onClose={() => setShowReciterModal(false)}
        />
      )}

      {/* Rule information card */}
      <View style={styles.ruleCard}>
        <View style={[styles.ruleIconContainer, { backgroundColor: `${rule.color}20` }]}>
          <Text style={styles.ruleIcon}>{rule.icon}</Text>
        </View>
        <View style={styles.ruleContent}>
          <Text style={styles.ruleDescription}>{rule.descriptionAr}</Text>
        </View>
        <View style={[styles.colorSample, { backgroundColor: rule.color }]} />
      </View>

      {/* Training controls (color toggle, practice mode, repeat mode) */}
      <View style={styles.controls}>
        {/* Color toggle */}
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>إظهار الألوان</Text>
          <Switch
            value={showColors}
            onValueChange={setShowColors}
            trackColor={{ false: '#CCC', true: '#A8E6CF' }}
            thumbColor={showColors ? '#006D4E' : '#F4F3F4'}
            disabled={practiceMode}
          />
        </View>

        {/* Practice mode toggle */}
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>وضع التدريب</Text>
          <Switch
            value={practiceMode}
            onValueChange={togglePracticeMode}
            trackColor={{ false: '#CCC', true: '#FFE4B5' }}
            thumbColor={practiceMode ? '#F7DC6F' : '#F4F3F4'}
          />
        </View>

        {/* Repeat mode toggle */}
        <View style={styles.controlRow}>
          <View style={styles.repeatLabelContainer}>
            <Text style={styles.controlLabel}>وضع التكرار</Text>
            {repeatMode && (
              <Text style={styles.repeatCounter}>
                {currentRepeat + 1}/{repeatCount}
              </Text>
            )}
          </View>
          <Switch
            value={repeatMode}
            onValueChange={toggleRepeatMode}
            trackColor={{ false: '#CCC', true: '#B4E1FF' }}
            thumbColor={repeatMode ? '#006D4E' : '#F4F3F4'}
            disabled={practiceMode}
          />
        </View>

        {/* Repeat count selector (only shown when repeat mode is on) */}
        {repeatMode && (
          <View style={styles.repeatCountContainer}>
            <Text style={styles.repeatCountLabel}>عدد التكرار:</Text>
            <View style={styles.repeatCountButtons}>
              {[3, 5, 7, 10].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.repeatCountButton,
                    repeatCount === count && styles.repeatCountButtonActive,
                  ]}
                  onPress={() => setRepeatCount(count)}
                >
                  <Text
                    style={[
                      styles.repeatCountButtonText,
                      repeatCount === count && styles.repeatCountButtonTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Main verse display area */}
      <ScrollView 
        style={styles.verseContainer}
        contentContainerStyle={styles.verseContent}
      >
        <View style={styles.verseCard}>
          {/* Verse header with numbering */}
          <View style={styles.verseHeader}>
            <Text style={styles.verseNumber}>
              آية {currentVerseIndex + 1} من {verses.length}
            </Text>
            <Text style={styles.verseSurah}>{currentVerse?.verseKey}</Text>
          </View>

          {/* Verse text with Tajweed colors */}
          <View style={styles.verseTextContainer}>
            <TajweedText 
              text={currentVerse?.text} 
              showColors={showColors}
              filterRule={ruleId}
              style={styles.verseText}
            />
          </View>

          {/* Practice mode hint */}
          {practiceMode && (
            <View style={styles.practiceHint}>
              <Text style={styles.practiceHintIcon}>💡</Text>
              <Text style={styles.practiceHintText}>
                اقرأ الآية وحاول تطبيق القاعدة
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Audio controls (hidden in practice mode) */}
      {!practiceMode && (
        <View style={styles.audioContainer}>
          <TouchableOpacity
            style={[styles.audioButton, (isLoadingAudio || !sound) && styles.audioButtonDisabled]}
            onPress={togglePlayPause}
            disabled={isLoadingAudio || !sound}
          >
            {isLoadingAudio ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.audioButtonIcon}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            )}
            <Text style={styles.audioButtonText}>
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation buttons (Previous/Next) */}
      <View style={styles.navigationContainer}>
        {/* Previous verse button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            currentVerseIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={goToPreviousVerse}
          disabled={currentVerseIndex === 0}
        >
          <Text style={styles.navButtonIcon}>◄</Text>
          <Text style={styles.navButtonText}>السابقة</Text>
        </TouchableOpacity>

        {/* Reveal colors button (only in practice mode) */}
        {practiceMode && (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={revealColors}
          >
            <Text style={styles.revealButtonIcon}>👁️</Text>
            <Text style={styles.revealButtonText}>إظهار</Text>
          </TouchableOpacity>
        )}

        {/* Next verse button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            currentVerseIndex >= verses.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={goToNextVerse}
          disabled={currentVerseIndex >= verses.length - 1}
        >
          <Text style={styles.navButtonText}>التالية</Text>
          <Text style={styles.navButtonIcon}>►</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${((currentVerseIndex + 1) / verses.length) * 100}%`,
                backgroundColor: rule?.color || '#006D4E',
              }
            ]} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

/**
 * Responsive styles for mobile devices
 * Uses flexible layouts and percentage-based sizing
 * Optimized for various screen sizes
 */
const styles = StyleSheet.create({
  // Main container
  safe: { 
    flex: 1, 
    backgroundColor: '#F7F4EE' 
  },
  
  // Loading state
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333' 
  },
  
  // Error state
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorIcon: { 
    fontSize: 48, 
    marginBottom: 16 
  },
  errorText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 24 
  },
  
  // Header
  header: { 
    height: 70, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    justifyContent: 'space-between', 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  headerBackButton: { 
    padding: 8, 
    minWidth: 44, 
    minHeight: 44, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backText: { 
    fontSize: 24, 
    color: '#006D4E' 
  },
  titleContainer: { 
    alignItems: 'center', 
    flex: 1 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#333' 
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },
  reciterButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#F0F0F0', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  reciterButtonIcon: { 
    fontSize: 24 
  },
  
  // Rule card
  ruleCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  ruleIconContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#F0F0F0', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  ruleIcon: { 
    fontSize: 32 
  },
  ruleContent: { 
    flex: 1 
  },
  ruleDescription: { 
    fontSize: 14, 
    color: '#666', 
    lineHeight: 20 
  },
  colorSample: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: '#CCC' 
  },
  
  // Controls
  controls: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  controlRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  controlLabel: { 
    fontSize: 14, 
    color: '#333', 
    fontWeight: '500' 
  },
  repeatLabelContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  repeatCounter: { 
    fontSize: 12, 
    color: '#006D4E', 
    fontWeight: '600', 
    marginLeft: 8 
  },
  repeatCountContainer: { 
    marginTop: 8, 
    paddingTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0' 
  },
  repeatCountLabel: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 8 
  },
  repeatCountButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 8 
  },
  repeatCountButton: { 
    flex: 1, 
    padding: 8, 
    borderRadius: 8, 
    backgroundColor: '#F0F0F0', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  repeatCountButtonActive: { 
    backgroundColor: '#E8F5E9', 
    borderColor: '#006D4E' 
  },
  repeatCountButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#666' 
  },
  repeatCountButtonTextActive: { 
    color: '#006D4E' 
  },
  
  // Verse display
  verseContainer: { 
    flex: 1 
  },
  verseContent: { 
    padding: 16 
  },
  verseCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4, 
    minHeight: 200 
  },
  verseHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16, 
    paddingBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  verseNumber: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#006D4E' 
  },
  verseSurah: { 
    fontSize: 14, 
    color: '#666' 
  },
  verseTextContainer: { 
    marginBottom: 16, 
    minHeight: 150 
  },
  verseText: { 
    fontSize: 30, 
    lineHeight: 52 
  },
  practiceHint: { 
    backgroundColor: '#FFF9E6', 
    padding: 12, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    borderLeftWidth: 4, 
    borderLeftColor: '#F7DC6F' 
  },
  practiceHintIcon: { 
    fontSize: 20, 
    marginRight: 8 
  },
  practiceHintText: { 
    flex: 1, 
    fontSize: 13, 
    color: '#856404', 
    lineHeight: 18 
  },
  
  // Audio controls
  audioContainer: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0' 
  },
  audioButton: { 
    backgroundColor: '#006D4E', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 14, 
    borderRadius: 12, 
    gap: 8 
  },
  audioButtonDisabled: { 
    backgroundColor: '#CCC', 
    opacity: 0.7 
  },
  audioButtonIcon: { 
    fontSize: 20 
  },
  audioButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  
  // Navigation
  navigationContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0', 
    gap: 12 
  },
  navButton: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: '#006D4E', 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  navButtonDisabled: { 
    backgroundColor: '#CCC', 
    opacity: 0.5 
  },
  navButtonIcon: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  navButtonText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  revealButton: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: '#F7DC6F', 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  revealButtonIcon: { 
    fontSize: 18 
  },
  revealButtonText: { 
    color: '#333', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  
  // Progress bar
  progressContainer: { 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 16, 
    paddingBottom: 12 
  },
  progressBar: { 
    height: 4, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 2, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 2 
  },
  
  // Back button
  backButton: { 
    backgroundColor: '#006D4E', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  backButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});

export default TajweedTrainingScreen;