// test-techniciens.js
const pool = require('./config/db');

async function getTechniciens() {
  try {
    const [techniciens] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE role = "technicien" ORDER BY name ASC'
    );
    
    console.log('Techniciens data type:', typeof techniciens);
    console.log('Is array:', Array.isArray(techniciens));
    console.log('Data:', JSON.stringify(techniciens, null, 2));
  } catch (error) {
    console.error('Error fetching techniciens:', error);
  }
}

getTechniciens();