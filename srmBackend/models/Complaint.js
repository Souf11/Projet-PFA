// models/Complaint.js
const pool = require('../config/db');

const Complaint = {
  // Créer une nouvelle réclamation
  create: async (complaintData) => {
    const { user_id, invoice_id, type, subject, description } = complaintData;
    const [result] = await pool.query(
      `INSERT INTO complaints 
      (user_id, invoice_id, type, subject, description, status) 
      VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, invoice_id, type, subject, description]
    );
    return result.insertId;
  },

  // Trouver toutes les réclamations d'un utilisateur
  findByUserId: async (userId) => {
    const [rows] = await pool.query(
      `SELECT c.*, i.invoice_number 
       FROM complaints c
       LEFT JOIN invoices i ON c.invoice_id = i.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows;
  },

  // Trouver une réclamation par son ID
  findById: async (id, userId) => {
    const [rows] = await pool.query(
      `SELECT c.*, i.invoice_number 
       FROM complaints c
       LEFT JOIN invoices i ON c.invoice_id = i.id
       WHERE c.id = ? AND c.user_id = ?`,
      [id, userId]
    );
    return rows[0];
  },

  // Mettre à jour une réclamation
  update: async (id, userId, updates) => {
    const { description, status } = updates;
    const [result] = await pool.query(
      `UPDATE complaints 
       SET description = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [description, status, id, userId]
    );
    return result.affectedRows > 0;
  },

  // Mettre à jour le statut seulement (pour admin)
  updateStatus: async (id, status, response = null) => {
    const [result] = await pool.query(
      `UPDATE complaints 
       SET status = ?, response = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, response, id]
    );
    return result.affectedRows > 0;
  },

  // Trouver toutes les réclamations (admin)
  findAll: async (status = null) => {
    let query = `SELECT c.*, u.name as user_name, i.invoice_number 
                FROM complaints c
                JOIN users u ON c.user_id = u.id
                LEFT JOIN invoices i ON c.invoice_id = i.id`;
    
    const params = [];
    if (status) {
      query += ' WHERE c.status = ?';
      params.push(status);
    }
    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }
};

module.exports = Complaint;
