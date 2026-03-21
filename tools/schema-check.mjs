import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

// 1. Check drivers table columns
console.log('=== DRIVERS TABLE COLUMNS ===');
const { rows: driverCols } = await pool.query(`
  SELECT column_name, data_type, column_default, is_nullable
  FROM information_schema.columns WHERE table_name = 'drivers' AND table_schema = 'public'
  ORDER BY ordinal_position
`);
for (const c of driverCols) console.log(`  ${c.column_name.padEnd(25)} ${c.data_type.padEnd(20)} nullable=${c.is_nullable} default=${c.column_default || 'none'}`);

// 2. Check if driver_earnings table exists
console.log('\n=== DRIVER_EARNINGS TABLE ===');
const { rows: deTable } = await pool.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_name = 'driver_earnings' AND table_schema = 'public'
`);
console.log(deTable.length > 0 ? '  EXISTS' : '  DOES NOT EXIST');

// 3. Check admin_settings columns
console.log('\n=== ADMIN_SETTINGS COLUMNS ===');
const { rows: asCols } = await pool.query(`
  SELECT column_name, data_type
  FROM information_schema.columns WHERE table_name = 'admin_settings' AND table_schema = 'public'
  ORDER BY ordinal_position
`);
for (const c of asCols) console.log(`  ${c.column_name.padEnd(40)} ${c.data_type}`);

// 4. Check admin_settings data
console.log('\n=== ADMIN_SETTINGS DATA ===');
const { rows: asData } = await pool.query('SELECT * FROM admin_settings');
for (const r of asData) console.log(JSON.stringify(r, null, 2));

// 5. Check all tables that exist
console.log('\n=== ALL TABLES ===');
const { rows: allTables } = await pool.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name
`);
for (const t of allTables) console.log('  ' + t.table_name);

await pool.end();
