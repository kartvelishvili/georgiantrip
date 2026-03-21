import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

const email = 'kartvel100@gmail.com';
const newPassword = 'Qartvela2786';

// Check if user exists
const { rows: users } = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email]);

if (users.length === 0) {
  console.log(`User ${email} not found. Creating...`);
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const { rows: newUser } = await pool.query(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, user_metadata)
     VALUES ($1, $2, 'driver', 'Driver', 'User', $3)
     RETURNING id, email, role`,
    [email, passwordHash, JSON.stringify({ role: 'driver', first_name: 'Driver', last_name: 'User' })]
  );
  console.log('Created user:', newUser[0]);
  
  // Also check if driver profile exists
  const { rows: drivers } = await pool.query('SELECT id FROM drivers WHERE email = $1', [email]);
  if (drivers.length === 0) {
    console.log('No driver profile found for this email. You may need to register through the portal to create one.');
  }
} else {
  console.log(`Found user: ${users[0].email} (role: ${users[0].role})`);
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
  console.log(`Password updated successfully for ${email}`);
}

await pool.end();
