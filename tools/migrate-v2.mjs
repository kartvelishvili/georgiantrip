/**
 * Migration Script v2: Supabase → iHost.ge
 * 
 * Auto-detects schema from actual data and handles column mismatches.
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

// ══════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════

function inferPgType(value) {
  if (value === null || value === undefined) return 'TEXT';
  if (typeof value === 'boolean') return 'BOOLEAN';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return 'INTEGER';
    return 'NUMERIC';
  }
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object') return 'JSONB';
    return 'TEXT[]';
  }
  if (typeof value === 'object') return 'JSONB';
  // Detect UUIDs
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return 'UUID';
  // Detect timestamps
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return 'TIMESTAMPTZ';
  return 'TEXT';
}

function inferSchemaFromData(rows) {
  const schema = {};
  for (const row of rows) {
    for (const [col, val] of Object.entries(row)) {
      if (val !== null && val !== undefined) {
        schema[col] = inferPgType(val);
      } else if (!schema[col]) {
        schema[col] = 'TEXT'; // fallback
      }
    }
  }
  return schema;
}

function escapeValue(val, colType) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    if (colType === 'JSONB' || (val.length > 0 && typeof val[0] === 'object')) {
      return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    }
    // PostgreSQL text array
    if (val.length === 0) return "'{}'";
    const items = val.map(v => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
    return `'{${items.join(',')}}'`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

// ══════════════════════════════════════════
// Supabase fetch with pagination
// ══════════════════════════════════════════

async function fetchAllFromSupabase(tableName) {
  let allData = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.log(`  ⚠ ${tableName}: ${error.message}`);
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
// Dynamic table creation/sync on iHost
// ══════════════════════════════════════════

async function ensureTable(client, tableName, schema) {
  // Check if table exists
  const { rows: existing } = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = $1
  `, [tableName]);
  
  const existingCols = new Set(existing.map(r => r.column_name));
  
  if (existing.length === 0) {
    // Create table from scratch
    const colDefs = Object.entries(schema).map(([col, type]) => {
      if (col === 'id') return `"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4()`;
      return `"${col}" ${type}`;
    }).join(',\n  ');
    
    await client.query(`CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs}\n)`);
    console.log(`  ✓ Created table ${tableName}`);
  } else {
    // Add missing columns
    for (const [col, type] of Object.entries(schema)) {
      if (!existingCols.has(col)) {
        try {
          await client.query(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${col}" ${type}`);
          console.log(`    + Added column ${tableName}.${col} (${type})`);
        } catch (err) {
          console.log(`    ⚠ Could not add ${tableName}.${col}: ${err.message}`);
        }
      }
    }
  }
}

// ══════════════════════════════════════════
// Import data
// ══════════════════════════════════════════

async function importData(client, tableName, rows, schema) {
  if (!rows || rows.length === 0) return;
  
  // Clear existing data first
  await client.query(`DELETE FROM "${tableName}"`);
  
  const columns = Object.keys(schema);
  let imported = 0;
  let errors = 0;
  
  for (const row of rows) {
    const rowCols = [];
    const rowVals = [];
    
    for (const col of columns) {
      if (row[col] !== undefined) {
        rowCols.push(`"${col}"`);
        rowVals.push(escapeValue(row[col], schema[col]));
      }
    }
    
    const sql = `INSERT INTO "${tableName}" (${rowCols.join(', ')}) VALUES (${rowVals.join(', ')}) ON CONFLICT DO NOTHING`;
    
    try {
      await client.query(sql);
      imported++;
    } catch (err) {
      errors++;
      if (errors <= 2) {
        console.log(`    ⚠ ${tableName} insert error: ${err.message}`);
        console.log(`    SQL (first 300): ${sql.substring(0, 300)}`);
      }
    }
  }
  
  console.log(`  ✓ ${tableName}: ${imported}/${rows.length} imported${errors > 0 ? ` (${errors} errors)` : ''}`);
}

// ══════════════════════════════════════════
// Storage file listing
// ══════════════════════════════════════════

async function listStorageFiles() {
  const bucketName = 'car-photos';
  const allFiles = [];
  
  const { data: rootFiles, error } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 1000 });
  
  if (error) {
    console.log(`  ⚠ Cannot list ${bucketName}: ${error.message}`);
    return allFiles;
  }
  
  for (const item of (rootFiles || [])) {
    if (item.id) {
      allFiles.push(item.name);
    } else {
      // Folder
      const { data: files } = await supabase.storage.from(bucketName).list(item.name, { limit: 1000 });
      for (const f of (files || [])) {
        if (f.id) {
          allFiles.push(`${item.name}/${f.name}`);
        } else {
          const { data: subFiles } = await supabase.storage.from(bucketName).list(`${item.name}/${f.name}`, { limit: 1000 });
          for (const sf of (subFiles || [])) {
            if (sf.id) allFiles.push(`${item.name}/${f.name}/${sf.name}`);
          }
        }
      }
    }
  }
  
  return allFiles;
}

// ══════════════════════════════════════════
// RPC Functions & Auth Table
// ══════════════════════════════════════════

const EXTRA_SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table for auth
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

-- site_content table
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section)
);

-- RPC: create_booking_v2
CREATE OR REPLACE FUNCTION create_booking_v2(booking_data JSONB)
RETURNS JSONB AS $$
DECLARE
  new_id UUID;
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
  ) RETURNING id INTO new_id;

  SELECT jsonb_build_object(
    'id', b.id, 'pickup_location_id', b.pickup_location_id,
    'dropoff_location_id', b.dropoff_location_id,
    'customer_first_name', b.customer_first_name,
    'customer_phone', b.customer_phone,
    'date', b.date, 'time', b.time,
    'total_price', b.total_price, 'status', b.status,
    'created_at', b.created_at,
    'pickup_location', CASE WHEN pl.id IS NOT NULL THEN row_to_json(pl) ELSE NULL END,
    'dropoff_location', CASE WHEN dl.id IS NOT NULL THEN row_to_json(dl) ELSE NULL END,
    'car', CASE WHEN c.id IS NOT NULL THEN row_to_json(c) ELSE NULL END,
    'driver', CASE WHEN d.id IS NOT NULL THEN row_to_json(d) ELSE NULL END
  ) INTO result
  FROM bookings b
  LEFT JOIN locations pl ON pl.id = b.pickup_location_id
  LEFT JOIN locations dl ON dl.id = b.dropoff_location_id
  LEFT JOIN cars c ON c.id = b.car_id
  LEFT JOIN drivers d ON d.id = b.driver_id
  WHERE b.id = new_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RPC: create_tour_booking
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
  ) RETURNING id INTO new_id;

  SELECT jsonb_build_object(
    'id', tb.id, 'tour_id', tb.tour_id,
    'passenger_name', tb.passenger_name,
    'passenger_phone', tb.passenger_phone,
    'passenger_count', tb.passenger_count,
    'tour_name', tb.tour_name, 'tour_date', tb.tour_date,
    'total_price', tb.total_price,
    'payment_status', tb.payment_status,
    'status', tb.status, 'created_at', tb.created_at,
    'tour', CASE WHEN t.id IS NOT NULL THEN row_to_json(t) ELSE NULL END
  ) INTO result
  FROM tour_bookings tb
  LEFT JOIN tours t ON t.id = tb.tour_id
  WHERE tb.id = new_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
`;

// ══════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  Migration v2: Supabase → iHost.ge');
  console.log('═══════════════════════════════════════\n');
  
  // 1. Connect
  console.log('🔌 Connecting to iHost PostgreSQL...');
  const client = new Client({ connectionString: IHOST_PG });
  await client.connect();
  console.log('  ✓ Connected\n');
  
  // 2. Run prerequisite SQL
  console.log('📐 Creating extensions, auth table, and RPC functions...');
  const statements = EXTRA_SQL.split(/;\s*$/m).filter(s => s.trim());
  for (const stmt of statements) {
    try {
      await client.query(stmt);
    } catch (err) {
      // Ignore if already exists
      if (!err.message.includes('already exists')) {
        console.log(`  ⚠ ${err.message.substring(0, 100)}`);
      }
    }
  }
  console.log('  ✓ Done\n');
  
  // 3. Export from Supabase  
  console.log('📥 Exporting from Supabase...');
  const allData = {};
  for (const table of TABLES) {
    allData[table] = await fetchAllFromSupabase(table);
  }
  console.log('');
  
  // 4. Create/sync tables and import data
  console.log('📤 Creating tables & importing to iHost...');
  
  // Import order (respects foreign keys)
  const importOrder = [
    'locations', 'drivers', 'transfers', 'cars', 'car_images',
    'car_reviews', 'reviews', 'driver_pricing', 'tours',
    'hero_settings', 'about_content', 'team_members',
    'admin_settings', 'admin_phone_numbers', 'sms_settings',
    'contact_messages', 'driver_applications', 'sms_logs',
    'bookings', 'tour_bookings',
  ];
  
  for (const table of importOrder) {
    const rows = allData[table];
    if (!rows || rows.length === 0) {
      console.log(`  ⊘ ${table}: no data`);
      continue;
    }
    
    const schema = inferSchemaFromData(rows);
    await ensureTable(client, table, schema);
    await importData(client, table, rows, schema);
  }
  
  console.log('');
  
  // 5. Storage files
  console.log('📦 Listing Supabase Storage files...');
  const storageFiles = await listStorageFiles();
  console.log(`  ✓ ${storageFiles.length} files found in car-photos bucket`);
  
  // Save file list
  if (storageFiles.length > 0) {
    console.log('\n  Files:');
    for (const f of storageFiles.slice(0, 10)) {
      console.log(`    ${f}`);
    }
    if (storageFiles.length > 10) {
      console.log(`    ... and ${storageFiles.length - 10} more`);
    }
  }
  
  // 6. Verify
  console.log('\n🔍 Verification:');
  for (const table of importOrder) {
    try {
      const { rows } = await client.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
      const expected = allData[table]?.length || 0;
      const actual = parseInt(rows[0].cnt);
      const status = actual >= expected ? '✓' : '⚠';
      console.log(`  ${status} ${table}: ${actual} rows (expected ${expected})`);
    } catch (err) {
      console.log(`  ✗ ${table}: ${err.message}`);
    }
  }
  
  // 7. Admin user
  console.log('\n👤 Creating admin user...');
  try {
    await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, user_metadata)
      VALUES ('admin@georgiantrip.com', crypt('admin123', gen_salt('bf')), 'super_admin', 'Admin', '{"role":"super_admin"}'::jsonb)
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('  ✓ admin@georgiantrip.com / admin123');
  } catch (err) {
    console.log(`  ⚠ ${err.message}`);
  }
  
  await client.end();
  
  console.log('\n═══════════════════════════════════════');
  console.log('  ✅ Migration Complete!');
  console.log('═══════════════════════════════════════');
  
  return storageFiles;
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
