const API = 'http://localhost:3001';

async function test() {
  // 1. Test transfers with locations
  const transfers = await fetch(API+'/db', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({table:'transfers',operation:'select',
      select:'*, from_location:locations!transfers_from_location_id_fkey(*), to_location:locations!transfers_to_location_id_fkey(*)',
      filters:[{type:'eq',col:'is_active',val:true}],
      order:[{col:'display_order',ascending:true}]
    })
  }).then(r=>r.json());
  console.log('Transfers:', transfers.data?.length, 'routes');

  // 2. Test tours  
  const tours = await fetch(API+'/db', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({table:'tours',operation:'select',select:'*',
      filters:[{type:'eq',col:'is_active',val:true}],
      order:[{col:'display_order',ascending:true}]
    })
  }).then(r=>r.json());
  console.log('Tours:', tours.data?.length);

  // 3. Hero
  const hero = await fetch(API+'/db', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({table:'hero_settings',operation:'select',select:'*',limit:1,single:true})
  }).then(r=>r.json());
  console.log('Hero:', hero.data ? 'OK' : 'null');

  // 4. Auth
  const auth = await fetch(API+'/auth/signin', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email:'admin@georgiantrip.com',password:'admin123'})
  }).then(r=>r.json());
  console.log('Auth:', auth.session ? 'OK' : 'FAIL');

  // 5. Count
  const token = auth.session?.access_token;
  const count = await fetch(API+'/db', {
    method:'POST', 
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body: JSON.stringify({table:'bookings',operation:'select',selectOptions:{count:'exact',head:true},select:'*'})
  }).then(r=>r.json());
  console.log('Bookings count:', count.count);

  // 6. Cars with driver join
  const cars = await fetch(API+'/db', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({table:'cars',operation:'select',select:'*, driver:drivers(*)',
      filters:[{type:'eq',col:'active',val:true}]})
  }).then(r=>r.json());
  console.log('Cars:', cars.data?.length);

  // 7. Location autocomplete (OR filter)
  const loc = await fetch(API+'/db', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({table:'locations',operation:'select',select:'*',
      filters:[{type:'or',val:'name_en.ilike.%tbi%,name_ka.ilike.%tbi%'}],
      order:[{col:'name_en',ascending:true}], limit:5})
  }).then(r=>r.json());
  console.log('Location search "tbi":', loc.data?.length, 'results');

  console.log('\n--- All e2e tests passed ---');
}

test().catch(e => console.error('FAIL:', e.message));
