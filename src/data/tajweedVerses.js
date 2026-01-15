/**
 * Training Verses for Tajweed Practice
 * Each verse is carefully selected to contain clear examples of its respective rule
 * Using verse keys in "surah:ayah" format
 */

export const TAJWEED_TRAINING_VERSES = {
  // Ghunnah - Verses with Noon/Meem Mushaddad (نّ مّ)
  ghunnah: [
'33:40',   // Al-Fatiha 1 - بِسْمِ اللَّهِ الرَّحْمَٰنِ
    '114:2',   // Al-Fatiha 3 - الرَّحْمَٰنِ الرَّحِيمِ
    '1:7', // Al-Ikhlas 1 - قُلْ هُوَ اللَّهُ أَحَدٌ
    '2:23', // Al-Falaq 1 - قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ
    
  ],
  
  // Madd - Verses with elongation (آ ا و ي with sukoon after)
  madd: [
    '1:2',  
    '2:1',   
    '55:1',  
    '2:19',
    '3:1',   
  ],
  
  // Qalqalah - Verses with Qalqalah letters with sukoon (ق ط ب ج د)
  qalqalah: [
    '111:1', 
    '113:1', 
    '112:4', 
    '81:18',
    '81:22',
  ],
  
  // Idgham - Verses with Noon Saakin/Tanween + Idgham letters (ي ر م ل و ن)
  idgham: [
 '2:2',
 '2:267',
 '73:20',
  ],
  
  // Ikhfa - Verses with Noon Saakin/Tanween + Ikhfa letters (15 letters)
  ikhfa: [
    '2:6',   
    '114:4', 
    '2:22',
    '2:50',
  ],
  
  // Izhar - Verses with Noon Saakin/Tanween + throat letters (أ ه ع ح غ خ)
  izhar: [
 '88:2',   // Al-Fatiha 7 - غَيْرِ (tanween + غ = izhar)
    '13:7',  // Al-Hijr 9 - إِنَّا نَحْنُ (noon + ن might have izhar)
    '10:27', // Al-Qari'ah 1 - الْقَارِعَةُ
    '2:29', // Al-Qari'ah 2 - مَا الْقَارِعَةُ
    '2:220', // Al-Qari'ah 3 - وَمَا أَدْرَاكَ
  
  ],
  
  // Iqlab - Verses with Noon Saakin/Tanween + Ba (ن + ب = م)
  iqlab: [
    '2:52',   // من بعد ذلك 
    '18:15',// لَوْلَا يَأْتُونَ عَلَيْهِمْ بِسُلْطَانٍ بَيِّنٍ
'57:13',
'70:1',
'40:44'
  ],
};

/**
 * Get training verses for a specific Tajweed rule
 * Returns array of verse keys that contain examples of the requested rule
 * 
 * @param {string} ruleId - Tajweed rule ID (ghunnah, madd, qalqalah, etc.)
 * @returns {Array<string>} Array of verse keys in "surah:ayah" format
 */
export const getTrainingVerses = (ruleId) => {
  return TAJWEED_TRAINING_VERSES[ruleId] || [];
};