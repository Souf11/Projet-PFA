require('dotenv').config();
const pool = require('./config/db');

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans la base de données...');
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    
    const [users] = await pool.query('SELECT id, email, name, created_at FROM users');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 Vous devez créer un compte via l\'interface web d\'abord');
    } else {
      console.log(`✅ ${users.length} utilisateur(s) trouvé(s):`);
      users.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Nom: ${user.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsers(); 