import Database from 'better-sqlite3';

const db = new Database('./data/lighting-monitor.db');

console.log('--- DATABASE INSPECTION ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map((t: any) => t.name));

const runs = db.prepare('SELECT * FROM crawl_runs').all();
console.log(`Crawl runs (${runs.length}):`, runs);

const products = db.prepare('SELECT id, manufacturer_id, product_name, category, classification, canonical_hash FROM products').all();
console.log(`Products (${products.length}):`, products.slice(0, 5));
