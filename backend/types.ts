/**
 * LumenRadar AI — Shared Type Definitions
 * 
 * Core types used across all backend modules.
 * Matches ТЗ data model (FR-39) and AI output schemas (FR-21, FR-22).
 */

// ============================================================================
// Manufacturer Configuration (FR-01, FR-02)
// ============================================================================

export interface ManufacturerConfig {
  id: number;
  name: string;
  domain: string;
  products_url: string;
  news_url?: string;
  sitemap_url?: string;
  language: string;
  additional_languages?: string[];
  is_js_rendered: boolean;
  custom_selectors?: Record<string, string>;
  active: boolean;
}

// ============================================================================
// Classification (FR-15)
// ============================================================================

export type ProductClassification = 
  | 'NEW_PRODUCT'
  | 'NEW_SERIES'
  | 'NEW_GENERATION'
  | 'MAJOR_UPDATE'
  | 'NOT_RELEVANT'
  | 'UNCERTAIN';

// ============================================================================
// Technical Highlights (FR-22 — ALL fields)
// ============================================================================

export interface TechnicalHighlights {
  luminaire_type?: string;
  mounting?: string;        // recessed / surface / suspended / track / wall / floor / pole
  power_w?: number;
  luminous_flux_lm?: number;
  efficacy_lm_w?: number;
  cct?: string[];           // e.g. ['3000K', '4000K']
  cri?: number;
  macadam_sdcm?: number;
  ugr?: number;
  optics?: string[];        // e.g. ['Spot 12°', 'Wide flood 60°']
  ip?: string;              // e.g. 'IP66'
  ik?: string;              // e.g. 'IK10'
  electrical_class?: string;
  lifetime?: string;        // e.g. 'L80/B10 60,000h'
  dimming_control?: string[]; // e.g. ['DALI-2', 'Casambi', 'KNX']
  sensors?: string[];
  emergency_option?: boolean;
  dimensions?: string;
  materials?: string[];
  colors_finishes?: string[];
  sustainability?: string;
  certifications?: string[];  // EPD, Declare, Cradle to Cradle
  other_key_specs?: Record<string, string>;
}

// ============================================================================
// Product Extraction Result (FR-21)
// ============================================================================

export interface ProductExtraction {
  classification: any;
  confidence: number;       // 0.0 to 1.0 (FR-20)
  manufacturer: string;
  product_name: string;
  series_name?: string | null;
  category: string;
  source_publication_date?: string | null;
  short_description: string;
  key_features: string[];
  technical_highlights: any;
  applications: string[];
  why_interesting: string;
  source_url: string;
  canonical_url?: string | null;
  image_url?: string | null;
  // AI Ukrainian summary (FR-25)
  summary_uk?: string;
}

// ============================================================================
// Product Candidate (internal pipeline type)
// ============================================================================

export interface ProductCandidate extends ProductExtraction {
  manufacturerConfig: ManufacturerConfig;
  relevance_score?: number;   // FR-59, FR-60
  relevanceScore?: number;
  canonical_hash?: string;    // FR-30
  first_seen_at?: string;
  last_seen_at?: string;
}


// ============================================================================
// Crawl Run Result (Section 26 — Run Summary)
// ============================================================================

export interface CrawlRunResult {
  runId: string;
  periodFrom: Date;
  periodTo: Date;
  totalManufacturers: number;
  successfulManufacturers: number;
  failedManufacturers: number;
  failedManufacturerNames: string[];
  pagesChecked: number;
  candidatesFound: number;
  newProducts: number;
  majorUpdates: number;
  duplicatesRemoved: number;
  uncertainItems: number;
  llmCalls: number;
  emailStatus: 'pending' | 'sent' | 'failed' | 'skipped_baseline';
  errors: string[];
}

// ============================================================================
// Discovered URL (crawler output)
// ============================================================================

export interface DiscoveredUrl {
  url: string;
  source: 'sitemap' | 'product_listing' | 'news' | 'rss' | 'structured_data';
  lastmod?: string;
  changefreq?: string;
}

// ============================================================================
// Change Detection Result (FR-12)
// ============================================================================

export interface ChangeResult {
  url: string;
  changeType: 'new_url' | 'content_changed' | 'lastmod_changed' | 'new_in_listing';
  previousHash?: string;
  currentHash?: string;
}

// ============================================================================
// Digest Data (FR-41 through FR-47)
// ============================================================================

export interface DigestData {
  periodFrom: Date;
  periodTo: Date;
  newProducts: ProductCandidate[];
  majorUpdates: ProductCandidate[];
  totalManufacturers: number;
  successfulManufacturers: number;
  failedManufacturers: string[];
}

// ============================================================================
// Email Send Result (FR-48 through FR-51)
// ============================================================================

export interface SendResult {
  success: boolean;
  messageId?: string;
  sentAt?: Date;
  error?: string;
}

// ============================================================================
// Settings Types (FR-03)
// ============================================================================

export interface AppSettings {
  schedule: {
    cron: string;
    timezone: string;
    day_of_week: number;
    time: string;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    sender: string;
    recipients: string[];
    cc?: string[];
    bcc?: string[];
    alert_recipients: string[];
  };
  ai: {
    model: string;
    confidenceThreshold: number;
    temperature: number;
    maxContentLength: number;
  };
  crawler: {
    rateLimitMs: number;
    maxRetries: number;
    timeoutMs: number;
    userAgent: string;
    respectRobotsTxt: boolean;
  };
}
