-- ============================================================================
-- LumenRadar AI — PostgreSQL Relational Database Schema
-- Technical Specification v1.0 (FR-39, FR-40, Section 14 & 19)
-- 5 Core Relational Tables + Digest Items Junction
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. MANUFACTURERS TABLE (FR-01, FR-02, FR-39)
CREATE TABLE IF NOT EXISTS manufacturers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    products_url TEXT NOT NULL,
    news_url TEXT,
    sitemap_url TEXT,
    language VARCHAR(10) DEFAULT 'en',
    is_js_rendered BOOLEAN DEFAULT FALSE,
    custom_selectors JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manufacturers_active ON manufacturers(active);

-- 2. CRAWL_RUNS TABLE (FR-11, FR-39, Section 26)
CREATE TABLE IF NOT EXISTS crawl_runs (
    id VARCHAR(64) PRIMARY KEY,
    manufacturer_id VARCHAR(64) NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ,
    status VARCHAR(32) DEFAULT 'pending', -- 'pending' | 'running' | 'success' | 'error'
    pages_checked INTEGER DEFAULT 0,
    candidates_found INTEGER DEFAULT 0,
    products_confirmed INTEGER DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crawl_runs_mfg ON crawl_runs(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_crawl_runs_status ON crawl_runs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_runs_started ON crawl_runs(started_at DESC);

-- 3. PAGES TABLE (FR-08, FR-12, FR-39)
CREATE TABLE IF NOT EXISTS pages (
    id VARCHAR(64) PRIMARY KEY,
    manufacturer_id VARCHAR(64) NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    canonical_url TEXT NOT NULL UNIQUE,
    title TEXT,
    first_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    content_hash VARCHAR(64), -- SHA-256 hash of cleaned HTML content
    last_modified_source TIMESTAMPTZ,
    last_crawled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pages_mfg ON pages(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_pages_canonical ON pages(canonical_url);
CREATE INDEX IF NOT EXISTS idx_pages_hash ON pages(content_hash);

-- 4. PRODUCTS TABLE (FR-21, FR-22, FR-39, FR-40)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    manufacturer_id VARCHAR(64) NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    series_name VARCHAR(255),
    category VARCHAR(128),
    classification VARCHAR(32) NOT NULL, -- NEW_PRODUCT | NEW_SERIES | NEW_GENERATION | MAJOR_UPDATE | NOT_RELEVANT | UNCERTAIN
    source_url TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    first_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    source_publication_date TIMESTAMPTZ,
    specs_json JSONB DEFAULT '{}'::jsonb, -- 20+ technical fields per FR-22
    summary_uk TEXT NOT NULL,             -- 5-point professional Ukrainian summary per FR-25
    key_features JSONB DEFAULT '[]'::jsonb,
    applications JSONB DEFAULT '[]'::jsonb,
    why_interesting TEXT,
    image_url TEXT,
    confidence NUMERIC(4,3) DEFAULT 1.000, -- AI Confidence score (0.000 - 1.000)
    canonical_hash VARCHAR(32) NOT NULL UNIQUE, -- Deterministic 16-character MD5 hash (FR-30)
    status VARCHAR(32) DEFAULT 'active',   -- 'active' | 'under_review' | 'archived'
    relevance_score NUMERIC(5,2) DEFAULT 0.00, -- Weighted score (0 - 100) per FR-59
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_mfg ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_classification ON products(classification);
CREATE INDEX IF NOT EXISTS idx_products_hash ON products(canonical_hash);
CREATE INDEX IF NOT EXISTS idx_products_relevance ON products(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- 5. DIGESTS TABLE (FR-41, FR-42, FR-50)
CREATE TABLE IF NOT EXISTS digests (
    id VARCHAR(64) PRIMARY KEY,
    period_from TIMESTAMPTZ NOT NULL,
    period_to TIMESTAMPTZ NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMPTZ,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'generated', -- 'generated' | 'sent' | 'failed'
    products_count INTEGER DEFAULT 0,
    html_content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_digests_generated ON digests(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_digests_status ON digests(status);

-- 6. DIGEST_ITEMS JUNCTION TABLE (FR-43, FR-50)
CREATE TABLE IF NOT EXISTS digest_items (
    id SERIAL PRIMARY KEY,
    digest_id VARCHAR(64) NOT NULL REFERENCES digests(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    section VARCHAR(64) DEFAULT 'new_products', -- 'new_products' | 'major_updates'
    sort_order INTEGER DEFAULT 0,
    UNIQUE(digest_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_digest_items_digest ON digest_items(digest_id);
CREATE INDEX IF NOT EXISTS idx_digest_items_product ON digest_items(product_id);
