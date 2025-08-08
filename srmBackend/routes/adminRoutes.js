const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const { requireAdmin, requireTechnicien, requireAgent } = require('../middlewares/roleAuth');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const statusHistoryController = require('../controllers/statusHistoryController');

// Créer un compte technicien (Admin seulement)
router.post('/create-technicien', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

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

    // Créer le technicien
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, 'technicien']
    );

    res.status(201).json({
      message: 'Technicien créé avec succès',
      user: {
        id: result.insertId,
        name,
        email,
        phone,
        role: 'technicien'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du technicien:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un compte utilisateur (Admin seulement)
router.post('/create-user', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password || !address) {
      return res.status(400).json({ 
        message: 'Nom, email, mot de passe et adresse requis' 
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

    // Créer l'utilisateur
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, address, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'utilisateur', address, req.body.phone || null]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: result.insertId,
        name,
        email,
        address,
        phone: req.body.phone || null,
        role: 'utilisateur'
      }
    });
  } catch (error) {
    console.error('Erreur création Utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un compte agent (Admin seulement)
router.post('/create-agent', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

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

    // Créer l'agent
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, 'agent']
    );

    res.status(201).json({
      message: 'Agent créé avec succès',
      user: {
        id: result.insertId,
        name,
        email,
        phone,
        role: 'agent'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Lister tous les utilisateurs (Admin et Techniciens)
router.get('/users', authenticate, requireTechnicien, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, address, phone, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Lister toutes les réclamations (Techniciens et Admin)
router.get('/complaints', authenticate, requireTechnicien, async (req, res) => {
  try {
    const [reclamations] = await pool.query(
      `SELECT r.*, 
       u1.name as created_by_name, u1.email as created_by_email,
       u2.name as assigned_to_name,
       c.nom as client_nom, c.telephone as client_telephone,
       ct.numero_contrat, ct.type_service
       FROM srmdb.reclamations r
       LEFT JOIN srmdb.users u1 ON r.created_by = u1.id
       LEFT JOIN srmdb.users u2 ON r.assigned_to = u2.id
       LEFT JOIN srmdb.clients c ON r.client_id = c.id
       LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
       ORDER BY r.created_at DESC`
    );

    res.json(reclamations);
  } catch (error) {
    console.error('Erreur récupération réclamations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour le statut d'une réclamation (Techniciens et Admin)
router.put('/complaints/:id/status', authenticate, requireTechnicien, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const changed_by = req.user.id; // ID de l'utilisateur qui fait la modification

    console.log('Received update request:', { id, status, response, changed_by });

    if (!status) {
      return res.status(400).json({ message: 'Statut requis' });
    }
    
    // Vérifier que le statut est valide
    const validStatuses = ['en attente', 'en cours', 'résolue', 'rejetée'];
    if (!validStatuses.includes(status)) {
      console.log('Statut invalide:', status);
      return res.status(400).json({ message: 'Statut invalide. Les valeurs autorisées sont: ' + validStatuses.join(', ') });
    }

    // Vérifier que la réclamation existe
    const [check] = await pool.query(
      'SELECT * FROM srmdb.reclamations WHERE id = ?',
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: 'Réclamation non trouvée' });
    }

    // Récupérer l'ancien statut pour l'historique
    const oldStatus = check[0].status;

    // Mettre à jour le statut et la réponse
    console.log('Executing SQL update with values:', { status, id });
    await pool.query(
      'UPDATE srmdb.reclamations SET status = ? WHERE id = ?',
      [status, id]
    );

    // Enregistrer le changement dans l'historique des statuts
    console.log('Inserting into status_history:', { id, oldStatus, status, changed_by });
    await pool.query(
      `INSERT INTO srmdb.status_history 
      (reclamation_id, old_status, new_status, changed_by, changed_at) 
      VALUES (?, ?, ?, ?, NOW())`,
      [id, oldStatus, status, changed_by]
    );

    // Récupérer la réclamation mise à jour
    const [updated] = await pool.query(
      `SELECT r.*, 
       u1.name as created_by_name, u1.email as created_by_email,
       u2.name as assigned_to_name,
       c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
       ct.numero_contrat, ct.type_service
       FROM srmdb.reclamations r
       LEFT JOIN srmdb.users u1 ON r.created_by = u1.id
       LEFT JOIN srmdb.users u2 ON r.assigned_to = u2.id
       LEFT JOIN srmdb.clients c ON r.client_id = c.id
       LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
       WHERE r.id = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Erreur mise à jour réclamation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer l'historique des statuts d'une réclamation
router.get('/complaints/:id/history', authenticate, requireTechnicien, statusHistoryController.getStatusHistory);

// Modifier un utilisateur (Admin seulement)
router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Nom et email requis' });
    }

    // Vérifier que l'utilisateur existe
    const [check] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        message: 'Un autre utilisateur avec cet email existe déjà' 
      });
    }

    // Mettre à jour l'utilisateur
    if (check[0].role === 'utilisateur') {
      // Pour les utilisateurs normaux, mettre à jour l'adresse aussi
      await pool.query(
        'UPDATE users SET name = ?, email = ?, address = ?, phone = ? WHERE id = ?',
        [name, email, address, phone || null, id]
      );
    } else {
      // Pour les techniciens et admins, ne pas mettre à jour l'adresse
      await pool.query(
        'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
        [name, email, phone || null, id]
      );
    }

    // Récupérer l'utilisateur mis à jour
    const [updatedUser] = await pool.query(
      'SELECT id, name, email, address, phone, role FROM users WHERE id = ?',
      [id]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
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

// Récupérer tous les techniciens
router.get('/users/techniciens', authenticate, requireAgent, async (req, res) => {
  try {
    console.log('Récupération des techniciens demandée par:', req.user.id, req.user.name, req.user.role);
    
    const [techniciens] = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE role = "technicien" ORDER BY name ASC'
    );
    
    console.log('Nombre de techniciens trouvés:', techniciens.length);
    console.log('Techniciens bruts:', JSON.stringify(techniciens));
    
    // Ajouter des informations supplémentaires pour l'affichage
    const techniciensPrepares = techniciens.map(tech => {
      // Extraire prénom et nom si disponible dans le champ name
      const nameParts = tech.name ? tech.name.split(' ') : [];
      const prenom = nameParts.length > 0 ? nameParts[0] : '';
      const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const displayName = tech.name || `Technicien #${tech.id}`;
      
      console.log(`Préparation du technicien ${tech.id}:`);
      console.log(` - Name original: ${tech.name}`);
      console.log(` - Prénom extrait: ${prenom}`);
      console.log(` - Nom extrait: ${nom}`);
      console.log(` - DisplayName généré: ${displayName}`);
      
      return {
        ...tech,
        // Ajouter des champs pour faciliter l'affichage
        prenom,
        nom,
        displayName
      };
    });
    
    console.log('Techniciens préparés:', JSON.stringify(techniciensPrepares));

    res.json(techniciensPrepares);
  } catch (error) {
    console.error('Erreur récupération techniciens:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer tous les agents
router.get('/users/agents', authenticate, requireTechnicien, async (req, res) => {
  try {
    const [agents] = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE role = "agent" ORDER BY name ASC'
    );

    res.json(agents);
  } catch (error) {
    console.error('Erreur récupération agents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;