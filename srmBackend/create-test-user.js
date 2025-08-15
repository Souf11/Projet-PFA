const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function createTestUser() {
  try {
    console.log('🔧 Création d\'un utilisateur de test...');
    
    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      ['test@test.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('✅ Utilisateur test@test.com existe déjà');
      return;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Créer l'utilisateur
    await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      ['test@test.com', hashedPassword, 'Utilisateur Test']
    );
    
    console.log('✅ Utilisateur de test créé avec succès!');
    console.log('Email: test@test.com');
    console.log('Mot de passe: password123');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();