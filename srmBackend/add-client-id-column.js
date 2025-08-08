require('dotenv').config();
const pool = require('./config/db');

async function addClientIdColumn() {
  try {
    console.log('Vérification de la structure de la table reclamations...');
    
    // Vérifier si la colonne client_id existe déjà
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'srmdb' 
       AND TABLE_NAME = 'reclamations' 
       AND COLUMN_NAME = 'client_id'`
    );
    
    if (columns.length === 0) {
      console.log('La colonne client_id n\'existe pas, ajout en cours...');
      
      // Ajouter la colonne client_id
      await pool.query(
        `ALTER TABLE srmdb.reclamations 
         ADD COLUMN client_id INT,
         ADD FOREIGN KEY (client_id) REFERENCES srmdb.clients(id) ON DELETE SET NULL`
      );
      
      console.log('Colonne client_id ajoutée avec succès!');
    } else {
      console.log('La colonne client_id existe déjà.');
    }
    
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

addClientIdColumn();