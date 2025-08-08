// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const contratController = require('../controllers/contratController');
const complaintController = require('../controllers/complaintController');
const authenticate = require('../middlewares/auth');
const { requireAdmin, requireTechnicien } = require('../middlewares/roleAuth');

// Routes pour les clients

// Créer un nouveau client (agents du centre d'appel et admin)
router.post('/', authenticate, clientController.createClient);

// Obtenir un client par son ID
router.get('/:id', authenticate, clientController.getClientById);

// Rechercher des clients par nom ou téléphone
router.get('/', authenticate, clientController.searchClients);

// Mettre à jour un client (admin uniquement)
router.put('/:id', authenticate, requireAdmin, clientController.updateClient);

// Lister tous les clients (admin et techniciens)
router.get('/all/list', authenticate, requireTechnicien, clientController.getAllClients);

// Routes pour les contrats

// Créer un nouveau contrat
router.post('/:clientId/contrats', authenticate, (req, res, next) => {
  req.body.client_id = req.params.clientId;
  next();
}, contratController.createContrat);

// Obtenir un contrat par son ID
router.get('/contrats/:id', authenticate, contratController.getContratById);

// Obtenir un contrat par son numéro
router.get('/contrats/numero/:numero', authenticate, contratController.getContratByNumero);

// Mettre à jour un contrat (admin uniquement)
router.put('/contrats/:id', authenticate, requireAdmin, contratController.updateContrat);

// Lister tous les contrats d'un client
router.get('/:clientId/contrats', authenticate, contratController.getContratsByClientId);

// Lister tous les contrats (admin et techniciens)
router.get('/contrats/all/list', authenticate, requireTechnicien, contratController.getAllContrats);

// Récupérer les réclamations associées à un contrat
router.get('/contrats/:id/reclamations', authenticate, contratController.getReclamationsByContratId);

// Récupérer les réclamations associées à un client
router.get('/:clientId/reclamations', authenticate, (req, res, next) => {
  req.query.client_id = req.params.clientId;
  next();
}, complaintController.getAllComplaintsAdmin);

module.exports = router;