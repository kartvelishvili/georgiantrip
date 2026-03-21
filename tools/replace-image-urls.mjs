/**
 * Replace all external image URLs in source files using the mapping from migrate-images
 * For 404'd images, use replacement Georgian landmark photos
 */
import fs from 'fs';
import path from 'path';

const mapping = JSON.parse(fs.readFileSync('tools/image-url-mapping.json', 'utf8'));

// For 404'd Unsplash images, find replacements (Georgian landmarks for login pages)
// These are already uploaded earlier or have Georgian landmark replacements
const FALLBACK_REPLACEMENTS = {
  // HowItWorks step 1 — route choosing (use existing road image)
  'https://images.unsplash.com/photo-1624632731086-4f6c4424367f?w=400':
    'https://s3.ihost.ge/site-georgiantrip-com/site-images/unsplash-1469854523086-cc02fe5d8800.jpg',
  // WhyChooseUs — Expert Local Guides (use existing wine/culture image)
  'https://images.unsplash.com/photo-1542318285-8025232822a1?auto=format&fit=crop&q=80&w=500':
    'https://s3.ihost.ge/site-georgiantrip-com/site-images/unsplash-1541300613939-71366b37c92e.jpg',
  // WhyChooseUs — Authentic Experiences (use existing scenic)
  'https://images.unsplash.com/photo-1562095368-2c262a046833?auto=format&fit=crop&q=80&w=500':
    'https://s3.ihost.ge/site-georgiantrip-com/site-images/unsplash-1595872018818-97555653a011.jpg',
  // OurStory — Old Tbilisi Streets
  'https://images.unsplash.com/photo-1574236170880-640fb0855277?auto=format&fit=crop&q=80&w=400':
    'https://s3.ihost.ge/site-georgiantrip-com/site-images/unsplash-1565008447742-97f6f38c985c.jpg',
  // OurStory — Hiking in Kazbegi
  'https://images.unsplash.com/photo-1473676766723-1d6eb758a5fc?auto=format&fit=crop&q=80&w=400':
    'https://s3.ihost.ge/site-georgiantrip-com/site-images/unsplash-1578326457399-3b34dbbf23b8.jpg',
  // OurStory — Our Transport Fleet
  'https://images.unsplash.com/photo-1589828949826-6f10137452d3?auto=format&fit=crop&q=80&w=400':
    'https://s3.ihost.ge/site-georgiantrip-com/site-images/unsplash-1550355291-bbee04a92027.jpg',
};

// Merge mapping + fallbacks
const fullMapping = { ...mapping, ...FALLBACK_REPLACEMENTS };

// Files to process
const srcDir = 'src';

function walkDir(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkDir(full));
    } else if (/\.(jsx?|tsx?|css|mjs)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const files = walkDir(srcDir);
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  for (const [oldUrl, newUrl] of Object.entries(fullMapping)) {
    if (content.includes(oldUrl)) {
      content = content.replaceAll(oldUrl, newUrl);
      modified = true;
      totalReplacements++;
      console.log(`  ${path.relative('.', file)}: ${oldUrl.substring(0, 60)}... → S3`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

console.log(`\n✅ Total replacements: ${totalReplacements} across ${files.length} files scanned`);
