import pg from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import https from 'https';
import http from 'http';
import { Buffer } from 'buffer';
import path from 'path';
import crypto from 'crypto';

// ── Config ──
const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://s3.ihost.ge',
  forcePathStyle: true,
  credentials: {
    accessKeyId: '6aoIaAV8AOW6OPH9',
    secretAccessKey: 'HFbIZ18R1ptcEjw4vVrTrZ29en0CWG90',
  },
});

const BUCKET = 'site-georgiantrip-com';
const S3_BASE = 'https://s3.ihost.ge/site-georgiantrip-com';

// ── Helpers ──
function isExternalUrl(url) {
  if (!url) return false;
  if (url.startsWith('data:')) return true; // data URIs count as "needs migration"
  if (url.startsWith(S3_BASE)) return false; // already on our S3
  return url.startsWith('http://') || url.startsWith('https://');
}

function getExtension(url, contentType) {
  const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
  };
  if (contentType && extMap[contentType]) return extMap[contentType];

  // Try from URL
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).split('?')[0].toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'].includes(ext)) return ext;
  } catch {}
  return '.jpg'; // default
}

async function downloadUrl(url) {
  // Handle data URIs
  if (url.startsWith('data:')) {
    const match = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) throw new Error('Invalid data URI');
    return {
      buffer: Buffer.from(match[2], 'base64'),
      contentType: match[1],
    };
  }

  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ImageMigrator/1.0)' },
      timeout: 30000,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          contentType: res.headers['content-type']?.split(';')[0] || 'image/jpeg',
        });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout for ${url}`)); });
  });
}

async function uploadToS3(buffer, key, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }));
  return `${S3_BASE}/${key}`;
}

function generateS3Key(table, id, ext) {
  const hash = crypto.randomBytes(4).toString('hex');
  return `db-images/${table}/${id}-${hash}${ext}`;
}

// ── Main Migration ──
async function migrateImages() {
  const results = { success: 0, failed: 0, skipped: 0, errors: [] };

  // Define what to migrate: [table, column, idColumn]
  const targets = [
    { table: 'cars', col: 'main_photo' },
    { table: 'cars', col: 'image_url' },
    { table: 'cars', col: 'primary_image_url' },
    { table: 'tours', col: 'image_url' },
    { table: 'transfers', col: 'image_url' },
    { table: 'hero_settings', col: 'image_url' },
    { table: 'hero_settings', col: 'background_image_url' },
    { table: 'about_content', col: 'image_url' },
    { table: 'team_members', col: 'photo_url' },
    { table: 'drivers', col: 'avatar_url' },
    { table: 'drivers', col: 'license_url' },
    { table: 'users', col: 'avatar_url' },
    { table: 'car_images', col: 'image_url' },
  ];

  for (const { table, col } of targets) {
    console.log(`\n── Scanning ${table}.${col} ──`);
    
    let rows;
    try {
      const res = await pool.query(`SELECT id, "${col}" as url FROM "${table}" WHERE "${col}" IS NOT NULL AND "${col}" != ''`);
      rows = res.rows;
    } catch (e) {
      console.log(`  ⚠ Error querying: ${e.message}`);
      continue;
    }

    for (const row of rows) {
      const url = row.url;
      
      if (!isExternalUrl(url)) {
        console.log(`  ✓ Already on S3: ${url.substring(0, 80)}...`);
        results.skipped++;
        continue;
      }

      const shortUrl = url.startsWith('data:') ? 'data:image/...(base64)' : url.substring(0, 100);
      console.log(`  ↓ Downloading: ${shortUrl}`);

      try {
        const { buffer, contentType } = await downloadUrl(url);
        const ext = getExtension(url, contentType);
        const s3Key = generateS3Key(table, row.id.substring(0, 8), ext);

        console.log(`  ↑ Uploading to S3: ${s3Key} (${(buffer.length / 1024).toFixed(1)}KB, ${contentType})`);
        const newUrl = await uploadToS3(buffer, s3Key, contentType);

        // Update database
        await pool.query(`UPDATE "${table}" SET "${col}" = $1 WHERE id = $2`, [newUrl, row.id]);
        console.log(`  ✅ Updated ${table}.${col} for id=${row.id.substring(0, 8)}... → ${newUrl}`);
        results.success++;
      } catch (e) {
        console.log(`  ❌ FAILED: ${e.message}`);
        results.errors.push({ table, col, id: row.id, url: shortUrl, error: e.message });
        results.failed++;
      }
    }
  }

  // Also check JSONB columns for image URLs
  console.log('\n\n── Scanning JSONB columns for image URLs ──');
  const jsonbTargets = [
    { table: 'site_content', col: 'content' },
    { table: 'admin_settings', col: 'settings' },
    { table: 'tours', col: 'itinerary' },
    { table: 'cars', col: 'specifications' },
  ];

  for (const { table, col } of jsonbTargets) {
    console.log(`\n  Checking ${table}.${col}...`);
    try {
      const { rows } = await pool.query(`SELECT id, "${col}" FROM "${table}" WHERE "${col}" IS NOT NULL`);
      for (const row of rows) {
        let jsonStr = JSON.stringify(row[col]);
        const urlPattern = /https?:\/\/[^"'\s,}]+\.(jpg|jpeg|png|gif|webp|svg|avif)(?:[^"'\s,}]*)/gi;
        const urls = [...new Set(jsonStr.match(urlPattern) || [])];
        const externalUrls = urls.filter(u => !u.startsWith(S3_BASE));
        
        if (externalUrls.length === 0) continue;
        
        console.log(`  Found ${externalUrls.length} external image URLs in ${table}.${col} id=${row.id.substring(0, 8)}`);
        
        let modified = false;
        for (const url of externalUrls) {
          try {
            console.log(`    ↓ ${url.substring(0, 80)}`);
            const { buffer, contentType } = await downloadUrl(url);
            const ext = getExtension(url, contentType);
            const s3Key = generateS3Key(table + '-json', row.id.substring(0, 8), ext);
            const newUrl = await uploadToS3(buffer, s3Key, contentType);
            jsonStr = jsonStr.split(url).join(newUrl);
            modified = true;
            console.log(`    ✅ → ${newUrl}`);
            results.success++;
          } catch (e) {
            console.log(`    ❌ ${e.message}`);
            results.errors.push({ table, col: `${col}(json)`, id: row.id, url, error: e.message });
            results.failed++;
          }
        }
        
        if (modified) {
          const newJson = JSON.parse(jsonStr);
          await pool.query(`UPDATE "${table}" SET "${col}" = $1 WHERE id = $2`, [newJson, row.id]);
          console.log(`  ✅ Updated ${table}.${col} JSON for id=${row.id.substring(0, 8)}`);
        }
      }
    } catch (e) {
      console.log(`  ⚠ Error: ${e.message}`);
    }
  }

  console.log('\n\n════════════════════════════════════');
  console.log('  MIGRATION COMPLETE');
  console.log(`  ✅ Success: ${results.success}`);
  console.log(`  ⏭ Skipped (already on S3): ${results.skipped}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  if (results.errors.length > 0) {
    console.log('\n  Failed items:');
    for (const e of results.errors) {
      console.log(`    ${e.table}.${e.col} id=${e.id.substring(0, 8)}: ${e.error}`);
    }
  }
  console.log('════════════════════════════════════');

  await pool.end();
}

migrateImages().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
