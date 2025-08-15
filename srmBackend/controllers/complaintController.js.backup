// /controllers/complaintController.js
const pool = require('../config/db');
const { validateComplaint } = require('../utils/validation');
const Client = require('../models/Client');
const Contrat = require('../models/Contrat');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const StatusHistory = require('../models/StatusHistory');

const complaintController = {
  // Créer une nouvelle réclamation
  createComplaint: async (req, res) => {
    try {
      const { objet, description, client_id, contrat_id, contrat_numero, type, phone_number } = req.body;
      const created_by = req.user.id; // ID de l'utilisateur authentifié
      let finalContratId = contrat_id;
      let finalClientId = client_id;

      // Validation des données
      const { error } = validateComplaint({ objet, description });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Si un numéro de contrat est fourni, rechercher le contrat correspondant
      if (contrat_numero && !contrat_id) {
        console.log('Recherche du contrat avec numéro:', contrat_numero);
        const contrat = await Contrat.findByNumero(contrat_numero);
        
        if (!contrat) {
          return res.status(404).json({ message: 'Contrat non trouvé avec ce numéro' });
        }
        
        finalContratId = contrat.id;
        finalClientId = contrat.client_id;
        
        console.log('Contrat trouvé:', contrat);
        console.log('Client associé ID:', finalClientId);
      }
      
      // Vérifier que le client existe
      if (finalClientId) {
        const client = await Client.findById(finalClientId);
        if (!client) {
          return res.status(404).json({ message: 'Client non trouvé' });
        }
      }

      // Vérifier que le contrat existe
      if (finalContratId) {
        const contrat = await Contrat.findById(finalContratId);
        if (!contrat) {
          return res.status(404).json({ message: 'Contrat non trouvé' });
        }
      }

      // Insertion dans la base de données
      const [result] = await pool.query(
        `INSERT INTO srmdb.reclamations 
        (created_by, objet, description, contrat_id, client_id, status, created_at, type) 
        VALUES (?, ?, ?, ?, ?, 'en attente', NOW(), ?)`,
        [created_by, objet, description, finalContratId || null, finalClientId || null, type || 'standard']
      );

      // Récupération de la réclamation créée
      const [rows] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ?',
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
      const created_by = req.user.id;
      
      const [reclamations] = await pool.query(
        `SELECT r.*, u.name as assigned_to_name, 
         c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
         ct.numero_contrat, ct.type_service
         FROM srmdb.reclamations r
         LEFT JOIN srmdb.users u ON r.assigned_to = u.id
         LEFT JOIN srmdb.clients c ON r.client_id = c.id
         LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
         WHERE r.created_by = ?
         ORDER BY r.created_at DESC`,
        [created_by]
      );

      res.json(reclamations);
    } catch (error) {
      console.error('Erreur récupération réclamations:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Obtenir une réclamation spécifique
  getComplaintById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Vérifier si l'utilisateur est admin ou agent
      if (userRole === 'admin' || userRole === 'agent') {
        const [rows] = await pool.query(
          `SELECT r.*, u.name as assigned_to_name, 
           c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
           ct.numero_contrat, ct.type_service
           FROM srmdb.reclamations r
           LEFT JOIN srmdb.users u ON r.assigned_to = u.id
           LEFT JOIN srmdb.clients c ON r.client_id = c.id
           LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
           WHERE r.id = ?`,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Réclamation non trouvée' });
        }

        return res.json(rows[0]);
      }
      
      // Vérifier si l'utilisateur est le créateur de la réclamation
      const [creatorRows] = await pool.query(
        `SELECT r.*, u.name as assigned_to_name, 
         c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
         ct.numero_contrat, ct.type_service
         FROM srmdb.reclamations r
         LEFT JOIN srmdb.users u ON r.assigned_to = u.id
         LEFT JOIN srmdb.clients c ON r.client_id = c.id
         LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
         WHERE r.id = ? AND r.created_by = ?`,
        [id, userId]
      );

      if (creatorRows.length > 0) {
        return res.json(creatorRows[0]);
      }
      
      // Vérifier si l'utilisateur est le technicien assigné à la réclamation
      const [assignedRows] = await pool.query(
        `SELECT r.*, u.name as assigned_to_name, 
         c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
         ct.numero_contrat, ct.type_service
         FROM srmdb.reclamations r
         LEFT JOIN srmdb.users u ON r.assigned_to = u.id
         LEFT JOIN srmdb.clients c ON r.client_id = c.id
         LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
         WHERE r.id = ? AND r.assigned_to = ?`,
        [id, userId]
      );

      if (assignedRows.length > 0) {
        return res.json(assignedRows[0]);
      }
      
      // Vérifier si l'utilisateur est un technicien assigné à une demande liée à cette réclamation
      if (userRole === 'technicien') {
        const [demandeRows] = await pool.query(
          `SELECT r.*, u.name as assigned_to_name, 
           c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
           ct.numero_contrat, ct.type_service
           FROM srmdb.reclamations r
           JOIN srmdb.demandes d ON r.id = d.reclamation_id
           LEFT JOIN srmdb.users u ON r.assigned_to = u.id
           LEFT JOIN srmdb.clients c ON r.client_id = c.id
           LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
           WHERE r.id = ? AND d.technicien_assigne_id = ?`,
          [id, userId]
        );

        if (demandeRows.length > 0) {
          return res.json(demandeRows[0]);
        }
      }

      // Si l'utilisateur n'a pas accès à cette réclamation
      return res.status(403).json({ message: 'Accès non autorisé à cette réclamation' });
    } catch (error) {
      console.error('Erreur récupération réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour une réclamation
  updateComplaint: async (req, res) => {
    try {
      const { id } = req.params;
      const created_by = req.user.id;
      const { description } = req.body;

      // Vérifier que la réclamation appartient à l'utilisateur
      const [check] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ? AND created_by = ?',
        [id, created_by]
      );

      if (check.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      // Mise à jour uniquement si le statut est "en attente"
      if (check[0].status !== 'en attente') {
        return res.status(400).json({ message: 'Seules les réclamations en attente peuvent être modifiées' });
      }

      // Mettre à jour la description
      await pool.query(
        'UPDATE srmdb.reclamations SET description = ? WHERE id = ?',
        [description, id]
      );

      // Récupérer la réclamation mise à jour
      const [updated] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ?',
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
      const created_by = req.user.id;

      // Vérifier que la réclamation appartient à l'utilisateur
      const [check] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ? AND created_by = ?',
        [id, created_by]
      );

      if (check.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      // Suppression
      await pool.query(
        'DELETE FROM srmdb.reclamations WHERE id = ?',
        [id]
      );

      res.status(204).send();
    } catch (error) {
      console.error('Erreur suppression réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Affecter une réclamation à un technicien (pour les agents)
  assignComplaint: async (req, res) => {
    try {
      const { id } = req.params;
      const { technicien_id } = req.body;
      const agent_id = req.user.id;

      // Vérifier que l'utilisateur est un agent
      if (req.user.role !== 'agent' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Seuls les agents peuvent affecter des réclamations' });
      }

      // Vérifier que la réclamation existe
      const [reclamation] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ?',
        [id]
      );

      if (reclamation.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      // Vérifier que le technicien existe et a le rôle technicien
      const [technicien] = await pool.query(
        'SELECT * FROM srmdb.users WHERE id = ? AND role = "technicien"',
        [technicien_id]
      );

      if (technicien.length === 0) {
        return res.status(404).json({ message: 'Technicien non trouvé' });
      }

      // Mettre à jour la réclamation avec le technicien assigné
      const oldStatus = reclamation[0].status;
      const newStatus = 'en cours';

      await pool.query(
        'UPDATE srmdb.reclamations SET assigned_to = ?, status = ? WHERE id = ?',
        [technicien_id, newStatus, id]
      );

      // Enregistrer le changement de statut dans l'historique
      await StatusHistory.create({
        reclamation_id: id,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: agent_id
      });

      // Récupérer la réclamation mise à jour avec toutes les informations du client
      const [updated] = await pool.query(
        `SELECT r.*, u1.name as created_by_name, u2.name as assigned_to_name,
         c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
         ct.numero_contrat, ct.type_service
         FROM srmdb.reclamations r
         JOIN srmdb.users u1 ON r.created_by = u1.id
         LEFT JOIN srmdb.users u2 ON r.assigned_to = u2.id
         LEFT JOIN srmdb.clients c ON r.client_id = c.id
         LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
         WHERE r.id = ?`,
        [id]
      );

      res.json(updated[0]);
    } catch (error) {
      console.error('Erreur affectation réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour le statut d'une réclamation
  updateComplaintStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user_id = req.user.id;

      // Vérifier que la réclamation existe
      const [reclamation] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ?',
        [id]
      );

      if (reclamation.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      // Vérifier que l'utilisateur est autorisé à mettre à jour le statut
      if (req.user.role !== 'admin' && req.user.role !== 'agent' && 
          (req.user.role === 'technicien' && reclamation[0].assigned_to !== user_id)) {
        return res.status(403).json({ message: 'Non autorisé à mettre à jour cette réclamation' });
      }

      // Mettre à jour le statut
      const oldStatus = reclamation[0].status;
      await pool.query(
        'UPDATE srmdb.reclamations SET status = ? WHERE id = ?',
        [status, id]
      );

      // Enregistrer le changement de statut dans l'historique
      await StatusHistory.create({
        reclamation_id: id,
        old_status: oldStatus,
        new_status: status,
        changed_by: user_id
      });

      // Récupérer la réclamation mise à jour avec toutes les informations du client
      const [updated] = await pool.query(
        `SELECT r.*, u1.name as created_by_name, u2.name as assigned_to_name,
         c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
         ct.numero_contrat, ct.type_service
         FROM srmdb.reclamations r
         JOIN srmdb.users u1 ON r.created_by = u1.id
         LEFT JOIN srmdb.users u2 ON r.assigned_to = u2.id
         LEFT JOIN srmdb.clients c ON r.client_id = c.id
         LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
         WHERE r.id = ?`,
        [id]
      );

      res.json(updated[0]);
    } catch (error) {
      console.error('Erreur mise à jour statut réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Lister toutes les réclamations (pour admin et agents)
  getAllComplaintsAdmin: async (req, res) => {
    try {
      const { status, client_id } = req.query;
      
      // Vérifier que l'utilisateur est un admin ou un agent
      if (req.user.role !== 'admin' && req.user.role !== 'agent') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      // Récupérer toutes les réclamations avec filtres optionnels
      const reclamations = await Complaint.findAll(status, client_id);

      res.json(reclamations);
    } catch (error) {
      console.error('Erreur récupération réclamations:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Lister toutes les réclamations assignées à un technicien
  getTechnicienComplaints: async (req, res) => {
    try {
      const technicien_id = req.user.id;
      
      // Vérifier que l'utilisateur est un technicien
      if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      // Récupérer les réclamations assignées au technicien
      const reclamations = await Complaint.findByTechnicianId(technicien_id);

      res.json(reclamations);
    } catch (error) {
      console.error('Erreur récupération réclamations technicien:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  
  // Lister toutes les réclamations liées aux demandes assignées à un technicien
  getTechnicienDemandeReclamations: async (req, res) => {
    try {
      const technicien_id = req.user.id;
      
      // Vérifier que l'utilisateur est un technicien
      if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      // Récupérer les réclamations liées aux demandes assignées au technicien
      const reclamations = await Complaint.findByAssignedDemandesForTechnician(technicien_id);

      res.json(reclamations);
    } catch (error) {
      console.error('Erreur récupération réclamations liées aux demandes:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = complaintController;
