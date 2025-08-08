// models/Contrat.js
const pool = require('../config/db');

const Contrat = {
  // Créer un nouveau contrat
  create: async (contratData) => {
    const { client_id, type_service, numero_contrat } = contratData;
    const [result] = await pool.query(
      `INSERT INTO srmdb.contrats 
      (client_id, type_service, numero_contrat) 
      VALUES (?, ?, ?)`,
      [client_id, type_service, numero_contrat]
    );
    return result.insertId;
  },

  // Trouver tous les contrats d'un client
  findByClientId: async (clientId) => {
    const [rows] = await pool.query(
      `SELECT * FROM srmdb.contrats
       WHERE client_id = ?
       ORDER BY id DESC`,
      [clientId]
    );
    return rows;
  },

  // Trouver un contrat par son ID
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT c.*, cl.nom as client_nom
       FROM srmdb.contrats c
       JOIN srmdb.clients cl ON c.client_id = cl.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Trouver un contrat par son numéro
  findByNumero: async (numero) => {
    const [rows] = await pool.query(
      `SELECT c.*, cl.nom as client_nom
       FROM srmdb.contrats c
       JOIN srmdb.clients cl ON c.client_id = cl.id
       WHERE c.numero_contrat = ?`,
      [numero]
    );
    return rows[0];
  },

  // Mettre à jour un contrat
  update: async (id, contratData) => {
    const { type_service, numero_contrat } = contratData;
    const [result] = await pool.query(
      `UPDATE srmdb.contrats 
       SET type_service = ?, numero_contrat = ?
       WHERE id = ?`,
      [type_service, numero_contrat, id]
    );
    return result.affectedRows > 0;
  },

  // Trouver tous les contrats
  findAll: async () => {
    const [rows] = await pool.query(
      `SELECT c.*, cl.nom as client_nom
       FROM srmdb.contrats c
       JOIN srmdb.clients cl ON c.client_id = cl.id
       ORDER BY c.id DESC`
    );
    return rows;
  }
};

module.exports = Contrat;