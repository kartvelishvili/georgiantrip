/**
 * Migrate Supabase Storage files → iHost S3 (MinIO)
 * Downloads from Supabase car-photos bucket and uploads to iHost S3
 */
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import https from 'https';
import http from 'http';

// ── Supabase (source) ──
const supabase = createClient(
  'https://whxtvtbhrrmqfnclqvxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeHR2dGJocnJtcWZuY2xxdnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTU5MTcsImV4cCI6MjA4MzI5MTkxN30.ULNulds6TUoBvRZLN7CTWteRSBw7fY6y9jn6uBP3SOs'
);

// ── iHost S3 (target) ──
const s3 = new S3Client({
  endpoint: 'https://s3.ihost.ge',
  region: 'us-east-1',
  credentials: {
    accessKeyId: '6aoIaAV8AOW6OPH9',
    secretAccessKey: 'HFbIZ18R1ptcEjw4vVrTrZ29en0CWG90',
  },
  forcePathStyle: true,
});

const BUCKET = 'site-georgiantrip-com';
const SOURCE_BUCKET = 'car-photos';

// Supabase public URL pattern
function getSupabasePublicUrl(filePath) {
  return `https://whxtvtbhrrmqfnclqvxw.supabase.co/storage/v1/object/public/${SOURCE_BUCKET}/${filePath}`;
}

// Download file as buffer
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// MIME type from extension
function getMimeType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const types = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
    avif: 'image/avif', mp4: 'video/mp4',
  };
  return types[ext] || 'application/octet-stream';
}

// List all files in Supabase storage
async function listStorageFiles() {
  const allFiles = [];
  
  const { data: rootFiles } = await supabase.storage
    .from(SOURCE_BUCKET)
    .list('', { limit: 1000 });
  
  for (const item of (rootFiles || [])) {
    if (item.id) {
      allFiles.push(item.name);
    } else {
      const { data: files } = await supabase.storage.from(SOURCE_BUCKET).list(item.name, { limit: 1000 });
      for (const f of (files || [])) {
        if (f.id) {
          allFiles.push(`${item.name}/${f.name}`);
        } else {
          const { data: subFiles } = await supabase.storage.from(SOURCE_BUCKET).list(`${item.name}/${f.name}`, { limit: 1000 });
          for (const sf of (subFiles || [])) {
            if (sf.id) allFiles.push(`${item.name}/${f.name}/${sf.name}`);
          }
        }
      }
    }
  }
  
  return allFiles;
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  Storage Migration: Supabase → iHost S3');
  console.log('═══════════════════════════════════════\n');

  // 1. List files
  console.log('📦 Listing Supabase Storage files...');
  const files = await listStorageFiles();
  console.log(`  Found ${files.length} files\n`);

  // 2. Download and upload each file
  let uploaded = 0, failed = 0;
  
  for (const filePath of files) {
    const url = getSupabasePublicUrl(filePath);
    // Keep same path structure in iHost S3
    const s3Key = `images/${filePath}`;
    
    try {
      // Check if already exists
      try {
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: s3Key }));
        console.log(`  ⊘ ${filePath} (already exists)`);
        uploaded++;
        continue;
      } catch (e) {
        // Does not exist, upload it
      }
      
      // Download from Supabase
      const { buffer, contentType } = await downloadFile(url);
      
      // Upload to iHost S3
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType || getMimeType(filePath),
      }));
      
      uploaded++;
      console.log(`  ✓ ${filePath} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      failed++;
      console.log(`  ✗ ${filePath}: ${err.message}`);
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`  Uploaded: ${uploaded}/${files.length} | Failed: ${failed}`);
  console.log(`  Base URL: https://s3.ihost.ge/${BUCKET}/images/`);
  console.log(`═══════════════════════════════════════`);
}

main().catch(e => { console.error(e); process.exit(1); });
