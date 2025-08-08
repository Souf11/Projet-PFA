const mysql = require('mysql2/promise');

async function updateUserRoles() {
  try {
    const pool = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'srmdb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Mise à jour des rôles utilisateurs...');
    const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE role IS NULL OR role = ""');
    console.log(`${users.length} utilisateur(s) sans rôle trouvé(s)`);

    for (const user of users) {
      console.log(`- Mise à jour de l'utilisateur ID: ${user.id}, Nom: ${user.name}, Email: ${user.email}`);
      await pool.query('UPDATE users SET role = ? WHERE id = ?', ['utilisateur', user.id]);
    }

    console.log('✅ Mise à jour terminée!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

updateUserRoles();