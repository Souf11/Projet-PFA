// routes/demandeRoutes.js
const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const authenticate = require('../middlewares/auth');
const { requireAdmin, requireTechnicien, roleAuth, requireAgent } = require('../middlewares/roleAuth');

// Routes pour les demandes de techniciens

// Créer une nouvelle demande (techniciens uniquement)
router.post('/', authenticate, requireTechnicien, demandeController.createDemande);

// Lister toutes les demandes créées par le technicien connecté
router.get('/mes-demandes', authenticate, requireTechnicien, demandeController.getTechnicienDemandes);

// Lister toutes les demandes assignées au technicien connecté
router.get('/assignees', authenticate, requireTechnicien, demandeController.getAssignedDemandes);

// Obtenir les demandes pour une réclamation spécifique
router.get('/reclamation/:reclamationId', authenticate, demandeController.getDemandesByReclamationId);

// Obtenir une demande spécifique
router.get('/:id', authenticate, demandeController.getDemandeById);

// Mettre à jour le statut d'une demande
router.put('/:id/status', authenticate, demandeController.updateDemandeStatus);

// Lister toutes les demandes (admin et agent)
router.get('/', authenticate, requireAgent, demandeController.getAllDemandes);

module.exports = router;