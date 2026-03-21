const BASE = 'http://194.163.172.62:3002';

const tests = [
  { name: 'Tours', url: `${BASE}/api/tours` },
  { name: 'Transfers', url: `${BASE}/api/transfers` },
  { name: 'Cars', url: `${BASE}/api/cars` },
  { name: 'Hero Settings', url: `${BASE}/api/hero-settings` },
  { name: 'Locations', url: `${BASE}/api/locations` },
  { name: 'Site Content (DB)', url: `${BASE}/db`, method: 'POST', body: { table: 'site_content', operation: 'select', select: '*', filters: [{ column: 'page', operator: 'eq', value: 'home' }] } },
  { name: 'Admin Login', url: `${BASE}/auth/signin`, method: 'POST', body: { email: 'admin@georgiantrip.com', password: 'admin123' } },
];

for (const t of tests) {
  try {
    const opts = { method: t.method || 'GET', headers: { 'Content-Type': 'application/json' } };
    if (t.body) opts.body = JSON.stringify(t.body);
    const res = await fetch(t.url, opts);
    const text = await res.text();
    const isJson = text.startsWith('{') || text.startsWith('[');
    const preview = isJson ? (text.length > 80 ? text.substring(0, 80) + '...' : text) : text.substring(0, 50);
    console.log(`${t.name}: ${res.status} ${isJson ? 'JSON' : 'NOT-JSON'} ${preview}`);
  } catch (e) {
    console.log(`${t.name}: ERROR ${e.message}`);
  }
}
