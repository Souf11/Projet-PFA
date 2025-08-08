require('dotenv').config();
const pool = require('./config/db');

async function modifyContratIdColumn() {
  try {
    console.log('Modification de la colonne contrat_id pour accepter les valeurs NULL...');
    
    // Modifier la colonne contrat_id pour accepter NULL
    await pool.query(
      `ALTER TABLE srmdb.reclamations 
       MODIFY COLUMN contrat_id INT NULL`
    );
    
    console.log('Colonne contrat_id modifiée avec succès!');
    
    // Vérifier la structure mise à jour
    const [rows] = await pool.query('DESCRIBE srmdb.reclamations');
    console.log('\nStructure mise à jour de la table reclamations:');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key || ''} ${row.Default || ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

modifyContratIdColumn();