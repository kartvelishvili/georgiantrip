import dotenv from 'dotenv';
dotenv.config();

const res = await fetch('http://localhost:3001/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@georgiantrip.com', password: 'admin123' })
});
const data = await res.json();
console.log('Status:', res.status);
console.log('User role:', data.user?.role);
console.log('Has session:', !!data.session);
console.log('Has error:', !!data.error);
if (data.error) console.log('Error:', data.error);
