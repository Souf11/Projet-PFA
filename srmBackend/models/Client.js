// models/Client.js
const pool = require('../config/db');

const Client = {
  // Créer un nouveau client
  create: async (clientData) => {
    const { nom, adresse, telephone } = clientData;
    const [result] = await pool.query(
      `INSERT INTO srmdb.clients 
      (nom, adresse, telephone, created_at) 
      VALUES (?, ?, ?, NOW())`,
      [nom, adresse, telephone]
    );
    return result.insertId;
  },

  // Trouver un client par son ID
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT * FROM srmdb.clients
       WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  // Trouver un client par son nom
  findByNom: async (nom) => {
    const [rows] = await pool.query(
      `SELECT * FROM srmdb.clients
       WHERE nom LIKE ?`,
      [`%${nom}%`]
    );
    return rows;
  },

  // Trouver un client par son téléphone
  findByTelephone: async (telephone) => {
    const [rows] = await pool.query(
      `SELECT * FROM srmdb.clients
       WHERE telephone = ?`,
      [telephone]
    );
    return rows[0];
  },

  // Mettre à jour un client
  update: async (id, clientData) => {
    const { nom, adresse, telephone } = clientData;
    const [result] = await pool.query(
      `UPDATE srmdb.clients 
       SET nom = ?, adresse = ?, telephone = ?
       WHERE id = ?`,
      [nom, adresse, telephone, id]
    );
    return result.affectedRows > 0;
  },

  // Trouver tous les clients
  findAll: async () => {
    const [rows] = await pool.query(
      `SELECT * FROM srmdb.clients
       ORDER BY nom ASC`
    );
    return rows;
  }
};

module.exports = Client;