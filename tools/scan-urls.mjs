import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com' });

async function scan() {
  const tables = ['cars','tours','transfers','hero_settings','about_settings','about_team','about_gallery','site_content','drivers','bookings','tour_bookings'];
  
  for (const table of tables) {
    try {
      const { rows } = await pool.query('SELECT * FROM ' + table + ' LIMIT 1');
      if (rows.length === 0) { console.log(table + ': empty'); continue; }
      const json = JSON.stringify(rows[0]);
      if (json.includes('supabase')) {
        console.log('⚠️  ' + table + ': HAS SUPABASE URLs');
        for (const [key, val] of Object.entries(rows[0])) {
          if (val && String(val).includes('supabase')) {
            console.log('   col=' + key + ' => ' + String(val).substring(0, 150));
          }
        }
      } else {
        console.log('OK ' + table);
      }
    } catch(e) {
      console.log('   ' + table + ': ' + e.message.substring(0, 60));
    }
  }

  // Deep scan specific columns
  const checks = [
    "SELECT id, photo_url FROM cars WHERE photo_url LIKE '%supabase%'",
    "SELECT id, photos::text as p FROM cars WHERE photos::text LIKE '%supabase%'",
    "SELECT id, image_url FROM tours WHERE image_url LIKE '%supabase%'",
    "SELECT id, image_url FROM transfers WHERE image_url LIKE '%supabase%'",
    "SELECT id, image_url FROM about_team WHERE image_url LIKE '%supabase%'",
    "SELECT id, image_url FROM about_gallery WHERE image_url LIKE '%supabase%'",
    "SELECT key, value FROM site_content WHERE value LIKE '%supabase%'",
  ];

  console.log('\n--- Deep scan ---');
  for (const q of checks) {
    const { rows } = await pool.query(q);
    if (rows.length > 0) {
      console.log('FOUND (' + rows.length + '):', q.substring(0, 60));
      rows.forEach(r => console.log('  ', JSON.stringify(r).substring(0, 200)));
    }
  }

  // Show all image URLs used in the DB
  console.log('\n--- All image URL patterns ---');
  const { rows: carUrls } = await pool.query("SELECT DISTINCT substring(photo_url from '^https?://[^/]+') as domain FROM cars WHERE photo_url IS NOT NULL");
  console.log('Car photo domains:', carUrls.map(r => r.domain));
  
  const { rows: tourUrls } = await pool.query("SELECT DISTINCT substring(image_url from '^https?://[^/]+') as domain FROM tours WHERE image_url IS NOT NULL");
  console.log('Tour image domains:', tourUrls.map(r => r.domain));
  
  const { rows: transferUrls } = await pool.query("SELECT DISTINCT substring(image_url from '^https?://[^/]+') as domain FROM transfers WHERE image_url IS NOT NULL");
  console.log('Transfer image domains:', transferUrls.map(r => r.domain));

  const { rows: teamUrls } = await pool.query("SELECT id, image_url FROM about_team");
  console.log('Team images:', teamUrls.map(r => ({ id: r.id, url: r.image_url?.substring(0, 80) })));

  await pool.end();
}
scan().catch(e => { console.error(e); process.exit(1); });
