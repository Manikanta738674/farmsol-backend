export interface CropDefinition {
  id: string;
  name: string;
  nameTe: string;
  nameHi: string;
  category: 'CEREALS' | 'PULSES' | 'OILSEEDS' | 'CASH_CROPS' | 'VEGETABLES' | 'FRUITS' | 'SPICES' | 'CUSTOM';
  mspRatePerQuintal: number;
  maxMoisturePercent: number;
  grade: string;
  icon: string;
  isCustom?: boolean;
}

export const CROP_CATEGORIES = [
  { id: 'ALL', label: 'All Crops', labelTe: 'అన్ని పంటలు', labelHi: 'सभी फसलें' },
  { id: 'CEREALS', label: 'Cereals & Millets', labelTe: 'ధాన్యాలు & చిరుధాన్యాలు', labelHi: 'अनाज और बाजरा' },
  { id: 'PULSES', label: 'Pulses & Legumes', labelTe: 'పప్పుధాన్యాలు', labelHi: 'दालें' },
  { id: 'OILSEEDS', label: 'Oilseeds', labelTe: 'నూనె గింజలు', labelHi: 'तिलहन' },
  { id: 'CASH_CROPS', label: 'Commercial & Cash', labelTe: 'వాణిజ్య పంటలు', labelHi: 'व्यावसायिक फसलें' },
  { id: 'VEGETABLES', label: 'Vegetables', labelTe: 'కూరగాయలు', labelHi: 'सब्जियां' },
  { id: 'FRUITS', label: 'Fruits & Horticulture', labelTe: 'పండ్లు & ఉద్యానవన', labelHi: 'फल एवं बागवानी' },
  { id: 'SPICES', label: 'Spices & Plantation', labelTe: 'మసాలా దినుసులు', labelHi: 'मसाले' },
  { id: 'CUSTOM', label: 'Custom / Other Crop', labelTe: 'స్వంత / ఇతర పంట', labelHi: 'अन्य / अपनी फसल' }
];

export const COMPREHENSIVE_CROPS: CropDefinition[] = [
  // --- CEREALS & MILLETS ---
  {
    id: 'crop-paddy-a',
    name: 'Paddy (Grade A)',
    nameTe: 'వరి (గ్రేడ్-ఎ)',
    nameHi: 'धान (ग्रेड-ए)',
    category: 'CEREALS',
    mspRatePerQuintal: 2320,
    maxMoisturePercent: 17.0,
    grade: 'Grade A',
    icon: '🌾'
  },
  {
    id: 'crop-paddy-common',
    name: 'Paddy (Common)',
    nameTe: 'వరి (సాధారణ)',
    nameHi: 'धान (सामान्य)',
    category: 'CEREALS',
    mspRatePerQuintal: 2300,
    maxMoisturePercent: 17.0,
    grade: 'Common',
    icon: '🌾'
  },
  {
    id: 'crop-wheat',
    name: 'Wheat (Sharbati / Common)',
    nameTe: 'గోధుమలు',
    nameHi: 'गेहूं (शरबती / सामान्य)',
    category: 'CEREALS',
    mspRatePerQuintal: 2275,
    maxMoisturePercent: 12.0,
    grade: 'Grade A',
    icon: '🌾'
  },
  {
    id: 'crop-maize',
    name: 'Maize (Corn)',
    nameTe: 'మొక్కజొన్న',
    nameHi: 'मक्का',
    category: 'CEREALS',
    mspRatePerQuintal: 2090,
    maxMoisturePercent: 14.0,
    grade: 'Hybrid',
    icon: '🌽'
  },
  {
    id: 'crop-jowar-hybrid',
    name: 'Jowar (Sorghum - Hybrid)',
    nameTe: 'జొన్నలు (హైబ్రిడ్)',
    nameHi: 'ज्वार (हाइब्रिड)',
    category: 'CEREALS',
    mspRatePerQuintal: 3180,
    maxMoisturePercent: 14.0,
    grade: 'Hybrid',
    icon: '🌾'
  },
  {
    id: 'crop-bajra',
    name: 'Bajra (Pearl Millet)',
    nameTe: 'సజ్జలు',
    nameHi: 'बाजरा',
    category: 'CEREALS',
    mspRatePerQuintal: 2500,
    maxMoisturePercent: 13.0,
    grade: 'Standard',
    icon: '🌾'
  },
  {
    id: 'crop-ragi',
    name: 'Ragi (Finger Millet)',
    nameTe: 'రాగులు (చోళ్ళు)',
    nameHi: 'रागी (मडुआ)',
    category: 'CEREALS',
    mspRatePerQuintal: 3846,
    maxMoisturePercent: 12.0,
    grade: 'Grade A',
    icon: '🌾'
  },
  {
    id: 'crop-barley',
    name: 'Barley (Jau)',
    nameTe: 'బార్లీ',
    nameHi: 'जौ',
    category: 'CEREALS',
    mspRatePerQuintal: 1850,
    maxMoisturePercent: 12.0,
    grade: 'Standard',
    icon: '🌾'
  },

  // --- PULSES ---
  {
    id: 'crop-gram',
    name: 'Gram (Chickpea / Chana)',
    nameTe: 'శనగలు',
    nameHi: 'चना (ग्राम)',
    category: 'PULSES',
    mspRatePerQuintal: 5440,
    maxMoisturePercent: 12.0,
    grade: 'Desi/Kabuli',
    icon: '🫘'
  },
  {
    id: 'crop-tur-arhar',
    name: 'Tur / Arhar (Pigeon Pea)',
    nameTe: 'కందులు',
    nameHi: 'अरहर / तूर',
    category: 'PULSES',
    mspRatePerQuintal: 7000,
    maxMoisturePercent: 12.0,
    grade: 'Grade A',
    icon: '🫘'
  },
  {
    id: 'crop-moong',
    name: 'Moong (Green Gram)',
    nameTe: 'పెసలు',
    nameHi: 'मूंग',
    category: 'PULSES',
    mspRatePerQuintal: 8558,
    maxMoisturePercent: 12.0,
    grade: 'Grade A',
    icon: '🫘'
  },
  {
    id: 'crop-urad',
    name: 'Urad (Black Gram)',
    nameTe: 'మినుములు',
    nameHi: 'उड़द',
    category: 'PULSES',
    mspRatePerQuintal: 6950,
    maxMoisturePercent: 12.0,
    grade: 'Grade A',
    icon: '🫘'
  },
  {
    id: 'crop-masoor',
    name: 'Masoor (Lentil)',
    nameTe: 'ఎర్ర కందులు (మసూర్)',
    nameHi: 'मसूर',
    category: 'PULSES',
    mspRatePerQuintal: 6425,
    maxMoisturePercent: 12.0,
    grade: 'Grade A',
    icon: '🫘'
  },
  {
    id: 'crop-soyabean',
    name: 'Soyabean (Yellow)',
    nameTe: 'సోయాబీన్',
    nameHi: 'सोयाबीन (पीला)',
    category: 'PULSES',
    mspRatePerQuintal: 4600,
    maxMoisturePercent: 12.0,
    grade: 'Yellow',
    icon: '🫘'
  },

  // --- OILSEEDS ---
  {
    id: 'crop-groundnut',
    name: 'Groundnut (Pods)',
    nameTe: 'వేరుశనగ కాయలు',
    nameHi: 'मूंगफली',
    category: 'OILSEEDS',
    mspRatePerQuintal: 6377,
    maxMoisturePercent: 9.0,
    grade: 'Standard',
    icon: '🥜'
  },
  {
    id: 'crop-mustard',
    name: 'Mustard / Rapeseed',
    nameTe: 'ఆవాలు',
    nameHi: 'सरसों / राई',
    category: 'OILSEEDS',
    mspRatePerQuintal: 5650,
    maxMoisturePercent: 8.0,
    grade: 'Grade A',
    icon: '🌱'
  },
  {
    id: 'crop-sunflower',
    name: 'Sunflower Seed',
    nameTe: 'పొద్దుతిరుగుడు గింజలు',
    nameHi: 'सूरजमुखी बीज',
    category: 'OILSEEDS',
    mspRatePerQuintal: 6760,
    maxMoisturePercent: 9.0,
    grade: 'Standard',
    icon: '🌻'
  },
  {
    id: 'crop-sesamum',
    name: 'Sesame (Til)',
    nameTe: 'నువ్వులు',
    nameHi: 'तिल',
    category: 'OILSEEDS',
    mspRatePerQuintal: 8635,
    maxMoisturePercent: 8.0,
    grade: 'White/Black',
    icon: '🌱'
  },

  // --- COMMERCIAL & CASH CROPS ---
  {
    id: 'crop-cotton-medium',
    name: 'Cotton (Medium Staple)',
    nameTe: 'ప్రత్తి (మధ్యమ రకం)',
    nameHi: 'कपास (मध्यम रेशा)',
    category: 'CASH_CROPS',
    mspRatePerQuintal: 6620,
    maxMoisturePercent: 8.0,
    grade: 'Medium Staple',
    icon: '☁️'
  },
  {
    id: 'crop-cotton-long',
    name: 'Cotton (Long Staple)',
    nameTe: 'ప్రత్తి (పొడవు రకం)',
    nameHi: 'कपास (लंबा रेशा)',
    category: 'CASH_CROPS',
    mspRatePerQuintal: 7020,
    maxMoisturePercent: 8.0,
    grade: 'Long Staple',
    icon: '☁️'
  },
  {
    id: 'crop-sugarcane',
    name: 'Sugarcane (FRP / SAP)',
    nameTe: 'చెరకు',
    nameHi: 'गन्ना',
    category: 'CASH_CROPS',
    mspRatePerQuintal: 340,
    maxMoisturePercent: 80.0,
    grade: 'Standard',
    icon: '🎋'
  },
  {
    id: 'crop-jute',
    name: 'Raw Jute (TD-5)',
    nameTe: 'జనపనార',
    nameHi: 'कच्चा जूट',
    category: 'CASH_CROPS',
    mspRatePerQuintal: 5050,
    maxMoisturePercent: 14.0,
    grade: 'TD-5',
    icon: '🌾'
  },
  {
    id: 'crop-tobacco',
    name: 'Tobacco (FCV / Non-FCV)',
    nameTe: 'పొగాకు',
    nameHi: 'तंबाकू',
    category: 'CASH_CROPS',
    mspRatePerQuintal: 8500,
    maxMoisturePercent: 15.0,
    grade: 'FCV',
    icon: '🍂'
  },

  // --- VEGETABLES ---
  {
    id: 'crop-tomato',
    name: 'Tomato (Hybrid / Local)',
    nameTe: 'టమోటా',
    nameHi: 'टमाटर',
    category: 'VEGETABLES',
    mspRatePerQuintal: 1800,
    maxMoisturePercent: 85.0,
    grade: 'Fresh Market',
    icon: '🍅'
  },
  {
    id: 'crop-onion',
    name: 'Onion (Red / White / Nashik)',
    nameTe: 'ఉల్లిపాయలు',
    nameHi: 'प्याज',
    category: 'VEGETABLES',
    mspRatePerQuintal: 2100,
    maxMoisturePercent: 12.0,
    grade: 'Fair Average',
    icon: '🧅'
  },
  {
    id: 'crop-potato',
    name: 'Potato (Jyoti / Chipsona)',
    nameTe: 'బంగాళాదుంపలు (ఆలు)',
    nameHi: 'आलू',
    category: 'VEGETABLES',
    mspRatePerQuintal: 1650,
    maxMoisturePercent: 14.0,
    grade: 'Table Variety',
    icon: '🥔'
  },
  {
    id: 'crop-chilli-dry',
    name: 'Red Chilli (Dry / Guntur)',
    nameTe: 'ఎండు మిర్చి (గుంటూరు)',
    nameHi: 'सूखी लाल मिर्च',
    category: 'VEGETABLES',
    mspRatePerQuintal: 14500,
    maxMoisturePercent: 10.0,
    grade: 'Teja / Deluxe',
    icon: '🌶️'
  },
  {
    id: 'crop-turmeric',
    name: 'Turmeric (Haldi Fingers)',
    nameTe: 'పసుపు కొమ్ములు',
    nameHi: 'हल्दी (कच्ची/सूखी)',
    category: 'VEGETABLES',
    mspRatePerQuintal: 8200,
    maxMoisturePercent: 10.0,
    grade: 'Finger Grade',
    icon: '🫚'
  },
  {
    id: 'crop-ginger',
    name: 'Ginger (Fresh / Dry Sonth)',
    nameTe: 'అల్లం',
    nameHi: 'अदरक / सोंठ',
    category: 'VEGETABLES',
    mspRatePerQuintal: 6500,
    maxMoisturePercent: 12.0,
    grade: 'Fresh Root',
    icon: '🫚'
  },
  {
    id: 'crop-garlic',
    name: 'Garlic (Desi / Ooty)',
    nameTe: 'వెల్లుల్లి',
    nameHi: 'लहसुन',
    category: 'VEGETABLES',
    mspRatePerQuintal: 7800,
    maxMoisturePercent: 11.0,
    grade: 'Grade A',
    icon: '🧄'
  },

  // --- FRUITS & HORTICULTURE ---
  {
    id: 'crop-mango',
    name: 'Mango (Banganapalli / Alphonso)',
    nameTe: 'మామిడి పండ్లు (బంగినపల్లి)',
    nameHi: 'आम (दशहरी / अल्फांसो)',
    category: 'FRUITS',
    mspRatePerQuintal: 3500,
    maxMoisturePercent: 80.0,
    grade: 'Table Grade',
    icon: '🥭'
  },
  {
    id: 'crop-banana',
    name: 'Banana (Robusta / G9)',
    nameTe: 'అరటి పండ్లు',
    nameHi: 'केला',
    category: 'FRUITS',
    mspRatePerQuintal: 1900,
    maxMoisturePercent: 75.0,
    grade: 'Premium Hands',
    icon: '🍌'
  },
  {
    id: 'crop-coconut',
    name: 'Copra (Milling / Ball Coconut)',
    nameTe: 'కొబ్బరి (కొబ్బరి కాయలు)',
    nameHi: 'खोपरा / नारियल',
    category: 'FRUITS',
    mspRatePerQuintal: 10860,
    maxMoisturePercent: 6.0,
    grade: 'Milling',
    icon: '🥥'
  },
  {
    id: 'crop-cashew',
    name: 'Raw Cashew Nuts',
    nameTe: 'జీడిమామిడి గింజలు',
    nameHi: 'कच्चा काजू',
    category: 'FRUITS',
    mspRatePerQuintal: 9200,
    maxMoisturePercent: 9.0,
    grade: 'Grade A',
    icon: '🥜'
  },

  // --- SPICES & PLANTATION ---
  {
    id: 'crop-coriander',
    name: 'Coriander Seed (Dhania)',
    nameTe: 'ధనియాలు',
    nameHi: 'धनिया बीज',
    category: 'SPICES',
    mspRatePerQuintal: 7400,
    maxMoisturePercent: 10.0,
    grade: 'Eagle Quality',
    icon: '🌿'
  },
  {
    id: 'crop-cumin',
    name: 'Cumin Seed (Jeera)',
    nameTe: 'జీలకర్ర',
    nameHi: 'जीरा',
    category: 'SPICES',
    mspRatePerQuintal: 28500,
    maxMoisturePercent: 9.0,
    grade: 'Export Grade',
    icon: '🌱'
  },
  {
    id: 'crop-black-pepper',
    name: 'Black Pepper (Garbled)',
    nameTe: 'మిరియాలు',
    nameHi: 'काली मिर्च',
    category: 'SPICES',
    mspRatePerQuintal: 48000,
    maxMoisturePercent: 11.0,
    grade: 'Garbled',
    icon: '🫘'
  },

  // --- SPECIAL CUSTOM / ENTER OWN CROP ---
  {
    id: 'OTHER_CUSTOM',
    name: 'Other / Custom Crop (Enter Your Own)',
    nameTe: 'ఇతర / స్వంత పంట (మీ పంట పేరు రాయండి)',
    nameHi: 'अन्य / अपनी फसल (स्वयं दर्ज करें)',
    category: 'CUSTOM',
    mspRatePerQuintal: 2500,
    maxMoisturePercent: 14.0,
    grade: 'Farmer Verified',
    icon: '✨',
    isCustom: true
  }
];
