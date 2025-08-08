require('dotenv').config();
const pool = require('./config/db');

async function checkContratsTable() {
  try {
    console.log('Checking contrats table structure...');
    
    const [rows] = await pool.query('DESCRIBE srmdb.contrats');
    console.log('Contrats table structure:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key || ''} ${row.Default || ''}`);
    });
    
    console.log('\nChecking sample contrats data...');
    const [contrats] = await pool.query('SELECT * FROM srmdb.contrats LIMIT 3');
    console.log('Sample contrats:');
    contrats.forEach(contrat => {
      console.log(contrat);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkContratsTable();