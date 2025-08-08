require('dotenv').config();
const pool = require('./config/db');

async function testCreateReclamation() {
  try {
    console.log('Test de création d\'une réclamation...');
    
    // Récupérer un utilisateur pour created_by
    const [users] = await pool.query('SELECT id FROM srmdb.users LIMIT 1');
    if (users.length === 0) {
      console.error('Aucun utilisateur trouvé dans la base de données');
      process.exit(1);
    }
    const userId = users[0].id;
    
    // Récupérer un client (optionnel)
    let clientId = null;
    const [clients] = await pool.query('SELECT id FROM srmdb.clients LIMIT 1');
    if (clients.length > 0) {
      clientId = clients[0].id;
    }
    
    // Récupérer un contrat (optionnel)
    let contratId = null;
    const [contrats] = await pool.query('SELECT id FROM srmdb.contrats LIMIT 1');
    if (contrats.length > 0) {
      contratId = contrats[0].id;
    }
    
    // Insérer une réclamation de test
    const [result] = await pool.query(
      `INSERT INTO srmdb.reclamations 
      (created_by, objet, description, contrat_id, client_id, status, created_at) 
      VALUES (?, ?, ?, ?, ?, 'en attente', NOW())`,
      [userId, 'Test réclamation', 'Description de test', contratId, clientId]
    );
    
    console.log(`Réclamation créée avec succès! ID: ${result.insertId}`);
    
    // Vérifier que la réclamation a bien été créée
    const [reclamation] = await pool.query(
      'SELECT * FROM srmdb.reclamations WHERE id = ?',
      [result.insertId]
    );
    
    console.log('\nDétails de la réclamation créée:');
    console.log(reclamation[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de la réclamation:', error);
    process.exit(1);
  }
}

testCreateReclamation();