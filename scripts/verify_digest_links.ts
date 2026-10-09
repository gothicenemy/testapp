import Database from 'better-sqlite3';
import path from 'path';
import { DigestGenerator } from '../backend/digest/generator.js';

const DB_PATH = path.join(process.cwd(), 'data', 'lighting-monitor.db');
const db = new Database(DB_PATH);

const gen = new DigestGenerator();
const raw = db.prepare('SELECT * FROM products ORDER BY relevance_score DESC LIMIT 20').all() as any[];
const mapped = raw.map(p => ({
  ...p,
  specs: JSON.parse(p.specs_json || '{}'),
  key_features: JSON.parse(p.key_features || '[]')
}));

const html = gen.generate({
  periodFrom: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  periodTo: new Date(),
  newProducts: mapped,
  majorUpdates: [],
  totalManufacturers: 20,
  successfulManufacturers: 20,
  failedManufacturers: [],
  maxItems: 20
});

const regex = /href="(https?:\/\/[^"]+)"/g;
const links: string[] = [];
let match;
while ((match = regex.exec(html)) !== null) {
  links.push(match[1]);
}

console.log(`[VERIFY] Total extracted links: ${links.length}`);
links.forEach((url, i) => {
  console.log(`${i + 1}. ${url}`);
});
