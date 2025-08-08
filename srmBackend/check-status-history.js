require('dotenv').config();
const pool = require('./config/db');

async function checkStatusHistoryTable() {
  try {
    console.log('Checking status_history table structure...');
    
    const [rows] = await pool.query('DESCRIBE srmdb.status_history');
    console.log('Status history table structure:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key || ''} ${row.Default || ''}`);
    });
    
    console.log('\nChecking sample status history data...');
    const [statusHistory] = await pool.query(`
      SELECT sh.*, 
             r.objet as reclamation_objet,
             u.name as changed_by_name
      FROM srmdb.status_history sh
      JOIN srmdb.reclamations r ON sh.reclamation_id = r.id
      JOIN srmdb.users u ON sh.changed_by = u.id
      ORDER BY sh.changed_at DESC
      LIMIT 5
    `);
    
    console.log('Sample status history entries:');
    statusHistory.forEach(entry => {
      console.log(entry);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkStatusHistoryTable();