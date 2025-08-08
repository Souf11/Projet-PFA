require('dotenv').config();
const pool = require('./config/db');
const StatusHistory = require('./models/StatusHistory');

async function testStatusHistory() {
  try {
    console.log('Testing status history functionality...');
    
    // 1. Get a reclamation to test with
    const [reclamations] = await pool.query('SELECT * FROM srmdb.reclamations LIMIT 1');
    if (reclamations.length === 0) {
      console.error('No reclamations found for testing');
      process.exit(1);
    }
    
    const reclamation = reclamations[0];
    console.log(`Using reclamation ID: ${reclamation.id}`);
    
    // 2. Get a user ID for testing
    const [users] = await pool.query('SELECT id FROM srmdb.users WHERE role = "technicien" LIMIT 1');
    if (users.length === 0) {
      console.error('No technicien users found for testing');
      process.exit(1);
    }
    
    const userId = users[0].id;
    console.log(`Using user ID: ${userId}`);
    
    // 3. Create a test status change
    const oldStatus = reclamation.status;
    const newStatus = oldStatus === 'en attente' ? 'en cours' : 'en attente';
    
    console.log(`Creating test status change: ${oldStatus} -> ${newStatus}`);
    
    // 4. Insert directly into status_history
    const statusHistoryData = {
      reclamation_id: reclamation.id,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: userId
    };
    
    const historyId = await StatusHistory.create(statusHistoryData);
    console.log(`Created status history entry with ID: ${historyId}`);
    
    // 5. Update the reclamation status
    await pool.query(
      'UPDATE srmdb.reclamations SET status = ? WHERE id = ?',
      [newStatus, reclamation.id]
    );
    console.log(`Updated reclamation status to: ${newStatus}`);
    
    // 6. Retrieve and display the status history
    const statusHistory = await StatusHistory.findByReclamationId(reclamation.id);
    console.log('\nStatus history for reclamation:');
    statusHistory.forEach(entry => {
      console.log(`${entry.old_status} -> ${entry.new_status} | By: ${entry.changed_by_name} | At: ${entry.changed_at}`);
    });
    
    console.log('\nTest completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

testStatusHistory();