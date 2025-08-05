const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authenticate = require('../middlewares/auth');

// Créer une nouvelle réclamation
router.post('/', authenticate, complaintController.createComplaint);

// Lister toutes les réclamations de l'utilisateur
router.get('/', authenticate, complaintController.getAllComplaints);

// Obtenir les détails d'une réclamation spécifique
router.get('/:id', authenticate, complaintController.getComplaintById);

// Mettre à jour une réclamation
router.put('/:id', authenticate, complaintController.updateComplaint);

// Supprimer une réclamation
router.delete('/:id', authenticate, complaintController.deleteComplaint);

module.exports = router;
