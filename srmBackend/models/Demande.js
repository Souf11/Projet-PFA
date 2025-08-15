// models/Demande.js
const pool = require('../config/db');
const moment = require('moment');

const Demande = {
  // Créer une nouvelle demande
  create: async (demandeData) => {
    const { reclamation_id, demandeur_id, type_demande, description, materiel_demande } = demandeData;
    const [result] = await pool.query(
      `INSERT INTO srmdb.demandes 
      (reclamation_id, demandeur_id, type_demande, description, materiel_demande, status, created_at) 
      VALUES (?, ?, ?, ?, ?, 'en_attente', NOW())`,
      [reclamation_id, demandeur_id, type_demande, description, materiel_demande || null]
    );
    return result.insertId;
  },

  // Trouver toutes les demandes d'un technicien (créées par lui)
  findByTechnicienId: async (technicienId) => {
    const [rows] = await pool.query(
      `SELECT d.*, r.objet as reclamation_objet, u.name as technicien_assigne_name 
       FROM srmdb.demandes d
       JOIN srmdb.reclamations r ON d.reclamation_id = r.id
       LEFT JOIN srmdb.users u ON d.technicien_assigne_id = u.id
       WHERE d.demandeur_id = ?
       ORDER BY d.created_at DESC`,
      [technicienId]
    );
    return rows;
  },
  
  // Trouver toutes les demandes assignées à un technicien
  findByAssignedTechnicienId: async (technicienId) => {
    const [rows] = await pool.query(
      `SELECT d.*, r.objet as reclamation_objet, u.name as demandeur_name 
       FROM srmdb.demandes d
       JOIN srmdb.reclamations r ON d.reclamation_id = r.id
       JOIN srmdb.users u ON d.demandeur_id = u.id
       WHERE d.technicien_assigne_id = ?
       ORDER BY d.created_at DESC`,
      [technicienId]
    );
    return rows;
  },

  // Trouver une demande par son ID
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT d.*, r.objet as reclamation_objet, 
       u1.name as demandeur_name, 
       u2.name as technicien_assigne_name 
       FROM srmdb.demandes d
       JOIN srmdb.reclamations r ON d.reclamation_id = r.id
       JOIN srmdb.users u1 ON d.demandeur_id = u1.id
       LEFT JOIN srmdb.users u2 ON d.technicien_assigne_id = u2.id
       WHERE d.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Mettre à jour le statut d'une demande
  updateStatus: async (id, status, technicien_assigne_id = null) => {
    let query = `UPDATE srmdb.demandes 
       SET status = ?, technicien_assigne_id = ?`;
    
    // Ajouter resolved_at si le statut est terminee
    if (status === 'terminee') {
      query += `, resolved_at = NOW()`;
    }
    
    query += ` WHERE id = ?`;
    
    const [result] = await pool.query(query, [status, technicien_assigne_id, id]);
    
    // Nous ne mettons pas à jour le champ assigned_to de la réclamation
    // pour qu'elle reste visible pour le technicien original et le nouveau technicien assigné
    // La réclamation sera visible pour les deux techniciens dans leurs tableaux de bord respectifs
    
    return result.affectedRows > 0;
  },

  // Ajouter une réponse à une demande
  addResponse: async (id, reponse) => {
    const [result] = await pool.query(
      `UPDATE srmdb.demandes 
       SET reponse = ?
       WHERE id = ?`,
      [reponse, id]
    );
    return result.affectedRows > 0;
  },

  // Trouver toutes les demandes (admin)
  findAll: async (status = null) => {
    let query = `SELECT d.*, 
                r.objet as reclamation_objet,
                u1.name as demandeur_name,
                u2.name as technicien_assigne_name
                FROM srmdb.demandes d
                JOIN srmdb.reclamations r ON d.reclamation_id = r.id
                JOIN srmdb.users u1 ON d.demandeur_id = u1.id
                LEFT JOIN srmdb.users u2 ON d.technicien_assigne_id = u2.id`;
    
    const params = [];
    if (status) {
      query += ' WHERE d.status = ?';
      params.push(status);
    }
    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },
  
  // Trouver toutes les demandes pour une réclamation spécifique
  findByReclamationId: async (reclamationId) => {
    const [rows] = await pool.query(
      `SELECT d.*, r.objet as reclamation_objet, 
       u1.name as demandeur_name, 
       u2.name as technicien_assigne_name 
       FROM srmdb.demandes d
       JOIN srmdb.reclamations r ON d.reclamation_id = r.id
       JOIN srmdb.users u1 ON d.demandeur_id = u1.id
       LEFT JOIN srmdb.users u2 ON d.technicien_assigne_id = u2.id
       WHERE d.reclamation_id = ?
       ORDER BY d.created_at DESC`,
      [reclamationId]
    );
    return rows;
  }
};

module.exports = Demande;