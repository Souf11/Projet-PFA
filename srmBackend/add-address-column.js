require('dotenv').config();
const pool = require('./config/db');

async function addAddressColumn() {
  try {
    console.log('🔧 Ajout de la colonne address à la table users...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await pool.query('DESCRIBE users');
    const addressColumnExists = columns.some(col => col.Field === 'address');
    
    if (addressColumnExists) {
      console.log('✅ La colonne address existe déjà dans la table users');
    } else {
      // Ajouter la colonne address
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN address VARCHAR(255) NULL
      `);
      
      console.log('✅ Colonne address ajoutée avec succès!');
    }
    
    // Vérifier la structure de la table
    const [updatedColumns] = await pool.query('DESCRIBE users');
    console.log('\nStructure actuelle de la table users:');
    updatedColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
  } finally {
    process.exit(0);
  }
}

addAddressColumn();