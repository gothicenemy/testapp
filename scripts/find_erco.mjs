import https from 'https';

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) {
      console.log(`[HTTP ${res.status}] ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.log(`[ERR] ${url}: ${err.message}`);
    return null;
  }
}

async function findErco() {
  const html = await fetchHtml('https://www.erco.com/en/products/indoor/spotlights-for-track/');
  if (!html) return;
  const matches = [...html.matchAll(/href="(\/en\/products\/[^"]+)"/g)];
  console.log('ERCO links count:', matches.length);
  const unique = [...new Set(matches.map(m => 'https://www.erco.com' + m[1]))];
  console.log(unique.slice(0, 15));
}

findErco();
