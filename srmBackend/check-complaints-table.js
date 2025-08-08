require('dotenv').config();
const pool = require('./config/db');

async function checkComplaintsTable() {
  try {
    console.log('Checking reclamations table structure...');
    
    const [rows] = await pool.query('DESCRIBE srmdb.reclamations');
    console.log('Reclamations table structure:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key || ''} ${row.Default || ''}`);
    });
    
    console.log('\nChecking sample reclamations data...');
    const [reclamations] = await pool.query('SELECT * FROM srmdb.reclamations LIMIT 3');
    console.log('Sample reclamations:');
    reclamations.forEach(reclamation => {
      console.log(reclamation);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkComplaintsTable();