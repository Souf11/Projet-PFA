// models/ReclamationTechnicien.js
const pool = require('../config/db');

const ReclamationTechnicien = {
  // Ajouter un technicien supplémentaire à une réclamation
  addTechnicien: async (reclamationId, technicienId, addedBy) => {
    console.log(`Tentative d'ajout du technicien ${technicienId} à la réclamation ${reclamationId} par ${addedBy}`);
    try {
      // Vérifier si l'entrée existe déjà
      const [existing] = await pool.query(
        `SELECT * FROM srmdb.reclamation_techniciens 
         WHERE reclamation_id = ? AND technicien_id = ?`,
        [reclamationId, technicienId]
      );
      
      if (existing.length > 0) {
        console.log(`Le technicien ${technicienId} est déjà associé à la réclamation ${reclamationId}`);
        return null;
      }
      
      const [result] = await pool.query(
        `INSERT INTO srmdb.reclamation_techniciens 
        (reclamation_id, technicien_id, added_by, added_at) 
        VALUES (?, ?, ?, NOW())`,
        [reclamationId, technicienId, addedBy]
      );
      console.log(`Technicien ${technicienId} ajouté avec succès à la réclamation ${reclamationId}, ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      // Si le technicien est déjà assigné, on ignore l'erreur de duplicate
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`Erreur de duplication ignorée: Le technicien ${technicienId} est déjà associé à la réclamation ${reclamationId}`);
        return null;
      }
      console.error(`Erreur lors de l'ajout du technicien ${technicienId} à la réclamation ${reclamationId}:`, error);
      throw error;
    }
  },

  // Récupérer tous les techniciens assignés à une réclamation
  getTechniciensByReclamationId: async (reclamationId) => {
    const [rows] = await pool.query(
      `SELECT rt.*, u.name, u.email, u.role 
       FROM srmdb.reclamation_techniciens rt
       JOIN srmdb.users u ON rt.technicien_id = u.id
       WHERE rt.reclamation_id = ?`,
      [reclamationId]
    );
    return rows;
  },

  // Récupérer toutes les réclamations assignées à un technicien (y compris via la table reclamation_techniciens)
  getReclamationsByTechnicienId: async (technicienId) => {
    console.log(`ReclamationTechnicien: Recherche des réclamations pour le technicien ${technicienId}`);
    
    // Vérifier d'abord si le technicien est présent dans la table reclamation_techniciens
    const [techCheck] = await pool.query(
      `SELECT * FROM srmdb.reclamation_techniciens WHERE technicien_id = ?`,
      [technicienId]
    );
    console.log(`ReclamationTechnicien: Nombre d'entrées dans reclamation_techniciens pour ce technicien: ${techCheck.length}`);
    
    const [rows] = await pool.query(
      `SELECT DISTINCT r.* 
       FROM srmdb.reclamations r
       LEFT JOIN srmdb.reclamation_techniciens rt ON r.id = rt.reclamation_id
       WHERE r.assigned_to = ? OR rt.technicien_id = ?`,
      [technicienId, technicienId]
    );
    console.log(`ReclamationTechnicien: Nombre de réclamations trouvées: ${rows.length}`);
    return rows;
  },

  // Supprimer un technicien supplémentaire d'une réclamation
  removeTechnicien: async (reclamationId, technicienId) => {
    const [result] = await pool.query(
      `DELETE FROM srmdb.reclamation_techniciens 
       WHERE reclamation_id = ? AND technicien_id = ?`,
      [reclamationId, technicienId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = ReclamationTechnicien;