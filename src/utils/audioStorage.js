import AsyncStorage from '@react-native-async-storage/async-storage';

const RECITER_KEY = 'QURAN_PREFERRED_RECITER';

/**
 * Save user's preferred reciter
 * @param {string} reciterId - Reciter identifier
 */
export const savePreferredReciter = async (reciterId) => {
  try {
    await AsyncStorage.setItem(RECITER_KEY, reciterId);
  } catch (error) {
    console.error('Error saving reciter:', error);
  }
};

/**
 * Get user's preferred reciter
 * @returns {Promise<string>} Reciter ID (default: ar.alafasy)
 */
export const getPreferredReciter = async () => {
  try {
    const reciter = await AsyncStorage.getItem(RECITER_KEY);
    return reciter || 'ar.alafasy';
  } catch (error) {
    console.error('Error getting reciter:', error);
    return 'ar.alafasy';
  }
};