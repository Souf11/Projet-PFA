// update-database-schema.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de la connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'srmdb'
};

async function updateDatabaseSchema() {
  let connection;

  try {
    // Connexion à la base de données
    connection = await mysql.createConnection(dbConfig);
    console.log('Connexion à la base de données établie');

    // Vérifier si la table reclamations existe déjà
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reclamations'`,
      [dbConfig.database]
    );

    if (tables.length === 0) {
      // Créer la table reclamations
      await connection.query(`
        CREATE TABLE reclamations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          contrat_id INT,
          client_id INT,
          objet VARCHAR(150) NOT NULL,
          description TEXT,
          status ENUM('en attente', 'en cours', 'résolue', 'rejetée') DEFAULT 'en attente',
          created_at DATETIME NOT NULL,
          created_by INT NOT NULL,
          assigned_to INT,
          FOREIGN KEY (contrat_id) REFERENCES contrats(id) ON DELETE SET NULL,
          FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users(id),
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Table reclamations créée');
    } else {
      // Mettre à jour la table reclamations existante
      await connection.query(`
        ALTER TABLE reclamations
        ADD COLUMN contrat_id INT,
        ADD COLUMN client_id INT,
        ADD FOREIGN KEY (contrat_id) REFERENCES contrats(id) ON DELETE SET NULL,
        ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
      `);
      console.log('Table reclamations mise à jour');
    }

    // Vérifier si la table status_history existe déjà
    const [statusHistoryTables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'status_history'`,
      [dbConfig.database]
    );

    if (statusHistoryTables.length === 0) {
      // Créer la table status_history
      await connection.query(`
        CREATE TABLE status_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          reclamation_id INT NOT NULL,
          old_status ENUM('en attente', 'en cours', 'résolue', 'rejetée'),
          new_status ENUM('en attente', 'en cours', 'résolue', 'rejetée') NOT NULL,
          changed_by INT NOT NULL,
          changed_at DATETIME NOT NULL,
          FOREIGN KEY (reclamation_id) REFERENCES reclamations(id) ON DELETE CASCADE,
          FOREIGN KEY (changed_by) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Table status_history créée');
    }

    // Vérifier si la table demandes existe déjà
    const [demandesTables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'demandes'`,
      [dbConfig.database]
    );

    if (demandesTables.length === 0) {
      // Créer la table demandes
      await connection.query(`
        CREATE TABLE demandes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          reclamation_id INT NOT NULL,
          demandeur_id INT NOT NULL,
          type_demande ENUM('assistance_technicien', 'materiel') NOT NULL,
          description TEXT,
          status ENUM('en_attente', 'approuvee', 'rejetee', 'terminee') DEFAULT 'en_attente',
          technicien_assigne_id INT,
          materiel_demande VARCHAR(255),
          created_at DATETIME NOT NULL,
          reponse TEXT,
          resolved_at DATETIME,
          FOREIGN KEY (reclamation_id) REFERENCES reclamations(id) ON DELETE CASCADE,
          FOREIGN KEY (demandeur_id) REFERENCES users(id),
          FOREIGN KEY (technicien_assigne_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('Table demandes créée');
    }

    // Mettre à jour la table users pour ajouter le rôle technicien si nécessaire
    await connection.query(`
      ALTER TABLE users MODIFY COLUMN role ENUM('utilisateur', 'agent', 'technicien', 'admin') DEFAULT 'utilisateur';
    `);
    console.log('Table users mise à jour');

    console.log('Mise à jour du schéma de la base de données terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du schéma de la base de données:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connexion à la base de données fermée');
    }
  }
}

// Exécuter la fonction de mise à jour
updateDatabaseSchema();