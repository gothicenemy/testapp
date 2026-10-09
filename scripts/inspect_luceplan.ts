import * as cheerio from 'cheerio';

async function inspectLuceplan() {
  const res = await fetch('https://www.luceplan.com/products/silenzio-suspension/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Search for 90c, 120c, 150c and what happens when you click Discover
  $('div, a, button, section').each((_, el) => {
    const text = $(el).text();
    if (text.includes('90c') && (text.includes('Discover') || $(el).attr('data-model') || $(el).attr('id') || $(el).attr('data-id'))) {
      console.log('Element:', el.tagName, 'Attribs:', $(el).attr());
      console.log('HTML snippet:', $.html(el).slice(0, 500));
    }
  });

  // Also check if there are other Luceplan products with direct product pages
  console.log('\nAll products in sitemap or search on Luceplan:');
}

inspectLuceplan();
