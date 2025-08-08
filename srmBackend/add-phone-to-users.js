require('dotenv').config();
const pool = require('./config/db');

async function addPhoneColumnToUsers() {
  try {
    console.log('🔧 Ajout de la colonne phone à la table users...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await pool.query('DESCRIBE users');
    const phoneColumnExists = columns.some(col => col.Field === 'phone');
    
    if (phoneColumnExists) {
      console.log('✅ La colonne phone existe déjà dans la table users');
    } else {
      // Ajouter la colonne phone
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN phone VARCHAR(20) NULL
      `);
      
      console.log('✅ Colonne phone ajoutée avec succès!');
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

addPhoneColumnToUsers();