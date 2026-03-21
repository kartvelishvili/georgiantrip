import https from 'https';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY },
  forcePathStyle: true
});

const images = [
  { url: 'https://images.unsplash.com/photo-1595872018818-97555653a011?w=1920&q=80', key: 'site-images/driver-login-bg-georgia-landmark.jpg' }
];

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const get = (u) => https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' }}, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
    get(url);
  });
}

for (const img of images) {
  try {
    console.log('Downloading:', img.url.substring(0, 70) + '...');
    const buf = await downloadBuffer(img.url);
    console.log('  Size:', (buf.length / 1024).toFixed(0), 'KB');
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: img.key,
      Body: buf,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    }));
    console.log('  Uploaded:', img.key);
  } catch (e) {
    console.error('  FAILED:', e.message);
  }
}
console.log('Done!');
