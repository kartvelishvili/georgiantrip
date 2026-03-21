/**
 * Fix import: re-import cars and tours with relaxed constraints
 */
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
const { Client } = pg;

const supabase = createClient(
  'https://whxtvtbhrrmqfnclqvxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeHR2dGJocnJtcWZuY2xxdnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTU5MTcsImV4cCI6MjA4MzI5MTkxN30.ULNulds6TUoBvRZLN7CTWteRSBw7fY6y9jn6uBP3SOs'
);

const IHOST_PG = 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com';

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "'{}'";
    if (typeof val[0] === 'object') {
      return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
    }
    const items = val.map(v => '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
    return "'{" + items.join(',') + "}'::text[]";
  }
  if (typeof val === 'object') {
    return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
  }
  return "'" + String(val).replace(/'/g, "''") + "'";
}

async function importTable(client, tableName, rows) {
  if (!rows || rows.length === 0) {
    console.log(`  ${tableName}: no data`);
    return;
  }

  await client.query(`DELETE FROM "${tableName}"`);

  let ok = 0, fail = 0;
  for (const row of rows) {
    const cols = Object.keys(row);
    const vals = cols.map(c => esc(row[c]));
    const sql = `INSERT INTO "${tableName}" (${cols.map(c => '"' + c + '"').join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT DO NOTHING`;
    try {
      await client.query(sql);
      ok++;
    } catch (e) {
      fail++;
      if (fail <= 2) console.log(`  ⚠ ${tableName}: ${e.message.substring(0, 150)}`);
    }
  }
  console.log(`  ✓ ${tableName}: ${ok}/${rows.length}${fail > 0 ? ` (${fail} errors)` : ''}`);
}

async function main() {
  const client = new Client({ connectionString: IHOST_PG });
  await client.connect();

  // Fetch from Supabase
  console.log('Fetching cars and tours from Supabase...');
  const { data: cars } = await supabase.from('cars').select('*');
  const { data: tours } = await supabase.from('tours').select('*');
  console.log(`  cars: ${cars?.length}, tours: ${tours?.length}`);

  // Import
  console.log('\nImporting...');
  await importTable(client, 'cars', cars);
  await importTable(client, 'tours', tours);

  // Also create RPC functions
  console.log('\nCreating RPC functions...');
  
  await client.query(`
    CREATE OR REPLACE FUNCTION create_booking_v2(booking_data JSONB)
    RETURNS JSONB AS $fn$
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
    $fn$ LANGUAGE plpgsql
  `);
  console.log('  ✓ create_booking_v2');

  await client.query(`
    CREATE OR REPLACE FUNCTION create_tour_booking(booking_data JSONB)
    RETURNS JSONB AS $fn$
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
    $fn$ LANGUAGE plpgsql
  `);
  console.log('  ✓ create_tour_booking');

  // Final verification
  console.log('\nVerification:');
  for (const t of ['locations', 'transfers', 'cars', 'tours', 'hero_settings', 'about_content', 'admin_settings', 'admin_phone_numbers', 'sms_settings']) {
    const { rows } = await client.query(`SELECT COUNT(*) as cnt FROM "${t}"`);
    console.log(`  ${t}: ${rows[0].cnt} rows`);
  }

  await client.end();
  console.log('\n✅ Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
