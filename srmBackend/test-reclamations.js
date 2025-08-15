// test-reclamations.js
const axios = require('axios');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:3001/api';
let authToken = '';
let agentId = null;
let technicienId = null;
let clientId = null;
let contratId = null;
let reclamationId = null;
let demandeId = null;

// Fonction pour se connecter
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    authToken = response.data.token;
    console.log(`Connecté en tant que ${email}`);
    return response.data.user;
  } catch (error) {
    console.error('Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

// Utiliser les identifiants qui fonctionnent
const testUser = {
  email: 'test@test.com',
  password: 'password123'
};

// Fonction pour créer un client
async function createClient() {
  try {
    const response = await axios.post(
      `${API_URL}/clients`,
      {
        nom: 'Client Test',
        telephone: '0612345678',
        adresse: '123 Rue de Test, Ville Test'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    clientId = response.data.id;
    console.log('Client créé avec ID:', clientId);
    return response.data;
  } catch (error) {
    console.error('Erreur création client:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer un contrat
async function createContrat() {
  try {
    const response = await axios.post(
      `${API_URL}/clients/${clientId}/contrats`,
      {
        type_service: 'eau',
        numero_contrat: `TEST-${Date.now()}`
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    contratId = response.data.id;
    console.log('Contrat créé avec ID:', contratId);
    return response.data;
  } catch (error) {
    console.error('Erreur création contrat:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer une réclamation
async function createReclamation() {
  try {
    const response = await axios.post(
      `${API_URL}/complaints`,
      {
        type: 'technique',
        objet: 'Problème de pression d\'eau',
        description: 'Le client signale une faible pression d\'eau depuis 2 jours',
        client_id: clientId,
        contrat_id: contratId
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    reclamationId = response.data.id;
    console.log('Réclamation créée avec ID:', reclamationId);
    return response.data;
  } catch (error) {
    console.error('Erreur création réclamation:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour affecter une réclamation à un technicien
async function assignReclamation() {
  try {
    const response = await axios.put(
      `${API_URL}/complaints/${reclamationId}/assign`,
      {
        technicien_id: technicienId
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Réclamation affectée au technicien:', technicienId);
    return response.data;
  } catch (error) {
    console.error('Erreur affectation réclamation:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour créer une demande de matériel
async function createDemande() {
  try {
    // Se connecter en tant que technicien
    await login('technicien@example.com', 'password123');
    
    const response = await axios.post(
      `${API_URL}/demandes`,
      {
        reclamation_id: reclamationId,
        type_demande: 'materiel',
        description: 'Besoin d\'un manomètre pour tester la pression',
        materiel_demande: 'Manomètre professionnel'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    demandeId = response.data.id;
    console.log('Demande créée avec ID:', demandeId);
    return response.data;
  } catch (error) {
    console.error('Erreur création demande:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour mettre à jour le statut d'une réclamation
async function updateReclamationStatus(status) {
  try {
    const response = await axios.put(
      `${API_URL}/complaints/${reclamationId}/status`,
      {
        status
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`Statut de la réclamation mis à jour: ${status}`);
    return response.data;
  } catch (error) {
    console.error('Erreur mise à jour statut:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour obtenir l'historique des statuts
async function getStatusHistory() {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/${reclamationId}/status-history`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Historique des statuts:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération historique:', error.response?.data || error.message);
    throw error;
  }
}

// Exécution du test
async function runTest() {
  try {
    // 1. Se connecter en tant qu'agent
    const agent = await login('agent@example.com', 'password123');
    agentId = agent.id;
    
    // 2. Créer un client
    await createClient();
    
    // 3. Créer un contrat
    await createContrat();
    
    // 4. Créer une réclamation
    await createReclamation();
    
    // 5. Trouver un technicien
    const techniciens = await axios.get(
      `${API_URL}/admin/users/techniciens`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    if (techniciens.data.length > 0) {
      technicienId = techniciens.data[0].id;
      console.log('Technicien trouvé avec ID:', technicienId);
      
      // 6. Affecter la réclamation au technicien
      await assignReclamation();
      
      // 7. Créer une demande de matériel (en tant que technicien)
      await createDemande();
      
      // 8. Mettre à jour le statut de la réclamation
      await updateReclamationStatus('résolue');
      
      // 9. Obtenir l'historique des statuts
      await getStatusHistory();
    } else {
      console.log('Aucun technicien trouvé. Créez d\'abord un utilisateur avec le rôle technicien.');
    }
    
    console.log('Test terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

runTest();