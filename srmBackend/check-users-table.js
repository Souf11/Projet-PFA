require('dotenv').config();
const pool = require('./config/db');

async function checkUsersTable() {
  try {
    console.log('🔍 Vérification de la structure de la table users...');
    
    const [columns] = await pool.query('DESCRIBE users');
    console.log('Structure de la table users:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key || ''} ${col.Default || ''}`);
    });
    
    console.log('\n🔍 Vérification des données utilisateurs...');
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users LIMIT 5');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
    } else {
      console.log(`✅ ${users.length} utilisateur(s) trouvé(s):`);
      users.forEach(user => {
        console.log(`- ID: ${user.id}, Nom: ${user.name}, Email: ${user.email}, Rôle: ${user.role || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    process.exit(0);
  }
}

checkUsersTable();