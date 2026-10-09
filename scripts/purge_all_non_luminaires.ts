import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'lighting-monitor.db');
const db = new Database(DB_PATH);

console.log('[Purge] Starting deep purge of non-luminaire items...');

const beforeCount = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
console.log(`[Purge] Total products before purge: ${beforeCount.count}`);

// Strict deletion query: Delete ALL corporate pages, services, tools, software, furniture, EV chargers, accessories, PR, journals, and category hubs
const deleteStmt = db.prepare(`
  DELETE FROM products
  WHERE 
    -- 1. Explicit service / showroom / quote / corporate names
    product_name IN (
      'Modular Custom', 'Repair & refurbish', 'Technical support', 'Visit our showrooms',
      'Request a quote', 'Become a partner', 'Personalised project consultation',
      'Request a lighting design', 'Smart Services', 'Notice to Customers',
      'Payment - Customer care', 'Shipping - Customer care', 'Frequently Asked Questions - FAQ',
      'Flos Stories', 'Design history: iconic Flos lamps', 'The designers of Flos lamps',
      'Where to Buy Flos Lighting - Store Locator', 'Original spare parts for Flos lamps',
      'Returns and Refunds', 'All new Flos lamps', 'Flos lamps: designer gift ideas',
      'Design wall lamps and modern wall sconces', 'Modern and design table lamps',
      'Modern floor lamps, design standing lamps', 'Modern portable lamps',
      'Pendant lamps and chandeliers',
      'Artemide journal', 'Artemide\n\t\t\t\tjournal', 'Artemide Outlet Days 2026',
      'Iluminar la vida, Construir el mañana', 'London Design Festival 2026', 'My Area',
      'New Frankfurt  Flagship Store', 'Novelties2026', 'Vea and Boltons', 'Vea and Boltons at ADI',
      'loadMore',
      'BEGA Connect', 'BEGA Smart', 'Connecting pillars', 'E-mobility', 'Electrical supply',
      'Light control', 'Luminaire poles', 'Modular Furniture System', 'Outdoor Furniture',
      'Street furniture', 'Urban Design Elements', 'accessories', 'BEGA Bollards', 'Bollards',
      'Light building elements', 'Light design elements', 'In-ground luminaires series',
      'Acoustics and lighting in one', 'Events', 'ISO Certificates', 'Installation videos',
      'Job vacancies', 'LED technology', 'Light is what makes a house a home', 'Logistics',
      'My pinlist', 'Optics and light control', 'Our Lighting Experience', 'Our People',
      'Quality testing in our very own lab', 'RELATE. A video series on architecture and light',
      'Research and Development', 'Sensors and connectivity', 'Spy II 39 Configurator',
      'Technology & LED', 'The Deltalight design', 'The Profile Configurator for Omniliner',
      'The highest production standards', 'Working at Deltalight', 'Deep Ringo, Splitline, Spy',
      'Castor, Kona XS, Lightscan, Tesis', 'ERCO Lichtbericht magazine: subscribe free of charge',
      'ERCO Sitemap and Product Index', 'ERCO individual', 'Light seminars',
      'Minirail 48V & Eclipse 48V', 'Optec new', 'Jilly', 'Jilly, Skim, Compar',
      'Fagerhult Pendant Lighting Range', 'Fagerhult Surface Mounted Indoor Series',
      'Outdoor Bollard Series (Fjord, Vivita, Verda, On Ground)',
      'Outdoor Surface Mounted Lighting Range', 'Track Mounted Lighting Range',
      'Accessories', 'Acoustics', 'Acoustics Series', 'All Product Categories', 'Fast Delivery',
      'LED strips and profiles', 'Outdoor Luminaires Assortment', 'Pendant Luminaires Portfolio',
      'Product Index', 'Profile systems', 'Recessed Luminaires Category', 'Track systems',
      'Trail Trunking System Components', 'Trunking systems', 'all product families',
      'Locations', 'Regent lab', 'Your wish list at Regent.chWish list', 'log in', 'product finder',
      'Digital tools for luminaires, track systems & planning', 'Highlight Families', 'NUMINOS',
      'SLV CATALOGUES - FACETS OF LIGHT', 'SLVtec', 'SLVtec® - Efficient, functional, future-proof',
      'In-ground luminaires category page', 'Neuheiten Kollektion', 'Outdoor Projectors',
      'Strahler Outdoor Series',
      'Azmet EV - view the range', 'Azmet EV Accessories', 'Carbon offsetting',
      'ColourActive Gateway - view the range', 'Columns - view the range', 'SmartScan',
      '5 Year Guarantee', 'Common (shared) items', 'Site map', 'Tools',
      'Ground-recessed luminaires category', 'IntuSens', 'IntuSens sensors',
      'IntuSens sensors › Light management', 'IntuSens – The Future of Sensing begins now',
      'Light management', 'Light management, indoor lighting › Light management',
      'Light management, outdoor lighting › Light management', 'LiveLink light management',
      'Luminaires with higher degree of protection', 'Rail Track and Inserts', 'Spotlight Series',
      'Track and inserts - Nordic', 'E-Line / Yonos', 'E-Line Continuous Line System – In Line with Evolution',
      'E-Line Pro'
    )
    -- 2. Patterns in name (case-insensitive)
    OR LOWER(product_name) LIKE '%journal%'
    OR LOWER(product_name) LIKE '%festival%'
    OR LOWER(product_name) LIKE '%showroom%'
    OR LOWER(product_name) LIKE '%partner%'
    OR LOWER(product_name) LIKE '%technical support%'
    OR LOWER(product_name) LIKE '%repair%'
    OR LOWER(product_name) LIKE '%refurbish%'
    OR LOWER(product_name) LIKE '%request a%'
    OR LOWER(product_name) LIKE '%consultation%'
    OR LOWER(product_name) LIKE '%smart service%'
    OR LOWER(product_name) LIKE '%magazine%'
    OR LOWER(product_name) LIKE '%catalogue%'
    OR LOWER(product_name) LIKE '%catalogues%'
    OR LOWER(product_name) LIKE '%customer care%'
    OR LOWER(product_name) LIKE '%notice to%'
    OR LOWER(product_name) LIKE '%faq%'
    OR LOWER(product_name) LIKE '%furniture%'
    OR LOWER(product_name) LIKE '%e-mobility%'
    OR LOWER(product_name) LIKE '%connecting pillar%'
    OR LOWER(product_name) LIKE '%electrical supply%'
    OR LOWER(product_name) LIKE '%carbon offsetting%'
    OR LOWER(product_name) LIKE '%gateway%'
    OR LOWER(product_name) LIKE '%light management%'
    OR LOWER(product_name) LIKE '%guarantee%'
    OR LOWER(product_name) LIKE '%wish list%'
    OR LOWER(product_name) LIKE '%log in%'
    OR LOWER(product_name) LIKE '%login%'
    OR LOWER(product_name) LIKE '%product finder%'
    OR LOWER(product_name) LIKE '%digital tools%'
    OR LOWER(product_name) LIKE '%configurator%'
    OR LOWER(product_name) LIKE '%loadmore%'
    OR LOWER(product_name) LIKE '%outlet days%'
    OR LOWER(product_name) LIKE '%job vacancies%'
    OR LOWER(product_name) LIKE '%working at%'
    OR LOWER(product_name) LIKE '%our people%'
    OR LOWER(product_name) LIKE '%vacancies%'
    OR LOWER(product_name) LIKE '%ev chargers%'
    OR LOWER(product_name) LIKE '%ev charger%'
    -- 3. Patterns in source_url indicating services, corporate, stories, tools
    OR source_url LIKE '%/services-for-business/%'
    OR source_url LIKE '%/services/%'
    OR source_url LIKE '%/service/%'
    OR source_url LIKE '%/journal/%'
    OR source_url LIKE '%/stories/%'
    OR source_url LIKE '%/more-inspiration/%'
    OR source_url LIKE '%/our-expertise/%'
    OR source_url LIKE '%/working-at%'
    OR source_url LIKE '%/profile/%'
    OR source_url LIKE '%/lighting-tools/%'
    OR source_url LIKE '%/seminars/%'
    OR source_url LIKE '%/urban-furniture/%'
    OR source_url LIKE '%/electrical-supply%'
    OR source_url LIKE '%/light-control%'
    OR source_url LIKE '%/tools-resources/%'
    OR source_url LIKE '%/locations/%'
    OR source_url LIKE '%/nutzerbereich%'
    OR source_url LIKE '%/carbon-offsetting%'
    OR source_url LIKE '%/smartscan%'
    OR source_url LIKE '%/5-year-guarantee%'
    OR source_url LIKE '%/sitemap%'
    OR source_url LIKE '%/tools%'
    OR source_url LIKE '%/clp-spare-parts%'
    OR source_url LIKE '%/notice-to-customers%'
    OR source_url LIKE '%/payments.html%'
    OR source_url LIKE '%/shipping.html%'
    OR source_url LIKE '%/returns.html%'
    OR source_url LIKE '%/stores%'
    OR source_url LIKE '%/designers%'
    OR source_url LIKE '%/Light-management%'
    OR source_url LIKE '%/azmet-ev/%'
    OR source_url LIKE '%/colouractive-gateway/%'
    OR source_url LIKE '%/columns/%'
    OR source_url LIKE '%/shop-products/%'
    OR source_url LIKE '%/products/list/%'
    OR source_url LIKE '%/product-categories/%'
    OR source_url LIKE '%/all-product-families%'
    OR source_url LIKE '%/product-index%'
    OR source_url LIKE '%/fast-delivery%'
    OR source_url LIKE '%/my/area%'
    OR source_url LIKE '%/loadMore%'
`);

const result = deleteStmt.run();
console.log(`[Purge] Successfully deleted ${result.changes} non-luminaire items!`);

const afterCount = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
console.log(`[Purge] Clean luminaires remaining in database: ${afterCount.count}`);

// Display remaining products grouped by manufacturer
const remaining = db.prepare('SELECT id, manufacturer_id, product_name, category, source_url FROM products ORDER BY manufacturer_id, product_name').all() as any[];

console.log('\n=== REMAINING VALID LUMINAIRES AUDIT ===');
for (const p of remaining) {
  console.log(`[${p.manufacturer_id}] "${p.product_name}" (${p.category}) -> ${p.source_url}`);
}
