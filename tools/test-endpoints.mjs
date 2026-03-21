// Quick test of key API endpoints
const endpoints = [
  { url: 'http://localhost:3001/db', method: 'POST', body: { table: 'site_content', operation: 'select', select: '*', filters: [{ column: 'section', operator: 'eq', value: 'hero' }] } },
  { url: 'http://localhost:3001/api/tours', method: 'GET' },
  { url: 'http://localhost:3001/api/transfers', method: 'GET' },
  { url: 'http://localhost:3001/api/hero-settings', method: 'GET' },
  { url: 'http://localhost:3001/api/locations', method: 'GET' },
  { url: 'http://localhost:3001/nonexistent-page', method: 'GET' },
];

for (const ep of endpoints) {
  try {
    const opts = { method: ep.method, headers: { 'Content-Type': 'application/json' } };
    if (ep.body) opts.body = JSON.stringify(ep.body);
    const res = await fetch(ep.url, opts);
    const text = await res.text();
    const isJson = text.startsWith('{') || text.startsWith('[');
    const isHtml = text.startsWith('<!');
    console.log(`${ep.method} ${ep.url.replace('http://localhost:3001', '')} → ${res.status} ${isJson ? 'JSON' : isHtml ? 'HTML!' : text.substring(0, 30)}`);
  } catch (e) {
    console.log(`${ep.method} ${ep.url.replace('http://localhost:3001', '')} → ERROR: ${e.message}`);
  }
}
