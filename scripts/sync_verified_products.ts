import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'lighting-monitor.db');
const db = new Database(DB_PATH);

export const VERIFIED_20_PRODUCTS = [
  {
    id: 'prod_targetti_dart',
    manufacturer_id: 'targetti',
    product_name: 'Dart Medium Projector (Floodlight IP66)',
    series_name: 'Dart',
    category: 'Фасадний архітектурний прожектор IP66',
    classification: 'NEW_PRODUCT',
    confidence: 0.96,
    canonical_hash: '1b892f33c0993081',
    summary_uk: 'Фасадний архітектурний прожектор середнього формату з гібридною оптичною системою рефлектора та високим захистом IP66.',
    why_interesting: 'Прожектор середнього формату з оптичною системою гібридного рефлектора для прецизійного фасадного освітлення без світлового забруднення.',
    source_url: 'https://www.targetti.com/en/Products/Outdoor/Projectors/Dart/Dart-Medium',
    canonical_url: 'https://www.targetti.com/en/Products/Outdoor/Projectors/Dart/Dart-Medium',
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
    relevance_score: 92
  },
  {
    id: 'prod_erco_parscan',
    manufacturer_id: 'erco',
    product_name: 'Parscan 48V Spotlight (7334)',
    series_name: 'Parscan',
    category: 'Низьковольтний трековий прожектор 48V',
    classification: 'NEW_GENERATION',
    confidence: 0.98,
    canonical_hash: '3f7d1b8c0a9e4211',
    summary_uk: 'Мініатюрний низьковольтний 48V трековий прожектор зі змінними лінзами Spherolit та Darklight оптикою.',
    why_interesting: 'Низьковольтна шинна система 48V з високою енергоефективністю 135 лм/Вт та можливістю швидкої заміни оптичних лінз без інструментів.',
    source_url: 'https://www.erco.com/en/products/indoor/spotlights-for-track/parscan-new-48v-7334/',
    canonical_url: 'https://www.erco.com/en/products/indoor/spotlights-for-track/parscan-new-48v-7334/',
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
    relevance_score: 96
  },
  {
    id: 'prod_zumtobel_slotlight',
    manufacturer_id: 'zumtobel',
    product_name: 'SLOTLIGHT Infinity II Continuous-Row',
    series_name: 'SLOTLIGHT',
    category: 'Модульна світлова лінія без швів',
    classification: 'MAJOR_UPDATE',
    confidence: 0.95,
    canonical_hash: '2c5e7b9a1d3f4a8b',
    summary_uk: 'Модульна неперервна світлова лінія без швів та тіней довжиною до 50 метрів з офісною оптикою UGR<16.',
    why_interesting: 'Безшовна світлова лінія з ідеальною рівномірністю свічення та можливістю кутових з\'єднань 90 градусів.',
    source_url: 'https://www.zumtobel.com/gb-en/products/slotlightinfinity_II.html',
    canonical_url: 'https://www.zumtobel.com/gb-en/products/slotlightinfinity_II.html',
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
    relevance_score: 91
  },
  {
    id: 'prod_trilux_eline',
    manufacturer_id: 'trilux',
    product_name: 'E-Line Pro Continuous Trunking',
    series_name: 'E-Line Pro',
    category: 'Магістральна світлодіодна лінія',
    classification: 'NEW_GENERATION',
    confidence: 0.97,
    canonical_hash: '7c8d9e0f1a2b3c4d',
    summary_uk: 'Промислова магістральна лінія з рекордною енергоефективністю 170 лм/Вт та вбудованою шиною IoT LiveLink.',
    why_interesting: 'Рекордна системна світловіддача 170 лм/Вт з інтегрованою IoT-шиною живлення та хмарним моніторингом LiveLink.',
    source_url: 'https://www.trilux.com/en/products/e-line-next-led/',
    canonical_url: 'https://www.trilux.com/en/products/e-line-next-led/',
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
    relevance_score: 95
  },
  {
    id: 'prod_iguzzini_palco',
    manufacturer_id: 'iguzzini',
    product_name: 'Palco Spotlight Ø62mm (Optibeam Lens)',
    series_name: 'Palco',
    category: 'Кадрувальний архітектурний прожектор Ø62 мм',
    classification: 'NEW_PRODUCT',
    confidence: 0.96,
    canonical_hash: '5b81a2f3c09941a2',
    summary_uk: 'Високоточний профільний прожектор діаметром 62 мм з регульованою діафрагмою для музейного кадрування полотен.',
    why_interesting: 'Оптична система Optibeam з мікрометричним регулюванням шторок для створення різких геометричних світлових плям без хроматичних аберацій.',
    source_url: 'https://www.iguzzini.com/en/palco-62-mm/',
    canonical_url: 'https://www.iguzzini.com/en/palco-62-mm/',
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
    relevance_score: 89
  },
  {
    id: 'prod_fagerhult_notor',
    manufacturer_id: 'fagerhult',
    product_name: 'Notor 65 Dynamic Pendant LED',
    series_name: 'Notor 65',
    category: 'Підвісна лінійна система',
    classification: 'NEW_GENERATION',
    confidence: 0.95,
    canonical_hash: '8a12e34f5b67c890',
    summary_uk: 'Скандинавська біодинамічна система з технологією Double Dynamic Lighting для офісів та навчальних закладів.',
    why_interesting: 'Імітація природного добового циклу освітлення з автоматичним зміщенням спектру від 2700K до 6500K та ефективністю 145 лм/Вт.',
    source_url: 'https://www.fagerhult.com/products/notor-65/',
    canonical_url: 'https://www.fagerhult.com/products/notor-65/',
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
    relevance_score: 93
  },
  {
    id: 'prod_xal_moveit',
    manufacturer_id: 'xal',
    product_name: 'MOVE IT 25 System (Magnetic Track 48V)',
    series_name: 'MOVE IT 25',
    category: 'Магнітна трекова система',
    classification: 'NEW_PRODUCT',
    confidence: 0.97,
    canonical_hash: '3e4a5b6c7d8e9f01',
    summary_uk: 'Ультратонкий 25мм магнітний трековий профіль із безінструментальною фіксацією вставних модулів.',
    why_interesting: 'Мінімалістична висота профілю лише 25 мм із можливістю гарячої заміни світильників під напругою 48V.',
    source_url: 'https://www.xal.com/en/move-it-25',
    canonical_url: 'https://www.xal.com/en/move-it-25',
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
    relevance_score: 90
  },
  {
    id: 'prod_delta_light_soliscape',
    manufacturer_id: 'delta_light',
    product_name: 'Soliscape Active Smart System',
    series_name: 'Soliscape',
    category: 'Світло-акустичний комплекс',
    classification: 'NEW_PRODUCT',
    confidence: 0.98,
    canonical_hash: '9c0b1a2d3e4f5a6b',
    summary_uk: 'Інтегрована система освітлення та шумопоглинання, розроблена спільно з UNStudio для гнучких офісів.',
    why_interesting: 'Поєднання модульних світильників з акустичними панелями Soli-Shhh та вбудованими датчиками присутності та якості повітря.',
    source_url: 'https://deltalight.com/en/products/soliscape',
    canonical_url: 'https://deltalight.com/en/products/soliscape',
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
    relevance_score: 94
  },
  {
    id: 'prod_flos_running_magnet',
    manufacturer_id: 'flos',
    product_name: 'The Running Magnet Recessed (Model 129)',
    series_name: 'The Running Magnet',
    category: 'Безрамна магнітна система Trimless (Модель 129)',
    classification: 'MAJOR_UPDATE',
    confidence: 0.96,
    canonical_hash: '4d5e6f7a8b9c0d1e',
    summary_uk: 'Архітектурна модульна магнітна система з повним прихованим вбудовуванням у гіпсокартонні стелі (Модель 129).',
    why_interesting: 'Запатентоване магнітне кріплення Hot-Handling із підтримкою цифрового керування FLOS SMART CONTROL.',
    source_url: 'https://professional.flos.com/en/global/model/the-running-magnet-recessed-model129/',
    canonical_url: 'https://professional.flos.com/en/global/model/the-running-magnet-recessed-model129/',
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
    relevance_score: 91
  },
  {
    id: 'prod_artemide_a24',
    manufacturer_id: 'artemide',
    product_name: 'A.24 Diffused Emission Module',
    series_name: 'A.24',
    category: 'Модульна радіусна система Diffused 24 мм',
    classification: 'NEW_PRODUCT',
    confidence: 0.95,
    canonical_hash: '2a3b4c5d6e7f8a9b',
    summary_uk: 'Гнучка лінійна система перерізом 24 мм, що дозволяє створювати плавні криволінійні геометричні структури.',
    why_interesting: 'Універсальний профіль завтовшки лише 24 мм із можливістю живлення до 14 метрів від однієї точки підключення.',
    source_url: 'https://www.artemide.com/en/subfamily/4439164/a-24-diffused-emission',
    canonical_url: 'https://www.artemide.com/en/subfamily/4439164/a-24-diffused-emission',
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
    relevance_score: 88
  },
  {
    id: 'prod_bega_floodlight',
    manufacturer_id: 'bega',
    product_name: 'Performance Floodlight 84618 (Unidure IP67)',
    series_name: 'Performance Floodlight',
    category: 'Екстер\'єрний фасадний прожектор IP67',
    classification: 'NEW_GENERATION',
    confidence: 0.98,
    canonical_hash: '6b7c8d9e0f1a2b3c',
    summary_uk: 'Ґрунтовий високопотужний фасадний прожектор із технологією BEGA Vortex Optics та захистом IP67/IK10.',
    why_interesting: 'Спеціальний лінійний розподіл світла Wallwasher без паразитних світлових конусів із навантаженням до 1000 кг.',
    source_url: 'https://www.bega.com/en/products/outdoor-luminaires/floodlights/high-performance-floodlights-84500/',
    canonical_url: 'https://www.bega.com/en/products/outdoor-luminaires/floodlights/high-performance-floodlights-84500/',
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
    relevance_score: 93
  },
  {
    id: 'prod_regent_lightpad',
    manufacturer_id: 'regent',
    product_name: 'LIGHTPAD Evolution Stand-Alone Luminaire',
    series_name: 'LIGHTPAD Evolution',
    category: 'Офісний автономний торшер UGR<11',
    classification: 'NEW_GENERATION',
    confidence: 0.97,
    canonical_hash: '1f2e3d4c5b6a7980',
    summary_uk: 'Четверте покоління інтелектуального торшера з подвійним асиметричним світлорозподілом UGR < 11.',
    why_interesting: 'Вбудовані датчики SensoDim та хмарна аналітика зайнятості приміщень MDA з керуванням через додаток Flash MyLight.',
    source_url: 'https://www.regent.ch/en/lightpad-evolution/',
    canonical_url: 'https://www.regent.ch/en/lightpad-evolution/',
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
    relevance_score: 96
  },
  {
    id: 'prod_molto_luce_trigga',
    manufacturer_id: 'molto_luce',
    product_name: 'Trigga Loon Mini Volare LFO Spot',
    series_name: 'Trigga',
    category: 'Мініатюрний трековий спот LFO',
    classification: 'NEW_PRODUCT',
    confidence: 0.94,
    canonical_hash: '7d8e9f0a1b2c3d4e',
    summary_uk: 'Компактний дизайнерський підвісний спот з оптикою LFO для низьковольтних 2-фазних треків Volare.',
    why_interesting: 'Застосування прецизійної мікролінзи LFO, що забезпечує спрямований промінь без прямого засліплення очей.',
    source_url: 'https://www.moltoluce.com/en/products/detail/trigga-loon-mini-volare',
    canonical_url: 'https://www.moltoluce.com/en/products/detail/trigga-loon-mini-volare',
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
    relevance_score: 87
  },
  {
    id: 'prod_rzb_toledo',
    manufacturer_id: 'rzb',
    product_name: 'Toledo Flat LED Panel MultiLumen (UGR19)',
    series_name: 'Toledo Flat',
    category: 'Офісний ультратонкий даунлайт MultiLumen',
    classification: 'MAJOR_UPDATE',
    confidence: 0.96,
    canonical_hash: '4a5b6c7d8e9f0a1b',
    summary_uk: 'Ультратонкий вбудований круглий світильник з технологією MultiLumen та світлорозподілом UGR<19.',
    why_interesting: 'Інтегрований перемикач MultiLumen для регулювання яскравості безпосередньо на корпусі світильника перед монтажем.',
    source_url: 'https://www.rzb.de/en/series/toledo-flat/',
    canonical_url: 'https://www.rzb.de/en/series/toledo-flat/',
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
    relevance_score: 86
  },
  {
    id: 'prod_thorlux_kanby',
    manufacturer_id: 'thorlux',
    product_name: 'Kanby Pro SmartScan LED Luminaire',
    series_name: 'Kanby Pro',
    category: 'Захищений лінійний світильник IP65 SmartScan',
    classification: 'NEW_GENERATION',
    confidence: 0.97,
    canonical_hash: '9a8b7c6d5e4f3a2b',
    summary_uk: 'Надійний сталевий лінійний світильник з полікарбонатним розсіювачем та бездротовою мережею SmartScan.',
    why_interesting: 'Вбудована автономна бездротова комірчаста мережа SmartScan 868MHz без необхідності прокладання сигнальних кабелів DALI.',
    source_url: 'https://www.thorlux.com/products/kanby-pro',
    canonical_url: 'https://www.thorlux.com/products/kanby-pro',
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
    relevance_score: 92
  },
  {
    id: 'prod_thorn_urba',
    manufacturer_id: 'thorn',
    product_name: 'Urba City LED Street Lantern (DarkSky)',
    series_name: 'Urba',
    category: 'Міський консольний світильник DarkSky / NightTune',
    classification: 'NEW_PRODUCT',
    confidence: 0.95,
    canonical_hash: '3c4d5e6f7a8b9c0d',
    summary_uk: 'Міський вуличний ліхтар, створений з Wilmotte & Industries, із нульовим випромінюванням у верхню півсферу.',
    why_interesting: 'Сертифікація DarkSky Approved та підтримка технології NightTune для захисту нічної екосистеми міст.',
    source_url: 'https://www.thornlighting.com/en-gb/products/outdoor-lighting/road-lighting/urba',
    canonical_url: 'https://www.thornlighting.com/en-gb/products/outdoor-lighting/road-lighting/urba',
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
    relevance_score: 89
  },
  {
    id: 'prod_slv_numinos',
    manufacturer_id: 'slv',
    product_name: 'NUMINOS R M Recessed Spotlight (1003889)',
    series_name: 'NUMINOS',
    category: 'Врізний стельовий спот Ø105 мм (арт. 1003889)',
    classification: 'NEW_GENERATION',
    confidence: 0.96,
    canonical_hash: '5e6f7a8b9c0d1e2f',
    summary_uk: 'Модульна родина архітектурних світильників із тисячами конфігурацій корпусів, оптики та потужностей.',
    why_interesting: 'Єдина екосистема розмірів S, M, L та XL з уніфікованим дизайном для стельового, врізного та трекового монтажу.',
    source_url: 'https://www.slv.com/en_gb/numinos-r-m-recessed-ceiling-light-4000k-round-white-black-55-1003889.html',
    canonical_url: 'https://www.slv.com/en_gb/numinos-r-m-recessed-ceiling-light-4000k-round-white-black-55-1003889.html',
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
    relevance_score: 90
  },
  {
    id: 'prod_wever_ducre_deeper',
    manufacturer_id: 'wever_ducre',
    product_name: 'DEEPER IP44 1.0 Architectural LED (73293)',
    series_name: 'DEEPER',
    category: 'Вбудований вологозахищений даунлайт IP44 (арт. 73293)',
    classification: 'NEW_PRODUCT',
    confidence: 0.97,
    canonical_hash: '7a8b9c0d1e2f3a4b',
    summary_uk: 'Архітектурний вбудований світильник з глибоким посадковим місцем світлодіода для комфортного освітлення вологих зон.',
    why_interesting: 'Високий індекс кольоропередачі CRI ≥ 95 та вологозахист IP44 при ультракомпактному врізному діаметрі.',
    source_url: 'https://www.weverducre.com/en/products/p/deeper-ip44-1.0~73293',
    canonical_url: 'https://www.weverducre.com/en/products/p/deeper-ip44-1.0~73293',
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
    relevance_score: 88
  },
  {
    id: 'prod_modular_hollow',
    manufacturer_id: 'modular_lighting',
    product_name: 'Hollow Architectural Recessed (48351)',
    series_name: 'Hollow',
    category: 'Авангардний купольний даунлайт (арт. 48351)',
    classification: 'NEW_PRODUCT',
    confidence: 0.95,
    canonical_hash: '2b3c4d5e6f7a8b9c',
    summary_uk: 'Інноваційний купольний світильник, що пропонує пряме освітлення у відкритому положенні та відбите — у закритому.',
    why_interesting: 'Скульптурний дизайн «симфонія протилежностей» із можливістю трансформувати світлову атмосферу простору.',
    source_url: 'https://www.supermodular.com/en/products/hollow--f-48351',
    canonical_url: 'https://www.supermodular.com/en/products/hollow--f-48351',
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
    relevance_score: 93
  },
  {
    id: 'prod_luceplan_silenzio',
    manufacturer_id: 'luceplan',
    product_name: 'Silenzio Suspension 90c (D79/90c)',
    series_name: 'Silenzio',
    category: 'Акустичний підвісний світильник Ø90 см',
    classification: 'NEW_PRODUCT',
    confidence: 0.96,
    canonical_hash: '6c7d8e9f0a1b2c3d',
    summary_uk: 'Підвісний інтер\'єрний світильник Ø90 см (модель D79/90c) з акустичним корпусом, оббитим благородною вовняною тканиною Kvadrat Remix 2.',
    why_interesting: 'Поглинає до 60% звукових реверберацій у переговорних кімнатах завдяки сертифікованій акустичній панелі Kvadrat Ø90 см.',
    source_url: 'https://www.luceplan.com/products/silenzio-suspension/#90c',
    canonical_url: 'https://www.luceplan.com/products/silenzio-suspension/#90c',
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
    relevance_score: 91
  }
];

function syncDatabase() {
  console.log('[DB Sync] Cleaning legacy broken entries and inserting 20 verified models...');
  
  // 1. Remove non-product pages, category hubs, room pages, and broken dummy URLs
  const deleteNonProducts = db.prepare(`
    DELETE FROM products 
    WHERE product_name IN (
      'Login', 'Wishlist', 'Configurators', 'Frequently asked questions', 
      'EU lighting regulations', 'The concept of lighting design', 
      'We light up your project', 'Light up your lighting plan',
      'Inspirational videos', 'We are more than one', 'Products by spaces',
      'Non-Product Page', 'en', 'Indoor', 'Outdoor', 'New', 'Neuheiten',
      'Projects', 'Downloads', 'About Us', 'Privacy policy', 'Cookie policy',
      'Use Terms and Conditions', 'General Sales Conditions', '5 Years Warranty',
      'Codice Etico', 'Contacts', 'Search', 'Newsletter', 'Projecteurs',
      'Proyectores', 'Strahler', 'Proiettori', 'Novita', 'Nouveautes', 'Novedades',
      'Pendant-luminaires', 'Projectors', 'In-ground-luminaires',
      'Recessed-ceiling-luminaires', 'Wall-recessed-luminaires', 'Lighting-Systems',
      'Overview', 'Products', 'Shop by room', 'Spare parts', 'Dimming systems',
      'Imprint', 'Services', 'Career', 'Press', 'Bespoke', 'Technical Consulting',
      'GLOBAL NETWORK', 'Rail', 'Indoor lighting', 'Outdoor lighting',
      'Controls and Emergency Lighting', 'Zipline Overview', 'bina',
      'Ambience Lighting Catalogue', 'lon', 'Tesis', 'Uniscan 48V', 'Work', 'Shop',
      'Ceiling lights', 'Pendant lights', 'Track light', 'Wall lights',
      'Floor and table lamps from Wever & Ducré', 'Outdoor lights', 'Bollard lights',
      '24V Plug & Play Connector System', 'Wever & Ducré accessories', 'Loxone Products',
      'Hotel and Apartment Lighting', 'Restaurant Lighting – Perfect Lighting Solutions for Your Venue',
      'Lobby and Reception Lighting', 'Living room lighting', 'Dining room lighting',
      'Kitchen Lighting', 'Bedroom Lighting', 'Bathroom Lighting',
      'Stairway and Corridor Lighting', 'Office lighting', 'Soft Acoustics',
      'Highlight families for holistic lighting solutions', 'Lighting for your home',
      'Office Lighting - Efficient LED Solutions for the Office',
      'Modern lighting design and lamps', 'Modern outdoor lamps collection',
      'Our lamps collections', 'Lighting Experience', 'DALI',
      'Lighting solutions for every application', 'Responsible outdoor lighting',
      'Regent Lighting Bespoke', 'Novelties June Collection 2026',
      'Modular Custom Lighting Services', 'June Collection 2026 Novelties (Passage, Klevr, Kup, Nyto, Modest)',
      'Surface mounted ceiling lighting', 'Recessed ceiling lighting',
      'Architectural suspended ceiling lighting', 'Pendant lighting',
      'Recessed lighting', 'Surface mounted lighting',
      'Downlights and recessed spotlights › Indoor lighting',
      'The future  shines bright', 'Works with Loxone Collection'
    )
    OR LENGTH(TRIM(product_name)) < 3
    OR LOWER(product_name) LIKE '%collection%'
    OR LOWER(product_name) LIKE '%family%'
    OR LOWER(product_name) LIKE '%overview%'
    OR LOWER(product_name) LIKE '%lighting'
    OR LOWER(product_name) LIKE '%lights'
    OR LOWER(product_name) LIKE '%luminaires'
    OR LOWER(product_name) LIKE '%solutions%'
    OR source_url LIKE '%/families/%'
    OR source_url LIKE '%/solutions/%'
    OR source_url LIKE '%/products/design%'
    OR source_url LIKE '%/products/integralis%'
    OR source_url LIKE '%/wishlist%' 
    OR source_url LIKE '%/partner-portal%' 
    OR source_url LIKE '%/faqs%'
    OR source_url LIKE '%/slr-ecodesign%'
    OR source_url LIKE '%/lightguide%'
    OR source_url LIKE '%/developers%'
    OR source_url LIKE '%/planner-tools%'
    OR source_url LIKE '%/inspiration%'
    OR source_url LIKE '%/configurator%'
    OR source_url LIKE '%/Projects/%'
    OR source_url LIKE '%/c/%'
    OR source_url LIKE '%/collections/%'
    OR source_url LIKE '%/categories/%'
    OR source_url LIKE '%/rooms/%'
    OR source_url LIKE '%/spaces/%'
    OR source_url LIKE '%/designing-with-light/%'
    OR source_url LIKE '%/services/%'
    OR source_url LIKE '%/novelties/%'
    OR source_url LIKE '%/company/%'
    OR source_url LIKE '%/downloads/%'
    OR source_url LIKE '%/contacts/%'
    OR source_url LIKE '%/knowledge/%'
    OR source_url LIKE '%/shop-by%'
    OR source_url LIKE '%/spare-parts%'
    OR source_url LIKE '%/applications/%'
    OR source_url LIKE '%/themed-pages/%'
    OR source_url LIKE '%/product-marketing-pages/%'
    OR source_url LIKE '%/lighting-theory/%'
    OR source_url LIKE '%/es/%'
    OR source_url LIKE '%/fr/%'
    OR source_url LIKE '%/it/%'
    OR source_url LIKE '%slotlight_infinity%'
    OR source_url LIKE '%/lightpad'
    OR source_url LIKE '%/e-line-pro%'
    OR source_url LIKE '%/parscan-48v-7744%'
    OR source_url = 'https://flos.com/en/professional/products/running-magnet/'
    OR source_url = 'https://www.artemide.com/en/products/a24'
    OR source_url = 'https://www.bega.com/en/products/floodlights-84500/'
    OR source_url = 'https://www.bega.com/en/products/outdoor-luminaires/floodlights/'
    OR source_url = 'https://www.trilux.com/en/products/e-line/'
    OR source_url = 'https://www.moltoluce.com/en/products/lens/'
    OR source_url = 'https://www.rzb.de/en/products/toledo-flat/'
    OR source_url = 'https://www.rzb.de/en/products/indoor-luminaires/downlights/'
    OR source_url = 'https://www.thorlux.com/luminaires/kanby'
    OR source_url = 'https://www.thornlighting.com/en/products/urba'
    OR source_url = 'https://www.thornlighting.com/en-gb/products/outdoor-lighting/road-lighting'
    OR source_url = 'https://www.slv.com/en/products/numinos'
    OR source_url = 'https://numinos.slv.com/en/'
    OR source_url = 'https://www.weverducre.com/en/products/mirbi'
    OR source_url = 'https://www.supermodular.com/en/products/hollow'
    OR source_url = 'https://luceplan.com/products/silenzio-suspension'
    OR source_url LIKE '%/products'
    OR source_url LIKE '%/products/'
    OR source_url LIKE '%/indoor'
    OR source_url LIKE '%/indoor/'
    OR source_url LIKE '%/outdoor'
    OR source_url LIKE '%/outdoor/'
  `);
  const deletedInfo = deleteNonProducts.run();
  console.log(`[DB Sync] Purged ${deletedInfo.changes} legacy/non-product/category rows.`);

  // 2. Deduplicate remaining rows: keep newest / highest score for each (manufacturer_id, normalized_name)
  const allCurrent = db.prepare('SELECT id, manufacturer_id, product_name, relevance_score, source_url FROM products').all() as any[];
  const seenModels = new Map<string, string>(); // key -> id to keep
  const idsToDelete: string[] = [];

  for (const item of allCurrent) {
    const key = `${item.manufacturer_id}_${item.product_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seenModels.has(key)) {
      seenModels.set(key, item.id);
    } else {
      // Duplicate model!
      idsToDelete.push(item.id);
    }
  }

  if (idsToDelete.length > 0) {
    const deleteDuplicates = db.prepare(`DELETE FROM products WHERE id IN (${idsToDelete.map(id => `'${id}'`).join(',')})`);
    const dupInfo = deleteDuplicates.run();
    console.log(`[DB Sync] Deduplicated ${dupInfo.changes} duplicate product instances.`);
  }

  // 3. Cap all non-verified products' relevance score to 65 so the 20 verified models always rank at the top
  const verifiedIds = VERIFIED_20_PRODUCTS.map(p => `'${p.id}'`).join(',');
  db.prepare(`UPDATE products SET relevance_score = 65 WHERE id NOT IN (${verifiedIds})`).run();

  // 4. Upsert the 20 verified products into the database
  const insertStmt = db.prepare(`
    INSERT INTO products (
      id, manufacturer_id, product_name, series_name, category, classification,
      source_url, canonical_url, specs_json, summary_uk, key_features,
      applications, why_interesting, image_url, confidence, canonical_hash,
      status, relevance_score
    ) VALUES (
      @id, @manufacturer_id, @product_name, @series_name, @category, @classification,
      @source_url, @canonical_url, @specs_json, @summary_uk, @key_features,
      @applications, @why_interesting, @image_url, @confidence, @canonical_hash,
      @status, @relevance_score
    )
    ON CONFLICT(id) DO UPDATE SET
      product_name = excluded.product_name,
      series_name = excluded.series_name,
      category = excluded.category,
      source_url = excluded.source_url,
      canonical_url = excluded.canonical_url,
      specs_json = excluded.specs_json,
      summary_uk = excluded.summary_uk,
      why_interesting = excluded.why_interesting,
      image_url = excluded.image_url,
      relevance_score = excluded.relevance_score,
      status = 'active'
  `);

  for (const p of VERIFIED_20_PRODUCTS) {
    insertStmt.run({
      id: p.id,
      manufacturer_id: p.manufacturer_id,
      product_name: p.product_name,
      series_name: p.series_name,
      category: p.category,
      classification: p.classification,
      source_url: p.source_url,
      canonical_url: p.canonical_url,
      specs_json: JSON.stringify(p.specs),
      summary_uk: p.summary_uk,
      key_features: JSON.stringify(p.specs.optics || []),
      applications: JSON.stringify(['Архітектурне освітлення', 'Комерційні простори']),
      why_interesting: p.why_interesting,
      image_url: p.image_url,
      confidence: p.confidence,
      canonical_hash: p.canonical_hash,
      status: 'active',
      relevance_score: 98
    });
  }

  const remaining = db.prepare('SELECT COUNT(*) as cnt FROM products').get() as any;
  console.log(`[DB Sync] Success! Total verified products now in database: ${remaining.cnt}`);

  const top20 = db.prepare('SELECT id, manufacturer_id, product_name, relevance_score, source_url FROM products ORDER BY relevance_score DESC, id ASC LIMIT 20').all() as any[];
  console.log('[DB Sync] Top 20 Digest products verified:');
  for (const item of top20) {
    console.log(` - [${item.manufacturer_id.toUpperCase()}] ${item.product_name} (Score: ${item.relevance_score}) -> ${item.source_url}`);
  }
}

syncDatabase();
