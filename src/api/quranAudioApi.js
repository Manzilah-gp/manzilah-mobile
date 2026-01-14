/**
 * Quran Audio API Integration
 * Using AlQuran Cloud API for free audio recitation
 */

const API_BASE = 'https://api.alquran.cloud/v1';

/**
 * List of approved reciters with their API identifiers
 * Format: { id, name, language }
 */
export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', language: 'Arabic', flag: '🇰🇼' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdul Rahman Al-Sudais', language: 'Arabic', flag: '🇸🇦' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', language: 'Arabic', flag: '🇪🇬' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Hussary', language: 'Arabic', flag: '🇪🇬' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', language: 'Arabic', flag: '🇪🇬' },
  { id: 'ar.shaatree', name: 'Abu Bakr Al-Shatri', language: 'Arabic', flag: '🇸🇦' },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyub', language: 'Arabic', flag: '🇸🇦' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', language: 'Arabic', flag: '🇸🇦' },
];

/**
 * Get verses for a specific page with audio URLs
 * @param {number} page - Page number (1-604)
 * @param {string} reciterId - Reciter identifier (e.g., 'ar.alafasy')
 * @returns {Promise<Array>} Array of verses with audio URLs
 */
export const getPageWithAudio = async (page, reciterId = 'ar.alafasy') => {
  try {
    const response = await fetch(
      `${API_BASE}/page/${page}/${reciterId}`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      return data.data.ayahs.map(ayah => ({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        surahNumber: ayah.surah.number,
        surahName: ayah.surah.name,
        audioUrl: ayah.audio,
        page: page,
      }));
    }
    throw new Error('Failed to fetch page audio');
  } catch (error) {
    console.error('Error fetching page audio:', error);
    throw error;
  }
};

/**
 * Get audio URL for a specific verse
 * @param {number} surahNumber - Surah number (1-114)
 * @param {number} ayahNumber - Ayah number
 * @param {string} reciterId - Reciter identifier
 * @returns {Promise<string>} Audio URL
 */
export const getVerseAudio = async (surahNumber, ayahNumber, reciterId = 'ar.alafasy') => {
  try {
    const response = await fetch(
      `${API_BASE}/ayah/${surahNumber}:${ayahNumber}/${reciterId}`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      return data.data.audio;
    }
    throw new Error('Failed to fetch verse audio');
  } catch (error) {
    console.error('Error fetching verse audio:', error);
    throw error;
  }
};