// controllers/clientController.js
const Client = require('../models/Client');
const Contrat = require('../models/Contrat');
const { validateClient } = require('../utils/validation');

const clientController = {
  // Créer un nouveau client
  createClient: async (req, res) => {
    try {
      const { nom, adresse, telephone } = req.body;

      // Validation des données
      const { error } = validateClient({ nom, adresse, telephone });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Vérifier si le client existe déjà avec ce téléphone
      const existingClient = await Client.findByTelephone(telephone);
      if (existingClient) {
        return res.status(400).json({ message: 'Un client avec ce numéro de téléphone existe déjà' });
      }

      // Créer le client
      const clientId = await Client.create({
        nom,
        adresse,
        telephone
      });

      // Récupérer le client créé
      const client = await Client.findById(clientId);

      res.status(201).json(client);
    } catch (error) {
      console.error('Erreur création client:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Obtenir un client par son ID
  getClientById: async (req, res) => {
    try {
      const { id } = req.params;

      const client = await Client.findById(id);

      if (!client) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }

      // Récupérer les contrats du client
      const contrats = await Contrat.findByClientId(id);

      res.json({
        ...client,
        contrats
      });
    } catch (error) {
      console.error('Erreur récupération client:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Rechercher des clients par nom
  searchClients: async (req, res) => {
    try {
      const { nom, telephone } = req.query;

      let clients = [];

      if (telephone) {
        const client = await Client.findByTelephone(telephone);
        if (client) {
          clients = [client];
        }
      } else if (nom) {
        clients = await Client.findByNom(nom);
      } else {
        return res.status(400).json({ message: 'Veuillez fournir un nom ou un téléphone pour la recherche' });
      }

      res.json(clients);
    } catch (error) {
      console.error('Erreur recherche clients:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour un client
  updateClient: async (req, res) => {
    try {
      const { id } = req.params;
      const { nom, adresse, telephone } = req.body;

      // Validation des données
      if (!nom || !telephone) {
        return res.status(400).json({ message: 'Nom et téléphone sont requis' });
      }

      // Vérifier que le client existe
      const client = await Client.findById(id);

      if (!client) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }

      // Vérifier si un autre client utilise déjà ce téléphone
      if (telephone !== client.telephone) {
        const existingClient = await Client.findByTelephone(telephone);
        if (existingClient && existingClient.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Un autre client utilise déjà ce numéro de téléphone' });
        }
      }

      // Mettre à jour le client
      await Client.update(id, {
        nom,
        adresse,
        telephone
      });

      // Récupérer le client mis à jour
      const updatedClient = await Client.findById(id);

      res.json(updatedClient);
    } catch (error) {
      console.error('Erreur mise à jour client:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Lister tous les clients
  getAllClients: async (req, res) => {
    try {
      const clients = await Client.findAll();

      res.json(clients);
    } catch (error) {
      console.error('Erreur récupération clients:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = clientController;