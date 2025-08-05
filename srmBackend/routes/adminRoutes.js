const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const { requireAdmin, requireCollaborator } = require('../middlewares/roleAuth');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Créer un compte collaborateur (Admin seulement)
router.post('/create-collaborator', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Nom, email et mot de passe requis' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        message: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer le collaborateur
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'collaborator']
    );

    res.status(201).json({
      message: 'Collaborateur créé avec succès',
      user: {
        id: result.insertId,
        name,
        email,
        role: 'collaborator'
      }
    });

  } catch (error) {
    console.error('Erreur création collaborateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Lister tous les utilisateurs (Admin et Collaborateurs)
router.get('/users', authenticate, requireCollaborator, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Lister toutes les réclamations (Collaborateurs et Admin)
router.get('/complaints', authenticate, requireCollaborator, async (req, res) => {
  try {
    const [complaints] = await pool.query(
      `SELECT c.*, u.name as user_name, u.email as user_email, i.invoice_number 
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN invoices i ON c.invoice_id = i.id
       ORDER BY c.created_at DESC`
    );

    res.json(complaints);
  } catch (error) {
    console.error('Erreur récupération réclamations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour le statut d'une réclamation (Collaborateurs et Admin)
router.put('/complaints/:id/status', authenticate, requireCollaborator, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Statut requis' });
    }

    // Vérifier que la réclamation existe
    const [check] = await pool.query(
      'SELECT * FROM complaints WHERE id = ?',
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: 'Réclamation non trouvée' });
    }

    // Mettre à jour le statut et la réponse
    await pool.query(
      'UPDATE complaints SET status = ?, response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, response || null, id]
    );

    // Récupérer la réclamation mise à jour
    const [updated] = await pool.query(
      `SELECT c.*, u.name as user_name, u.email as user_email, i.invoice_number 
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN invoices i ON c.invoice_id = i.id
       WHERE c.id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Erreur mise à jour réclamation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un utilisateur (Admin seulement)
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const [check] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression d'un admin
    if (check[0].role === 'admin') {
      return res.status(403).json({ 
        message: 'Impossible de supprimer un administrateur' 
      });
    }

    // Supprimer l'utilisateur
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 