require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function createAdmin() {
  try {
    console.log('🔧 Création d\'un utilisateur administrateur...');
    
    // Vérifier si un admin existe déjà
    const [existingAdmins] = await pool.query(
      'SELECT * FROM users WHERE role = ?',
      ['admin']
    );
    
    if (existingAdmins.length > 0) {
      console.log('✅ Un administrateur existe déjà:');
      existingAdmins.forEach(admin => {
        console.log(`- ID: ${admin.id}, Email: ${admin.email}, Nom: ${admin.name}`);
      });
      return;
    }
    
    // Créer l'administrateur
    const adminName = 'Administrateur';
    const adminEmail = 'admin@srm.ma';
    const adminPassword = 'admin123';
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Créer l'admin
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [adminName, adminEmail, hashedPassword, 'admin']
    );
    
    console.log('✅ Administrateur créé avec succès!');
    console.log('Email:', adminEmail);
    console.log('Mot de passe:', adminPassword);
    console.log('ID:', result.insertId);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();