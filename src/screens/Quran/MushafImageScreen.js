import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import MushafPageImage from '../../components/Quran/MushafPageImage';
import AudioPlayer from '../../components/Quran/AudioPlayer';
import ReciterSelector from '../../components/Quran/ReciterSelector';
import VerseOverlay from '../../components/Quran/VerseOverlay';

import { getPageImageUrl } from '../../utils/mushafImage';
import { getLastPage, saveLastPage } from '../../utils/quranStorage';
import { getPageWithAudio } from '../../api/quranAudioApi';
import { getPreferredReciter, savePreferredReciter } from '../../utils/audioStorage';

const { width, height } = Dimensions.get('window');

const TOTAL_PAGES = 604;
const HEADER_HEIGHT = 60;

/**
 * Enhanced Mushaf Screen with Audio Recitation
 * Features: Image display, audio playback, verse highlighting, reciter selection
 */
const MushafImageScreen = () => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  
  // Page state
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Audio state
  const [verses, setVerses] = useState([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [audioLoading, setAudioLoading] = useState(false);
  
  // UI state
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showVerseOverlay, setShowVerseOverlay] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  /**
   * Initialize: Load last page and preferred reciter
   */
  useEffect(() => {
    initializeMushaf();
  }, []);

  /**
   * Load verses when page changes
   */
  useEffect(() => {
    if (showAudioPlayer) {
      loadPageVerses();
    }
  }, [currentPage, selectedReciter]);

  /**
   * Initialize Mushaf with saved preferences
   */
  const initializeMushaf = async () => {
    try {
      const [lastPage, reciter] = await Promise.all([
        getLastPage(),
        getPreferredReciter(),
      ]);
      
      setCurrentPage(lastPage);
      setSelectedReciter(reciter);

      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: lastPage - 1,
            animated: false,
          });
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error initializing Mushaf:', error);
      Alert.alert('Error', 'Failed to load Quran. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Load verses with audio for current page
   */
  const loadPageVerses = async () => {
    try {
      setAudioLoading(true);
      const pageVerses = await getPageWithAudio(currentPage, selectedReciter);
      setVerses(pageVerses);
      setCurrentVerseIndex(0);
      setAudioLoading(false);
    } catch (error) {
      console.error('Error loading page verses:', error);
      Alert.alert('Error', 'Failed to load audio. Please try again.');
      setAudioLoading(false);
    }
  };

  /**
   * Handle page change when swiping
   */
  const handlePageChange = (index) => {
    const page = index + 1;
    setCurrentPage(page);
    saveLastPage(page);
    setCurrentVerseIndex(0);
  };

  /**
   * Toggle audio player visibility
   */
  const toggleAudioPlayer = async () => {
    const newState = !showAudioPlayer;
    setShowAudioPlayer(newState);
    
    if (newState && verses.length === 0) {
      await loadPageVerses();
    }
  };

  /**
   * Toggle verse overlay visibility
   */
  const toggleVerseOverlay = async () => {
    const newState = !showVerseOverlay;
    setShowVerseOverlay(newState);
    
    if (newState && verses.length === 0) {
      await loadPageVerses();
    }
  };

  /**
   * Handle reciter selection
   */
  const handleReciterSelect = async (reciterId) => {
    setSelectedReciter(reciterId);
    await savePreferredReciter(reciterId);
    if (showAudioPlayer) {
      await loadPageVerses();
    }
  };

  /**
   * Navigate to next verse
   */
  const handleNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    } else {
      // Auto-advance to next page if available
      if (currentPage < TOTAL_PAGES) {
        handlePageChange(currentPage);
        flatListRef.current?.scrollToIndex({
          index: currentPage,
          animated: true,
        });
      }
    }
  };

  /**
   * Navigate to previous verse
   */
  const handlePreviousVerse = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
    }
  };

  /**
   * Handle verse selection from overlay
   */
  const handleVersePress = (verse, index) => {
    setCurrentVerseIndex(index);
    setShowVerseOverlay(false);
    if (!showAudioPlayer) {
      setShowAudioPlayer(true);
    }
  };

  /**
   * Handle audio playback finish
   */
  const handleAudioFinish = () => {
    handleNextVerse();
  };

  /**
   * Render each Quran page
   */
  const renderPage = ({ item }) => (
    <View style={styles.pageContainer}>
      <MushafPageImage 
        uri={getPageImageUrl(item)} 
        pageNumber={item}
      />
      {showVerseOverlay && (
        <VerseOverlay
          verses={verses}
          currentPlayingVerse={verses[currentVerseIndex]?.number}
          onVersePress={handleVersePress}
          visible={showVerseOverlay}
        />
      )}
    </View>
  );

  /**
   * Handle scroll failures
   */
  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ 
        index: info.index, 
        animated: false 
      });
    });
  };

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006D4E" />
          <Text style={styles.loadingText}>جاري تحميل المصحف...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentVerse = verses[currentVerseIndex];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>صفحة {currentPage}</Text>
          <Text style={styles.pageSubtitle}>من {TOTAL_PAGES}</Text>
        </View>

        {/* Audio Controls Toggle */}
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleVerseOverlay}
          >
            <Text style={styles.iconButtonText}>📖</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleAudioPlayer}
          >
            <Text style={styles.iconButtonText}>🔊</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowReciterModal(true)}
          >
            <Text style={styles.iconButtonText}>🎙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quran Pages */}
      <FlatList
        ref={flatListRef}
        data={Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1)}
        keyExtractor={(item) => `page-${item}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderPage}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          handlePageChange(index);
        }}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
      />

      {/* Audio Player */}
      {showAudioPlayer && (
        <View style={styles.audioPlayerContainer}>
          {audioLoading ? (
            <View style={styles.audioLoading}>
              <ActivityIndicator color="#006D4E" />
              <Text style={styles.audioLoadingText}>Loading audio...</Text>
            </View>
          ) : currentVerse ? (
            <AudioPlayer
              audioUrl={currentVerse.audioUrl}
              currentVerse={currentVerse}
              onFinish={handleAudioFinish}
              onNext={handleNextVerse}
              onPrevious={handlePreviousVerse}
              hasNext={currentVerseIndex < verses.length - 1}
              hasPrevious={currentVerseIndex > 0}
            />
          ) : (
            <View style={styles.noAudioContainer}>
              <Text style={styles.noAudioText}>No audio available</Text>
            </View>
          )}
        </View>
      )}

      {/* Reciter Selection Modal */}
      <ReciterSelector
        visible={showReciterModal}
        onClose={() => setShowReciterModal(false)}
        selectedReciter={selectedReciter}
        onSelectReciter={handleReciterSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#006D4E',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  pageContainer: {
    width,
    height: height - HEADER_HEIGHT,
    backgroundColor: '#F7F4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  audioLoading: {
    padding: 20,
    alignItems: 'center',
  },
  audioLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  noAudioContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noAudioText: {
    fontSize: 14,
    color: '#999',
  },
});

export default MushafImageScreen;