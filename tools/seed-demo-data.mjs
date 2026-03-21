import pg from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const pool = new pg.Pool({
  connectionString: 'postgresql://user_georgiantrip_com:D6ZYerpxQSfxWwemPUra@194.163.172.62:5432/site_georgiantrip_com',
});

const PASSWORD = 'Driver2026!';
const ADMIN_PASSWORD = 'Admin2026!';
const hashPassword = async (pw) => bcrypt.hash(pw, 10);

// ═══════════════════════════════════════════
// DEMO DRIVER DATA (10 drivers)
// ═══════════════════════════════════════════
const drivers = [
  { firstName: 'Giorgi', lastName: 'Beridze', email: 'driver1@georgiantrip.com', phone: '+995555100101', bio: 'Professional driver with 10 years of experience in Tbilisi and Kakheti region tours.', languages: ['KA','EN','RU'], rating: 4.9, reviews: 45 },
  { firstName: 'Levan', lastName: 'Kvaratskhelia', email: 'driver2@georgiantrip.com', phone: '+995555100102', bio: 'Specialized in Svaneti and mountain road transfers. Safe and reliable.', languages: ['KA','EN'], rating: 4.8, reviews: 38 },
  { firstName: 'Dato', lastName: 'Tsiklauri', email: 'driver3@georgiantrip.com', phone: '+995555100103', bio: 'Expert in Georgian wine region tours. Fluent in 3 languages.', languages: ['KA','EN','RU'], rating: 4.7, reviews: 52 },
  { firstName: 'Nika', lastName: 'Gelashvili', email: 'driver4@georgiantrip.com', phone: '+995555100104', bio: 'Airport transfer specialist. Clean, punctual, and professional.', languages: ['KA','EN'], rating: 4.6, reviews: 30 },
  { firstName: 'Irakli', lastName: 'Janelidze', email: 'driver5@georgiantrip.com', phone: '+995555100105', bio: 'Mountain and adventure tour driver. Experienced in all weather conditions.', languages: ['KA','RU'], rating: 4.8, reviews: 41 },
  { firstName: 'Tornike', lastName: 'Mchedlishvili', email: 'driver6@georgiantrip.com', phone: '+995555100106', bio: 'Premium sedan and executive transfer services across Georgia.', languages: ['KA','EN','RU'], rating: 5.0, reviews: 28 },
  { firstName: 'Saba', lastName: 'Lomidze', email: 'driver7@georgiantrip.com', phone: '+995555100107', bio: 'Batumi and Black Sea coast specialist. Great knowledge of local attractions.', languages: ['KA','EN'], rating: 4.5, reviews: 35 },
  { firstName: 'Archil', lastName: 'Palavandishvili', email: 'driver8@georgiantrip.com', phone: '+995555100108', bio: 'Historical sites tour expert. Former history teacher turned professional driver.', languages: ['KA','EN','RU'], rating: 4.9, reviews: 60 },
  { firstName: 'Zurab', lastName: 'Gogichaishvili', email: 'driver9@georgiantrip.com', phone: '+995555100109', bio: 'Kazbegi and Military Highway specialist. 4x4 vehicle owner.', languages: ['KA','RU'], rating: 4.7, reviews: 33 },
  { firstName: 'Mamuka', lastName: 'Davitashvili', email: 'driver10@georgiantrip.com', phone: '+995555100110', bio: 'Group tour minibus driver. Perfect for families and large groups.', languages: ['KA','EN','RU'], rating: 4.8, reviews: 47 },
];

// ═══════════════════════════════════════════
// DEMO CARS (1-2 per driver, 15 total)
// ═══════════════════════════════════════════
const carData = [
  // Driver 1
  { driverIdx: 0, make: 'Toyota', model: 'Land Cruiser Prado', year: 2022, color: 'White', plate: 'AA-001-AA', fuel: 'Diesel', seats: 7, luggage: 5, transmission: 'Automatic', features: ['AC','WiFi','USB Charger','Heated Seats'], desc: 'Premium 4x4 SUV perfect for mountain and city transfers.', pricePerKm: 2 },
  // Driver 2
  { driverIdx: 1, make: 'Mitsubishi', model: 'Pajero', year: 2021, color: 'Black', plate: 'BB-002-BB', fuel: 'Diesel', seats: 7, luggage: 4, transmission: 'Automatic', features: ['AC','4WD','USB Charger'], desc: 'Reliable 4WD SUV ideal for Svaneti mountain roads.', pricePerKm: 2 },
  { driverIdx: 1, make: 'Toyota', model: 'Camry', year: 2023, color: 'Silver', plate: 'BB-003-BB', fuel: 'Hybrid', seats: 4, luggage: 3, transmission: 'Automatic', features: ['AC','WiFi','Leather Seats','USB Charger'], desc: 'Comfortable hybrid sedan for city and highway transfers.', pricePerKm: 2 },
  // Driver 3
  { driverIdx: 2, make: 'Mercedes-Benz', model: 'E-Class', year: 2023, color: 'Black', plate: 'CC-004-CC', fuel: 'Petrol', seats: 4, luggage: 3, transmission: 'Automatic', features: ['AC','WiFi','Leather Seats','USB Charger','Bluetooth','Bottled Water'], desc: 'Luxury sedan for premium Kakheti wine tours.', pricePerKm: 3 },
  // Driver 4
  { driverIdx: 3, make: 'Toyota', model: 'Corolla', year: 2022, color: 'Blue', plate: 'DD-005-DD', fuel: 'Hybrid', seats: 4, luggage: 2, transmission: 'Automatic', features: ['AC','USB Charger','Bluetooth'], desc: 'Efficient sedan for airport transfers.', pricePerKm: 1 },
  { driverIdx: 3, make: 'Hyundai', model: 'Tucson', year: 2023, color: 'Grey', plate: 'DD-006-DD', fuel: 'Diesel', seats: 5, luggage: 4, transmission: 'Automatic', features: ['AC','USB Charger','Heated Seats','Rear Camera'], desc: 'Spacious SUV for comfortable airport transfers.', pricePerKm: 2 },
  // Driver 5
  { driverIdx: 4, make: 'Toyota', model: '4Runner', year: 2021, color: 'Green', plate: 'EE-007-EE', fuel: 'Petrol', seats: 5, luggage: 4, transmission: 'Automatic', features: ['AC','4WD','Roof Rack','First Aid Kit'], desc: 'Tough 4x4 for mountain adventure routes.', pricePerKm: 2 },
  // Driver 6
  { driverIdx: 5, make: 'Mercedes-Benz', model: 'S-Class', year: 2024, color: 'Black', plate: 'FF-008-FF', fuel: 'Petrol', seats: 4, luggage: 3, transmission: 'Automatic', features: ['AC','WiFi','Leather Seats','USB Charger','Massage Seats','Champagne Cooler','Privacy Glass'], desc: 'Ultra-premium executive vehicle for VIP transfers.', pricePerKm: 4 },
  // Driver 7
  { driverIdx: 6, make: 'Volkswagen', model: 'Tiguan', year: 2022, color: 'White', plate: 'GG-009-GG', fuel: 'Diesel', seats: 5, luggage: 3, transmission: 'Automatic', features: ['AC','USB Charger','Bluetooth','Parking Sensors'], desc: 'Comfortable SUV for Batumi coast tours.', pricePerKm: 2 },
  // Driver 8
  { driverIdx: 7, make: 'Toyota', model: 'Highlander', year: 2023, color: 'Pearl White', plate: 'HH-010-HH', fuel: 'Hybrid', seats: 7, luggage: 5, transmission: 'Automatic', features: ['AC','WiFi','USB Charger','Third Row Seats','Panoramic Roof'], desc: 'Premium 7-seater SUV for historical site tours.', pricePerKm: 2 },
  { driverIdx: 7, make: 'Lexus', model: 'LX 570', year: 2022, color: 'Black', plate: 'HH-011-HH', fuel: 'Petrol', seats: 7, luggage: 5, transmission: 'Automatic', features: ['AC','WiFi','Leather Seats','USB Charger','Heated Seats','Cooled Seats'], desc: 'Top-tier luxury SUV for exclusive tours.', pricePerKm: 4 },
  // Driver 9
  { driverIdx: 8, make: 'Toyota', model: 'Land Cruiser 300', year: 2023, color: 'Dark Grey', plate: 'II-012-II', fuel: 'Diesel', seats: 7, luggage: 5, transmission: 'Automatic', features: ['AC','4WD','WiFi','USB Charger','Snorkel','Off-road Kit'], desc: 'Heavy-duty 4x4 for Kazbegi Military Highway adventures.', pricePerKm: 3 },
  // Driver 10
  { driverIdx: 9, make: 'Mercedes-Benz', model: 'Sprinter', year: 2023, color: 'White', plate: 'JJ-013-JJ', fuel: 'Diesel', seats: 16, luggage: 16, transmission: 'Manual', features: ['AC','WiFi','USB Charger','Microphone','Large Luggage Space'], desc: 'Professional minibus for group tours and transfers.', pricePerKm: 2 },
  { driverIdx: 9, make: 'Mercedes-Benz', model: 'V-Class', year: 2024, color: 'Silver', plate: 'JJ-014-JJ', fuel: 'Diesel', seats: 7, luggage: 6, transmission: 'Automatic', features: ['AC','WiFi','Leather Seats','USB Charger','Electric Doors','Captain Seats'], desc: 'Premium passenger van for family group transfers.', pricePerKm: 3 },
];

// Car photo URLs from free stock (Unsplash - public domain)
const carPhotos = [
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', // Land Cruiser style
  'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800', // SUV
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', // Camry-style
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', // Mercedes E
  'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', // Corolla-style
  'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800', // Tucson-style
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', // 4Runner-style
  'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', // S-Class style
  'https://images.unsplash.com/photo-1606611013016-969c19ba29cd?w=800', // Tiguan-style
  'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800', // Highlander
  'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800', // Lexus LX
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800', // Land Cruiser 300
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', // Sprinter
  'https://images.unsplash.com/photo-1632245889029-e406faee34cd?w=800', // V-Class
];

// Driver avatar URLs
const avatarPhotos = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', // Man 1
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', // Man 2
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', // Man 3
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', // Man 4
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200', // Man 5
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200', // Man 6
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200', // Man 7
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200', // Man 8
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200', // Man 9
  'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=200', // Man 10
];

// ═══════════════════════════════════════════
// SUPER ADMINS (3)
// ═══════════════════════════════════════════
const superAdmins = [
  { firstName: 'Admin', lastName: 'Master', email: 'superadmin@georgiantrip.com', password: ADMIN_PASSWORD },
  { firstName: 'Nino', lastName: 'Chitadze', email: 'nino@georgiantrip.com', password: ADMIN_PASSWORD },
  { firstName: 'Lasha', lastName: 'Tsereteli', email: 'lasha@georgiantrip.com', password: ADMIN_PASSWORD },
];

// Key locations for bookings
const LOCATIONS = {
  tbilisi: '82f8d840-2c64-4131-80f5-10e111ee5b76',
  tbilisiAirport: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
  batumi: 'd407b904-f84a-455a-850a-c459d7735ad5',
  batumiAirport: 'f65e88fb-45b3-4e68-beae-919a68e96754',
  kazbegi: '5395d17f-ddc5-4028-8b26-1b9eef1c0bc0',
  borjomi: '6cc7c0a6-7c16-4104-889c-f71216dd3766',
  sighnaghi: 'ec974bcc-74f5-442c-ae69-ed94e264cbd7',
  telavi: '3dca5289-b6fc-4bcc-8514-7157463a6d3b',
};

// ═══════════════════════════════════════════
//  EXECUTION
// ═══════════════════════════════════════════
console.log('🚀 Starting demo data seed...\n');

const client = await pool.connect();
try {
  await client.query('BEGIN');

  // ── Step 0: Clean existing orphan data ──
  console.log('🧹 Cleaning orphaned data...');
  await client.query('DELETE FROM driver_earnings');
  await client.query('DELETE FROM bookings');
  await client.query('DELETE FROM driver_pricing');
  await client.query('DELETE FROM car_images');
  await client.query('DELETE FROM car_reviews');
  // Don't delete cars that have existing S3 images - update them instead
  await client.query('DELETE FROM drivers');
  // Don't delete the existing admin user or kartvel100 driver user
  
  // ── Step 1: Create Super Admin users ──
  console.log('\n👑 Creating super admin accounts...');
  for (const admin of superAdmins) {
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [admin.email]);
    if (existingUser.rows.length > 0) {
      // Update password
      const hash = await hashPassword(admin.password);
      await client.query('UPDATE users SET password_hash = $1, role = $2, first_name = $3, last_name = $4, user_metadata = $5 WHERE email = $6', 
        [hash, 'super_admin', admin.firstName, admin.lastName, JSON.stringify({ role: 'super_admin', first_name: admin.firstName, last_name: admin.lastName }), admin.email]);
      console.log(`  ✅ Updated: ${admin.email}`);
    } else {
      const hash = await hashPassword(admin.password);
      await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, user_metadata)
         VALUES ($1, $2, 'super_admin', $3, $4, $5)`,
        [admin.email, hash, admin.firstName, admin.lastName, JSON.stringify({ role: 'super_admin', first_name: admin.firstName, last_name: admin.lastName })]
      );
      console.log(`  ✅ Created: ${admin.email}`);
    }
  }

  // ── Step 2: Create driver users + driver profiles ──
  console.log('\n🚗 Creating driver accounts...');
  const driverIds = [];
  const driverUserIds = [];
  
  for (let i = 0; i < drivers.length; i++) {
    const d = drivers[i];
    const hash = await hashPassword(PASSWORD);
    
    // Create or update user
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [d.email]);
    let userId;
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      await client.query('UPDATE users SET password_hash = $1, role = $2, first_name = $3, last_name = $4, user_metadata = $5 WHERE id = $6',
        [hash, 'driver', d.firstName, d.lastName, JSON.stringify({ role: 'driver', first_name: d.firstName, last_name: d.lastName }), userId]);
    } else {
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, user_metadata)
         VALUES ($1, $2, 'driver', $3, $4, $5) RETURNING id`,
        [d.email, hash, d.firstName, d.lastName, JSON.stringify({ role: 'driver', first_name: d.firstName, last_name: d.lastName })]
      );
      userId = rows[0].id;
    }
    driverUserIds.push(userId);
    
    // Create driver profile
    const driverId = randomUUID();
    driverIds.push(driverId);
    
    await client.query(
      `INSERT INTO drivers (id, user_id, first_name, last_name, email, phone, avatar_url, bio, rating, reviews_count, languages_spoken, verification_status, status, is_active, total_earnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', 'active', true, $12)`,
      [driverId, userId, d.firstName, d.lastName, d.email, d.phone, avatarPhotos[i], d.bio, d.rating, d.reviews, d.languages, Math.floor(Math.random() * 5000) + 1000]
    );
    
    console.log(`  ✅ Driver ${i+1}: ${d.firstName} ${d.lastName} (${d.email})`);
  }

  // ── Step 3: Create demo cars ──
  console.log('\n🚙 Creating demo cars...');
  // First clear existing cars then recreate
  await client.query('DELETE FROM cars');
  
  const carIds = [];
  for (let i = 0; i < carData.length; i++) {
    const c = carData[i];
    const carId = randomUUID();
    carIds.push(carId);
    
    await client.query(
      `INSERT INTO cars (id, driver_id, make, model, year, color, license_plate, fuel_type, seats, luggage_capacity, transmission, features, description, main_photo, photos_urls, active, verification_status, price_per_km)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, 'approved', $16)`,
      [carId, driverIds[c.driverIdx], c.make, c.model, c.year, c.color, c.plate, c.fuel, c.seats, c.luggage, c.transmission, c.features, c.desc, carPhotos[i], [carPhotos[i]], c.pricePerKm]
    );
    
    console.log(`  ✅ Car ${i+1}: ${c.make} ${c.model} → ${drivers[c.driverIdx].firstName}`);
  }

  // ── Step 4: Create driver pricing ──
  console.log('\n💰 Creating driver pricing...');
  const pricingData = [
    { driverIdx: 0, pricePerKm: 1.8, minPrice: 40 },
    { driverIdx: 1, pricePerKm: 2.0, minPrice: 50 },
    { driverIdx: 2, pricePerKm: 2.5, minPrice: 60 },
    { driverIdx: 3, pricePerKm: 1.5, minPrice: 30 },
    { driverIdx: 4, pricePerKm: 2.2, minPrice: 55 },
    { driverIdx: 5, pricePerKm: 3.5, minPrice: 100 },
    { driverIdx: 6, pricePerKm: 1.8, minPrice: 35 },
    { driverIdx: 7, pricePerKm: 2.0, minPrice: 45 },
    { driverIdx: 8, pricePerKm: 2.5, minPrice: 60 },
    { driverIdx: 9, pricePerKm: 1.6, minPrice: 40 },
  ];
  
  for (const p of pricingData) {
    await client.query(
      `INSERT INTO driver_pricing (driver_id, price_per_km, min_price, currency)
       VALUES ($1, $2, $3, 'GEL')`,
      [driverIds[p.driverIdx], p.pricePerKm, p.minPrice]
    );
  }
  console.log('  ✅ Pricing set for all 10 drivers');

  // ── Step 5: Create 5 test bookings ──
  console.log('\n📋 Creating test bookings...');
  const bookings = [
    { 
      pickup: LOCATIONS.tbilisiAirport, dropoff: LOCATIONS.tbilisi,
      carIdx: 4, driverIdx: 3, // Nika - Toyota Corolla
      firstName: 'John', lastName: 'Smith', email: 'john.smith@gmail.com', phone: '+44 7700 900123',
      date: '2026-03-25', time: '14:00', passengers: 2, price: 45,
      status: 'confirmed', paymentStatus: 'paid',
      notes: 'Flight arrives at 13:30. Please wait at arrivals.'
    },
    {
      pickup: LOCATIONS.tbilisi, dropoff: LOCATIONS.kazbegi,
      carIdx: 0, driverIdx: 0, // Giorgi - Land Cruiser
      firstName: 'Anna', lastName: 'Mueller', email: 'anna.mueller@web.de', phone: '+49 170 1234567',
      date: '2026-03-26', time: '08:00', passengers: 4, price: 280,
      status: 'pending', paymentStatus: 'pending',
      notes: 'We want to stop at Ananuri fortress on the way.'
    },
    {
      pickup: LOCATIONS.tbilisi, dropoff: LOCATIONS.sighnaghi,
      carIdx: 3, driverIdx: 2, // Dato - Mercedes E-Class
      firstName: 'Pierre', lastName: 'Dubois', email: 'pierre.dubois@gmail.com', phone: '+33 6 12 34 56 78',
      date: '2026-03-24', time: '10:00', passengers: 2, price: 180,
      status: 'completed', paymentStatus: 'paid',
      notes: 'Wine tasting tour included. Return trip same day.',
      driverEarnings: 126, driverNet: 126
    },
    {
      pickup: LOCATIONS.batumi, dropoff: LOCATIONS.batumiAirport,
      carIdx: 8, driverIdx: 6, // Saba - VW Tiguan
      firstName: 'Maria', lastName: 'Ivanova', email: 'maria.ivanova@mail.ru', phone: '+7 916 123 4567',
      date: '2026-03-27', time: '06:00', passengers: 3, price: 35,
      status: 'confirmed', paymentStatus: 'pending',
      notes: 'Early morning flight. Please be on time.'
    },
    {
      pickup: LOCATIONS.tbilisi, dropoff: LOCATIONS.borjomi,
      carIdx: 6, driverIdx: 4, // Irakli - Toyota 4Runner
      firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.tanaka@yahoo.co.jp', phone: '+81 90 1234 5678',
      date: '2026-03-28', time: '09:00', passengers: 2, price: 200,
      status: 'pending', paymentStatus: 'pending',
      notes: 'Want to visit Borjomi Central Park and mineral springs.'
    },
  ];

  const bookingIds = [];
  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    const bookingId = randomUUID();
    bookingIds.push(bookingId);
    
    await client.query(
      `INSERT INTO bookings (id, pickup_location_id, dropoff_location_id, car_id, driver_id,
       customer_first_name, customer_last_name, customer_email, customer_phone,
       date, time, passengers, notes, total_price, status, payment_status,
       driver_earnings, driver_net, final_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [bookingId, b.pickup, b.dropoff, carIds[b.carIdx], driverIds[b.driverIdx],
       b.firstName, b.lastName, b.email, b.phone,
       b.date, b.time, b.passengers, b.notes, b.price, b.status, b.paymentStatus,
       b.driverEarnings || null, b.driverNet || null, b.price]
    );
    
    console.log(`  ✅ Booking ${i+1}: ${b.firstName} ${b.lastName} — ${b.status} (₾${b.price})`);
    
    // Create driver_earnings entry for completed bookings
    if (b.status === 'completed') {
      const commission = b.price * 0.3;
      const net = b.price * 0.7;
      await client.query(
        `INSERT INTO driver_earnings (driver_id, booking_id, gross_amount, platform_commission, net_amount, status)
         VALUES ($1, $2, $3, $4, $5, 'completed')`,
        [driverIds[b.driverIdx], bookingId, b.price, commission, net]
      );
    }
  }

  await client.query('COMMIT');
  console.log('\n✅ All demo data seeded successfully!\n');

  // ═══════════════════════════════════════════
  //  PRINT CREDENTIALS
  // ═══════════════════════════════════════════
  console.log('═══════════════════════════════════════════════');
  console.log('  SUPER ADMIN ACCOUNTS');
  console.log('  Login URL: https://georgiantrip.com/admin-login');
  console.log('  Admin Panel: https://georgiantrip.com/paneli/dashboard');
  console.log('═══════════════════════════════════════════════');
  for (const a of superAdmins) {
    console.log(`  📧 ${a.email}  🔑 ${a.password}`);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  DRIVER ACCOUNTS (10)');
  console.log('  Login URL: https://georgiantrip.com/driver/login');
  console.log('  Dashboard: https://georgiantrip.com/driver/dashboard');
  console.log('═══════════════════════════════════════════════');
  for (let i = 0; i < drivers.length; i++) {
    console.log(`  ${(i+1).toString().padStart(2)}. ${drivers[i].firstName.padEnd(10)} ${drivers[i].lastName.padEnd(18)} 📧 ${drivers[i].email.padEnd(32)} 🔑 ${PASSWORD}`);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  TEST BOOKINGS (5)');
  console.log('═══════════════════════════════════════════════');
  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    console.log(`  ${i+1}. ${b.firstName} ${b.lastName} | ${b.status} | ₾${b.price} | ${b.date}`);
  }

} catch (err) {
  await client.query('ROLLBACK');
  console.error('❌ Error:', err.message);
  console.error(err.stack);
} finally {
  client.release();
  await pool.end();
}
