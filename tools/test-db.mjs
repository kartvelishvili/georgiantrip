// Quick test for /db endpoint
const tests = [
  {
    name: 'Simple select',
    body: { table: 'tours', operation: 'select', select: '*', filters: [{ type: 'eq', col: 'is_active', val: true }], limit: 2 }
  },
  {
    name: 'Transfer with location joins',
    body: { 
      table: 'transfers', operation: 'select',
      select: '*, from_location:locations!transfers_from_location_id_fkey(*), to_location:locations!transfers_to_location_id_fkey(*)',
      filters: [{ type: 'eq', col: 'is_active', val: true }],
      limit: 1
    }
  },
  {
    name: 'Cars with driver join',
    body: {
      table: 'cars', operation: 'select',
      select: '*, driver:drivers(*)',
      filters: [{ type: 'eq', col: 'active', val: true }],
      limit: 2
    }
  },
  {
    name: 'Count query',
    body: { table: 'locations', operation: 'select', select: '*', selectOptions: { count: 'exact', head: true } }
  },
  {
    name: 'Auth signin',
    url: '/auth/signin',
    body: { email: 'admin@georgiantrip.com', password: 'admin123' }
  }
];

async function run() {
  for (const t of tests) {
    const url = t.url ? `http://localhost:3001${t.url}` : 'http://localhost:3001/db';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t.body)
      });
      const data = await res.json();
      
      if (data.error) {
        console.log(`❌ ${t.name}: ${data.error}`);
      } else if (t.name === 'Auth signin') {
        console.log(`✅ ${t.name}: token=${data.session?.access_token?.slice(0,20)}...`);
      } else if (t.name === 'Count query') {
        console.log(`✅ ${t.name}: count=${data.count}`);
      } else if (t.name === 'Transfer with location joins') {
        const tr = data.data?.[0];
        console.log(`✅ ${t.name}: ${tr?.name_en}, from=${tr?.from_location?.name_en}, to=${tr?.to_location?.name_en}`);
      } else if (t.name === 'Cars with driver join') {
        const c = data.data?.[0];
        console.log(`✅ ${t.name}: ${c?.make} ${c?.model}, driver=${c?.driver?.first_name || 'null'}`);
      } else {
        console.log(`✅ ${t.name}: ${data.data?.length || 0} rows`);
      }
    } catch (err) {
      console.log(`❌ ${t.name}: ${err.message}`);
    }
  }
}

run();
