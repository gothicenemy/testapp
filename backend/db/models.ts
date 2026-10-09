import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'lighting-monitor.db');


// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

export function getDatabase() {
    return db;
}


// Define types
export interface Manufacturer {
    id: string;
    name: string;
    domain: string;
    products_url: string;
    news_url: string | null;
    sitemap_url: string | null;
    language: string;
    is_js_rendered: boolean;
    custom_selectors: string | null; // JSON string
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CrawlRun {
    id: string;
    manufacturer_id: string;
    started_at?: string;
    finished_at?: string | null;
    status: 'pending' | 'running' | 'success' | 'error';
    pages_checked: number;
    candidates_found: number;
    products_confirmed: number;
    error_log: string | null;
    created_at?: string;
}

export interface Page {
    id: string;
    manufacturer_id: string;
    canonical_url: string;
    title: string | null;
    first_seen_at?: string;
    last_seen_at?: string;
    content_hash: string | null;
    last_modified_source: string | null;
    last_crawled_at: string | null;
}

export interface Product {
    id: string;
    manufacturer_id: string;
    product_name: string;
    series_name: string | null;
    category: string | null;
    classification: 'NEW_PRODUCT' | 'NEW_SERIES' | 'NEW_GENERATION' | 'MAJOR_UPDATE' | 'NOT_RELEVANT' | 'UNCERTAIN';
    source_url: string;
    canonical_url: string | null;
    first_seen_at?: string;
    last_seen_at?: string;
    source_publication_date: string | null;
    specs_json: string | null;
    summary_uk: string | null;
    key_features: string | null; // JSON array
    applications: string | null; // JSON array
    why_interesting: string | null;
    image_url: string | null;
    confidence: number | null;
    canonical_hash: string | null;
    status: 'active' | 'archived';
    relevance_score: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface Digest {
    id: string;
    period_from: string;
    period_to: string;
    generated_at?: string;
    sent_at: string | null;
    recipient: string;
    subject: string;
    status: 'generated' | 'sent' | 'failed';
    products_count: number;
    html_content: string;
}

export interface DigestItem {
    id: string;
    digest_id: string;
    product_id: string;
    section: 'new_products' | 'major_updates';
    sort_order: number;
}

export function initDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS manufacturers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            domain TEXT NOT NULL,
            products_url TEXT NOT NULL,
            news_url TEXT,
            sitemap_url TEXT,
            language TEXT DEFAULT 'en',
            is_js_rendered BOOLEAN DEFAULT 0,
            custom_selectors TEXT,
            active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT (datetime('now', 'utc')),
            updated_at DATETIME DEFAULT (datetime('now', 'utc'))
        );

        CREATE TABLE IF NOT EXISTS crawl_runs (
            id TEXT PRIMARY KEY,
            manufacturer_id TEXT NOT NULL,
            started_at DATETIME DEFAULT (datetime('now', 'utc')),
            finished_at DATETIME,
            status TEXT DEFAULT 'pending',
            pages_checked INTEGER DEFAULT 0,
            candidates_found INTEGER DEFAULT 0,
            products_confirmed INTEGER DEFAULT 0,
            error_log TEXT,
            created_at DATETIME DEFAULT (datetime('now', 'utc')),
            FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id)
        );

        CREATE TABLE IF NOT EXISTS pages (
            id TEXT PRIMARY KEY,
            manufacturer_id TEXT NOT NULL,
            canonical_url TEXT NOT NULL UNIQUE,
            title TEXT,
            first_seen_at DATETIME DEFAULT (datetime('now', 'utc')),
            last_seen_at DATETIME DEFAULT (datetime('now', 'utc')),
            content_hash TEXT,
            last_modified_source DATETIME,
            last_crawled_at DATETIME,
            FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id)
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            manufacturer_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            series_name TEXT,
            category TEXT,
            classification TEXT,
            source_url TEXT NOT NULL,
            canonical_url TEXT,
            first_seen_at DATETIME DEFAULT (datetime('now', 'utc')),
            last_seen_at DATETIME DEFAULT (datetime('now', 'utc')),
            source_publication_date DATETIME,
            specs_json TEXT,
            summary_uk TEXT,
            key_features TEXT,
            applications TEXT,
            why_interesting TEXT,
            image_url TEXT,
            confidence REAL,
            canonical_hash TEXT,
            status TEXT DEFAULT 'active',
            relevance_score REAL,
            created_at DATETIME DEFAULT (datetime('now', 'utc')),
            updated_at DATETIME DEFAULT (datetime('now', 'utc')),
            FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id)
        );

        CREATE TABLE IF NOT EXISTS digests (
            id TEXT PRIMARY KEY,
            period_from DATETIME NOT NULL,
            period_to DATETIME NOT NULL,
            generated_at DATETIME DEFAULT (datetime('now', 'utc')),
            sent_at DATETIME,
            recipient TEXT NOT NULL,
            subject TEXT NOT NULL,
            status TEXT DEFAULT 'generated',
            products_count INTEGER DEFAULT 0,
            html_content TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS digest_items (
            id TEXT PRIMARY KEY,
            digest_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            section TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY (digest_id) REFERENCES digests(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
    `);

    // Auto-seed manufacturers from config if table is empty
    try {
        const count = db.prepare('SELECT count(*) as cnt FROM manufacturers').get() as { cnt: number };
        if (count.cnt === 0) {
            const mfgPath = path.join(process.cwd(), 'backend', 'config', 'manufacturers.yaml');
            if (fs.existsSync(mfgPath)) {
                const { load } = require('js-yaml');
                const raw = load(fs.readFileSync(mfgPath, 'utf8')) as any;
                const mfgs = Array.isArray(raw) ? raw : (raw.manufacturers || []);
                const insertStmt = db.prepare(`
                    INSERT OR IGNORE INTO manufacturers 
                    (id, name, domain, products_url, news_url, sitemap_url, language, is_js_rendered, custom_selectors, active)
                    VALUES (@id, @name, @domain, @products_url, @news_url, @sitemap_url, @language, @is_js_rendered, @custom_selectors, @active)
                `);
                for (const m of mfgs) {
                    insertStmt.run({
                        id: String(m.id),
                        name: m.name,
                        domain: m.domain,
                        products_url: m.products_url,
                        news_url: m.news_url || null,
                        sitemap_url: m.sitemap_url || null,
                        language: m.language || 'en',
                        is_js_rendered: m.is_js_rendered ? 1 : 0,
                        custom_selectors: m.custom_selectors ? JSON.stringify(m.custom_selectors) : null,
                        active: m.active ? 1 : 0
                    });
                }
            }
        }
    } catch {
        // seeding fallback
    }
}


// CRUD Helpers
export const ManufacturerModel = {
    getAllActive: () => db.prepare('SELECT * FROM manufacturers WHERE active = 1').all() as Manufacturer[],
    insert: (m: Manufacturer) => {
        db.prepare(`
            INSERT OR IGNORE INTO manufacturers 
            (id, name, domain, products_url, news_url, sitemap_url, language, is_js_rendered, custom_selectors, active)
            VALUES (@id, @name, @domain, @products_url, @news_url, @sitemap_url, @language, @is_js_rendered, @custom_selectors, @active)
        `).run(m);
    }
};

export const CrawlRunModel = {
    insert: (run: CrawlRun) => {
        db.prepare(`
            INSERT INTO crawl_runs 
            (id, manufacturer_id, status, pages_checked, candidates_found, products_confirmed, error_log)
            VALUES (@id, @manufacturer_id, @status, @pages_checked, @candidates_found, @products_confirmed, @error_log)
        `).run(run);
    },
    updateStatus: (id: string, status: string, error_log: string | null = null) => {
        db.prepare("UPDATE crawl_runs SET status = ?, error_log = ?, finished_at = datetime('now', 'utc') WHERE id = ?").run(status, error_log, id);
    }
};

export const PageModel = {
    upsert: (page: Page) => {
        db.prepare(`
            INSERT INTO pages (id, manufacturer_id, canonical_url, title, content_hash, last_modified_source, last_crawled_at)
            VALUES (@id, @manufacturer_id, @canonical_url, @title, @content_hash, @last_modified_source, @last_crawled_at)
            ON CONFLICT(canonical_url) DO UPDATE SET
            last_seen_at = datetime('now', 'utc'),
            title = excluded.title,
            content_hash = excluded.content_hash,
            last_modified_source = excluded.last_modified_source,
            last_crawled_at = excluded.last_crawled_at
        `).run(page);
    },
    getByCanonicalUrl: (url: string) => db.prepare('SELECT * FROM pages WHERE canonical_url = ?').get(url) as Page | undefined
};

export const ProductModel = {
    insert: (product: Product) => {
        db.prepare(`
            INSERT INTO products 
            (id, manufacturer_id, product_name, series_name, category, classification, source_url, canonical_url, source_publication_date, specs_json, summary_uk, key_features, applications, why_interesting, image_url, confidence, canonical_hash, status, relevance_score)
            VALUES (@id, @manufacturer_id, @product_name, @series_name, @category, @classification, @source_url, @canonical_url, @source_publication_date, @specs_json, @summary_uk, @key_features, @applications, @why_interesting, @image_url, @confidence, @canonical_hash, @status, @relevance_score)
        `).run(product);
    },
    upsert: (product: Product) => {
        const existing = db.prepare('SELECT id FROM products WHERE source_url = ? OR (manufacturer_id = ? AND LOWER(TRIM(product_name)) = LOWER(TRIM(?)))').get(product.source_url, product.manufacturer_id, product.product_name) as { id: string } | undefined;
        if (existing) {
            db.prepare(`
                UPDATE products SET
                    last_seen_at = datetime('now', 'utc'),
                    specs_json = COALESCE(@specs_json, specs_json),
                    summary_uk = COALESCE(@summary_uk, summary_uk),
                    why_interesting = COALESCE(@why_interesting, why_interesting),
                    image_url = COALESCE(@image_url, image_url),
                    relevance_score = MAX(relevance_score, @relevance_score),
                    updated_at = datetime('now', 'utc')
                WHERE id = @id
            `).run({ ...product, id: existing.id });
        } else {
            ProductModel.insert(product);
        }
    }
};

export const DigestModel = {
    insert: (digest: Digest) => {
        db.prepare(`
            INSERT INTO digests 
            (id, period_from, period_to, recipient, subject, status, products_count, html_content)
            VALUES (@id, @period_from, @period_to, @recipient, @subject, @status, @products_count, @html_content)
        `).run(digest);
    },
    updateSentAt: (id: string) => db.prepare("UPDATE digests SET status = 'sent', sent_at = datetime('now', 'utc') WHERE id = ?").run(id)

};

export const DigestItemModel = {
    insert: (item: DigestItem) => {
        db.prepare(`
            INSERT INTO digest_items (id, digest_id, product_id, section, sort_order)
            VALUES (@id, @digest_id, @product_id, @section, @sort_order)
        `).run(item);
    }
};
