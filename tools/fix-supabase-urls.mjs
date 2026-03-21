import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com' });

const OLD = 'https://whxtvtbhrrmqfnclqvxw.supabase.co/storage/v1/object/public/car-photos/';
const NEW = 'https://s3.ihost.ge/site-georgiantrip-com/images/';

async function fix() {
  // 1. Fix cars.photos_urls (text[] array) - use SQL REPLACE directly
  const r1 = await pool.query(`
    UPDATE cars SET photos_urls = (
      SELECT array_agg(REPLACE(elem, $1, $2))
      FROM unnest(photos_urls) AS elem
    ) WHERE photos_urls::text LIKE '%supabase%'
  `, [OLD, NEW]);
  console.log('Fixed cars.photos_urls:', r1.rowCount);

  // 2. Fix cars.image_url
  const r2 = await pool.query("UPDATE cars SET image_url = REPLACE(image_url, $1, $2) WHERE image_url LIKE '%supabase%'", [OLD, NEW]);
  console.log('Fixed cars.image_url:', r2.rowCount);

  // 3. Fix cars.main_photo
  const r3 = await pool.query("UPDATE cars SET main_photo = REPLACE(main_photo, $1, $2) WHERE main_photo LIKE '%supabase%'", [OLD, NEW]);
  console.log('Fixed cars.main_photo:', r3.rowCount);

  // 4. Fix cars.primary_image_url
  const r4 = await pool.query("UPDATE cars SET primary_image_url = REPLACE(primary_image_url, $1, $2) WHERE primary_image_url LIKE '%supabase%'", [OLD, NEW]);
  console.log('Fixed cars.primary_image_url:', r4.rowCount);

  // 5. Fix cars.gallery_images (text[] or jsonb)
  try {
    const r5 = await pool.query(`
      UPDATE cars SET gallery_images = (
        SELECT array_agg(REPLACE(elem, $1, $2))
        FROM unnest(gallery_images::text[]) AS elem
      ) WHERE gallery_images::text LIKE '%supabase%'
    `, [OLD, NEW]);
    console.log('Fixed cars.gallery_images:', r5.rowCount);
  } catch(e) {
    console.log('cars.gallery_images skip:', e.message.substring(0, 60));
  }

  // 6. Fix car_images table
  const r6 = await pool.query("UPDATE car_images SET image_url = REPLACE(image_url, $1, $2) WHERE image_url LIKE '%supabase%'", [OLD, NEW]);
  console.log('Fixed car_images:', r6.rowCount);

  // 7. Fix transfers.image_url  
  const r7 = await pool.query("UPDATE transfers SET image_url = REPLACE(image_url, $1, $2) WHERE image_url LIKE '%supabase%'", [OLD, NEW]);
  console.log('Fixed transfers.image_url:', r7.rowCount);

  // 8. Fix tours.image_url
  const r8 = await pool.query("UPDATE tours SET image_url = REPLACE(image_url, $1, $2) WHERE image_url LIKE '%supabase%'", [OLD, NEW]);
  console.log('Fixed tours.image_url:', r8.rowCount);

  // 9. Fix tours.gallery_images
  try {
    const r9 = await pool.query(`
      UPDATE tours SET gallery_images = (
        SELECT array_agg(REPLACE(elem, $1, $2))
        FROM unnest(gallery_images::text[]) AS elem
      ) WHERE gallery_images::text LIKE '%supabase%'
    `, [OLD, NEW]);
    console.log('Fixed tours.gallery_images:', r9.rowCount);
  } catch(e) {
    console.log('tours.gallery_images skip:', e.message.substring(0, 60));
  }

  // 10. Fix hero_settings
  const r10a = await pool.query("UPDATE hero_settings SET image_url = REPLACE(image_url, $1, $2) WHERE image_url LIKE '%supabase%'", [OLD, NEW]);
  const r10b = await pool.query("UPDATE hero_settings SET background_image_url = REPLACE(background_image_url, $1, $2) WHERE background_image_url LIKE '%supabase%'", [OLD, NEW]);
  console.log('Fixed hero_settings:', r10a.rowCount + r10b.rowCount);

  // 11. Fix the second Supabase project URL (lekwouwaajnnjhoomyrc)
  const OLD2 = 'https://lekwouwaajnnjhoomyrc.supabase.co/storage/v1/object/public/';
  // Fix in team_members
  const r11 = await pool.query("UPDATE team_members SET photo_url = REPLACE(photo_url, $1, $2) WHERE photo_url LIKE '%supabase%'", [OLD2, NEW]);
  console.log('Fixed team_members:', r11.rowCount);

  // 12. Fix drivers.avatar_url  
  const r12 = await pool.query("UPDATE drivers SET avatar_url = REPLACE(avatar_url, $1, $2) WHERE avatar_url LIKE '%supabase%'", [OLD, NEW]);
  console.log('Fixed drivers.avatar_url:', r12.rowCount);

  // Verify - any remaining supabase URLs?
  console.log('\n=== Verification ===');
  const checks = [
    'cars', 'tours', 'transfers', 'hero_settings', 'car_images', 'team_members', 'drivers'
  ];
  for (const t of checks) {
    try {
      const { rows } = await pool.query(`SELECT count(*) as c FROM ${t}`);
      const total = rows[0].c;
      // Try to find supabase in any text column
      const { rows: cols } = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND data_type IN ('text','character varying','jsonb')`, [t]);
      let found = 0;
      for (const col of cols) {
        try {
          const { rows: r } = await pool.query(`SELECT count(*) as c FROM ${t} WHERE ${col.column_name}::text LIKE '%supabase%'`);
          found += parseInt(r[0].c);
        } catch(e) {}
      }
      console.log(t + ': ' + total + ' total, ' + found + ' with supabase');
    } catch(e) {}
  }

  await pool.end();
  console.log('\nDone!');
}

fix().catch(e => { console.error(e); process.exit(1); });
