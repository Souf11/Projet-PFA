const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const FIXED_ADMIN_EMAIL = 'admin@srm.ma';
const FIXED_ADMIN_PASSWORD = 'admin123'; // In production, use env vars!

const register = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    // Validation robuste
    if (!name || !email || !password || !address) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires',
        required_fields: {
          name: 'string',
          email: 'string',
          password: 'string (min 6 caractères)',
          address: 'string',
          phone: 'string (optionnel)'
        }
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec le rôle par défaut 'utilisateur'
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, phone || null, 'utilisateur']
    );

    const userId = result.insertId;

    // Vérification du JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error('Configuration JWT manquante');
    }

    const token = jwt.sign(
      { id: userId, email, role: 'utilisateur' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      token,
      userId,
      user: { id: userId, name, email, address, phone, role: 'utilisateur' }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email, password); // Debug log

    // 1. Fixed admin login (robust check)
    if (
      email && password &&
      email.trim().toLowerCase() === FIXED_ADMIN_EMAIL &&
      password.trim() === FIXED_ADMIN_PASSWORD
    ) {
      console.log('Fixed admin login matched!');
      const token = jwt.sign(
        { id: 0, email: FIXED_ADMIN_EMAIL, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.json({
        success: true,
        token,
        userId: 0,
        user: {
          id: 0,
          name: 'Administrateur',
          email: FIXED_ADMIN_EMAIL,
          role: 'admin'
        }
      });
    } else {
      console.log('Fixed admin login did NOT match.');
    }

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('No user found in DB');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log('Password does not match for DB user');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { register, login };