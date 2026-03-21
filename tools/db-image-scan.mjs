import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

const imageColumns = [
  { table: 'about_content', col: 'image_url' },
  { table: 'car_images', col: 'image_url' },
  { table: 'cars', col: 'image_url' },
  { table: 'cars', col: 'main_photo' },
  { table: 'cars', col: 'primary_image_url' },
  { table: 'drivers', col: 'avatar_url' },
  { table: 'drivers', col: 'license_url' },
  { table: 'hero_settings', col: 'background_image_url' },
  { table: 'hero_settings', col: 'image_url' },
  { table: 'team_members', col: 'photo_url' },
  { table: 'tours', col: 'image_url' },
  { table: 'transfers', col: 'image_url' },
  { table: 'users', col: 'avatar_url' },
];

console.log('=== Scanning image URL columns ===\n');

for (const { table, col } of imageColumns) {
  try {
    const { rows } = await pool.query(
      `SELECT id, ${col} FROM ${table} WHERE ${col} IS NOT NULL AND ${col} != ''`
    );
    if (rows.length > 0) {
      console.log(`\n--- ${table}.${col} (${rows.length} rows) ---`);
      for (const r of rows) {
        console.log(`  id=${r.id}  url=${r[col]}`);
      }
    }
  } catch (e) {
    console.log(`ERR ${table}.${col}: ${e.message}`);
  }
}

// Also check about_content.value for URLs
console.log('\n=== Scanning about_content.value for http URLs ===');
try {
  const { rows } = await pool.query(
    `SELECT id, key, section, value FROM about_content WHERE value LIKE '%http%'`
  );
  for (const r of rows) {
    console.log(`  id=${r.id} section=${r.section} key=${r.key} value=${r.value}`);
  }
} catch (e) {
  console.log('ERR: ' + e.message);
}

// Check site_content JSONB for image URLs
console.log('\n=== Scanning site_content.content (JSONB) for image URLs ===');
try {
  const { rows } = await pool.query(`SELECT id, page, section, content FROM site_content`);
  for (const r of rows) {
    const str = JSON.stringify(r.content);
    const urls = str.match(/https?:\/\/[^"'\s,}]+\.(jpg|jpeg|png|gif|webp|svg|avif)/gi);
    if (urls && urls.length > 0) {
      console.log(`\n  page=${r.page} section=${r.section}`);
      for (const u of [...new Set(urls)]) console.log(`    ${u}`);
    }
  }
} catch (e) {
  console.log('ERR: ' + e.message);
}

// Check admin_settings JSONB
console.log('\n=== Scanning admin_settings.settings (JSONB) for image URLs ===');
try {
  const { rows } = await pool.query(`SELECT id, key, settings FROM admin_settings`);
  for (const r of rows) {
    const str = JSON.stringify(r.settings);
    const urls = str.match(/https?:\/\/[^"'\s,}]+/gi);
    if (urls && urls.length > 0) {
      console.log(`\n  key=${r.key}`);
      for (const u of [...new Set(urls)]) console.log(`    ${u}`);
    }
  }
} catch (e) {
  console.log('ERR: ' + e.message);
}

// Check tours.itinerary JSONB
console.log('\n=== Scanning tours.itinerary (JSONB) for image URLs ===');
try {
  const { rows } = await pool.query(`SELECT id, title, itinerary FROM tours WHERE itinerary IS NOT NULL`);
  for (const r of rows) {
    const str = JSON.stringify(r.itinerary);
    const urls = str.match(/https?:\/\/[^"'\s,}]+\.(jpg|jpeg|png|gif|webp|svg|avif)/gi);
    if (urls && urls.length > 0) {
      console.log(`\n  tour: ${r.title || r.id}`);
      for (const u of [...new Set(urls)]) console.log(`    ${u}`);
    }
  }
} catch (e) {
  console.log('ERR: ' + e.message);
}

// Check cars.specifications JSONB  
console.log('\n=== Scanning cars.specifications (JSONB) for image URLs ===');
try {
  const { rows } = await pool.query(`SELECT id, make, model, specifications FROM cars WHERE specifications IS NOT NULL`);
  for (const r of rows) {
    const str = JSON.stringify(r.specifications);
    const urls = str.match(/https?:\/\/[^"'\s,}]+\.(jpg|jpeg|png|gif|webp|svg|avif)/gi);
    if (urls && urls.length > 0) {
      console.log(`\n  car: ${r.make} ${r.model}`);
      for (const u of [...new Set(urls)]) console.log(`    ${u}`);
    }
  }
} catch (e) {
  console.log('ERR: ' + e.message);
}

// Check team_members.social_links JSONB
console.log('\n=== Scanning team_members.social_links (JSONB) for image URLs ===');
try {
  const { rows } = await pool.query(`SELECT id, name, social_links FROM team_members WHERE social_links IS NOT NULL`);
  for (const r of rows) {
    const str = JSON.stringify(r.social_links);
    const urls = str.match(/https?:\/\/[^"'\s,}]+\.(jpg|jpeg|png|gif|webp|svg|avif)/gi);
    if (urls && urls.length > 0) {
      console.log(`\n  member: ${r.name}`);
      for (const u of [...new Set(urls)]) console.log(`    ${u}`);
    }
  }
} catch (e) {
  console.log('ERR: ' + e.message);
}

// Also do a broad sweep - search ALL text columns for http URLs with image extensions
console.log('\n\n=== BROAD SWEEP: All text columns with image-like URLs ===');
try {
  const { rows: tables } = await pool.query(`
    SELECT table_name, column_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND (data_type = 'text' OR data_type LIKE '%character%')
    ORDER BY table_name
  `);
  
  for (const { table_name, column_name } of tables) {
    try {
      const { rows } = await pool.query(
        `SELECT id, "${column_name}" as val FROM "${table_name}" 
         WHERE "${column_name}" ~ 'https?://.*\\.(jpg|jpeg|png|gif|webp|svg|avif)'`
      );
      if (rows.length > 0) {
        console.log(`\n  ${table_name}.${column_name} (${rows.length} matches)`);
        for (const r of rows) console.log(`    id=${r.id}: ${r.val}`);
      }
    } catch(e) { /* skip */ }
  }
} catch (e) {
  console.log('ERR: ' + e.message);
}

await pool.end();
console.log('\n\nDone scanning.');
