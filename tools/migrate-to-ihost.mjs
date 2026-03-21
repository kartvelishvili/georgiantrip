/**
 * Migration Script: Supabase → iHost.ge
 * 
 * Exports all data from Supabase via REST API,
 * creates schema on iHost PostgreSQL,
 * and imports all data.
 */

import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;

// ── Supabase (source) ──
const SUPABASE_URL = 'https://whxtvtbhrrmqfnclqvxw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeHR2dGJocnJtcWZuY2xxdnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTU5MTcsImV4cCI6MjA4MzI5MTkxN30.ULNulds6TUoBvRZLN7CTWteRSBw7fY6y9jn6uBP3SOs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── iHost PostgreSQL (target) ──
const IHOST_PG = 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com';

// ══════════════════════════════════════════
//  STEP 1: Create Schema on iHost
// ══════════════════════════════════════════

const SCHEMA_SQL = `
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── locations ──
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ka TEXT,
  name_ru TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_popular BOOLEAN DEFAULT false,
  location_type TEXT DEFAULT 'city',
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── drivers ──
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  languages_spoken TEXT[] DEFAULT '{}',
  verification_status TEXT DEFAULT 'pending',
  license_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── transfers ──
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  slug TEXT UNIQUE,
  title TEXT,
  title_ka TEXT,
  title_ru TEXT,
  description TEXT,
  description_ka TEXT,
  description_ru TEXT,
  distance_km NUMERIC(10,2),
  duration_minutes INTEGER,
  base_price NUMERIC(10,2),
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── cars ──
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  transfer_id UUID REFERENCES transfers(id) ON DELETE SET NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  license_plate TEXT,
  fuel_type TEXT,
  seats INTEGER DEFAULT 4,
  description TEXT,
  features TEXT[],
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── car_images ──
CREATE TABLE IF NOT EXISTS car_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── car_reviews ──
CREATE TABLE IF NOT EXISTS car_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── reviews (driver reviews) ──
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── driver_pricing ──
CREATE TABLE IF NOT EXISTS driver_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  price_per_km NUMERIC(10,2),
  min_price NUMERIC(10,2),
  currency TEXT DEFAULT 'GEL',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── tours ──
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_ka TEXT,
  title_ru TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  description_ka TEXT,
  description_ru TEXT,
  short_description TEXT,
  duration TEXT,
  price NUMERIC(10,2),
  price_per_person NUMERIC(10,2),
  max_group_size INTEGER,
  difficulty TEXT,
  category TEXT,
  image_url TEXT,
  gallery_images TEXT[],
  highlights TEXT[],
  includes TEXT[],
  excludes TEXT[],
  itinerary JSONB,
  meeting_point TEXT,
  start_time TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── bookings (transfer bookings) ──
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pickup_location_id UUID REFERENCES locations(id),
  dropoff_location_id UUID REFERENCES locations(id),
  car_id UUID REFERENCES cars(id),
  driver_id UUID REFERENCES drivers(id),
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  date TEXT,
  time TEXT,
  passengers INTEGER DEFAULT 1,
  stops JSONB,
  notes TEXT,
  total_price NUMERIC(10,2),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── tour_bookings ──
CREATE TABLE IF NOT EXISTS tour_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id),
  passenger_name TEXT,
  passenger_email TEXT,
  passenger_phone TEXT,
  passenger_count INTEGER DEFAULT 1,
  tour_name TEXT,
  tour_date TEXT,
  total_price NUMERIC(10,2),
  total_price_gel NUMERIC(10,2),
  payment_status TEXT DEFAULT 'pending',
  paypal_transaction_id TEXT,
  paypal_order_id TEXT,
  paypal_payer_email TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── hero_settings ──
CREATE TABLE IF NOT EXISTS hero_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  title_ka TEXT,
  title_ru TEXT,
  subtitle TEXT,
  subtitle_ka TEXT,
  subtitle_ru TEXT,
  background_image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── about_content ──
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── team_members ──
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  social_links JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── site_content ──
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section)
);

-- ── contact_messages ──
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── driver_applications ──
CREATE TABLE IF NOT EXISTS driver_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  car_make TEXT,
  car_model TEXT,
  car_year INTEGER,
  experience_years INTEGER,
  languages TEXT[],
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── admin_settings ──
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE,
  base_price_per_km NUMERIC(10,2) DEFAULT 1.5,
  minimum_price NUMERIC(10,2) DEFAULT 50,
  premium_multiplier NUMERIC(5,2) DEFAULT 1.5,
  night_surcharge NUMERIC(5,2) DEFAULT 1.2,
  currency TEXT DEFAULT 'GEL',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── admin_phone_numbers ──
CREATE TABLE IF NOT EXISTS admin_phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  label TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── sms_settings ──
CREATE TABLE IF NOT EXISTS sms_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key TEXT,
  sender_name TEXT DEFAULT 'Georgiantrip',
  driver_sms_template TEXT,
  admin_sms_template TEXT,
  passenger_sms_template TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── sms_logs ──
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID,
  recipient_phone TEXT,
  recipient_type TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── users (for auth - replacing Supabase auth) ──
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  user_metadata JSONB DEFAULT '{}',
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_cars_driver_id ON cars(driver_id);
CREATE INDEX IF NOT EXISTS idx_cars_transfer_id ON cars(transfer_id);
CREATE INDEX IF NOT EXISTS idx_cars_active ON cars(active);
CREATE INDEX IF NOT EXISTS idx_cars_verification ON cars(verification_status);
CREATE INDEX IF NOT EXISTS idx_transfers_slug ON transfers(slug);
CREATE INDEX IF NOT EXISTS idx_transfers_active ON transfers(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_tour_id ON tour_bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_site_content_page_section ON site_content(page, section);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── RPC functions ──

-- create_booking_v2: Insert a booking and return it with joins
CREATE OR REPLACE FUNCTION create_booking_v2(booking_data JSONB)
RETURNS JSONB AS $$
DECLARE
  new_booking_id UUID;
  result JSONB;
BEGIN
  INSERT INTO bookings (
    pickup_location_id, dropoff_location_id, car_id, driver_id,
    customer_first_name, customer_last_name, customer_email, customer_phone,
    date, time, passengers, stops, notes, total_price, status
  ) VALUES (
    (booking_data->>'pickup_location_id')::UUID,
    (booking_data->>'dropoff_location_id')::UUID,
    (booking_data->>'car_id')::UUID,
    (booking_data->>'driver_id')::UUID,
    booking_data->>'customer_first_name',
    booking_data->>'customer_last_name',
    booking_data->>'customer_email',
    booking_data->>'customer_phone',
    booking_data->>'date',
    booking_data->>'time',
    COALESCE((booking_data->>'passengers')::INTEGER, 1),
    booking_data->'stops',
    booking_data->>'notes',
    (booking_data->>'total_price')::NUMERIC,
    COALESCE(booking_data->>'status', 'pending')
  )
  RETURNING id INTO new_booking_id;

  SELECT jsonb_build_object(
    'id', b.id,
    'pickup_location_id', b.pickup_location_id,
    'dropoff_location_id', b.dropoff_location_id,
    'car_id', b.car_id,
    'driver_id', b.driver_id,
    'customer_first_name', b.customer_first_name,
    'customer_last_name', b.customer_last_name,
    'customer_email', b.customer_email,
    'customer_phone', b.customer_phone,
    'date', b.date,
    'time', b.time,
    'passengers', b.passengers,
    'total_price', b.total_price,
    'status', b.status,
    'created_at', b.created_at,
    'pickup_location', row_to_json(pl),
    'dropoff_location', row_to_json(dl),
    'car', row_to_json(c),
    'driver', row_to_json(d)
  ) INTO result
  FROM bookings b
  LEFT JOIN locations pl ON pl.id = b.pickup_location_id
  LEFT JOIN locations dl ON dl.id = b.dropoff_location_id
  LEFT JOIN cars c ON c.id = b.car_id
  LEFT JOIN drivers d ON d.id = b.driver_id
  WHERE b.id = new_booking_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- create_tour_booking: Insert a tour booking and return it
CREATE OR REPLACE FUNCTION create_tour_booking(booking_data JSONB)
RETURNS JSONB AS $$
DECLARE
  new_id UUID;
  result JSONB;
BEGIN
  INSERT INTO tour_bookings (
    tour_id, passenger_name, passenger_email, passenger_phone,
    passenger_count, tour_name, tour_date, total_price, total_price_gel,
    payment_status, status, notes
  ) VALUES (
    (booking_data->>'tour_id')::UUID,
    booking_data->>'passenger_name',
    booking_data->>'passenger_email',
    booking_data->>'passenger_phone',
    COALESCE((booking_data->>'passenger_count')::INTEGER, 1),
    booking_data->>'tour_name',
    booking_data->>'tour_date',
    (booking_data->>'total_price')::NUMERIC,
    (booking_data->>'total_price_gel')::NUMERIC,
    COALESCE(booking_data->>'payment_status', 'pending'),
    COALESCE(booking_data->>'status', 'pending'),
    booking_data->>'notes'
  )
  RETURNING id INTO new_id;

  SELECT jsonb_build_object(
    'id', tb.id,
    'tour_id', tb.tour_id,
    'passenger_name', tb.passenger_name,
    'passenger_email', tb.passenger_email,
    'passenger_phone', tb.passenger_phone,
    'passenger_count', tb.passenger_count,
    'tour_name', tb.tour_name,
    'tour_date', tb.tour_date,
    'total_price', tb.total_price,
    'payment_status', tb.payment_status,
    'status', tb.status,
    'created_at', tb.created_at,
    'tour', row_to_json(t)
  ) INTO result
  FROM tour_bookings tb
  LEFT JOIN tours t ON t.id = tb.tour_id
  WHERE tb.id = new_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
`;

// ══════════════════════════════════════════
//  STEP 2: Export from Supabase
// ══════════════════════════════════════════

const TABLES = [
  'locations',
  'drivers',
  'transfers',
  'cars',
  'car_images',
  'car_reviews',
  'reviews',
  'driver_pricing',
  'tours',
  'bookings',
  'tour_bookings',
  'hero_settings',
  'about_content',
  'team_members',
  'site_content',
  'contact_messages',
  'driver_applications',
  'admin_settings',
  'admin_phone_numbers',
  'sms_settings',
  'sms_logs',
];

async function fetchAllFromSupabase(tableName) {
  console.log(`  Fetching ${tableName}...`);
  
  // Fetch with pagination (Supabase default limit is 1000)
  let allData = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.warn(`  ⚠ Could not fetch ${tableName}: ${error.message}`);
      return [];
    }
    
    if (!data || data.length === 0) break;
    
    allData = allData.concat(data);
    
    if (data.length < limit) break;
    offset += limit;
  }
  
  console.log(`  ✓ ${tableName}: ${allData.length} rows`);
  return allData;
}

// ══════════════════════════════════════════
//  STEP 3: Import into iHost PostgreSQL
// ══════════════════════════════════════════

function escapeValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    // PostgreSQL array syntax
    if (val.length === 0) return "'{}'";
    const items = val.map(v => typeof v === 'string' ? `"${v.replace(/"/g, '\\"')}"` : String(v));
    return `'{${items.join(',')}}'`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  // String - escape single quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function importToIHost(client, tableName, rows) {
  if (!rows || rows.length === 0) {
    console.log(`  ⊘ ${tableName}: no data to import`);
    return;
  }
  
  console.log(`  Importing ${rows.length} rows into ${tableName}...`);
  
  const columns = Object.keys(rows[0]);
  
  for (const row of rows) {
    const values = columns.map(col => escapeValue(row[col]));
    const sql = `INSERT INTO ${tableName} (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING`;
    
    try {
      await client.query(sql);
    } catch (err) {
      console.warn(`  ⚠ Insert error in ${tableName}: ${err.message}`);
      // Log first failed row for debugging
      if (rows.indexOf(row) === 0) {
        console.warn(`    SQL: ${sql.substring(0, 200)}...`);
      }
    }
  }
  
  console.log(`  ✓ ${tableName}: imported`);
}

// ══════════════════════════════════════════
//  STEP 4: List Supabase Storage files
// ══════════════════════════════════════════

async function listStorageFiles() {
  console.log('\n📦 Listing Supabase Storage files...');
  
  const bucketName = 'car-photos';
  const allFiles = [];
  
  // List root level
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 1000 });
  
  if (rootError) {
    console.warn(`  ⚠ Could not list ${bucketName}: ${rootError.message}`);
    return allFiles;
  }
  
  for (const item of (rootFiles || [])) {
    if (item.id) {
      // It's a file
      allFiles.push(item.name);
    } else {
      // It's a folder, list its contents recursively
      const { data: folderFiles } = await supabase.storage
        .from(bucketName)
        .list(item.name, { limit: 1000 });
      
      for (const file of (folderFiles || [])) {
        if (file.id) {
          allFiles.push(`${item.name}/${file.name}`);
        } else {
          // Nested folder
          const { data: subFiles } = await supabase.storage
            .from(bucketName)
            .list(`${item.name}/${file.name}`, { limit: 1000 });
          
          for (const subFile of (subFiles || [])) {
            if (subFile.id) {
              allFiles.push(`${item.name}/${file.name}/${subFile.name}`);
            }
          }
        }
      }
    }
  }
  
  console.log(`  ✓ Found ${allFiles.length} files in ${bucketName}`);
  return allFiles;
}

// ══════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  Migration: Supabase → iHost.ge');
  console.log('═══════════════════════════════════════\n');
  
  // 1. Connect to iHost PostgreSQL
  console.log('🔌 Connecting to iHost PostgreSQL...');
  const client = new Client({ connectionString: IHOST_PG });
  await client.connect();
  console.log('  ✓ Connected\n');
  
  // 2. Create schema
  console.log('📐 Creating schema...');
  try {
    await client.query(SCHEMA_SQL);
    console.log('  ✓ Schema created\n');
  } catch (err) {
    console.error('  ✗ Schema error:', err.message);
    // Continue anyway - tables may already exist
  }
  
  // 3. Export from Supabase
  console.log('📥 Exporting from Supabase...');
  const exportedData = {};
  
  for (const table of TABLES) {
    exportedData[table] = await fetchAllFromSupabase(table);
  }
  
  console.log('');
  
  // 4. Import to iHost (in correct order due to foreign keys)
  console.log('📤 Importing to iHost PostgreSQL...');
  
  // Import order matters for foreign keys
  const importOrder = [
    'locations',
    'drivers',
    'transfers',
    'cars',
    'car_images',
    'car_reviews',
    'reviews',
    'driver_pricing',
    'tours',
    'bookings',
    'tour_bookings',
    'hero_settings',
    'about_content',
    'team_members',
    'site_content',
    'contact_messages',
    'driver_applications',
    'admin_settings',
    'admin_phone_numbers',
    'sms_settings',
    'sms_logs',
  ];
  
  for (const table of importOrder) {
    await importToIHost(client, table, exportedData[table]);
  }
  
  // 5. List storage files for migration
  const storageFiles = await listStorageFiles();
  if (storageFiles.length > 0) {
    console.log('\n📁 Storage files to migrate:');
    storageFiles.forEach(f => console.log(`    ${f}`));
  }
  
  // 6. Verify data
  console.log('\n🔍 Verification...');
  for (const table of importOrder) {
    try {
      const { rows } = await client.query(`SELECT COUNT(*) as cnt FROM ${table}`);
      console.log(`  ${table}: ${rows[0].cnt} rows`);
    } catch (err) {
      console.warn(`  ${table}: error - ${err.message}`);
    }
  }
  
  // 7. Create default admin user
  console.log('\n👤 Creating default admin user...');
  try {
    // Use pgcrypto for password hashing
    await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, user_metadata)
      VALUES (
        'admin@georgiantrip.com',
        crypt('admin123', gen_salt('bf')),
        'super_admin',
        'Admin',
        '{"role": "super_admin"}'::jsonb
      )
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('  ✓ Admin user created (admin@georgiantrip.com / admin123)');
  } catch (err) {
    console.warn('  ⚠ Admin user:', err.message);
  }
  
  await client.end();
  
  console.log('\n═══════════════════════════════════════');
  console.log('  ✅ Migration Complete!');
  console.log('═══════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
