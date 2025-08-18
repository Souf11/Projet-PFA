import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DemandesAgentManagement from '../components/DemandesAgentManagement';
import AgentNavbar from '../components/AgentNavbar';
import '../assets/styles/agent-dashboard.css';

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
  const [statusFilter, setStatusFilter] = useState('tous');

  const statusColors = {
    'en attente': 'var(--warning)',
    'en cours': 'var(--purple)',
    'résolue': 'var(--success)',
    'rejetée': 'var(--danger)'
  };
  
  const fetchTechniciens = async () => {
    console.log('Executing fetchTechniciens function');
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching techniciens with token:', token ? 'Token exists' : 'No token');
      
      const apiUrl = 'http://localhost:3001/api/admin/users/techniciens';
      console.log('Fetching from URL:', apiUrl);
      
      console.log('Envoi de la requête pour récupérer les techniciens...');
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
        
        console.log('Techniciens API response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`Erreur API: ${res.status}`);
        }
        
        let data;
        try {
          const textResponse = await res.text();
          console.log('Raw response text:', textResponse);
          
          try {
            data = JSON.parse(textResponse);
            console.log('Parsed JSON response:', data);
          } catch (jsonError) {
            console.error('Response is not valid JSON:', jsonError);
            throw new Error('Réponse invalide du serveur');
          }
        } catch (parseError) {
          console.error('Error reading response:', parseError);
          throw new Error('Erreur lors du traitement de la réponse');
        }
        
        if (Array.isArray(data)) {
          console.log('Received techniciens array with length:', data.length);
          
          const cleanedData = data.map(tech => {
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
          
          console.log('Cleaned techniciens data:', JSON.stringify(cleanedData));
          setTechniciens(cleanedData);
        } else if (data && typeof data === 'object') {
          if (data.message) {
            console.error('API returned error message:', data.message);
            setTechniciens([]);
          } else {
            const techArray = Object.values(data);
            console.log('Converted object to array with length:', techArray.length);
            
            const cleanedData = techArray.map(tech => {
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

  const handleAssignTechnicien = async (complaintId) => {
    console.log(`Assigning technicien to complaint ${complaintId}`);
    console.log(`Selected technicien ID: ${selectedTechnicien}`);
    
    if (!selectedTechnicien) {
      setError('Veuillez sélectionner un technicien');
      return;
    }
    
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
          technicien_name: selectedTech ? selectedTech.displayName : null
        })
      });

      console.log('Assignment response status:', res.status);
      
      let data;
      try {
        const textResponse = await res.text();
        console.log('Raw response text:', textResponse);
        
        try {
          data = JSON.parse(textResponse);
          console.log('Parsed JSON response:', data);
        } catch (jsonError) {
          console.error('Response is not valid JSON:', jsonError);
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
      
      try {
        console.log('Appel de fetchComplaints pour rafraîchir les données');
        await fetchComplaints();
        console.log('Liste des réclamations mise à jour avec succès');
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement des réclamations:', refreshError);
      }
      
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
    return statusColors[status] || '#95a5a6';
  };

  const getTypeLabel = (type) => {
    return type || 'Standard';
  };

  const filteredComplaints = statusFilter === 'tous' 
    ? complaints 
    : complaints.filter(complaint => complaint.status === statusFilter);

  if (!Array.isArray(complaints)) {
    return (
      <div className="complaints-section">
        <h2 className="section-title">Gestion des réclamations</h2>
        <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)' }}>
          Aucune réclamation trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="section-container">
      <h2 className="section-title">Gestion des réclamations</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
      
      {/* Filtres de statut */}
      <div className="filter-container">
        <label className="filter-label">Filtrer par statut :</label>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'tous' ? 'active' : ''}`}
            onClick={() => setStatusFilter('tous')}
          >
            Tous ({complaints.length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'en attente' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en attente')}
          >
            En attente ({complaints.filter(c => c.status === 'en attente').length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'en cours' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en cours')}
          >
            En cours ({complaints.filter(c => c.status === 'en cours').length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'résolue' ? 'active' : ''}`}
            onClick={() => setStatusFilter('résolue')}
          >
            Résolues ({complaints.filter(c => c.status === 'résolue').length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'rejetée' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejetée')}
          >
            Rejetées ({complaints.filter(c => c.status === 'rejetée').length})
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
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
              <tr key={complaint.id}>
                <td>{complaint.id}</td>
                <td>{complaint.client_nom || 'N/A'}</td>
                <td>{complaint.objet}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(complaint.status) }}>
                    {complaint.status}
                  </span>
                </td>
                <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                <td>{complaint.assigned_to_name || 'Non assigné'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={async () => {
                        console.log('Ouverture du modal d\'affectation pour la réclamation:', complaint.id);
                        setSelectedComplaint(complaint);
                        setSelectedTechnicien('');
                        
                        // Charger les techniciens de manière asynchrone
                        try {
                          await fetchTechniciens();
                          console.log('Techniciens rechargés avec succès');
                        } catch (err) {
                          console.error('Erreur lors du rechargement des techniciens:', err);
                        }
                      }}
                      className="btn-action btn-affecter"
                    >
                      Affecter
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour affecter un technicien */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={(e) => {
          // Empêcher la fermeture du modal en cliquant sur l'overlay
          e.stopPropagation();
        }}>
          <div className="modal-content" onClick={(e) => {
            // Empêcher la fermeture du modal en cliquant sur le contenu
            e.stopPropagation();
          }}>
            <h3 className="modal-title">Affecter la réclamation #{selectedComplaint.id}</h3>
            <div className="form-group">
              <p><strong>Objet:</strong> {selectedComplaint.objet}</p>
              <p><strong>Description:</strong> {selectedComplaint.description}</p>
              <p><strong>Statut actuel:</strong> {selectedComplaint.status}</p>
            </div>
            
            <div className="form-group" style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
              <h4 style={{ marginBottom: '10px', borderBottom: '1px solid #dee2e6', paddingBottom: '5px' }}>Informations du client</h4>
              <p><strong>Nom:</strong> {selectedComplaint.client_nom || 'Non spécifié'}</p>
              <p><strong>Téléphone:</strong> {selectedComplaint.client_telephone || 'Non spécifié'}</p>
              <p><strong>Adresse:</strong> {selectedComplaint.client_adresse || 'Non spécifiée'}</p>
              <p><strong>N° de contrat:</strong> {selectedComplaint.numero_contrat || 'Non spécifié'}</p>
              <p><strong>Type de service:</strong> {selectedComplaint.type_service || 'Non spécifié'}</p>
            </div>
            
                        <div className="form-group">
              <label className="form-label">Sélectionner un technicien:</label>
              <select 
                value={selectedTechnicien} 
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Technicien sélectionné:', value, 'Type:', typeof value);
                  setSelectedTechnicien(String(value));
                }}
                className="form-select"
                disabled={!Array.isArray(techniciens) || techniciens.length === 0}
                required
              >
                <option value="">Sélectionner un technicien...</option>
                {Array.isArray(techniciens) && techniciens.length > 0 ? (
                  techniciens.map((tech, index) => {
                    const displayName = tech.displayName || 
                      (tech.prenom && tech.nom ? `${tech.prenom} ${tech.nom}` : 
                       tech.prenom ? tech.prenom : 
                       tech.nom ? tech.nom : 
                       `Technicien #${tech.id}`);
                    
                    const isDefaultTech = displayName === 'Technicien par défaut';
                    const optionKey = `tech-${tech.id}-${index}`;
                    
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
            
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setSelectedComplaint(null);
                  setSelectedTechnicien('');
                  setError('');
                  setSuccess('');
                }}
                className="btn-cancel"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleAssignTechnicien(selectedComplaint.id)}
                disabled={loading || !selectedTechnicien}
                className="btn-save"
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

function DemandesManagement({ demandes, fetchDemandes }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [selectedAssistanceTechnicien, setSelectedAssistanceTechnicien] = useState('');
  const [assistanceTechniciens, setAssistanceTechniciens] = useState([]);

  const fetchAssistanceTechniciens = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/users/techniciens', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const cleanedData = data.map(tech => ({
          id: String(tech.id),
          displayName: tech.displayName || 
            (tech.prenom && tech.nom ? `${tech.prenom} ${tech.nom}` : 
             tech.prenom ? tech.prenom : 
             tech.nom ? tech.nom : 
             `Technicien #${tech.id}`)
        }));
        setAssistanceTechniciens(cleanedData);
      } else {
        console.error('Erreur lors de la récupération des techniciens');
        setAssistanceTechniciens([]);
      }
    } catch (err) {
      console.error('Error fetching assistance techniciens:', err);
      setAssistanceTechniciens([]);
    }
  };

  const handleStatusChange = async (demandeId, newStatus) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/demandes/${demandeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setSuccess('Statut mis à jour avec succès');
        await fetchDemandes();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleAssistanceRequest = async (demandeId, reclamationId) => {
    if (!selectedAssistanceTechnicien) {
      setError('Veuillez sélectionner un technicien pour l\'assistance');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Affecter la réclamation au technicien d'assistance
      const assignRes = await fetch(`http://localhost:3001/api/complaints/${reclamationId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          technicien_id: selectedAssistanceTechnicien,
          assistance_request: true
        })
      });

      if (assignRes.ok) {
        // Mettre à jour le statut de la demande
        const statusRes = await fetch(`http://localhost:3001/api/demandes/${demandeId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'approuvée' })
        });

        if (statusRes.ok) {
          setSuccess('Demande d\'assistance approuvée et technicien affecté avec succès');
          await fetchDemandes();
          setSelectedDemande(null);
          setSelectedAssistanceTechnicien('');
        } else {
          throw new Error('Erreur lors de la mise à jour du statut');
        }
      } else {
        throw new Error('Erreur lors de l\'affectation du technicien');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la demande d\'assistance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en attente': return 'var(--warning)';
      case 'approuvée': return 'var(--success)';
      case 'rejetée': return 'var(--danger)';
      default: return '#95a5a6';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'assistance_technicien': return 'Assistance technicien';
      case 'materiel': return 'Matériel';
      default: return type;
    }
  };

  // Filtrer les demandes selon le statut
  const filteredDemandes = statusFilter === 'tous' 
    ? demandes 
    : demandes.filter(demande => demande.status === statusFilter);

  console.log('DemandesManagement - demandes:', demandes);
  console.log('DemandesManagement - demandes length:', Array.isArray(demandes) ? demandes.length : 'Not array');
  
  if (!Array.isArray(demandes)) {
    return (
      <div className="section-container">
        <h2 className="section-title">Gestion des demandes</h2>
        <div className="no-data">
          Aucune demande trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="section-container">
      <h2 className="section-title">Gestion des demandes</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
      
      {/* Filtres de statut */}
      <div className="filter-container">
        <label className="filter-label">Filtrer par statut :</label>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'tous' ? 'active' : ''}`}
            onClick={() => setStatusFilter('tous')}
          >
            Tous ({demandes.length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'en attente' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en attente')}
          >
            En attente ({demandes.filter(d => d.status === 'en attente').length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'approuvée' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approuvée')}
          >
            Approuvées ({demandes.filter(d => d.status === 'approuvée').length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'rejetée' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejetée')}
          >
            Rejetées ({demandes.filter(d => d.status === 'rejetée').length})
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Réclamation</th>
              <th>Technicien</th>
              <th>Type</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDemandes.map(demande => {
              console.log('Rendering demande:', demande.id, 'Status:', demande.status);
              return (
                <tr key={demande.id}>
                  <td>{demande.reclamation_id}</td>
                  <td>{demande.demandeur_name || 'N/A'}</td>
                  <td>{getTypeLabel(demande.type_demande)}</td>
                  <td>{demande.description}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(demande.status) }}>
                      {demande.status}
                    </span>
                  </td>
                  <td>{new Date(demande.created_at).toLocaleDateString()}</td>
                                    <td>
                    <div className="action-buttons">
                      {/* Actions selon le type de demande */}
                      {demande.type_demande === 'assistance_technicien' ? (
                        // Pour les demandes d'assistance technicien : Affecter/Rejeter
                        <>
                          <button 
                            onClick={() => {
                              setSelectedDemande(demande);
                              fetchAssistanceTechniciens();
                            }}
                            disabled={loading || demande.status === 'approuvée'}
                            className={`btn-action btn-assign ${demande.status === 'approuvée' ? 'disabled' : ''}`}
                          >
                            Affecter
                          </button>
                          <button 
                            onClick={() => handleStatusChange(demande.id, 'rejetée')}
                            disabled={loading || demande.status === 'rejetée'}
                            className={`btn-action btn-reject ${demande.status === 'rejetée' ? 'disabled' : ''}`}
                          >
                            Rejeter
                          </button>
                        </>
                      ) : (
                        // Pour les demandes de matériel : Approuver/Rejeter
                        <>
                          <button 
                            onClick={() => handleStatusChange(demande.id, 'approuvée')}
                            disabled={loading || demande.status === 'approuvée'}
                            className={`btn-action btn-approve ${demande.status === 'approuvée' ? 'disabled' : ''}`}
                          >
                            Approuver
                          </button>
                          <button 
                            onClick={() => handleStatusChange(demande.id, 'rejetée')}
                            disabled={loading || demande.status === 'rejetée'}
                            className={`btn-action btn-reject ${demande.status === 'rejetée' ? 'disabled' : ''}`}
                          >
                            Rejeter
                          </button>
                        </>
                      )}
                      
                      {/* Afficher le statut actuel */}
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        fontSize: '0.75rem',
                        marginTop: '4px'
                      }}>
                        Statut: {demande.status}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal pour affecter un technicien d'assistance */}
      {selectedDemande && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Affecter un technicien d'assistance</h3>
            <div className="form-group">
              <p><strong>Réclamation:</strong> #{selectedDemande.reclamation_id}</p>
              <p><strong>Technicien demandeur:</strong> {selectedDemande.technicien_name}</p>
              <p><strong>Type de demande:</strong> {selectedDemande.type}</p>
              <p><strong>Description:</strong> {selectedDemande.description}</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Sélectionner un technicien d'assistance:</label>
              <select 
                value={selectedAssistanceTechnicien} 
                onChange={(e) => setSelectedAssistanceTechnicien(e.target.value)}
                className="form-select"
                disabled={!Array.isArray(assistanceTechniciens) || assistanceTechniciens.length === 0}
                required
              >
                <option value="">Sélectionner un technicien...</option>
                {Array.isArray(assistanceTechniciens) && assistanceTechniciens.length > 0 ? (
                  assistanceTechniciens
                    .filter(tech => tech.id !== selectedDemande.technicien_id) // Exclure le technicien demandeur
                    .map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.displayName}
                      </option>
                    ))
                ) : (
                  <option value="">Aucun technicien disponible</option>
                )}
              </select>
              {Array.isArray(assistanceTechniciens) && assistanceTechniciens.length === 0 && (
                <div style={{color: 'orange', marginTop: '5px', fontSize: '0.8rem'}}>
                  Aucun technicien disponible pour l'assistance
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setSelectedDemande(null);
                  setSelectedAssistanceTechnicien('');
                  setError('');
                  setSuccess('');
                }}
                className="btn-cancel"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleAssistanceRequest(selectedDemande.id, selectedDemande.reclamation_id)}
                disabled={loading || !selectedAssistanceTechnicien}
                className="btn-save"
              >
                {loading ? 'Affectation...' : 'Affecter et Approuver'}
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
  const [demandes, setDemandes] = useState([]);
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fonctions utilitaires
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getComplaintsStats = () => {
    if (!Array.isArray(complaints)) return { total: 0, enAttente: 0, enCours: 0, resolues: 0 };
    
    return {
      total: complaints.length,
      enAttente: complaints.filter(c => c.status === 'en attente').length,
      enCours: complaints.filter(c => c.status === 'en cours').length,
      resolues: complaints.filter(c => c.status === 'résolue').length
    };
  };

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

  const fetchDemandes = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching demandes with token:', token ? 'Token exists' : 'No token');
      
      const res = await fetch('http://localhost:3001/api/demandes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Demandes API response status:', res.status);
      
      if (res.ok) {
        const demandesData = await res.json();
        console.log('Demandes récupérées:', demandesData);
        console.log('Nombre de demandes:', Array.isArray(demandesData) ? demandesData.length : 0);
        setDemandes(Array.isArray(demandesData) ? demandesData : []);
      } else {
        console.error('Erreur lors de la récupération des demandes:', await res.text());
        setDemandes([]);
      }
    } catch (err) {
      console.error('Error fetching demandes:', err);
      setDemandes([]);
    }
  };

  useEffect(() => {
    // Récupérer les données utilisateur
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Charger les données
    fetchData();
    fetchDemandes();

    // Mettre à jour l'heure en temps réel
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const stats = getComplaintsStats();

  return (
    <div className="dashboard-container">
      <AgentNavbar view={view} setView={setView} />
      
      <div className="dashboard-content">
        {/* Section d'accueil */}
        <header className="dashboard-header">
          <h1>Bonjour, {user?.name || 'Agent'}</h1>
          <p className="current-date">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        {/* Statistiques rapides */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <h3>{stats.total}</h3>
            <p>Total</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <h3>{stats.enAttente}</h3>
            <p>En attente</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔧</div>
            <h3>{stats.enCours}</h3>
            <p>En cours</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <h3>{stats.resolues}</h3>
            <p>Résolues</p>
          </div>
        </div>

        {/* Section des réclamations */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : view === 'complaints' ? (
          <ComplaintsManagement 
            complaints={complaints} 
            fetchData={fetchData} 
          />
        ) : view === 'demandes' ? (
          <DemandesManagement 
            demandes={demandes} 
            fetchDemandes={fetchDemandes} 
          />
        ) : null}

      </div>
    </div>
  );
}