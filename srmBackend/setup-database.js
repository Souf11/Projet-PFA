const pool = require('./config/db');

async function setupComplaintsTable() {
  try {
    console.log('🔧 Configuration de la table complaints...');
    
    // Création de la table complaints
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS complaints (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        invoice_id INT,
        type ENUM('facture', 'service', 'compteur', 'autre') NOT NULL,
        subject VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table complaints créée avec succès');
    
    // Création des index
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at)'
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