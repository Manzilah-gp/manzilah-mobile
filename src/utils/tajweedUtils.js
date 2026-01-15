/**
 * Tajweed Utilities
 * Comprehensive color mapping and rule definitions
 */

export const TAJWEED_COLORS = {
  ghunnah: '#A1D6A8',
  madd_normal: '#FFB3BA',
  madd_wajib: '#FF8C94',
  madd_munfasil: '#FFD4D4',
  madd_lazim: '#FF6B7A',
  qalqalah: '#B4E1FF',
  idgham_wo_ghunnah: '#D4A5FF',
  idgham_w_ghunnah: '#C084FC',
  ikhfa: '#FFE4B5',
  izhar: '#A8E6CF',
  iqlab: '#F7DC6F',
  silent: '#D3D3D3',
  hamzat_wasl: '#FFA07A',
  laam_shamsiyah: '#87CEEB',
};

export const TAJWEED_RULES = [
  {
    id: 'ghunnah',
    nameAr: 'الغنة',
    nameEn: 'Ghunnah',
    descriptionAr: 'صوت أنفي يُحفظ لمدة حركتين',
    description: 'Nasal sound held for 2 counts',
    color: TAJWEED_COLORS.ghunnah,
    icon: '👃',
    details: 'Occurs with Noon Mushaddad (نّ) and Meem Mushaddad (مّ)',
  },
  {
    id: 'madd',
    nameAr: 'المد',
    nameEn: 'Madd',
    descriptionAr: 'إطالة الحروف (آ ا و ي)',
    description: 'Prolongation of vowel sounds (2-6 counts)',
    color: TAJWEED_COLORS.madd_normal,
    icon: '📏',
    details: 'Elongation of Alif, Waw, or Ya',
  },
  {
    id: 'qalqalah',
    nameAr: 'القلقلة',
    nameEn: 'Qalqalah',
    descriptionAr: 'اضطراب الصوت عند النطق',
    description: 'Echoing/bouncing sound',
    color: TAJWEED_COLORS.qalqalah,
    icon: '🔊',
    details: 'Applies to: ق ط ب ج د with Sukoon',
  },
  {
    id: 'idgham',
    nameAr: 'الإدغام',
    nameEn: 'Idgham',
    descriptionAr: 'إدخال حرف ساكن في حرف متحرك',
    description: 'Merging of letters',
    color: TAJWEED_COLORS.idgham_wo_ghunnah,
    icon: '🔗',
    details: 'With or without Ghunnah',
  },
  {
    id: 'ikhfa',
    nameAr: 'الإخفاء',
    nameEn: 'Ikhfa',
    descriptionAr: 'إخفاء النون الساكنة أو التنوين',
    description: 'Concealment with nasal sound',
    color: TAJWEED_COLORS.ikhfa,
    icon: '🤫',
    details: 'Before 15 specific letters',
  },
  {
    id: 'izhar',
    nameAr: 'الإظهار',
    nameEn: 'Izhar',
    descriptionAr: 'إظهار النون الساكنة والتنوين واضحاً',
    description: 'Clear pronunciation',
    color: TAJWEED_COLORS.izhar,
    icon: '🔆',
    details: 'Before throat letters: أ ه ع ح غ خ',
  },
  {
    id: 'iqlab',
    nameAr: 'الإقلاب',
    nameEn: 'Iqlab',
    descriptionAr: 'قلب النون الساكنة أو التنوين ميماً',
    description: 'Conversion to Meem sound',
    color: TAJWEED_COLORS.iqlab,
    icon: '🔄',
    details: 'Before the letter Ba (ب)',
  },
];

export const getTajweedRuleById = (ruleId) => {
  return TAJWEED_RULES.find(rule => rule.id === ruleId);
};

export const getAllTajweedRules = () => {
  return TAJWEED_RULES;
};

/**
 * Map class name to rule ID
 * COMPREHENSIVE Izhar detection with ALL possible variations
 */
export const getRuleIdFromClassName = (className) => {
  if (!className) return null;
  
  const normalized = className.toLowerCase().replace(/_/g, '-');
  
  // IZHAR - Check ALL possible variations (check this FIRST!)
  const izharVariations = [
    'izhar',
    'izhaar', 
    'izhar-halqi',
    'izhaar-halqi',
    'izhar-shafawi',
    'izhaar-shafawi',
    'izhar-halq',
    'izhaar-halq',
  ];
  
  for (const variation of izharVariations) {
    if (normalized === variation || normalized.includes(variation)) {
      console.log(`✅ IZHAR DETECTED: className="${className}" normalized="${normalized}"`);
      return 'izhar';
    }
  }
  
  // Check other rules
  if (normalized.includes('ghunnah') || normalized.includes('gunnah')) return 'ghunnah';
  if (normalized.includes('madd') || normalized.includes('mad')) return 'madd';
  if (normalized.includes('qalq') || normalized.includes('qalaq')) return 'qalqalah';
  if (normalized.includes('idgham') || normalized.includes('idghaam')) return 'idgham';
  if (normalized.includes('ikhf') || normalized.includes('ikhaf')) return 'ikhfa';
  if (normalized.includes('iqlab') || normalized.includes('iqlaab')) return 'iqlab';
  
  // Log unknown class names
  console.log(`❓ Unknown class: "${className}"`);
  return null;
};

/**
 * Map class name to color
 * COMPREHENSIVE color mapping with ALL variations
 */
export const getTajweedColor = (className) => {
  if (!className) return null;
  
  const normalized = className.toLowerCase().replace(/_/g, '-');
  
  const colorMap = {
    // Ghunnah
    'ghunnah': TAJWEED_COLORS.ghunnah,
    'gunnah': TAJWEED_COLORS.ghunnah,
    
    // Madd
    'madd': TAJWEED_COLORS.madd_normal,
    'mad': TAJWEED_COLORS.madd_normal,
    'madd-normal': TAJWEED_COLORS.madd_normal,
    'madd-wajib': TAJWEED_COLORS.madd_wajib,
    'madd-munfasil': TAJWEED_COLORS.madd_munfasil,
    'madd-lazim': TAJWEED_COLORS.madd_lazim,
    'madda': TAJWEED_COLORS.madd_normal,
    'madda-normal': TAJWEED_COLORS.madd_normal,
    'madda-permissible': TAJWEED_COLORS.madd_munfasil,
    'madda-obligatory': TAJWEED_COLORS.madd_wajib,
    
    // Qalqalah
    'qalqalah': TAJWEED_COLORS.qalqalah,
    'qalaqah': TAJWEED_COLORS.qalqalah,
    'qalqala': TAJWEED_COLORS.qalqalah,
    
    // Idgham
    'idgham': TAJWEED_COLORS.idgham_wo_ghunnah,
    'idghaam': TAJWEED_COLORS.idgham_wo_ghunnah,
    'idgham-wo-ghunnah': TAJWEED_COLORS.idgham_wo_ghunnah,
    'idgham-w-ghunnah': TAJWEED_COLORS.idgham_w_ghunnah,
    'idgham-ghunnah': TAJWEED_COLORS.idgham_w_ghunnah,
    
    // Ikhfa
    'ikhfa': TAJWEED_COLORS.ikhfa,
    'ikhfaa': TAJWEED_COLORS.ikhfa,
    'ikhafa': TAJWEED_COLORS.ikhfa,
    'ikhfa-shafawi': TAJWEED_COLORS.ikhfa,
    
    // Izhar - ALL VARIATIONS WITH LOGGING
    'izhar': TAJWEED_COLORS.izhar,
    'izhaar': TAJWEED_COLORS.izhar,
    'izhar-halqi': TAJWEED_COLORS.izhar,
    'izhaar-halqi': TAJWEED_COLORS.izhar,
    'izhar-halq': TAJWEED_COLORS.izhar,
    'izhaar-halq': TAJWEED_COLORS.izhar,
    'izhar-shafawi': TAJWEED_COLORS.izhar,
    'izhaar-shafawi': TAJWEED_COLORS.izhar,
    
    // Iqlab
    'iqlab': TAJWEED_COLORS.iqlab,
    'iqlaab': TAJWEED_COLORS.iqlab,
    
    // Silent
    'silent': TAJWEED_COLORS.silent,
    'slnt': TAJWEED_COLORS.silent,
    
    // Hamzat Wasl
    'hamzat-wasl': TAJWEED_COLORS.hamzat_wasl,
    'ham-wasl': TAJWEED_COLORS.hamzat_wasl,
    'hamza-wasl': TAJWEED_COLORS.hamzat_wasl,
    
    // Laam Shamsiyah
    'laam-shamsiyah': TAJWEED_COLORS.laam_shamsiyah,
    'lam-shamsiyah': TAJWEED_COLORS.laam_shamsiyah,
  };

  // Try exact match
  if (colorMap[normalized]) {
    const color = colorMap[normalized];
    console.log(`🎨 Color found: "${className}" → ${color}`);
    return color;
  }

  // Try partial match
  for (const [key, color] of Object.entries(colorMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      console.log(`🎨 Color matched (partial): "${className}" → ${color}`);
      return color;
    }
  }

  console.log(`⚠️ No color for: "${className}"`);
  return null;
};