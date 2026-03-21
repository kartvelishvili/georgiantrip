import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

async function inspect(label, query) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${label}`);
  console.log(`${'═'.repeat(60)}`);
  try {
    const { rows } = await pool.query(query);
    if (rows.length === 0) {
      console.log('  (empty)');
    } else {
      for (const r of rows) {
        console.log(JSON.stringify(r, null, 2));
      }
    }
  } catch (e) {
    console.log('  ERROR:', e.message);
  }
}

// ── DRIVERS ──
await inspect('DRIVERS (0 rows - POTENTIAL ISSUE)', 
  'SELECT * FROM drivers LIMIT 5');

// ── CARS (check completeness) ──
await inspect('CARS (5 rows)', 
  `SELECT id, make, model, license_plate, main_photo, primary_image_url, image_url, verification_status FROM cars`);

// ── CAR_IMAGES ──
await inspect('CAR_IMAGES (0 rows - POTENTIAL ISSUE)', 
  'SELECT * FROM car_images LIMIT 5');

// ── DRIVER_APPLICATIONS ──
await inspect('DRIVER_APPLICATIONS (0 rows)', 
  'SELECT * FROM driver_applications LIMIT 5');

// ── DRIVER_PRICING ──
await inspect('DRIVER_PRICING (0 rows - POTENTIAL ISSUE)', 
  'SELECT * FROM driver_pricing LIMIT 5');

// ── TEAM_MEMBERS ──
await inspect('TEAM_MEMBERS (0 rows - POTENTIAL ISSUE)', 
  'SELECT * FROM team_members LIMIT 5');

// ── SITE_CONTENT ──
await inspect('SITE_CONTENT (0 rows - POTENTIAL ISSUE)',
  'SELECT * FROM site_content LIMIT 10');

// ── BOOKINGS ──
await inspect('BOOKINGS (0 rows)', 
  'SELECT * FROM bookings LIMIT 5');

// ── REVIEWS ──
await inspect('REVIEWS (0 rows)', 
  'SELECT * FROM reviews LIMIT 5');

// ── CAR_REVIEWS ──
await inspect('CAR_REVIEWS (0 rows)', 
  'SELECT * FROM car_reviews LIMIT 5');

// ── USERS ──
await inspect('USERS (1 row)', 
  `SELECT id, email, first_name, last_name, role, avatar_url FROM users`);

// ── ABOUT_CONTENT ──
await inspect('ABOUT_CONTENT (3 rows)', 
  `SELECT id, section, key, substring(value, 1, 100) as value_preview, image_url FROM about_content`);

// ── TOURS (check completeness) ──
await inspect('TOURS (11 rows) - key fields',
  `SELECT id, title, title_ka, slug, price_per_person, image_url IS NOT NULL as has_image, description IS NOT NULL OR description_ka IS NOT NULL as has_desc FROM tours`);

// ── TRANSFERS ──
await inspect('TRANSFERS (8 rows) - key fields',
  `SELECT id, title, title_ka, slug, image_url IS NOT NULL as has_image FROM transfers`);

// ── HERO_SETTINGS ──
await inspect('HERO_SETTINGS', 
  `SELECT * FROM hero_settings`);

// ── ADMIN_SETTINGS ──
await inspect('ADMIN_SETTINGS',
  `SELECT id, key, currency, settings FROM admin_settings`);

// ── SMS_SETTINGS ──
await inspect('SMS_SETTINGS',
  `SELECT id, service_name, sender_name, api_key IS NOT NULL as has_api_key FROM sms_settings`);

// ── ADMIN_PHONE_NUMBERS ──
await inspect('ADMIN_PHONE_NUMBERS',
  `SELECT * FROM admin_phone_numbers`);

await pool.end();
console.log('\n\nDone.');
