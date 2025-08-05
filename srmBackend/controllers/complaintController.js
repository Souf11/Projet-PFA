// /controllers/complaintController.js
const pool = require('../config/db');
const { validateComplaint } = require('../utils/validation');

const complaintController = {
  // Créer une nouvelle réclamation
  createComplaint: async (req, res) => {
    try {
      const { invoice_id, type, subject, description, phone_number } = req.body;
      const user_id = req.user.id; // ID de l'utilisateur authentifié

      // Validation des données
      const { error } = validateComplaint({ type, subject, description });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Vérifier si invoice_id est fourni et valide
      let finalInvoiceId = null;
      if (invoice_id && invoice_id !== '') {
        // Vérifier si l'invoice existe
        const [invoiceCheck] = await pool.query(
          'SELECT id FROM invoices WHERE id = ?',
          [invoice_id]
        );
        
        if (invoiceCheck.length === 0) {
          return res.status(400).json({ 
            message: 'Invoice ID invalide ou inexistant' 
          });
        }
        finalInvoiceId = invoice_id;
      }

      // Insertion dans la base de données
      const [result] = await pool.query(
        `INSERT INTO complaints 
        (user_id, invoice_id, type, subject, description, phone_number, status) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [user_id, finalInvoiceId, type, subject, description, phone_number || null]
      );

      // Récupération de la réclamation créée
      const [rows] = await pool.query(
        'SELECT * FROM complaints WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Erreur création réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Lister toutes les réclamations de l'utilisateur
  getAllComplaints: async (req, res) => {
    try {
      const user_id = req.user.id;
      
      const [complaints] = await pool.query(
        `SELECT c.*, i.invoice_number 
         FROM complaints c
         LEFT JOIN invoices i ON c.invoice_id = i.id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC`,
        [user_id]
      );

      res.json(complaints);
    } catch (error) {
      console.error('Erreur récupération réclamations:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Obtenir une réclamation spécifique
  getComplaintById: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const [rows] = await pool.query(
        `SELECT c.*, i.invoice_number 
         FROM complaints c
         LEFT JOIN invoices i ON c.invoice_id = i.id
         WHERE c.id = ? AND c.user_id = ?`,
        [id, user_id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Erreur récupération réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour une réclamation
  updateComplaint: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      const { description } = req.body;

      // Vérifier que la réclamation appartient à l'utilisateur
      const [check] = await pool.query(
        'SELECT * FROM complaints WHERE id = ? AND user_id = ?',
        [id, user_id]
      );

      if (check.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      // Mise à jour uniquement si le statut est "pending"
      if (check[0].status !== 'pending') {
        return res.status(400).json({ message: 'Seules les réclamations en attente peuvent être modifiées' });
      }

      // Mettre à jour la description
      await pool.query(
        'UPDATE complaints SET description = ? WHERE id = ?',
        [description, id]
      );

      // Récupérer la réclamation mise à jour
      const [updated] = await pool.query(
        'SELECT * FROM complaints WHERE id = ?',
        [id]
      );

      res.json(updated[0]);
    } catch (error) {
      console.error('Erreur mise à jour réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Supprimer une réclamation
  deleteComplaint: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Vérifier que la réclamation appartient à l'utilisateur
      const [check] = await pool.query(
        'SELECT * FROM complaints WHERE id = ? AND user_id = ?',
        [id, user_id]
      );

      if (check.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      // Suppression
      await pool.query(
        'DELETE FROM complaints WHERE id = ?',
        [id]
      );

      res.status(204).send();
    } catch (error) {
      console.error('Erreur suppression réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = complaintController;
