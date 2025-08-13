const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authenticate = require('../middlewares/auth');
const { requireAdmin, requireAgent, requireTechnicien } = require('../middlewares/roleAuth');
const pool = require('../config/db');
const statusHistoryController = require('../controllers/statusHistoryController');

// Routes spécifiques (doivent être définies avant les routes paramétrées)

// Routes pour les agents et admins
// Lister toutes les réclamations (admin et agents)
router.get('/admin/all', authenticate, requireAgent, complaintController.getAllComplaintsAdmin);

// Routes pour les techniciens
// Lister toutes les réclamations assignées à un technicien
router.get('/technicien/assigned', authenticate, requireTechnicien, complaintController.getTechnicienComplaints);

// Lister toutes les réclamations liées aux demandes assignées à un technicien
router.get('/technicien/demandes-reclamations', authenticate, requireTechnicien, complaintController.getTechnicienDemandeReclamations);

// Routes générales

// Créer une nouvelle réclamation
router.post('/', authenticate, complaintController.createComplaint);

// Lister toutes les réclamations de l'utilisateur
router.get('/', authenticate, complaintController.getAllComplaints);

// Routes paramétrées

// Obtenir l'historique des statuts d'une réclamation
router.get('/:id/status-history', authenticate, statusHistoryController.getStatusHistory);

// Affecter une réclamation à un technicien
router.put('/:id/assign', authenticate, requireAgent, complaintController.assignComplaint);

// Mettre à jour le statut d'une réclamation
router.put('/:id/status', authenticate, complaintController.updateComplaintStatus);

// Obtenir les détails d'une réclamation spécifique
router.get('/:id', authenticate, complaintController.getComplaintById);

// Mettre à jour une réclamation
router.put('/:id', authenticate, complaintController.updateComplaint);

// Supprimer une réclamation
router.delete('/:id', authenticate, complaintController.deleteComplaint);

module.exports = router;
