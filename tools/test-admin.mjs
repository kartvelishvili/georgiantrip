// Quick admin panel data test
const API = 'http://localhost:3001';

async function main() {
  // Login
  const login = await fetch(`${API}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@georgiantrip.com', password: 'admin123' })
  }).then(r => r.json());
  
  if (login.error) { console.error('Login failed:', login.error); return; }
  const token = login.session.access_token;
  console.log('✓ Admin login OK');

  const h = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  
  // Test various admin queries
  const tests = [
    { name: 'Bookings', body: { table: 'bookings', operation: 'select', select: '*', filters: [], order: [], limit: 5 } },
    { name: 'Cars+Driver', body: { table: 'cars', operation: 'select', select: '*, driver:drivers(*)', filters: [], order: [] } },
    { name: 'Tours', body: { table: 'tours', operation: 'select', select: '*', filters: [], order: [] } },
    { name: 'Transfers+Locations', body: { table: 'transfers', operation: 'select', select: '*, from_location:locations!transfers_from_location_id_fkey(*), to_location:locations!transfers_to_location_id_fkey(*)', filters: [], order: [] } },
    { name: 'Locations (5)', body: { table: 'locations', operation: 'select', select: '*', filters: [], order: [], limit: 5 } },
    { name: 'Hero Settings', body: { table: 'hero_settings', operation: 'select', select: '*', filters: [], order: [] } },
    { name: 'Drivers', body: { table: 'drivers', operation: 'select', select: '*', filters: [], order: [] } },
  ];

  for (const t of tests) {
    try {
      const res = await fetch(`${API}/db`, { method: 'POST', headers: h, body: JSON.stringify(t.body) }).then(r => r.json());
      if (res.error) {
        console.log(`✗ ${t.name}: ${res.error}`);
      } else {
        const count = Array.isArray(res.data) ? res.data.length : (res.data ? 1 : 0);
        console.log(`✓ ${t.name}: ${count} rows`);
      }
    } catch (e) {
      console.log(`✗ ${t.name}: ${e.message}`);
    }
  }
}

main().catch(console.error);
