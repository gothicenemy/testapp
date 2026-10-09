async function findBega() {
  const res = await fetch('https://www.bega.com/en/products/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  const matches = [...html.matchAll(/href="([^"]+)"/g)];
  const productLinks = matches
    .map(m => m[1])
    .filter(u => u.includes('/products/') && !u.endsWith('/products/'));
  console.log('BEGA product links:', [...new Set(productLinks)].slice(0, 20));
}
findBega();
