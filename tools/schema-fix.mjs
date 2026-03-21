import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

const migrations = [
  // 1. drivers.status - frontend expects text 'active'/'blocked', DB only has is_active boolean
  `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'`,
  
  // 2. drivers.total_earnings - AdminDriversPage displays it
  `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS total_earnings numeric DEFAULT 0`,
  
  // 3. drivers.verification_rejection_reason - DriverApprovalModal sets it
  `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_rejection_reason text`,

  // 4. admin_settings.driver_price_override_enabled - used by pricing, CarForm, MyPricing
  `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS driver_price_override_enabled boolean DEFAULT true`,
  
  // 5. admin_settings.max_price_per_km - used by pricing
  `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS max_price_per_km numeric DEFAULT 5.0`,

  // 6. bookings.driver_earnings - DriverEarnings, DriverRoutesPage reference it
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_earnings numeric`,
  
  // 7. bookings.driver_net - DriverDashboard references it
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_net numeric`,
  
  // 8. bookings.final_price - BookingModal references it
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_price numeric`,

  // 9. Create driver_earnings table - FinancesPage reads from it
  `CREATE TABLE IF NOT EXISTS driver_earnings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
    booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
    gross_amount numeric DEFAULT 0,
    platform_commission numeric DEFAULT 0,
    net_amount numeric DEFAULT 0,
    status text DEFAULT 'completed',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`,

  // 10. Index on driver_earnings for lookups
  `CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver_id ON driver_earnings(driver_id)`,
  `CREATE INDEX IF NOT EXISTS idx_driver_earnings_booking_id ON driver_earnings(booking_id)`,
];

console.log('Running schema migrations...\n');

for (const sql of migrations) {
  const label = sql.trim().substring(0, 80);
  try {
    await pool.query(sql);
    console.log(`✅ ${label}...`);
  } catch (err) {
    console.log(`❌ ${label}...`);
    console.log(`   Error: ${err.message}`);
  }
}

// Verify
console.log('\n=== VERIFICATION ===\n');

const { rows: driverCols } = await pool.query(`
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'drivers' AND table_schema = 'public' ORDER BY ordinal_position
`);
console.log('drivers columns:', driverCols.map(c => c.column_name).join(', '));

const { rows: asCols } = await pool.query(`
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'admin_settings' AND table_schema = 'public' ORDER BY ordinal_position
`);
console.log('admin_settings columns:', asCols.map(c => c.column_name).join(', '));

const { rows: bkCols } = await pool.query(`
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'bookings' AND table_schema = 'public' ORDER BY ordinal_position
`);
console.log('bookings columns:', bkCols.map(c => c.column_name).join(', '));

const { rows: deTables } = await pool.query(`
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'driver_earnings' AND table_schema = 'public' ORDER BY ordinal_position
`);
console.log('driver_earnings columns:', deTables.map(c => c.column_name).join(', '));

await pool.end();
console.log('\nDone!');
