// models/Complaint.js
const pool = require('../config/db');

const Complaint = {
  // Créer une nouvelle réclamation
  create: async (complaintData) => {
    const { created_by, objet, description, contrat_id, client_id, type } = complaintData;
    const [result] = await pool.query(
      `INSERT INTO srmdb.reclamations 
      (created_by, objet, description, status, created_at, contrat_id, client_id, type) 
      VALUES (?, ?, ?, 'en attente', NOW(), ?, ?, ?)`,
      [created_by, objet, description, contrat_id, client_id, type || 'standard']
    );
    return result.insertId;
  },

  // Trouver toutes les réclamations d'un utilisateur
  findByUserId: async (userId) => {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as assigned_to_name, 
       c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
       ct.numero_contrat, ct.type_service 
       FROM srmdb.reclamations r
       LEFT JOIN srmdb.users u ON r.assigned_to = u.id
       LEFT JOIN srmdb.clients c ON r.client_id = c.id
       LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
       WHERE r.created_by = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  },

  // Trouver une réclamation par son ID
  findById: async (id, userId) => {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as assigned_to_name, 
       c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse, c.id as client_id, 
       ct.numero_contrat, ct.type_service, ct.id as contrat_id 
       FROM srmdb.reclamations r
       LEFT JOIN srmdb.users u ON r.assigned_to = u.id
       LEFT JOIN srmdb.clients c ON r.client_id = c.id
       LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
       WHERE r.id = ? AND r.created_by = ?`,
      [id, userId]
    );
    return rows[0];
  },

  // Mettre à jour une réclamation
  update: async (id, userId, updates) => {
    const { description } = updates;
    const [result] = await pool.query(
      `UPDATE srmdb.reclamations 
       SET description = ?
       WHERE id = ? AND created_by = ?`,
      [description, id, userId]
    );
    return result.affectedRows > 0;
  },

  // Mettre à jour le statut seulement (pour admin)
  updateStatus: async (id, status, assigned_to = null, changed_by) => {
    // Get current status before update
    const [currentStatus] = await pool.query(
      `SELECT status FROM srmdb.reclamations WHERE id = ?`,
      [id]
    );
    
    if (currentStatus.length === 0) {
      return false;
    }
    
    const oldStatus = currentStatus[0].status;
    
    // Update reclamation status
    const [result] = await pool.query(
      `UPDATE srmdb.reclamations 
       SET status = ?, assigned_to = ?
       WHERE id = ?`,
      [status, assigned_to, id]
    );
    
    if (result.affectedRows > 0) {
      // Record status change in history
      await pool.query(
        `INSERT INTO srmdb.status_history 
         (reclamation_id, old_status, new_status, changed_by, changed_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [id, oldStatus, status, changed_by]
      );
      return true;
    }
    
    return false;
  },

  // Trouver toutes les réclamations (admin)
  findAll: async (status = null, clientId = null) => {
    let query = `SELECT r.*, 
                u1.name as created_by_name,
                u2.name as assigned_to_name,
                c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
                ct.numero_contrat, ct.type_service
                FROM srmdb.reclamations r
                JOIN srmdb.users u1 ON r.created_by = u1.id
                LEFT JOIN srmdb.users u2 ON r.assigned_to = u2.id
                LEFT JOIN srmdb.clients c ON r.client_id = c.id
                LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id`;
    
    const params = [];
    const conditions = [];
    
    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }
    
    if (clientId) {
      conditions.push('r.client_id = ?');
      params.push(clientId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },
  
  // Trouver les réclamations par client
  findByClientId: async (clientId) => {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as assigned_to_name, 
       c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
       ct.numero_contrat, ct.type_service 
       FROM srmdb.reclamations r
       LEFT JOIN srmdb.users u ON r.assigned_to = u.id
       LEFT JOIN srmdb.clients c ON r.client_id = c.id
       LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
       WHERE r.client_id = ?
       ORDER BY r.created_at DESC`,
      [clientId]
    );
    return rows;
  },
  
  // Trouver les réclamations assignées à un technicien (y compris via la table reclamation_techniciens)
  findByTechnicianId: async (technicianId) => {
    console.log(`Recherche des réclamations pour le technicien ${technicianId} (directement assignées ou via reclamation_techniciens)`);
    
    // Vérifier d'abord si le technicien est présent dans la table reclamation_techniciens
    const [techCheck] = await pool.query(
      `SELECT * FROM srmdb.reclamation_techniciens WHERE technicien_id = ?`,
      [technicianId]
    );
    console.log(`Nombre d'entrées dans reclamation_techniciens pour ce technicien: ${techCheck.length}`);
    if (techCheck.length > 0) {
      console.log('IDs des réclamations associées:', techCheck.map(t => t.reclamation_id).join(', '));
    }
    
    const [rows] = await pool.query(
      `SELECT DISTINCT r.*, 
       u1.name as created_by_name,
       u2.name as assigned_to_name,
       c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
       ct.numero_contrat, ct.type_service 
       FROM srmdb.reclamations r
       JOIN srmdb.users u1 ON r.created_by = u1.id
       LEFT JOIN srmdb.users u2 ON r.assigned_to = u2.id
       LEFT JOIN srmdb.clients c ON r.client_id = c.id
       LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
       LEFT JOIN srmdb.reclamation_techniciens rt ON r.id = rt.reclamation_id
       WHERE r.assigned_to = ? OR rt.technicien_id = ?
       ORDER BY r.created_at DESC`,
      [technicianId, technicianId]
    );
    
    console.log(`Nombre de réclamations trouvées: ${rows.length}`);
    if (rows.length > 0) {
      console.log('IDs des réclamations trouvées:', rows.map(r => r.id).join(', '));
    }
    
    return rows;
  },
  
  // Trouver les réclamations liées aux demandes assignées à un technicien
  findByAssignedDemandesForTechnician: async (technicianId) => {
    console.log(`Recherche des réclamations liées aux demandes pour le technicien ${technicianId}`);
    const [rows] = await pool.query(
      `SELECT DISTINCT r.*, 
       u1.name as created_by_name,
       u2.name as assigned_to_name,
       c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse,
       ct.numero_contrat, ct.type_service 
       FROM srmdb.reclamations r
       JOIN srmdb.demandes d ON r.id = d.reclamation_id
       JOIN srmdb.users u1 ON r.created_by = u1.id
       LEFT JOIN srmdb.users u2 ON r.assigned_to = u2.id
       LEFT JOIN srmdb.clients c ON r.client_id = c.id
       LEFT JOIN srmdb.contrats ct ON r.contrat_id = ct.id
       WHERE d.technicien_assigne_id = ?
       ORDER BY r.created_at DESC`,
      [technicianId]
    );
    console.log(`Nombre de réclamations liées aux demandes trouvées: ${rows.length}`);
    return rows;
  }
};

module.exports = Complaint;
