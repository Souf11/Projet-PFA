// update-reclamation-schema.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de la connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'srmdb'
};

async function updateReclamationSchema() {
  let connection;
  try {
    // Créer une connexion à la base de données
    connection = await mysql.createConnection(dbConfig);

    console.log('Connexion à la base de données établie');

    // Vérifier si la table reclamation_techniciens existe déjà
    const [reclamationTechniciensTable] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reclamation_techniciens'`,
      [dbConfig.database]
    );

    if (reclamationTechniciensTable.length === 0) {
      // Créer la table reclamation_techniciens pour stocker les techniciens supplémentaires
      await connection.query(`
        CREATE TABLE reclamation_techniciens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          reclamation_id INT NOT NULL,
          technicien_id INT NOT NULL,
          added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          added_by INT NOT NULL,
          FOREIGN KEY (reclamation_id) REFERENCES reclamations(id) ON DELETE CASCADE,
          FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (added_by) REFERENCES users(id),
          UNIQUE KEY unique_reclamation_technicien (reclamation_id, technicien_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Table reclamation_techniciens créée');
    } else {
      console.log('La table reclamation_techniciens existe déjà');
    }

    console.log('Mise à jour du schéma de réclamation terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du schéma de réclamation:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connexion à la base de données fermée');
    }
  }
}

// Exécuter la fonction de mise à jour
updateReclamationSchema();