const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async findByEmail(email) {
  const [rows] = await pool.query('SELECT id, name, email, address, phone, password_hash FROM users WHERE email = ?', [email]);
  return rows[0];
  },

  async create({ name, email, password, address, phone }) {
    // Validation simple (comme dans le schéma Mongoose)
    if (!name || !email || !password || !address) {
      throw new Error('All fields are required');
    }
    // Vérifie unicité email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new Error('Email already in use');
    }
    // Hash du mot de passe
    const password_hash = await bcrypt.hash(password, 10);
    // Insertion
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, address, phone || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, phone FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
};

module.exports = User;
