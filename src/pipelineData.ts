export interface ProductItem {
  id: string;
  manufacturer: string;
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
    control?: string[];
  };
  metrics: {
    energySavingsPct: number; // vs benchmark (105 lm/W)
    efficacyTier: 'Top Efficacy Leader' | 'High Performance' | 'Standard';
  };
  pipelineStatus: 'Active' | 'Under Review' | 'Archived';
  discoveredAt: string;
}

export const INITIAL_BASELINE_PRODUCTS: ProductItem[] = [
  {
    id: 'base-1',
    manufacturer: 'ERCO',
    product_name: 'Parscan New 48V',
    series_name: 'Parscan',
    category: 'Track Spotlight',
    classification: 'NEW_GENERATION',
    confidence: 0.95,
    canonical_hash: '3f7d1b8c0a9e4211',
    short_description: 'Miniaturized 48V track spotlight system featuring interchangeable Spherolit lens optics.',
    why_interesting: 'Advanced 48V low-voltage architecture with precision collimating lenses delivering 135 lm/W system efficacy.',
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
      control: ['DALI', 'Casambi']
    },
    metrics: {
      energySavingsPct: 28.5,
      efficacyTier: 'Top Efficacy Leader'
    },
    pipelineStatus: 'Active',
    discoveredAt: '2026-09-18 10:30'
  },
  {
    id: 'base-2',
    manufacturer: 'Zumtobel',
    product_name: 'SLOTLIGHT LED III',
    series_name: 'SLOTLIGHT',
    category: 'Linear Recessed',
    classification: 'MAJOR_UPDATE',
    confidence: 0.91,
    canonical_hash: '9e41a77d5b204c8f',
    short_description: 'Continuous linear recessed illumination line engineered for shadow-free light runs up to 150 feet.',
    why_interesting: 'High-precision micro-prismatic optics achieving UGR < 16 glare suppression strictly compliant with EN 12464-1 office standards.',
    source_url: 'https://zumtobel.us/slotlight-led-iii/',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 28,
      luminous_flux_lm: 3800,
      efficacy_lm_w: 136,
      cri: 90,
      cct: ['Tunable White 2700-6500K'],
      ip: 'IP40',
      ugr: 15.4,
      control: ['DALI-2', 'Lutron Athena']
    },
    metrics: {
      energySavingsPct: 29.5,
      efficacyTier: 'Top Efficacy Leader'
    },
    pipelineStatus: 'Active',
    discoveredAt: '2026-09-22 14:15'
  },
  {
    id: 'base-3',
    manufacturer: 'iGuzzini',
    product_name: 'Palco Low Voltage',
    series_name: 'Palco',
    category: 'Architectural Projector',
    classification: 'NEW_SERIES',
    confidence: 0.93,
    canonical_hash: '4d8a11bc334190fa',
    short_description: 'Ultra-compact framed projectors with motorized zoom mechanisms tailored for gallery and museum curation.',
    why_interesting: 'Opti Beam optics technology providing sharp beam definition and warm dimming without chromatic aberration or shift.',
    source_url: 'https://www.iguzzini.com/en/palco/#chapter-palco-low-voltage',
    image_url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 18,
      luminous_flux_lm: 1950,
      efficacy_lm_w: 108,
      cri: 97,
      cct: ['2700K', '3000K'],
      ip: 'IP20',
      ugr: 10.5,
      control: ['Bluetooth Casambi', 'DALI']
    },
    metrics: {
      energySavingsPct: 3.0,
      efficacyTier: 'High Performance'
    },
    pipelineStatus: 'Active',
    discoveredAt: '2026-09-28 09:00'
  },
  {
    id: 'base-4',
    manufacturer: 'Targetti',
    product_name: 'DART Medium',
    series_name: 'DART',
    category: 'Architectural Floodlight',
    classification: 'NEW_PRODUCT',
    confidence: 0.94,
    canonical_hash: '1b892f33c0993081',
    short_description: 'High-output professional exterior projector floodlight with marine-grade IP66 anodized housing and variable beam optics.',
    why_interesting: 'Advanced optical collimator delivering high lux over extended throw distance with cataphoresis anti-corrosion treatment.',
    source_url: 'https://www.targetti.com/en/Products/Outdoor/Projectors/Dart/Dart-Medium',
    image_url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
    specs: {
      power_w: 36,
      luminous_flux_lm: 4269,
      efficacy_lm_w: 118,
      cri: 90,
      cct: ['3000K', '4000K', 'RGBW'],
      ip: 'IP66',
      ugr: 14,
      control: ['DMX-RDM', 'DALI']
    },
    metrics: {
      energySavingsPct: 12.4,
      efficacyTier: 'High Performance'
    },
    pipelineStatus: 'Active',
    discoveredAt: '2026-10-01 11:20'
  }
];

export const PIPELINE_STAGES = [
  {
    stage: 'Stage 1',
    name: 'Scheduled Crawler',
    tech: 'Requests & BeautifulSoup4',
    desc: 'Automated 14-day discovery crawling 20 verified manufacturer product feeds.',
    status: 'Automated (Cron)'
  },
  {
    stage: 'Stage 2',
    name: 'AI Spec Extraction',
    tech: 'Gemini 2.5 Pro (Structured)',
    desc: 'Extracts validated technical specs (lumen, watt, CRI, IP, UGR) via Pydantic schemas.',
    status: 'Zero Hallucinations'
  },
  {
    stage: 'Stage 3',
    name: 'Pandas Data Engine',
    tech: 'pandas.DataFrame',
    desc: 'Calculates energy efficiency scores (lm/W benchmark) and filters baseline duplicates.',
    status: 'Analytics + MD5'
  },
  {
    stage: 'Stage 4',
    name: 'Digest Engine & Dispatch',
    tech: 'MIME HTML + SMTP',
    desc: 'Manufacturer clustering with product imagery & efficiency tier classification.',
    status: 'Rich Media Email'
  }
];
