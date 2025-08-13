import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DemandesAgentManagement from '../components/DemandesAgentManagement';

const AgentNavbar = ({ view, setView }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        SRM - Espace Agent
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => setView('complaints')}
          style={{
            backgroundColor: view === 'complaints' ? '#3498db' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Réclamations
        </button>
        <button 
          onClick={() => setView('demandes')}
          style={{
            backgroundColor: view === 'demandes' ? '#3498db' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Gérer les demandes
        </button>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            marginLeft: '10px'
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

function StatusHistory({ reclamationId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3001/api/complaints/${reclamationId}/status-history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error('Erreur chargement historique:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [reclamationId]);

  if (loading) {
    return <div>Chargement de l'historique...</div>;
  }

  if (!history || history.length === 0) {
    return <div>Aucun historique disponible</div>;
  }

  return (
    <div>
      <h3 style={{ marginBottom: '10px' }}>Historique des statuts</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f7fa' }}>
            <th>Date</th>
            <th>Ancien statut</th>
            <th>Nouveau statut</th>
            <th>Modifié par</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td>{new Date(item.changed_at).toLocaleString()}</td>
              <td>{item.old_status || 'N/A'}</td>
              <td>{item.new_status}</td>
              <td>{item.changed_by_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComplaintsManagement({ complaints, fetchData: fetchComplaints }) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [techniciens, setTechniciens] = useState([]);
  const [selectedTechnicien, setSelectedTechnicien] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('tous'); // Ajout du filtre par statut
  
  // Déplacer fetchTechniciens en dehors du useEffect pour pouvoir l'appeler ailleurs
  const fetchTechniciens = async () => {
    console.log('Executing fetchTechniciens function');
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching techniciens with token:', token ? 'Token exists' : 'No token');
      
      // Make sure we're using the correct API URL
      const apiUrl = 'http://localhost:3001/api/admin/users/techniciens';
      console.log('Fetching from URL:', apiUrl);
      
      // Ajouter un timestamp pour éviter le cache
      const urlWithTimestamp = `${apiUrl}?_=${new Date().getTime()}`;
      console.log('Fetching from URL with timestamp:', urlWithTimestamp);
      
      // Vider la liste des techniciens avant de faire la requête
      console.log('Réinitialisation de la liste des techniciens avant la requête');
      setTechniciens([]);
      
      console.log('Envoi de la requête pour récupérer les techniciens...');
      const res = await fetch(urlWithTimestamp, {
        method: 'GET', // Explicitement définir la méthode GET en premier
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Ajouter Accept header
        },
        cache: 'no-store' // Désactiver le cache
      });
        
        console.log('Techniciens API response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`Erreur API: ${res.status}`);
        }
        
        // Essayer de lire la réponse comme JSON
        let data;
        try {
          const textResponse = await res.text();
          console.log('Raw response text:', textResponse);
          
          try {
            // Essayer de parser la réponse comme JSON
            data = JSON.parse(textResponse);
            console.log('Parsed JSON response:', data);
          } catch (jsonError) {
            console.error('Response is not valid JSON:', jsonError);
            // Si ce n'est pas du JSON valide, utiliser le texte brut
            throw new Error('Réponse invalide du serveur');
          }
        } catch (parseError) {
          console.error('Error reading response:', parseError);
          throw new Error('Erreur lors du traitement de la réponse');
        }
        
        // Traiter les données reçues
        if (Array.isArray(data)) {
          console.log('Received techniciens array with length:', data.length);
          
          // Nettoyer les données pour s'assurer qu'elles sont utilisables
          const cleanedData = data.map(tech => {
            // Construire un meilleur displayName
            let betterDisplayName = tech.displayName;
            
            if (!betterDisplayName && tech.name) {
              betterDisplayName = tech.name;
            } else if (!betterDisplayName && tech.prenom && tech.nom) {
              betterDisplayName = `${tech.prenom} ${tech.nom}`;
            } else if (!betterDisplayName) {
              betterDisplayName = `Technicien #${tech.id}`;
            }
            
            return {
              // S'assurer que tous les champs nécessaires sont présents et que l'ID est une chaîne de caractères
              id: tech.id ? String(tech.id) : Math.random().toString(36).substr(2, 9),
              displayName: betterDisplayName,
              // Ajouter un timestamp pour forcer le re-render
              _timestamp: Date.now()
            };
          });
          
          console.log('Cleaned techniciens data:', JSON.stringify(cleanedData));
          setTechniciens(cleanedData);
        } else if (data && typeof data === 'object') {
          // If it's an object with a message property, it might be an error
          if (data.message) {
            console.error('API returned error message:', data.message);
            setTechniciens([]);
          } else {
            // Try to convert to array if possible
            const techArray = Object.values(data);
            console.log('Converted object to array with length:', techArray.length);
            
            // Appliquer le même nettoyage
            const cleanedData = techArray.map(tech => {
              // Construire un meilleur displayName
              let betterDisplayName = tech.displayName;
              
              if (!betterDisplayName && tech.name) {
                betterDisplayName = tech.name;
              } else if (!betterDisplayName && tech.prenom && tech.nom) {
                betterDisplayName = `${tech.prenom} ${tech.nom}`;
              } else if (!betterDisplayName) {
                betterDisplayName = `Technicien #${tech.id}`;
              }
              
              return {
                id: tech.id ? String(tech.id) : Math.random().toString(36).substr(2, 9),
                displayName: betterDisplayName,
                _timestamp: Date.now()
              };
            });
            
            console.log('Cleaned techniciens data from object:', JSON.stringify(cleanedData));
            setTechniciens(cleanedData);
          }
        } else {
          console.error('Unexpected data format:', data);
          setTechniciens([]);
        }
    } catch (err) {
      console.error('Error fetching techniciens:', err);
      setTechniciens([]);
    }
  };

  // Fonction pour assigner un technicien à une réclamation
  const handleAssignTechnicien = async (complaintId) => {
    console.log(`Assigning technicien to complaint ${complaintId}`);
    console.log(`Selected technicien ID: ${selectedTechnicien}`);
    
    // Vérifier que le technicien est sélectionné
    if (!selectedTechnicien) {
      setError('Veuillez sélectionner un technicien');
      return;
    }
    
    // Trouver le technicien sélectionné dans la liste
    const selectedTech = techniciens.find(tech => String(tech.id) === String(selectedTechnicien));
    console.log('Selected technicien object:', selectedTech);
    
    if (!selectedTech) {
      console.error('Selected technicien not found in techniciens list');
      console.log('Available techniciens:');
      techniciens.forEach((tech, index) => {
        console.log(`Technicien #${index}: ID=${tech.id} (${typeof tech.id}), Nom=${tech.displayName}`);
      });
      setError('Technicien sélectionné non trouvé. Veuillez rafraîchir et réessayer.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log(`Assigning complaint ${complaintId} to technicien ${selectedTechnicien}`);
      
      console.log(`Envoi de la requête d'affectation au serveur: ${complaintId} -> ${selectedTechnicien}`);
      console.log('Payload:', JSON.stringify({ technicien_id: selectedTechnicien }));
      
      const res = await fetch(`http://localhost:3001/api/complaints/${complaintId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          technicien_id: String(selectedTechnicien),
          // Ajouter des informations supplémentaires pour le débogage
          technicien_name: selectedTech ? selectedTech.displayName : null
        })
      });

      console.log('Assignment response status:', res.status);
      
      let data;
      try {
        const textResponse = await res.text();
        console.log('Raw response text:', textResponse);
        
        try {
          // Essayer de parser la réponse comme JSON
          data = JSON.parse(textResponse);
          console.log('Parsed JSON response:', data);
        } catch (jsonError) {
          console.error('Response is not valid JSON:', jsonError);
          // Si ce n'est pas du JSON valide, utiliser le texte brut
          data = { message: textResponse };
        }
      } catch (parseError) {
        console.error('Error reading response:', parseError);
        throw new Error('Erreur lors du traitement de la réponse');
      }
      
      if (!res.ok) {
        console.error('Assignment error:', data);
        throw new Error(data.message || data.error || 'Erreur lors de l\'affectation');
      }

      console.log('Assignment successful:', data);
      setSuccess('Réclamation affectée avec succès');
      
      // Mettre à jour la liste des réclamations
      try {
        console.log('Appel de fetchComplaints pour rafraîchir les données');
        await fetchComplaints();
        console.log('Liste des réclamations mise à jour avec succès');
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement des réclamations:', refreshError);
        // Continuer malgré l'erreur de rafraîchissement
      }
      
      // Fermer le modal et réinitialiser les états
      console.log('Fermeture du modal d\'affectation');
      setSelectedComplaint(null);
      setSelectedTechnicien('');
    } catch (err) {
      console.error('Assignment error:', err);
      setError(err.message || 'Erreur lors de l\'affectation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en attente': return '#f39c12';
      case 'en cours': return '#3498db';
      case 'résolue': return '#27ae60';
      case 'rejetée': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getTypeLabel = (type) => {
    return type || 'Standard';
  };

  // Filtrer les réclamations selon le statut sélectionné
  const filteredComplaints = statusFilter === 'tous' 
    ? complaints 
    : complaints.filter(complaint => complaint.status === statusFilter);

  if (!Array.isArray(complaints)) {
    return (
      <div className="card mt-2" style={{ textAlign: 'center' }}>
        <h2 className="mb-2">Gestion des réclamations</h2>
        <div>Aucune réclamation trouvée</div>
      </div>
    );
  }

  return (
    <div className="card mt-2" style={{ textAlign: 'center' }}>
      <h2 className="mb-2">Gestion des réclamations</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
      
      {/* Filtre par statut */}
      <div style={{ marginBottom: '20px', textAlign: 'left', padding: '0 10px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrer par statut:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="tous">Tous les statuts</option>
          <option value="en attente">En attente</option>
          <option value="en cours">En cours</option>
          <option value="résolue">Résolue</option>
          <option value="rejetée">Rejetée</option>
        </select>
      </div>
      
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
              <th>ID</th>
              <th>Client</th>
              <th>Objet</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Technicien</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(complaint => (
              <tr key={complaint.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{textAlign: 'center'}}>{complaint.id}</td>
                <td style={{textAlign: 'center'}}>{complaint.client_nom || 'N/A'}</td>
                <td style={{textAlign: 'center'}}>{complaint.objet}</td>
                <td style={{textAlign: 'center'}}>
                  <span style={{
                    backgroundColor: getStatusColor(complaint.status),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    {complaint.status}
                  </span>
                </td>
                <td style={{textAlign: 'center'}}>{new Date(complaint.created_at).toLocaleDateString()}</td>
                <td style={{textAlign: 'center'}}>{complaint.assigned_to_name || 'Non assigné'}</td>
                <td style={{textAlign: 'center'}}>
                  <button 
                    onClick={() => {
                      console.log('Ouverture du modal d\'affectation pour la réclamation:', complaint.id);
                      // Vider d'abord la liste des techniciens
                      setTechniciens([]);
                      // Réinitialiser le technicien sélectionné
                      setSelectedTechnicien('');
                      // Ouvrir le modal immédiatement pour une meilleure expérience utilisateur
                      setSelectedComplaint(complaint);
                      // Puis forcer un rechargement des techniciens
                      console.log('Rechargement des techniciens après ouverture du modal');
                      fetchTechniciens().then(() => {
                        console.log('Techniciens rechargés avec succès');
                      }).catch(err => {
                        console.error('Erreur lors du rechargement des techniciens:', err);
                      });
                    }}
                    style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Affecter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Utiliser un useEffect séparé pour recharger les techniciens quand le modal s'ouvre */}
      {selectedComplaint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{marginBottom: '20px'}}>Affecter la réclamation #{selectedComplaint.id}</h3>
            <div style={{marginBottom: '1rem'}}>
              <p><strong>Objet:</strong> {selectedComplaint.objet}</p>
              <p><strong>Description:</strong> {selectedComplaint.description}</p>
              <p><strong>Statut actuel:</strong> {selectedComplaint.status}</p>
            </div>
            
            <div style={{marginBottom: '1rem', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px'}}>
              <h4 style={{marginBottom: '10px', borderBottom: '1px solid #dee2e6', paddingBottom: '5px'}}>Informations du client</h4>
              <p><strong>Nom:</strong> {selectedComplaint.client_nom || 'Non spécifié'}</p>
              <p><strong>Téléphone:</strong> {selectedComplaint.client_telephone || 'Non spécifié'}</p>
              <p><strong>Adresse:</strong> {selectedComplaint.client_adresse || 'Non spécifiée'}</p>
              <p><strong>N° de contrat:</strong> {selectedComplaint.numero_contrat || 'Non spécifié'}</p>
              <p><strong>Type de service:</strong> {selectedComplaint.type_service || 'Non spécifié'}</p>
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <label>Sélectionner un technicien:</label>
              <select 
                className="form-select"
                value={selectedTechnicien} 
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Technicien sélectionné:', value, 'Type:', typeof value);
                  // Assurez-vous que la valeur est une chaîne de caractères
                  setSelectedTechnicien(String(value));
                }}
                style={{marginLeft: '10px', padding: '4px', width: '200px'}}
                disabled={!Array.isArray(techniciens) || techniciens.length === 0}
                required
                key={`tech-select-${Date.now()}`}
              >
                <option key="empty-option" value="">Sélectionner un technicien...</option>
                {Array.isArray(techniciens) && techniciens.length > 0 ? (
                  techniciens.map((tech, index) => {
                    // Vérifier si le technicien a un displayName valide
                    const displayName = tech.displayName || 
                      (tech.prenom && tech.nom ? `${tech.prenom} ${tech.nom}` : 
                       tech.prenom ? tech.prenom : 
                       tech.nom ? tech.nom : 
                       `Technicien #${tech.id}`);
                    
                    // Détecter si c'est le technicien par défaut
                    const isDefaultTech = displayName === 'Technicien par défaut';
                    
                    // Générer une clé unique qui ne change pas à chaque rendu
                    const optionKey = `tech-${tech.id}-${index}`;
                    
                    console.log(`Rendering option #${index} for tech #${tech.id}:`);
                    console.log(`  - DisplayName: ${displayName}`);
                    console.log(`  - Is Default: ${isDefaultTech}`);
                    console.log(`  - Option Key: ${optionKey}`);
                    
                    return (
                      <option 
                        key={optionKey} 
                        value={String(tech.id)}
                        className={isDefaultTech ? 'text-warning' : ''}
                      >
                        {displayName} (ID: {String(tech.id)})
                      </option>
                    );
                  })
                ) : (
                  <option value="">Aucun technicien disponible</option>
                )}
              </select>
                {Array.isArray(techniciens) && techniciens.length === 0 && (
                <div style={{color: 'orange', marginTop: '5px', fontSize: '0.8rem'}}>
                  Aucun technicien disponible pour l'affectation
                </div>
              )}
              {!Array.isArray(techniciens) && (
                <div style={{color: 'red', marginTop: '5px', fontSize: '0.8rem'}}>
                  Erreur de chargement des techniciens
                </div>
              )}
            </div>
            
            <div style={{marginTop: '20px'}}>
              <StatusHistory reclamationId={selectedComplaint.id} />
            </div>
            
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
              <button 
                onClick={() => {
                  setSelectedComplaint(null);
                  setSelectedTechnicien('');
                  setError('');
                  setSuccess('');
                }}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                onClick={() => handleAssignTechnicien(selectedComplaint.id)}
                disabled={loading || !selectedTechnicien}
                style={{
                  backgroundColor: loading || !selectedTechnicien ? '#bdc3c7' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: loading || !selectedTechnicien ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Affectation...' : 'Affecter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentDashboard() {
  const [view, setView] = useState('complaints');
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [showDemandesModal, setShowDemandesModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch complaints
      try {
        const complaintsRes = await fetch('http://localhost:3001/api/complaints/admin/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          console.log('Réclamations récupérées:', complaintsData);
          setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
        } else {
          console.error('Erreur lors de la récupération des réclamations:', await complaintsRes.text());
          setComplaints([]);
        }
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setComplaints([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setComplaints([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Effet pour gérer l'affichage du modal des demandes
  useEffect(() => {
    if (view === 'demandes') {
      setShowDemandesModal(true);
    } else {
      setShowDemandesModal(false);
    }
  }, [view]);

  // Fonction pour fermer le modal des demandes
  const handleCloseDemandesModal = () => {
    setShowDemandesModal(false);
    setView('complaints');
  };

  return (
    <div>
      <AgentNavbar view={view} setView={setView} />
      <div className="container mt-3" style={{ textAlign: 'center', marginTop: '80px' }}>
        {loading && <div className="card">Chargement...</div>}
        {!loading && view === 'complaints' && <ComplaintsManagement complaints={complaints} fetchData={fetchData} />}
      </div>
      
      {/* Modal pour la gestion des demandes */}
      {showDemandesModal && (
        <DemandesAgentManagement onClose={handleCloseDemandesModal} />
      )}
    </div>
  );
}