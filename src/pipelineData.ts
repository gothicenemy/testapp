export interface ProductItem {
  id: string | number;
  manufacturer: string;
  manufacturer_id?: string;
  product_name: string;
  series_name?: string;
  category: string;
  classification: 'NEW_PRODUCT' | 'NEW_SERIES' | 'NEW_GENERATION' | 'MAJOR_UPDATE' | 'NOT_RELEVANT' | 'UNCERTAIN';
  confidence: number;
  canonical_hash: string;
  short_description: string;
  why_interesting: string;
  source_url: string;
  image_url: string;
  specs: {
    power_w?: number;
    luminous_flux_lm?: number;
    efficacy_lm_w: number;
    cri?: number;
    cct?: string[];
    ip?: string;
    ugr?: number;
    optics?: string[];
    control?: string[];
  };
  metrics: {
    energySavingsPct: number;
    efficacyTier: 'Лідер енергоефективності' | 'Висока продуктивність' | 'Стандартна';
  };
  pipelineStatus: 'Активний' | 'На перевірці' | 'В архіві';
  discoveredAt: string;
}

export interface ManufacturerItem {
  id: string;
  name: string;
  domain: string;
  country: string;
  specialization: string;
  products_url: string;
  sitemap_url: string;
  is_js_rendered: boolean;
  active: boolean;
}

export const ALL_20_MANUFACTURERS: ManufacturerItem[] = [
  { id: 'erco', name: 'ERCO', domain: 'erco.com', country: 'Німеччина', specialization: 'Музейні трекові споти, прецизійні лінзи', products_url: 'https://www.erco.com/en/products/', sitemap_url: 'https://www.erco.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'zumtobel', name: 'Zumtobel', domain: 'zumtobel.com', country: 'Австрія', specialization: 'Лінійні магістралі, біодинамічне освітлення HCL', products_url: 'https://www.zumtobel.com/gb-en/products.html', sitemap_url: 'https://www.zumtobel.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'iguzzini', name: 'iGuzzini', domain: 'iguzzini.com', country: 'Італія', specialization: 'Профільні кадрувальні прожектори, мініатюрна оптика', products_url: 'https://www.iguzzini.com/en/indoor-lighting/', sitemap_url: 'https://www.iguzzini.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'targetti', name: 'Targetti', domain: 'targetti.com', country: 'Італія', specialization: 'Фасадні проектори, ґрунтові світильники IP68', products_url: 'https://www.targetti.com/en/Products/Indoor', sitemap_url: 'https://www.targetti.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'fagerhult', name: 'Fagerhult', domain: 'fagerhult.com', country: 'Швеція', specialization: 'Офісні нано-лінзові світильники, бездротові сенсори', products_url: 'https://www.fagerhult.com/products/', sitemap_url: 'https://www.fagerhult.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'trilux', name: 'Trilux', domain: 'trilux.com', country: 'Німеччина', specialization: 'Промислові магістралі, рекордна світловіддача 170 лм/Вт', products_url: 'https://www.trilux.com/en/products/', sitemap_url: 'https://www.trilux.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'xal', name: 'XAL', domain: 'xal.com', country: 'Австрія', specialization: 'Ультратонкі 25мм магнітні треки, мінімалізм', products_url: 'https://www.xal.com/en/products', sitemap_url: 'https://www.xal.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'delta_light', name: 'Delta Light', domain: 'deltalight.com', country: 'Бельгія', specialization: 'Світло-акустичні комплекси, розумні сенсори повітря', products_url: 'https://www.deltalight.com/en/products', sitemap_url: 'https://www.deltalight.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'flos', name: 'Flos', domain: 'flos.com', country: 'Італія', specialization: 'Безрамні архітектурні магнітні профілі Trimless', products_url: 'https://professional.flos.com/en/global/', sitemap_url: 'https://professional.flos.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'artemide', name: 'Artemide', domain: 'artemide.com', country: 'Італія', specialization: 'Радіусні гнучкі модульні системи перерізом 24мм', products_url: 'https://www.artemide.com/en/products/indoor', sitemap_url: 'https://www.artemide.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'bega', name: 'BEGA', domain: 'bega.com', country: 'Німеччина', specialization: 'Екстер\'єрні прожектори IP67, покриття Unidure', products_url: 'https://www.bega.com/en/products/', sitemap_url: 'https://www.bega.com/en/sitemap.xml', is_js_rendered: false, active: true },
  { id: 'regent', name: 'Regent', domain: 'regent.ch', country: 'Швейцарія', specialization: 'Розумні офісні торшери з радаром UGR < 11', products_url: 'https://www.regent.ch/en/products/overview/', sitemap_url: 'https://www.regent.ch/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'molto_luce', name: 'Molto Luce', domain: 'moltoluce.com', country: 'Австрія', specialization: 'Мініатюрні вбудовані даунлайти з поворотним блоком', products_url: 'https://www.moltoluce.com/en/products/', sitemap_url: 'https://www.moltoluce.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'rzb', name: 'RZB', domain: 'rzb.de', country: 'Німеччина', specialization: 'Офісні панелі з перемикачем MultiLumen, UGR < 19', products_url: 'https://www.rzb.de/en/products/', sitemap_url: 'https://www.rzb.de/sitemap.xml', is_js_rendered: false, active: true },
  { id: 'thorlux', name: 'Thorlux', domain: 'thorlux.com', country: 'Велика Британія', specialization: 'Захищені світильники IP65 з бездротовою мережею 868MHz', products_url: 'https://www.thorlux.com/products', sitemap_url: 'https://www.thorlux.com/sitemap.xml', is_js_rendered: false, active: true },
  { id: 'thorn', name: 'Thorn', domain: 'thornlighting.com', country: 'Австрія / UK', specialization: 'Міські ліхтарі Dark Sky 2200K, роз\'єми Zhaga Book 18', products_url: 'https://www.thornlighting.com/en-gb/products', sitemap_url: 'https://www.thornlighting.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'slv', name: 'SLV', domain: 'slv.com', country: 'Німеччина', specialization: 'Універсальні модульні родини спотів NUMINOS', products_url: 'https://www.slv.com/en_gb/products', sitemap_url: 'https://www.slv.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'wever_ducre', name: 'Wever & Ducré', domain: 'weverducre.com', country: 'Бельгія', specialization: 'Локальні вологозахищені світильники IP44 CRI 95', products_url: 'https://www.weverducre.com/en/products', sitemap_url: 'https://www.weverducre.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'modular_lighting', name: 'Modular Lighting', domain: 'supermodular.com', country: 'Бельгія', specialization: 'Авангардні вбудовані купольні інструменти Hollow', products_url: 'https://www.supermodular.com/en/products', sitemap_url: 'https://www.supermodular.com/sitemap.xml', is_js_rendered: true, active: true },
  { id: 'luceplan', name: 'Luceplan', domain: 'luceplan.com', country: 'Італія', specialization: 'Акустичні підвісні світильники з вовною Kvadrat', products_url: 'https://www.luceplan.com/products/', sitemap_url: 'https://www.luceplan.com/sitemap.xml', is_js_rendered: true, active: true },
];

export const INITIAL_BASELINE_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_targetti_dart',
    manufacturer: 'TARGETTI',
    manufacturer_id: 'targetti',
    product_name: 'Dart Medium Projector (Floodlight IP66)',
    series_name: 'Dart',
    category: 'Фасадний архітектурний прожектор IP66',
    classification: 'NEW_PRODUCT',
    confidence: 0.96,
    canonical_hash: '1b892f33c0993081',
    short_description: 'Фасадний архітектурний прожектор середнього формату з гібридною оптичною системою рефлектора та високим захистом IP66.',
    why_interesting: 'Прожектор середнього формату з оптичною системою гібридного рефлектора для прецизійного фасадного освітлення без світлового забруднення.',
    source_url: 'https://www.targetti.com/en/Products/Outdoor/Projectors/Dart/Dart-Medium',
    image_url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 48,
      luminous_flux_lm: 5900,
      efficacy_lm_w: 123,
      cri: 90,
      cct: ['3000K', '4000K'],
      ip: 'IP66',
      ugr: 14,
      optics: ['Spot 14°', 'Flood 38°', 'Wall Washer'],
      control: ['DALI-2']
    },
    metrics: {
      energySavingsPct: 17.1,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 10:00'
  },
  {
    id: 'prod_erco_parscan',
    manufacturer: 'ERCO',
    manufacturer_id: 'erco',
    product_name: 'Parscan 48V Spotlight (7334)',
    series_name: 'Parscan',
    category: 'Низьковольтний трековий прожектор 48V',
    classification: 'NEW_GENERATION',
    confidence: 0.98,
    canonical_hash: '3f7d1b8c0a9e4211',
    short_description: 'Мініатюрний низьковольтний 48V трековий прожектор зі змінними лінзами Spherolit та Darklight оптикою.',
    why_interesting: 'Низьковольтна шинна система 48V з високою енергоефективністю 135 лм/Вт та можливістю швидкої заміни оптичних лінз без інструментів.',
    source_url: 'https://www.erco.com/en/products/indoor/spotlights-for-track/parscan-new-48v-7334/',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 12,
      luminous_flux_lm: 1620,
      efficacy_lm_w: 135,
      cri: 92,
      cct: ['3000K', '4000K'],
      ip: 'IP20',
      ugr: 12,
      optics: ['Spot', 'Flood', 'Wide Flood', 'Oval Flood'],
      control: ['DALI', 'Casambi']
    },
    metrics: {
      energySavingsPct: 28.5,
      efficacyTier: 'Лідер енергоефективності'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 10:45'
  },
  {
    id: 'prod_zumtobel_slotlight',
    manufacturer: 'ZUMTOBEL',
    manufacturer_id: 'zumtobel',
    product_name: 'SLOTLIGHT Infinity II Continuous-Row',
    series_name: 'SLOTLIGHT',
    category: 'Модульна світлова лінія без швів',
    classification: 'MAJOR_UPDATE',
    confidence: 0.95,
    canonical_hash: '2c5e7b9a1d3f4a8b',
    short_description: 'Модульна неперервна світлова лінія без швів та тіней довжиною до 50 метрів з офісною оптикою UGR<16.',
    why_interesting: 'Безшовна світлова лінія з ідеальною рівномірністю свічення та можливістю кутових з\'єднань 90 градусів.',
    source_url: 'https://www.zumtobel.com/gb-en/products/slotlightinfinity_II.html',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 28,
      luminous_flux_lm: 3800,
      efficacy_lm_w: 136,
      cri: 90,
      cct: ['3000K', '4000K', 'Tunable White'],
      ip: 'IP40',
      ugr: 16,
      optics: ['Opal Diffuser', 'Microprismatic UGR<19'],
      control: ['DALI-2', 'Bluetooth basicDIM']
    },
    metrics: {
      energySavingsPct: 29.5,
      efficacyTier: 'Лідер енергоефективності'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 11:15'
  },
  {
    id: 'prod_trilux_eline',
    manufacturer: 'TRILUX',
    manufacturer_id: 'trilux',
    product_name: 'E-Line Pro Continuous Trunking',
    series_name: 'E-Line Pro',
    category: 'Магістральна світлодіодна лінія',
    classification: 'NEW_GENERATION',
    confidence: 0.97,
    canonical_hash: '7c8d9e0f1a2b3c4d',
    short_description: 'Промислова магістральна лінія з рекордною енергоефективністю 170 лм/Вт та вбудованою шиною IoT LiveLink.',
    why_interesting: 'Рекордна системна світловіддача 170 лм/Вт з інтегрованою IoT-шиною живлення та хмарним моніторингом LiveLink.',
    source_url: 'https://www.trilux.com/en/products/e-line-next-led/',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 52,
      luminous_flux_lm: 8840,
      efficacy_lm_w: 170,
      cri: 80,
      cct: ['4000K', '5000K'],
      ip: 'IP54',
      ugr: 19,
      optics: ['Double Asymmetric', 'Deep Wide Beam'],
      control: ['DALI-2', 'LiveLink IoT']
    },
    metrics: {
      energySavingsPct: 61.9,
      efficacyTier: 'Лідер енергоефективності'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 11:30'
  },
  {
    id: 'prod_iguzzini_palco',
    manufacturer: 'iGUZZINI',
    manufacturer_id: 'iguzzini',
    product_name: 'Palco Spotlight Ø62mm (Optibeam Lens)',
    series_name: 'Palco',
    category: 'Кадрувальний архітектурний прожектор Ø62 мм',
    classification: 'NEW_PRODUCT',
    confidence: 0.96,
    canonical_hash: '5b81a2f3c09941a2',
    short_description: 'Високоточний профільний прожектор діаметром 62 мм з регульованою діафрагмою для музейного кадрування полотен.',
    why_interesting: 'Оптична система Optibeam з мікрометричним регулюванням шторок для створення різких геометричних світлових плям без хроматичних аберацій.',
    source_url: 'https://www.iguzzini.com/en/palco-62-mm/',
    image_url: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 19,
      luminous_flux_lm: 2150,
      efficacy_lm_w: 113,
      cri: 97,
      cct: ['3000K', '4000K'],
      ip: 'IP20',
      ugr: 10,
      optics: ['Framing Shutter 15°-35°'],
      control: ['DALI-2']
    },
    metrics: {
      energySavingsPct: 15.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 12:00'
  },
  {
    id: 'prod_fagerhult_notor',
    manufacturer: 'FAGERHULT',
    manufacturer_id: 'fagerhult',
    product_name: 'Notor 65 Dynamic Pendant LED',
    series_name: 'Notor 65',
    category: 'Підвісна лінійна система',
    classification: 'NEW_GENERATION',
    confidence: 0.95,
    canonical_hash: '8a12e34f5b67c890',
    short_description: 'Скандинавська біодинамічна система з технологією Double Dynamic Lighting для офісів.',
    why_interesting: 'Імітація природного добового циклу освітлення з автоматичним зміщенням спектру від 2700K до 6500K та ефективністю 145 лм/Вт.',
    source_url: 'https://www.fagerhult.com/products/notor-65/',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 35,
      luminous_flux_lm: 5075,
      efficacy_lm_w: 145,
      cri: 90,
      cct: ['2700K-6500K Tunable White'],
      ip: 'IP20',
      ugr: 15,
      optics: ['Beta Opti Nano', 'Microprismatic'],
      control: ['DALI-2', 'Organic Response']
    },
    metrics: {
      energySavingsPct: 38.0,
      efficacyTier: 'Лідер енергоефективності'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 12:30'
  },
  {
    id: 'prod_xal_moveit',
    manufacturer: 'XAL',
    manufacturer_id: 'xal',
    product_name: 'MOVE IT 25 System (Magnetic Track 48V)',
    series_name: 'MOVE IT 25',
    category: 'Магнітна трекова система',
    classification: 'NEW_PRODUCT',
    confidence: 0.97,
    canonical_hash: '3e4a5b6c7d8e9f01',
    short_description: 'Ультратонкий 25мм магнітний трековий профіль із безінструментальною фіксацією модулів.',
    why_interesting: 'Мінімалістична висота профілю лише 25 мм із можливістю гарячої заміни світильників під напругою 48V.',
    source_url: 'https://www.xal.com/en/move-it-25',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 24,
      luminous_flux_lm: 2880,
      efficacy_lm_w: 120,
      cri: 90,
      cct: ['3000K', '4000K'],
      ip: 'IP20',
      ugr: 16,
      optics: ['Opal', 'Microprismatic', 'Wallwasher'],
      control: ['DALI-2']
    },
    metrics: {
      energySavingsPct: 20.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 13:00'
  },
  {
    id: 'prod_delta_light_soliscape',
    manufacturer: 'DELTA LIGHT',
    manufacturer_id: 'delta_light',
    product_name: 'Soliscape Active Smart System',
    series_name: 'Soliscape',
    category: 'Світло-акустичний комплекс',
    classification: 'NEW_PRODUCT',
    confidence: 0.98,
    canonical_hash: '9c0b1a2d3e4f5a6b',
    short_description: 'Інтегрована система освітлення та шумопоглинання, розроблена спільно з UNStudio.',
    why_interesting: 'Поєднання модульних світильників з акустичними панелями Soli-Shhh та вбудованими датчиками присутності та якості повітря.',
    source_url: 'https://deltalight.com/en/products/soliscape',
    image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 42,
      luminous_flux_lm: 5250,
      efficacy_lm_w: 125,
      cri: 90,
      cct: ['3000K', 'Tunable White'],
      ip: 'IP20',
      ugr: 14,
      optics: ['Faceted Reflector 33°', 'Acoustic Panel'],
      control: ['DALI-2', 'Wireless Mesh']
    },
    metrics: {
      energySavingsPct: 25.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 13:30'
  },
  {
    id: 'prod_flos_running_magnet',
    manufacturer: 'FLOS',
    manufacturer_id: 'flos',
    product_name: 'The Running Magnet Recessed (Model 129)',
    series_name: 'The Running Magnet',
    category: 'Безрамна магнітна система Trimless (Модель 129)',
    classification: 'MAJOR_UPDATE',
    confidence: 0.96,
    canonical_hash: '4d5e6f7a8b9c0d1e',
    short_description: 'Архітектурна модульна магнітна система з повним прихованим вбудовуванням у гіпсокартонні стелі (Модель 129).',
    why_interesting: 'Запатентоване магнітне кріплення Hot-Handling із підтримкою цифрового керування FLOS SMART CONTROL.',
    source_url: 'https://professional.flos.com/en/global/model/the-running-magnet-recessed-model129/',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 32,
      luminous_flux_lm: 3900,
      efficacy_lm_w: 122,
      cri: 90,
      cct: ['2700K', '3000K'],
      ip: 'IP20',
      ugr: 13,
      optics: ['Spot 14°', 'Medium 27°', 'Diffused'],
      control: ['DALI', 'Casambi', 'FLOS Smart']
    },
    metrics: {
      energySavingsPct: 22.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 14:00'
  },
  {
    id: 'prod_artemide_a24',
    manufacturer: 'ARTEMIDE',
    manufacturer_id: 'artemide',
    product_name: 'A.24 Diffused Emission Module',
    series_name: 'A.24',
    category: 'Модульна радіусна система Diffused 24 мм',
    classification: 'NEW_PRODUCT',
    confidence: 0.95,
    canonical_hash: '2a3b4c5d6e7f8a9b',
    short_description: 'Гнучка лінійна система перерізом 24 мм для створення плавних криволінійних геометричних структур.',
    why_interesting: 'Універсальний профіль завтовшки лише 24 мм із можливістю живлення до 14 метрів від однієї точки підключення.',
    source_url: 'https://www.artemide.com/en/subfamily/4439164/a-24-diffused-emission',
    image_url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 29,
      luminous_flux_lm: 3480,
      efficacy_lm_w: 120,
      cri: 90,
      cct: ['3000K', '4000K'],
      ip: 'IP20',
      ugr: 16,
      optics: ['Diffused', 'Sharp 20°/40°'],
      control: ['DALI-2', 'Artemide App']
    },
    metrics: {
      energySavingsPct: 20.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 14:30'
  },
  {
    id: 'prod_bega_floodlight',
    manufacturer: 'BEGA',
    manufacturer_id: 'bega',
    product_name: 'Performance Floodlight 84618 (Unidure IP67)',
    series_name: 'Performance Floodlight',
    category: 'Екстер\'єрний фасадний прожектор IP67',
    classification: 'NEW_GENERATION',
    confidence: 0.98,
    canonical_hash: '6b7c8d9e0f1a2b3c',
    short_description: 'Ґрунтовий високопотужний фасадний прожектор із технологією BEGA Vortex Optics.',
    why_interesting: 'Спеціальний лінійний розподіл світла Wallwasher без паразитних світлових конусів із навантаженням до 1000 кг.',
    source_url: 'https://www.bega.com/en/products/outdoor-luminaires/floodlights/high-performance-floodlights-84500/',
    image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 44,
      luminous_flux_lm: 5600,
      efficacy_lm_w: 127,
      cri: 85,
      cct: ['3000K', '4000K'],
      ip: 'IP67',
      ugr: 12,
      optics: ['Asymmetric Wallwasher'],
      control: ['DALI-2']
    },
    metrics: {
      energySavingsPct: 27.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 15:00'
  },
  {
    id: 'prod_regent_lightpad',
    manufacturer: 'REGENT',
    manufacturer_id: 'regent',
    product_name: 'LIGHTPAD Evolution Stand-Alone Luminaire',
    series_name: 'LIGHTPAD Evolution',
    category: 'Офісний автономний торшер UGR<11',
    classification: 'NEW_GENERATION',
    confidence: 0.97,
    canonical_hash: '1f2e3d4c5b6a7980',
    short_description: 'Четверте покоління інтелектуального торшера з подвійним асиметричним світлорозподілом UGR < 11.',
    why_interesting: 'Вбудовані датчики SensoDim та хмарна аналітика зайнятості приміщень MDA з керуванням через додаток Flash MyLight.',
    source_url: 'https://www.regent.ch/en/lightpad-evolution/',
    image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 78,
      luminous_flux_lm: 11700,
      efficacy_lm_w: 150,
      cri: 90,
      cct: ['3000K', '4000K', 'Tunable White'],
      ip: 'IP20',
      ugr: 11,
      optics: ['Double Asymmetric'],
      control: ['DALI', 'SensoDim Radar', 'Bluetooth']
    },
    metrics: {
      energySavingsPct: 45.0,
      efficacyTier: 'Лідер енергоефективності'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 15:30'
  },
  {
    id: 'prod_molto_luce_trigga',
    manufacturer: 'MOLTO LUCE',
    manufacturer_id: 'molto_luce',
    product_name: 'Trigga Loon Mini Volare LFO Spot',
    series_name: 'Trigga',
    category: 'Мініатюрний трековий спот LFO',
    classification: 'NEW_PRODUCT',
    confidence: 0.94,
    canonical_hash: '7d8e9f0a1b2c3d4e',
    short_description: 'Компактний дизайнерський підвісний спот з оптикою LFO для треків Volare.',
    why_interesting: 'Застосування прецизійної мікролінзи LFO, що забезпечує спрямований промінь без прямого засліплення очей.',
    source_url: 'https://www.moltoluce.com/en/products/detail/trigga-loon-mini-volare',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 6,
      luminous_flux_lm: 690,
      efficacy_lm_w: 115,
      cri: 90,
      cct: ['2700K', '3000K'],
      ip: 'IP20',
      ugr: 12,
      optics: ['LFO Lens 30°/55°'],
      control: ['DALI', 'Phase-cut']
    },
    metrics: {
      energySavingsPct: 15.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 16:00'
  },
  {
    id: 'prod_rzb_toledo',
    manufacturer: 'RZB',
    manufacturer_id: 'rzb',
    product_name: 'Toledo Flat LED Panel MultiLumen (UGR19)',
    series_name: 'Toledo Flat',
    category: 'Офісний ультратонкий даунлайт MultiLumen',
    classification: 'MAJOR_UPDATE',
    confidence: 0.96,
    canonical_hash: '4a5b6c7d8e9f0a1b',
    short_description: 'Ультратонкий вбудований круглий світильник з технологією MultiLumen та UGR<19.',
    why_interesting: 'Інтегрований перемикач MultiLumen для регулювання яскравості безпосередньо на корпусі світильника перед монтажем.',
    source_url: 'https://www.rzb.de/en/series/toledo-flat/',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 21,
      luminous_flux_lm: 2600,
      efficacy_lm_w: 124,
      cri: 85,
      cct: ['3000K', '4000K MultiColour'],
      ip: 'IP40/IP20',
      ugr: 19,
      optics: ['Microprismatic Diffuser'],
      control: ['DALI-2', 'MultiLumen Switch']
    },
    metrics: {
      energySavingsPct: 24.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 16:30'
  },
  {
    id: 'prod_thorlux_kanby',
    manufacturer: 'THORLUX',
    manufacturer_id: 'thorlux',
    product_name: 'Kanby Pro SmartScan LED Luminaire',
    series_name: 'Kanby Pro',
    category: 'Захищений лінійний світильник IP65 SmartScan',
    classification: 'NEW_GENERATION',
    confidence: 0.97,
    canonical_hash: '9a8b7c6d5e4f3a2b',
    short_description: 'Надійний сталевий лінійний світильник з полікарбонатним розсіювачем та SmartScan.',
    why_interesting: 'Вбудована автономна бездротова комірчаста мережа SmartScan 868MHz без необхідності прокладання сигнальних кабелів DALI.',
    source_url: 'https://www.thorlux.com/products/kanby-pro',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 38,
      luminous_flux_lm: 5510,
      efficacy_lm_w: 145,
      cri: 80,
      cct: ['4000K'],
      ip: 'IP65',
      ugr: 19,
      optics: ['Opal High Transmission'],
      control: ['SmartScan Wireless', 'DALI']
    },
    metrics: {
      energySavingsPct: 40.0,
      efficacyTier: 'Лідер енергоефективності'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 17:00'
  },
  {
    id: 'prod_thorn_urba',
    manufacturer: 'THORN',
    manufacturer_id: 'thorn',
    product_name: 'Urba City LED Street Lantern (DarkSky)',
    series_name: 'Urba',
    category: 'Міський консольний світильник DarkSky / NightTune',
    classification: 'NEW_PRODUCT',
    confidence: 0.95,
    canonical_hash: '3c4d5e6f7a8b9c0d',
    short_description: 'Міський вуличний ліхтар із нульовим випромінюванням у верхню півсферу.',
    why_interesting: 'Сертифікація DarkSky Approved та підтримка технології NightTune для захисту нічної екосистеми міст.',
    source_url: 'https://www.thornlighting.com/en-gb/products/outdoor-lighting/road-lighting/urba',
    image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 55,
      luminous_flux_lm: 7150,
      efficacy_lm_w: 130,
      cri: 75,
      cct: ['2200K', '3000K NightTune'],
      ip: 'IP66',
      ugr: 16,
      optics: ['Road Comfort R-Optic'],
      control: ['DALI', 'Zhaga Book 18']
    },
    metrics: {
      energySavingsPct: 30.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 17:30'
  },
  {
    id: 'prod_slv_numinos',
    manufacturer: 'SLV',
    manufacturer_id: 'slv',
    product_name: 'NUMINOS R M Recessed Spotlight (1003889)',
    series_name: 'NUMINOS',
    category: 'Врізний стельовий спот Ø105 мм (арт. 1003889)',
    classification: 'NEW_GENERATION',
    confidence: 0.96,
    canonical_hash: '5e6f7a8b9c0d1e2f',
    short_description: 'Модульна родина архітектурних світильників із тисячами конфігурацій.',
    why_interesting: 'Єдина екосистема розмірів S, M, L та XL з уніфікованим дизайном для стельового, врізного та трекового монтажу.',
    source_url: 'https://www.slv.com/en_gb/numinos-r-m-recessed-ceiling-light-4000k-round-white-black-55-1003889.html',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 28,
      luminous_flux_lm: 3360,
      efficacy_lm_w: 120,
      cri: 90,
      cct: ['2700K', '3000K', '4000K'],
      ip: 'IP20/IP54',
      ugr: 13,
      optics: ['Spot 20°', 'Medium 40°', 'Flood 55°'],
      control: ['DALI-2', 'Phase-cut']
    },
    metrics: {
      energySavingsPct: 20.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 18:00'
  },
  {
    id: 'prod_wever_ducre_deeper',
    manufacturer: 'WEVER & DUCRÉ',
    manufacturer_id: 'wever_ducre',
    product_name: 'DEEPER IP44 1.0 Architectural LED (73293)',
    series_name: 'DEEPER',
    category: 'Вбудований вологозахищений даунлайт IP44 (арт. 73293)',
    classification: 'NEW_PRODUCT',
    confidence: 0.97,
    canonical_hash: '7a8b9c0d1e2f3a4b',
    short_description: 'Архітектурний вбудований світильник з глибоким посадковим місцем світлодіода.',
    why_interesting: 'Високий індекс кольоропередачі CRI ≥ 95 та вологозахист IP44 при ультракомпактному врізному діаметрі.',
    source_url: 'https://www.weverducre.com/en/products/p/deeper-ip44-1.0~73293',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 10,
      luminous_flux_lm: 950,
      efficacy_lm_w: 95,
      cri: 95,
      cct: ['2700K', '3000K'],
      ip: 'IP44',
      ugr: 14,
      optics: ['Medium 36°'],
      control: ['DALI-2', 'Phase-cut']
    },
    metrics: {
      energySavingsPct: 10.0,
      efficacyTier: 'Стандартна'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 18:30'
  },
  {
    id: 'prod_modular_hollow',
    manufacturer: 'MODULAR LIGHTING',
    manufacturer_id: 'modular_lighting',
    product_name: 'Hollow Architectural Recessed (48351)',
    series_name: 'Hollow',
    category: 'Авангардний купольний даунлайт (арт. 48351)',
    classification: 'NEW_PRODUCT',
    confidence: 0.95,
    canonical_hash: '2b3c4d5e6f7a8b9c',
    short_description: 'Інноваційний купольний світильник з прямим та відбитим світлом.',
    why_interesting: 'Скульптурний дизайн «симфонія протилежностей» із можливістю трансформувати світлову атмосферу простору.',
    source_url: 'https://www.supermodular.com/en/products/hollow--f-48351',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 18,
      luminous_flux_lm: 2160,
      efficacy_lm_w: 120,
      cri: 90,
      cct: ['2700K', '3000K'],
      ip: 'IP20',
      ugr: 12,
      optics: ['Dual Dome Reflector'],
      control: ['DALI-2', '1-10V']
    },
    metrics: {
      energySavingsPct: 20.0,
      efficacyTier: 'Висока продуктивність'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 19:00'
  },
  {
    id: 'prod_luceplan_silenzio',
    manufacturer: 'LUCEPLAN',
    manufacturer_id: 'luceplan',
    product_name: 'Silenzio Suspension 90c (D79/90c)',
    series_name: 'Silenzio',
    category: 'Акустичний підвісний світильник Ø90 см',
    classification: 'NEW_PRODUCT',
    confidence: 0.96,
    canonical_hash: '6c7d8e9f0a1b2c3d',
    short_description: 'Підвісний інтер\'єрний світильник Ø90 см (D79/90c) з акустичним корпусом Kvadrat Remix 2.',
    why_interesting: 'Поглинає до 60% звукових реверберацій у переговорних кімнатах завдяки сертифікованій акустичній панелі Kvadrat Ø90 см.',
    source_url: 'https://www.luceplan.com/products/silenzio-suspension/#90c',
    image_url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 40,
      luminous_flux_lm: 4400,
      efficacy_lm_w: 110,
      cri: 90,
      cct: ['3000K'],
      ip: 'IP20',
      ugr: 15,
      optics: ['Diffused Fabric Reflector'],
      control: ['DALI-2', 'Push-dim']
    },
    metrics: {
      energySavingsPct: 12.0,
      efficacyTier: 'Стандартна'
    },
    pipelineStatus: 'Активний',
    discoveredAt: '2026-10-06 19:30'
  }
];

export interface PipelineStageItem {
  id: string;
  stage: string;
  name: string;
  tech: string;
  desc: string;
  frCode: string;
  status: string;
}

export const PIPELINE_STAGES: PipelineStageItem[] = [
  {
    id: 'stage-1',
    stage: 'Етап 1',
    name: 'Краулінг та Детекція',
    tech: 'Sitemap XML + SHA-256',
    desc: 'Періодичний парсинг sitemap.xml, robots.txt, 3x експоненційний backoff та розрахунок хешу контенту сторінок.',
    frCode: 'FR-08..FR-12',
    status: 'Автоматизовано (Cron)'
  },
  {
    id: 'stage-2',
    stage: 'Етап 2',
    name: 'AI Класифікація & Specs',
    tech: 'Gemini 2.5 Pro + Zod',
    desc: 'Строга валідація Zod: вилучення 20+ характеристик, українське резюме з 5 пунктів, відхилення нерелевантного.',
    frCode: 'FR-18..FR-28',
    status: 'Нуль галюцинацій'
  },
  {
    id: 'stage-3',
    stage: 'Етап 3',
    name: 'Канонікалізація & Дедуп',
    tech: 'SQLite/PG + Canonical MD5',
    desc: 'Очищення UTM/мовних шляхів (/en/, /de/), захист від повторів між мовними версіями та циклами моніторингу.',
    frCode: 'FR-13, FR-29..FR-33',
    status: 'Дедупліковано'
  },
  {
    id: 'stage-4',
    stage: 'Етап 4',
    name: 'Ранжування Релевантності',
    tech: 'Relevance Ranker (0-100)',
    desc: 'Багаторівневий скоринг за оптикою, енергоефективністю, інноваційністю та сегментом ринку.',
    frCode: 'FR-59..FR-60',
    status: 'Відранжовано'
  },
  {
    id: 'stage-5',
    stage: 'Етап 5',
    name: 'Генерація та Відправка Дайджесту',
    tech: 'Responsive HTML + SMTP',
    desc: 'Клієнтський адаптивний HTML (Gmail), кластеризація по брендах, прямі посилання на моделі.',
    frCode: 'FR-41..FR-51',
    status: 'Розіслано'
  }
];
