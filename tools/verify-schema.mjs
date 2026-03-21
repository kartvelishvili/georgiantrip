import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com' });

const { rows: r1 } = await pool.query('SELECT driver_price_override_enabled, max_price_per_km FROM admin_settings');
console.log('admin_settings new cols:', r1);

const { rows: r2 } = await pool.query('SELECT id, status, total_earnings FROM drivers LIMIT 5');
console.log('drivers status+earnings:', r2);

const { rows: r3 } = await pool.query('SELECT COUNT(*) FROM driver_earnings');
console.log('driver_earnings count:', r3[0].count);

const { rows: r4 } = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('driver_earnings', 'driver_net', 'final_price')");
console.log('bookings new cols:', r4.map(r => r.column_name));

await pool.end();
