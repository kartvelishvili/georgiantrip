import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com' });

// 1. driver_pricing columns
const { rows: dpCols } = await pool.query(`SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'driver_pricing' ORDER BY ordinal_position`);
console.log('=== DRIVER_PRICING COLUMNS ===');
dpCols.forEach(c => console.log(`  ${c.column_name.padEnd(25)} ${c.data_type.padEnd(20)} default=${c.column_default || 'none'}`));

// 2. Get some location IDs for bookings
const { rows: locs } = await pool.query(`SELECT id, name_en FROM locations WHERE is_active = true ORDER BY priority DESC LIMIT 20`);
console.log('\n=== TOP LOCATIONS ===');
locs.forEach(l => console.log(`  ${l.id}  ${l.name_en}`));

// 3. Get transfer IDs
const { rows: transfers } = await pool.query(`SELECT id, title, from_location_id, to_location_id, base_price, distance_km FROM transfers ORDER BY display_order`);
console.log('\n=== TRANSFERS ===');
transfers.forEach(t => console.log(`  ${t.id}  ${t.title}  price=${t.base_price} dist=${t.distance_km}`));

// 4. Existing users
const { rows: users } = await pool.query(`SELECT id, email, role FROM users ORDER BY created_at`);
console.log('\n=== EXISTING USERS ===');
users.forEach(u => console.log(`  ${u.id}  ${u.email}  role=${u.role}`));

// 5. Cars columns that we need
const { rows: carCols } = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cars' ORDER BY ordinal_position`);
console.log('\n=== CARS COLUMNS ===');
carCols.forEach(c => console.log(`  ${c.column_name.padEnd(25)} ${c.data_type}`));

// 6. Existing cars
const { rows: cars } = await pool.query(`SELECT id, make, model, driver_id FROM cars`);
console.log('\n=== EXISTING CARS ===');
cars.forEach(c => console.log(`  ${c.id}  ${c.make} ${c.model}  driver=${c.driver_id}`));

await pool.end();
