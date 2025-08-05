require('dotenv').config();

console.log('🔍 Vérification de la configuration de la base de données...');
console.log('DB_HOST:', process.env.DB_HOST || 'Non défini');
console.log('DB_USER:', process.env.DB_USER || 'Non défini');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Défini' : 'Non défini');
console.log('DB_NAME:', process.env.DB_NAME || 'Non défini');

const pool = require('./config/db');

async function testConnection() {
  try {
    console.log('🔧 Test de connexion à la base de données...');
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('✅ Connexion réussie!');
    console.log('Résultat du test:', rows[0]);
    
    // Test de la table complaints
    console.log('🔧 Test de la table complaints...');
    const [complaints] = await pool.query('SELECT COUNT(*) as count FROM complaints');
    console.log('✅ Table complaints accessible!');
    console.log('Nombre de réclamations:', complaints[0].count);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Code d\'erreur:', error.code);
  } finally {
    process.exit(0);
  }
}

testConnection(); 