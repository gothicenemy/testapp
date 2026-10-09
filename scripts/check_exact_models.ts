import * as cheerio from 'cheerio';

const urls = [
  { mfr: 'luceplan', name: 'Silenzio', url: 'https://www.luceplan.com/products/silenzio-suspension/' },
  { mfr: 'iguzzini', name: 'Palco Framer', url: 'https://www.iguzzini.com/en/palco/' },
  { mfr: 'fagerhult', name: 'Notor 65', url: 'https://www.fagerhult.com/products/notor-65/' },
  { mfr: 'xal', name: 'MOVE IT 25', url: 'https://www.xal.com/en/move-it-25' },
  { mfr: 'delta_light', name: 'Soliscape', url: 'https://deltalight.com/en/products/soliscape' },
  { mfr: 'flos', name: 'Running Magnet', url: 'https://professional.flos.com/en/global/subfamily/architectural-systems-the-running-magnet/' },
  { mfr: 'bega', name: 'Floodlight 84500', url: 'https://www.bega.com/en/products/outdoor-luminaires/floodlights/high-performance-floodlights-84500/' },
  { mfr: 'regent', name: 'LIGHTPAD', url: 'https://www.regent.ch/en/lightpad-evolution/' },
  { mfr: 'rzb', name: 'Toledo Flat', url: 'https://www.rzb.de/en/series/toledo-flat/' },
  { mfr: 'thorlux', name: 'Kanby Pro', url: 'https://www.thorlux.com/products/kanby-pro' },
  { mfr: 'thorn', name: 'Urba', url: 'https://www.thornlighting.com/en-gb/products/outdoor-lighting/road-lighting/urba' },
  { mfr: 'trilux', name: 'E-Line Pro', url: 'https://www.trilux.com/en/products/e-line-next-led/' }
];

async function checkPages() {
  for (const item of urls) {
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(10000)
      });
      const html = await res.text();
      const $ = cheerio.load(html);
      const title = $('title').text().trim();
      const h1 = $('h1').text().trim();
      
      // Look for sub-models or Discover links
      const subLinks: { text: string; href: string }[] = [];
      $('a[href]').each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (href && (href.includes('/p/') || href.includes('/product/') || href.includes('/model') || href.includes('detail') || href.match(/\d{5,}/) || text.toLowerCase().includes('discover') || text.toLowerCase().includes('model'))) {
          subLinks.push({ text: text.replace(/\s+/g, ' '), href });
        }
      });

      console.log(`\n=== [${item.mfr.toUpperCase()}] ${item.name} ===`);
      console.log(`URL: ${item.url}`);
      console.log(`Title: ${title}`);
      console.log(`H1: ${h1}`);
      console.log(`Sub-links (${subLinks.length}):`, subLinks.slice(0, 5));
    } catch (e: any) {
      console.log(`[ERR] ${item.mfr}: ${e.message}`);
    }
  }
}

checkPages();
