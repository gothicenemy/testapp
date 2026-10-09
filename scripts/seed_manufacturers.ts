import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';

const db = new Database('./data/lighting-monitor.db');

const mfgPath = path.join(process.cwd(), 'backend', 'config', 'manufacturers.yaml');
const raw = load(fs.readFileSync(mfgPath, 'utf8')) as any;
const mfgs = Array.isArray(raw) ? raw : (raw.manufacturers || []);

console.log(`Seeding ${mfgs.length} manufacturers...`);

const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO manufacturers 
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

const count = db.prepare('SELECT count(*) as cnt FROM manufacturers').get() as { cnt: number };
console.log(`✓ Successfully seeded ${count.cnt} manufacturers in database!`);
