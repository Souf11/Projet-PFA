// models/StatusHistory.js
const pool = require('../config/db');

const StatusHistory = {
  // Créer un nouvel enregistrement d'historique de statut
  create: async (statusHistoryData) => {
    const { reclamation_id, old_status, new_status, changed_by } = statusHistoryData;
    const [result] = await pool.query(
      `INSERT INTO srmdb.status_history 
      (reclamation_id, old_status, new_status, changed_by, changed_at) 
      VALUES (?, ?, ?, ?, NOW())`,
      [reclamation_id, old_status, new_status, changed_by]
    );
    return result.insertId;
  },

  // Trouver tout l'historique de statut pour une réclamation
  findByReclamationId: async (reclamationId) => {
    const [rows] = await pool.query(
      `SELECT sh.*, u.name as changed_by_name 
       FROM srmdb.status_history sh
       JOIN srmdb.users u ON sh.changed_by = u.id
       WHERE sh.reclamation_id = ?
       ORDER BY sh.changed_at DESC`,
      [reclamationId]
    );
    return rows;
  },

  // Trouver le dernier changement de statut pour une réclamation
  findLastStatusChange: async (reclamationId) => {
    const [rows] = await pool.query(
      `SELECT sh.*, u.name as changed_by_name 
       FROM srmdb.status_history sh
       JOIN srmdb.users u ON sh.changed_by = u.id
       WHERE sh.reclamation_id = ?
       ORDER BY sh.changed_at DESC
       LIMIT 1`,
      [reclamationId]
    );
    return rows[0];
  }
};

module.exports = StatusHistory;