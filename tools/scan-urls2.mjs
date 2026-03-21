import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com' });

async function scan() {
  // Get actual columns
  const { rows: cols } = await pool.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND (column_name LIKE '%url%' OR column_name LIKE '%image%' OR column_name LIKE '%photo%' OR column_name LIKE '%logo%')
    ORDER BY table_name, column_name
  `);
  console.log('=== Image/URL columns ===');
  cols.forEach(c => console.log(c.table_name + '.' + c.column_name));

  // Check cars
  console.log('\n=== Cars image data ===');
  const { rows: cars } = await pool.query('SELECT id, photos_urls FROM cars');
  cars.forEach(c => {
    console.log('Car', c.id.substring(0,8), JSON.stringify(c.photos_urls)?.substring(0, 300));
  });

  // Check tours
  console.log('\n=== Tours image data ===');
  const { rows: tours } = await pool.query('SELECT id, image_url, title FROM tours');
  tours.forEach(t => {
    console.log(t.title?.substring(0, 40), '=>', t.image_url?.substring(0, 100));
  });

  // Check transfers
  console.log('\n=== Transfers image data ===');
  const { rows: transfers } = await pool.query('SELECT id, image_url, name FROM transfers');
  transfers.forEach(t => {
    console.log(t.name?.substring(0, 40), '=>', t.image_url?.substring(0, 100));
  });

  // Check hero_settings
  console.log('\n=== Hero settings ===');
  const { rows: hero } = await pool.query('SELECT * FROM hero_settings LIMIT 1');
  if (hero.length) {
    const h = hero[0];
    for (const [k, v] of Object.entries(h)) {
      if (v && typeof v === 'string' && (v.includes('http') || v.includes('supabase'))) {
        console.log(k, '=>', v.substring(0, 100));
      }
    }
  }

  // Full text search for supabase across all text data
  console.log('\n=== Full text search for "supabase" ===');
  const tables = ['cars', 'tours', 'transfers', 'hero_settings', 'locations', 'drivers', 'bookings', 'tour_bookings'];
  for (const t of tables) {
    try {
      const { rows } = await pool.query(`SELECT count(*) as c FROM ${t} WHERE ${t}::text LIKE '%supabase%'`);
      if (parseInt(rows[0].c) > 0) {
        console.log('FOUND supabase in ' + t + ': ' + rows[0].c + ' rows');
      }
    } catch(e) {
      // row cast doesn't work, try column by column
    }
  }

  await pool.end();
}
scan().catch(e => { console.error(e.message); process.exit(1); });
