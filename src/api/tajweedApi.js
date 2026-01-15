/**
 * Tajweed API Integration - FIXED VERSION
 * Fetches verses with tajweed markup from Quran.com API
 */

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

/**
 * Get verse with tajweed markup using verse key (surah:ayah)
 * @param {string} verseKey - Verse key in format "surah:ayah" (e.g., "1:1")
 * @returns {Promise<Object>} Verse data with tajweed text
 */
export const getVerseWithTajweed = async (verseKey) => {
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/verses/by_key/${verseKey}?words=false&fields=text_uthmani,text_uthmani_tajweed`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.verse) {
      return {
        number: data.verse.id,
        verseKey: data.verse.verse_key,
        text: data.verse.text_uthmani_tajweed,
        textSimple: data.verse.text_uthmani,
        surahNumber: parseInt(verseKey.split(':')[0]),
        ayahNumber: parseInt(verseKey.split(':')[1]),
      };
    }
    
    throw new Error('Failed to fetch verse');
  } catch (error) {
    console.error('Error fetching verse with tajweed:', error);
    throw error;
  }
};

/**
 * Get verse by surah and ayah numbers
 * @param {number} surah - Surah number (1-114)
 * @param {number} ayah - Ayah number
 * @returns {Promise<Object>} Verse data with tajweed text
 */
export const getVerseByNumbers = async (surah, ayah) => {
  const verseKey = `${surah}:${ayah}`;
  return getVerseWithTajweed(verseKey);
};

/**
 * Get multiple verses with tajweed
 * @param {Array} verseKeys - Array of verse keys (e.g., ["1:1", "1:2"])
 * @returns {Promise<Array>} Array of verses with tajweed
 */
export const getMultipleVersesWithTajweed = async (verseKeys) => {
  try {
    const promises = verseKeys.map(key => getVerseWithTajweed(key));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error fetching multiple verses:', error);
    throw error;
  }
};