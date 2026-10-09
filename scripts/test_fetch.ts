import * as cheerio from 'cheerio';

async function testFetch() {
  const url = 'https://www.targetti.com/en/Products/Outdoor/Projectors/Dart/Dart-Medium';
  console.log('Fetching:', url);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('Title tag:', $('title').text().trim());
  console.log('H1 tag:', $('h1').first().text().trim());
  console.log('OG Title:', $('meta[property="og:title"]').attr('content'));
  console.log('OG Image:', $('meta[property="og:image"]').attr('content'));
  console.log('Meta Description:', $('meta[name="description"]').attr('content'));
}

testFetch().catch(console.error);
