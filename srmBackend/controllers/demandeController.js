// controllers/demandeController.js
const pool = require('../config/db');
const Demande = require('../models/Demande');

const demandeController = {
  // Créer une nouvelle demande
  createDemande: async (req, res) => {
    try {
      const { reclamation_id, type_demande, description, materiel_demande } = req.body;
      const demandeur_id = req.user.id; // ID du technicien authentifié

      // Validation des données
      if (!reclamation_id || !type_demande || !description) {
        return res.status(400).json({ message: 'Réclamation, type de demande et description sont requis' });
      }

      // Vérifier que la réclamation existe
      const [reclamation] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ?',
        [reclamation_id]
      );

      if (reclamation.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      // Vérifier que l'utilisateur est un technicien
      if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Seuls les techniciens peuvent créer des demandes' });
      }

      // Créer la demande
      const demandeId = await Demande.create({
        reclamation_id,
        demandeur_id,
        type_demande,
        description,
        materiel_demande: type_demande === 'materiel' ? materiel_demande : null
      });

      // Récupérer la demande créée
      const demande = await Demande.findById(demandeId);

      res.status(201).json(demande);
    } catch (error) {
      console.error('Erreur création demande:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Lister toutes les demandes créées par le technicien
  getTechnicienDemandes: async (req, res) => {
    try {
      const technicienId = req.user.id;
      
      const demandes = await Demande.findByTechnicienId(technicienId);

      res.json(demandes);
    } catch (error) {
      console.error('Erreur récupération demandes:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  
  // Lister toutes les demandes assignées au technicien
  getAssignedDemandes: async (req, res) => {
    try {
      const technicienId = req.user.id;
      
      // Vérifier que l'utilisateur est un technicien
      if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      
      const demandes = await Demande.findByAssignedTechnicienId(technicienId);

      res.json(demandes);
    } catch (error) {
      console.error('Erreur récupération demandes assignées:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Obtenir une demande spécifique
  getDemandeById: async (req, res) => {
    try {
      const { id } = req.params;

      const demande = await Demande.findById(id);

      if (!demande) {
        return res.status(404).json({ message: 'Demande non trouvée' });
      }

      // Vérifier que l'utilisateur est autorisé à voir cette demande
      // Un utilisateur peut voir une demande s'il est admin, le créateur de la demande, ou le technicien assigné
      if (req.user.role !== 'admin' && req.user.id !== demande.demandeur_id && req.user.id !== demande.technicien_assigne_id) {
        return res.status(403).json({ message: 'Accès non autorisé à cette demande' });
      }

      res.json(demande);
    } catch (error) {
      console.error('Erreur récupération demande:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour le statut d'une demande
  updateDemandeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, technicien_assigne_id, reponse } = req.body;
      const agent_id = req.user.id;

      // Validation des données
      if (!status) {
        return res.status(400).json({ message: 'Statut requis' });
      }

      // Vérifier que la demande existe
      const demande = await Demande.findById(id);

      if (!demande) {
        return res.status(404).json({ message: 'Demande non trouvée' });
      }

      // Vérifier que l'utilisateur est autorisé à mettre à jour cette demande
      if (req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.id !== demande.demandeur_id) {
        return res.status(403).json({ message: 'Accès non autorisé pour mettre à jour cette demande' });
      }

      // Mettre à jour le statut
      await Demande.updateStatus(id, status, technicien_assigne_id);

      // Ajouter une réponse si fournie
      if (reponse) {
        await Demande.addResponse(id, reponse);
      }
      
      // Si c'est une demande d'assistance technicien et qu'on assigne un technicien,
      // on ajoute le technicien à la table reclamation_techniciens pour qu'il puisse voir la réclamation
      if (demande.type_demande === 'assistance_technicien' && technicien_assigne_id && demande.reclamation_id) {
        try {
          // Importer le modèle ReclamationTechnicien
          const ReclamationTechnicien = require('../models/ReclamationTechnicien');
          
          // Ajouter le technicien à la liste des techniciens assignés à cette réclamation
          await ReclamationTechnicien.addTechnicien(
            demande.reclamation_id,
            technicien_assigne_id,
            agent_id
          );
        } catch (error) {
          console.error('Erreur lors de l\'ajout du technicien à la réclamation:', error);
          // On continue même si l'ajout échoue
        }
      }

      // Récupérer la demande mise à jour
      const updatedDemande = await Demande.findById(id);

      res.json(updatedDemande);
    } catch (error) {
      console.error('Erreur mise à jour demande:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Lister toutes les demandes (admin)
  getAllDemandes: async (req, res) => {
    try {
      const { status } = req.query;
      
      const demandes = await Demande.findAll(status);

      res.json(demandes);
    } catch (error) {
      console.error('Erreur récupération demandes:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  
  // Obtenir les demandes pour une réclamation spécifique
  getDemandesByReclamationId: async (req, res) => {
    try {
      const { reclamationId } = req.params;
      
      // Vérifier que la réclamation existe
      const [reclamation] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ?',
        [reclamationId]
      );

      if (reclamation.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }
      
      const demandes = await Demande.findByReclamationId(reclamationId);

      res.json(demandes);
    } catch (error) {
      console.error('Erreur récupération demandes par réclamation:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = demandeController;