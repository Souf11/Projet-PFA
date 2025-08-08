// routes/demandeRoutes.js
const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const authenticate = require('../middlewares/auth');
const { requireAdmin, requireTechnicien } = require('../middlewares/roleAuth');

// Routes pour les demandes de techniciens

// Créer une nouvelle demande (techniciens uniquement)
router.post('/', authenticate, requireTechnicien, demandeController.createDemande);

// Lister toutes les demandes du technicien connecté
router.get('/mes-demandes', authenticate, requireTechnicien, demandeController.getTechnicienDemandes);

// Obtenir une demande spécifique
router.get('/:id', authenticate, demandeController.getDemandeById);

// Mettre à jour le statut d'une demande
router.put('/:id/status', authenticate, demandeController.updateDemandeStatus);

// Lister toutes les demandes (admin uniquement)
router.get('/', authenticate, requireAdmin, demandeController.getAllDemandes);

module.exports = router;