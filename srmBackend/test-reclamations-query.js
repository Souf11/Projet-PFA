require('dotenv').config();
const pool = require('./config/db');

async function testReclamationsQuery() {
  try {
    console.log('Test de la requête de récupération des réclamations...');
    
    // Tester la requête qui posait problème
    const [reclamations] = await pool.query(
      `SELECT r.*, u.name as assigned_to_name, 
       c.nom as client_nom, ct.numero_contrat, ct.type_service
       FROM srmdb.reclamations r
       LEFT JOIN srmdb.users u ON r.assigned_to = u.id
       LEFT JOIN srmdb.clients c ON r.client_id = c.id
       LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );
    
    console.log('Requête exécutée avec succès!');
    console.log('\nRésultats:');
    console.log(reclamations);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    process.exit(1);
  }
}

testReclamationsQuery();