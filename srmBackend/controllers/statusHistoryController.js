// controllers/statusHistoryController.js
const pool = require('../config/db');
const StatusHistory = require('../models/StatusHistory');

const statusHistoryController = {
  // Récupérer l'historique des statuts d'une réclamation
  getStatusHistory: async (req, res) => {
    try {
      const { id } = req.params; // ID de la réclamation
      
      // Vérifier que la réclamation existe
      const [reclamation] = await pool.query(
        'SELECT * FROM srmdb.reclamations WHERE id = ?',
        [id]
      );

      if (reclamation.length === 0) {
        return res.status(404).json({ message: 'Réclamation non trouvée' });
      }

      // Récupérer l'historique des statuts
      const statusHistory = await StatusHistory.findByReclamationId(id);
      
      res.json(statusHistory);
    } catch (error) {
      console.error('Erreur récupération historique des statuts:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = statusHistoryController;