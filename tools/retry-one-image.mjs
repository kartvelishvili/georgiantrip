import pg from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://s3.ihost.ge',
  forcePathStyle: true,
  credentials: { accessKeyId: '6aoIaAV8AOW6OPH9', secretAccessKey: 'HFbIZ18R1ptcEjw4vVrTrZ29en0CWG90' },
});

// Alternative Kazbegi image from Wikimedia Commons
const url = 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1280&q=80';
const id = '64b8c3ec-aef1-442a-ad40-2cd6d59af1c6';

try {
  console.log('Downloading Kazbegi image from Wikimedia...');
  const res = await fetch(url, {
    headers: { 'User-Agent': 'GeorgianTripBot/1.0 (admin@georgiantrip.com)' },
    signal: AbortSignal.timeout(60000),
  });
  console.log('Status:', res.status, 'Content-Type:', res.headers.get('content-type'));
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const buf = Buffer.from(await res.arrayBuffer());
  console.log('Downloaded:', buf.length, 'bytes');
  
  const key = 'db-images/tours/64b8c3ec-kazbegi.jpg';
  await s3.send(new PutObjectCommand({
    Bucket: 'site-georgiantrip-com',
    Key: key,
    Body: buf,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  }));
  const newUrl = 'https://s3.ihost.ge/site-georgiantrip-com/' + key;
  await pool.query('UPDATE tours SET image_url = $1 WHERE id = $2', [newUrl, id]);
  console.log('SUCCESS! Updated to:', newUrl);
} catch (e) {
  console.log('Error:', e.message);
}
await pool.end();
