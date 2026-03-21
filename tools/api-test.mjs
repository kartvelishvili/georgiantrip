const API = 'https://api.georgiantrip.com';

async function test(label, url, method = 'GET', body = null) {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text.substring(0, 200); }
    const count = Array.isArray(data) ? data.length : (data?.data ? (Array.isArray(data.data) ? data.data.length : 1) : '?');
    console.log(label.padEnd(40) + 'HTTP ' + r.status + '  items: ' + count);
  } catch(e) { console.log(label.padEnd(40) + 'ERROR: ' + e.message); }
}

console.log('=== REST Endpoints ===');
await test('GET /api/tours', API + '/api/tours');
await test('GET /api/transfers', API + '/api/transfers');
await test('GET /api/cars', API + '/api/cars');
await test('GET /api/hero-settings', API + '/api/hero-settings');

console.log('\n=== Supabase-style DB Endpoints ===');
const tables = ['tours', 'transfers', 'cars', 'drivers', 'car_images', 'team_members', 'site_content', 'hero_settings', 'locations', 'about_content', 'admin_settings', 'users', 'bookings', 'driver_pricing', 'reviews', 'admin_phone_numbers', 'sms_settings'];
for (const t of tables) {
  await test('POST /db ' + t, API + '/db', 'POST', { table: t, method: 'select', params: { select: '*' } });
}

console.log('\n=== Auth ===');
await test('POST /auth/signin (admin)', API + '/auth/signin', 'POST', { email: 'admin@georgiantrip.com', password: 'admin123' });

console.log('\n=== Storage ===');
await test('GET /storage test', API + '/storage/list/site-images');
