// controllers/contratController.js
const Contrat = require('../models/Contrat');
const Client = require('../models/Client');
const pool = require('../config/db');

const contratController = {
  // Créer un nouveau contrat
  createContrat: async (req, res) => {
    try {
      const { client_id, type_service, numero_contrat } = req.body;

      // Validation des données
      if (!client_id || !type_service || !numero_contrat) {
        return res.status(400).json({ message: 'Client, type de service et numéro de contrat sont requis' });
      }

      // Vérifier que le client existe
      const client = await Client.findById(client_id);
      if (!client) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }

      // Vérifier si le numéro de contrat existe déjà
      const existingContrat = await Contrat.findByNumero(numero_contrat);
      if (existingContrat) {
        return res.status(400).json({ message: 'Ce numéro de contrat existe déjà' });
      }

      // Créer le contrat
      const contratId = await Contrat.create({
        client_id,
        type_service,
        numero_contrat
      });

      // Récupérer le contrat créé
      const contrat = await Contrat.findById(contratId);

      res.status(201).json(contrat);
    } catch (error) {
      console.error('Erreur création contrat:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Obtenir un contrat par son ID
  getContratById: async (req, res) => {
    try {
      const { id } = req.params;

      const contrat = await Contrat.findById(id);

      if (!contrat) {
        return res.status(404).json({ message: 'Contrat non trouvé' });
      }

      res.json(contrat);
    } catch (error) {
      console.error('Erreur récupération contrat:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Obtenir un contrat par son numéro
  getContratByNumero: async (req, res) => {
    try {
      const { numero } = req.params;

      const contrat = await Contrat.findByNumero(numero);

      if (!contrat) {
        return res.status(404).json({ message: 'Contrat non trouvé' });
      }

      res.json(contrat);
    } catch (error) {
      console.error('Erreur récupération contrat:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour un contrat
  updateContrat: async (req, res) => {
    try {
      const { id } = req.params;
      const { type_service, numero_contrat } = req.body;

      // Validation des données
      if (!type_service || !numero_contrat) {
        return res.status(400).json({ message: 'Type de service et numéro de contrat sont requis' });
      }

      // Vérifier que le contrat existe
      const contrat = await Contrat.findById(id);

      if (!contrat) {
        return res.status(404).json({ message: 'Contrat non trouvé' });
      }

      // Vérifier si un autre contrat utilise déjà ce numéro
      if (numero_contrat !== contrat.numero_contrat) {
        const existingContrat = await Contrat.findByNumero(numero_contrat);
        if (existingContrat && existingContrat.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Ce numéro de contrat est déjà utilisé' });
        }
      }

      // Mettre à jour le contrat
      await Contrat.update(id, {
        type_service,
        numero_contrat
      });

      // Récupérer le contrat mis à jour
      const updatedContrat = await Contrat.findById(id);

      res.json(updatedContrat);
    } catch (error) {
      console.error('Erreur mise à jour contrat:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Lister tous les contrats
  getAllContrats: async (req, res) => {
    try {
      const contrats = await Contrat.findAll();

      res.json(contrats);
    } catch (error) {
      console.error('Erreur récupération contrats:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Lister tous les contrats d'un client
  getContratsByClientId: async (req, res) => {
    try {
      const { clientId } = req.params;

      // Vérifier que le client existe
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }

      const contrats = await Contrat.findByClientId(clientId);

      res.json(contrats);
    } catch (error) {
      console.error('Erreur récupération contrats:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  
  // Récupérer les réclamations associées à un contrat
  getReclamationsByContratId: async (req, res) => {
    try {
      const { id } = req.params;

      // Vérifier que le contrat existe
      const contrat = await Contrat.findById(id);
      if (!contrat) {
        return res.status(404).json({ message: 'Contrat non trouvé' });
      }

      // Récupérer les réclamations associées au contrat
      const [reclamations] = await pool.query(
        `SELECT r.*, u1.name as created_by_name, u2.name as assigned_to_name, 
         c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse
         FROM srmdb.reclamations r
         JOIN srmdb.users u1 ON r.created_by = u1.id
         LEFT JOIN srmdb.users u2 ON r.assigned_to = u2.id
         LEFT JOIN srmdb.clients c ON r.client_id = c.id
         WHERE r.contrat_id = ?
         ORDER BY r.created_at DESC`,
        [id]
      );

      res.json(reclamations);
    } catch (error) {
      console.error('Erreur récupération réclamations:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = contratController;