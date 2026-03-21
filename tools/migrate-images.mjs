/**
 * Download all external images and upload to iHost S3
 * Then output a mapping of old URL -> new URL
 */
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import pg from 'pg';

const S3_ENDPOINT = 'https://s3.ihost.ge';
const S3_BUCKET = 'site-georgiantrip-com';
const S3_ACCESS_KEY = '6aoIaAV8AOW6OPH9';
const S3_SECRET_KEY = 'HFbIZ18R1ptcEjw4vVrTrZ29en0CWG90';
const S3_PUBLIC_URL = `${S3_ENDPOINT}/${S3_BUCKET}`;

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: 'us-east-1',
  credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  forcePathStyle: true,
});

const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

// All external image URLs found in codebase + DB
const IMAGE_URLS = [
  // HowItWorks.jsx
  'https://images.unsplash.com/photo-1624632731086-4f6c4424367f?w=400',
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
  // PopularDestinations.jsx
  'https://images.unsplash.com/photo-1595872018818-97555653a011',
  // InstagramFeed.jsx
  'https://images.unsplash.com/photo-1615003380049-a716b685b98e',
  // FeaturedDrivers.jsx  
  'https://images.unsplash.com/photo-1546661424-796f69a5ff97',
  // WhyChooseUsSection.jsx
  'https://images.unsplash.com/photo-1542318285-8025232822a1?auto=format&fit=crop&q=80&w=500',
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=500',
  'https://images.unsplash.com/photo-1562095368-2c262a046833?auto=format&fit=crop&q=80&w=500',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=500',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=500',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=500',
  // OurStorySection.jsx
  'https://images.unsplash.com/photo-1574236170880-640fb0855277?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1541300613939-71366b37c92e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1473676766723-1d6eb758a5fc?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1589828949826-6f10137452d3?auto=format&fit=crop&q=80&w=400',
  // TeamSection.jsx (background)
  'https://images.unsplash.com/photo-1578326457399-3b34dbbf23b8?auto=format&fit=crop&q=80&w=1920',
  // TeamSection.jsx (CEO photo)
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  // Other team member photos
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  // TransferRouteCard fallback
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=600&auto=format&fit=crop',
  // siteContentService.js
  'https://images.unsplash.com/photo-1682667027683-19908f23dd89',
  'https://images.unsplash.com/photo-1597566360895-5d93e580554e',
  'https://images.unsplash.com/photo-1492713239497-a6fa9352daff',
  'https://images.unsplash.com/photo-1672674779705-a58c96cdc8c5',
  'https://images.unsplash.com/photo-1678984451800-4a21019d74f0',
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
  // Admin & Driver login backgrounds
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=1920',
  // TransferCard default
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600',
  // Header and Footer logos (postimg)
  'https://i.postimg.cc/mgptfmRm/1-edited-1-1-qy5zwzzwpu0j6dxk2m4luqhe8smsejxkfebuablb4a.png',
  'https://i.postimg.cc/XYVFF6s6/smarketer-white.png',
  // Hero and Banner (postimg)
  'https://i.postimg.cc/nrbYszvV/179254820-super.jpg',
  'https://i.postimg.cc/BQQSS2hZ/banner-georgiantrip-2048x439-modified-(1).png',
  // About page hero bg
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80',
  // DB about_content
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80',
];

// Deduplicate by base photo ID
function getPhotoKey(url) {
  // For unsplash: extract photo ID
  const unsplashMatch = url.match(/photo-([a-zA-Z0-9_-]+)/);
  if (unsplashMatch) return `unsplash-${unsplashMatch[1]}`;
  
  // For postimg: extract filename
  const postimgMatch = url.match(/postimg\.cc\/[^/]+\/(.+)$/);
  if (postimgMatch) return `postimg-${postimgMatch[1].replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  // Fallback: hash the URL
  return crypto.createHash('md5').update(url).digest('hex');
}

function getExtension(contentType, url) {
  if (contentType?.includes('jpeg') || contentType?.includes('jpg')) return '.jpg';
  if (contentType?.includes('png')) return '.png';
  if (contentType?.includes('webp')) return '.webp';
  if (contentType?.includes('svg')) return '.svg';
  if (contentType?.includes('gif')) return '.gif';
  // Guess from URL
  if (url.includes('.png')) return '.png';
  if (url.includes('.webp')) return '.webp';
  return '.jpg';
}

async function downloadAndUpload(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (!response.ok) {
      console.error(`  ❌ HTTP ${response.status} for ${url.substring(0, 80)}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || '';
    const buffer = Buffer.from(await response.arrayBuffer());
    const ext = getExtension(contentType, url);
    const key = getPhotoKey(url);
    const s3Key = `site-images/${key}${ext}`;
    
    // Upload to S3
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType || 'image/jpeg',
      ACL: 'public-read',
    }));
    
    const newUrl = `${S3_PUBLIC_URL}/${s3Key}`;
    console.log(`  ✅ ${key}${ext} (${(buffer.length / 1024).toFixed(0)}KB)`);
    return newUrl;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message} for ${url.substring(0, 60)}`);
    return null;
  }
}

async function main() {
  // Deduplicate URLs by photo key
  const uniqueMap = new Map(); // photoKey -> { url, variants: [url1, url2, ...] }
  
  for (const url of IMAGE_URLS) {
    const key = getPhotoKey(url);
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, { url, variants: [url] });
    } else {
      uniqueMap.get(key).variants.push(url);
    }
  }
  
  console.log(`\n📦 Found ${IMAGE_URLS.length} URLs, ${uniqueMap.size} unique images to download\n`);
  
  // Download and upload each unique image
  const urlMapping = new Map(); // oldUrl -> newUrl
  
  // Download and upload in batches of 5
  const entries = [...uniqueMap.entries()];
  
  for (let i = 0; i < entries.length; i += 3) {
    const batch = entries.slice(i, i + 3);
    const results = await Promise.all(
      batch.map(async ([key, { url, variants }]) => {
        const newUrl = await downloadAndUpload(url);
        return { key, variants, newUrl };
      })
    );
    
    for (const { variants, newUrl } of results) {
      if (newUrl) {
        for (const v of variants) {
          urlMapping.set(v, newUrl);
        }
      }
    }
    console.log(`  Batch ${Math.floor(i/3)+1}/${Math.ceil(entries.length/3)} done`);
  }
  
  console.log(`\n✅ Uploaded ${urlMapping.size} URLs mapped\n`);
  
  // Output the mapping as JSON for the next step
  const mapping = Object.fromEntries(urlMapping);
  
  // Write mapping to file
  const fs = await import('fs');
  fs.writeFileSync('tools/image-url-mapping.json', JSON.stringify(mapping, null, 2));
  console.log('📝 Mapping saved to tools/image-url-mapping.json');
  
  // Also update DB about_content image if needed
  try {
    const { rows } = await pool.query("SELECT id, image_url FROM about_content WHERE image_url IS NOT NULL");
    for (const row of rows) {
      if (row.image_url && urlMapping.has(row.image_url)) {
        await pool.query('UPDATE about_content SET image_url = $1 WHERE id = $2', [urlMapping.get(row.image_url), row.id]);
        console.log(`  DB: Updated about_content ${row.id.substring(0, 8)}`);
      }
    }
  } catch(e) { console.log('DB update skip:', e.message); }
  
  // Update hero_settings
  try {
    const { rows } = await pool.query("SELECT id, image_url, background_image_url FROM hero_settings");
    for (const row of rows) {
      const updates = [];
      const params = [];
      let idx = 1;
      if (row.image_url && urlMapping.has(row.image_url)) {
        updates.push(`image_url = $${idx++}`);
        params.push(urlMapping.get(row.image_url));
      }
      if (row.background_image_url && urlMapping.has(row.background_image_url)) {
        updates.push(`background_image_url = $${idx++}`);
        params.push(urlMapping.get(row.background_image_url));
      }
      if (updates.length > 0) {
        params.push(row.id);
        await pool.query(`UPDATE hero_settings SET ${updates.join(', ')} WHERE id = $${idx}`, params);
        console.log(`  DB: Updated hero_settings ${row.id}`);
      }
    }
  } catch(e) { console.log('hero_settings update skip:', e.message); }
  
  await pool.end();
  console.log('\n🏁 Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
