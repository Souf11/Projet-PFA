const pool = require('./config/db');

async function addPhoneNumberColumn() {
  try {
    console.log('Ajout de la colonne phone_number à la table complaints...');
    
    // Ajouter la colonne phone_number
    await pool.query(`
      ALTER TABLE complaints 
      ADD COLUMN phone_number VARCHAR(20) NULL
    `);
    
    console.log('✅ Colonne phone_number ajoutée avec succès!');
    
    // Vérifier la structure de la table
    const [columns] = await pool.query('DESCRIBE complaints');
    console.log('\nStructure actuelle de la table complaints:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  La colonne phone_number existe déjà dans la table complaints');
    } else {
      console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
    }
  } finally {
    process.exit(0);
  }
}

addPhoneNumberColumn(); 