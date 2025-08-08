require('dotenv').config();
const pool = require('./config/db');

async function fixPasswordColumn() {
  try {
    console.log('🔧 Vérification des colonnes de mot de passe dans la table users...');
    
    // Vérifier la structure actuelle
    const [columns] = await pool.query('DESCRIBE users');
    console.log('Structure actuelle de la table users:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Vérifier si password_hash existe
    const passwordHashExists = columns.some(col => col.Field === 'password_hash');
    const passwordExists = columns.some(col => col.Field === 'password');
    
    if (passwordHashExists) {
      console.log('✅ La colonne password_hash existe déjà');
    } else if (passwordExists) {
      console.log('🔄 Renommage de la colonne password en password_hash...');
      
      // Renommer la colonne password en password_hash
      await pool.query(`
        ALTER TABLE users 
        CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL
      `);
      
      console.log('✅ Colonne password renommée en password_hash avec succès!');
    } else {
      console.log('❌ Ni password ni password_hash n\'existent dans la table users');
      console.log('🔄 Création de la colonne password_hash...');
      
      // Créer la colonne password_hash
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN password_hash VARCHAR(255) NOT NULL
      `);
      
      console.log('✅ Colonne password_hash créée avec succès!');
    }
    
    // Vérifier la structure mise à jour
    const [updatedColumns] = await pool.query('DESCRIBE users');
    console.log('\nStructure mise à jour de la table users:');
    updatedColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la modification de la colonne:', error);
  } finally {
    process.exit(0);
  }
}

fixPasswordColumn();