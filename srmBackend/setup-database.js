const pool = require('./config/db');

async function setupComplaintsTable() {
  try {
    console.log('🔧 Configuration de la table reclamations...');
    
    // Création de la table reclamations
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS srmdb.reclamations (
        id INT(11) PRIMARY KEY AUTO_INCREMENT,
        objet VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('eau', 'electricite') NOT NULL,
        status ENUM('en attente', 'en cours', 'résolue', 'rejetée') DEFAULT 'en attente',
        created_at DATETIME NOT NULL,
        created_by INT(11) NOT NULL,
        assigned_to INT(11),
        FOREIGN KEY (created_by) REFERENCES srmdb.users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES srmdb.users(id) ON DELETE SET NULL
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table reclamations créée avec succès');
    
    // Création des index
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_reclamations_created_by ON srmdb.reclamations(created_by)',
      'CREATE INDEX IF NOT EXISTS idx_reclamations_status ON srmdb.reclamations(status)',
      'CREATE INDEX IF NOT EXISTS idx_reclamations_created_at ON srmdb.reclamations(created_at)'
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
    console.log('🎉 Configuration de la base de données terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  } finally {
    process.exit(0);
  }
}

setupComplaintsTable();