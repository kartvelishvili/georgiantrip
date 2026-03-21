/**
 * Rewrite Supabase Storage URLs to iHost S3 URLs in database
 * 
 * Old: https://whxtvtbhrrmqfnclqvxw.supabase.co/storage/v1/object/public/car-photos/...
 * New: https://s3.ihost.ge/site-georgiantrip-com/images/...
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

const OLD_PREFIX = 'https://whxtvtbhrrmqfnclqvxw.supabase.co/storage/v1/object/public/car-photos/';
const NEW_PREFIX = 'https://s3.ihost.ge/site-georgiantrip-com/images/';

// Tables and columns that may contain image URLs
const targets = [
  { table: 'cars', columns: ['image_url', 'images'] },
  { table: 'drivers', columns: ['avatar_url', 'photo_url'] },
  { table: 'tours', columns: ['image_url', 'gallery_images', 'images'] },
  { table: 'transfers', columns: ['image_url'] },
  { table: 'hero_settings', columns: ['background_image', 'background_image_url', 'image_url'] },
  { table: 'about_content', columns: ['image_url'] },
  { table: 'team_members', columns: ['photo_url', 'image_url'] },
  { table: 'car_images', columns: ['image_url', 'url'] },
];

async function run() {
  // First check ALL text/jsonb columns for the old URL pattern
  const searchResult = await pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND (data_type LIKE '%char%' OR data_type = 'text' OR data_type = 'jsonb' OR data_type = 'json')
    ORDER BY table_name, column_name
  `);

  let totalUpdated = 0;
  const updatedTables = [];

  for (const col of searchResult.rows) {
    try {
      // Check if any rows contain the old URL
      const check = await pool.query(
        `SELECT COUNT(*) as cnt FROM "${col.table_name}" WHERE "${col.column_name}"::text LIKE $1`,
        [`%${OLD_PREFIX}%`]
      );
      
      const cnt = parseInt(check.rows[0].cnt);
      if (cnt > 0) {
        // Update the URLs
        const result = await pool.query(
          `UPDATE "${col.table_name}" SET "${col.column_name}" = 
            CASE 
              WHEN "${col.column_name}"::text LIKE $1 
              THEN REPLACE("${col.column_name}"::text, $2, $3)${col.data_type === 'jsonb' ? '::jsonb' : col.data_type === 'json' ? '::json' : ''}
              ELSE "${col.column_name}" 
            END
          WHERE "${col.column_name}"::text LIKE $1`,
          [`%${OLD_PREFIX}%`, OLD_PREFIX, NEW_PREFIX]
        );
        
        console.log(`✅ ${col.table_name}.${col.column_name}: ${result.rowCount} rows updated`);
        totalUpdated += result.rowCount;
        updatedTables.push(`${col.table_name}.${col.column_name}`);
      }
    } catch (err) {
      // Skip errors (e.g., columns that don't support LIKE)
    }
  }

  // Also check for URLs without the full supabase path (might be stored differently)
  const altPrefix = 'https://whxtvtbhrrmqfnclqvxw.supabase.co';
  for (const col of searchResult.rows) {
    try {
      const check = await pool.query(
        `SELECT COUNT(*) as cnt FROM "${col.table_name}" WHERE "${col.column_name}"::text LIKE $1 AND "${col.column_name}"::text NOT LIKE $2`,
        [`%${altPrefix}%`, `%${NEW_PREFIX}%`]
      );
      const cnt = parseInt(check.rows[0].cnt);
      if (cnt > 0) {
        console.log(`⚠️  ${col.table_name}.${col.column_name}: ${cnt} rows still contain old supabase domain`);
      }
    } catch (err) {}
  }

  console.log(`\n🎉 Total: ${totalUpdated} rows updated across ${updatedTables.length} columns`);
  if (updatedTables.length > 0) {
    console.log('   Updated:', updatedTables.join(', '));
  }

  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
