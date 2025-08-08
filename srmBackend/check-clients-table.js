require('dotenv').config();
const pool = require('./config/db');

async function checkClientsTable() {
  try {
    console.log('Checking clients table structure...');
    
    const [rows] = await pool.query('DESCRIBE srmdb.clients');
    console.log('Clients table structure:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key || ''} ${row.Default || ''}`);
    });
    
    console.log('\nChecking sample clients data...');
    const [clients] = await pool.query('SELECT * FROM srmdb.clients LIMIT 3');
    console.log('Sample clients:');
    clients.forEach(client => {
      console.log(client);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkClientsTable();