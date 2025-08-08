require('dotenv').config();
const pool = require('./config/db');

async function setupStatusHistoryTable() {
  try {
    console.log('🔧 Configuration de la table status_history...');
    
    // Création de la table status_history
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS srmdb.status_history (
        id INT(11) PRIMARY KEY AUTO_INCREMENT,
        reclamation_id INT(11) NOT NULL,
        old_status ENUM('en attente', 'en cours', 'résolue', 'rejetée'),
        new_status ENUM('en attente', 'en cours', 'résolue', 'rejetée'),
        changed_by INT(11) NOT NULL,
        changed_at DATETIME NOT NULL,
        FOREIGN KEY (reclamation_id) REFERENCES srmdb.reclamations(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES srmdb.users(id) ON DELETE CASCADE
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table status_history créée avec succès');
    
    // Création des index
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_status_history_reclamation_id ON srmdb.status_history(reclamation_id)',
      'CREATE INDEX IF NOT EXISTS idx_status_history_changed_by ON srmdb.status_history(changed_by)',
      'CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON srmdb.status_history(changed_at)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await pool.query(indexQuery);
      } catch (error) {
        // Index might already exist, that's okay
        console.log('ℹ️ Index déjà existant ou non nécessaire');
      }
    }
    
    console.log('✅ Index créés avec succès');
    console.log('🎉 Configuration de la table status_history terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  } finally {
    process.exit(0);
  }
}

setupStatusHistoryTable();