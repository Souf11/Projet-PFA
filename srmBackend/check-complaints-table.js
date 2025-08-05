require('dotenv').config();
const pool = require('./config/db');

async function checkComplaintsTable() {
  try {
    console.log('Checking complaints table structure...');
    
    const [rows] = await pool.query('DESCRIBE complaints');
    console.log('Complaints table structure:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key || ''} ${row.Default || ''}`);
    });
    
    console.log('\nChecking sample complaints data...');
    const [complaints] = await pool.query('SELECT * FROM complaints LIMIT 3');
    console.log('Sample complaints:');
    complaints.forEach(complaint => {
      console.log(complaint);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkComplaintsTable(); 