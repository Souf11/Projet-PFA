import { useState, useEffect } from 'react';
import '../assets/styles/global.css';

const DemandesAgentManagement = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [selectedTechnicien, setSelectedTechnicien] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [reponse, setReponse] = useState('');
  const [filter, setFilter] = useState('all');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTechnicien, setReassignTechnicien] = useState('');

  // Fetch all demandes (for agent)
  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/demandes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setDemandes(data);
      } else {
        console.error('Erreur lors de la récupération des demandes');
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
    setLoading(false);
  };

  // Fetch techniciens for assignment
  const fetchTechniciens = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/users/techniciens', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setTechniciens(Array.isArray(data) ? data : []);
      } else {
        console.error('Erreur lors de la récupération des techniciens');
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // Update demande status and assign technicien if needed
  const updateDemandeStatus = async (e) => {
    e.preventDefault();
    if (!selectedDemande || !statusUpdate) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        status: statusUpdate,
        reponse: reponse || undefined
      };

      // Add technicien assignment if selected and demande type is assistance_technicien
      if (selectedTechnicien && selectedDemande.type_demande === 'assistance_technicien') {
        payload.technicien_assigne_id = selectedTechnicien;
      }

      const res = await fetch(`http://localhost:3001/api/demandes/${selectedDemande.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Reset form and refresh data
        setSelectedDemande(null);
        setStatusUpdate('');
        setReponse('');
        setSelectedTechnicien('');
        fetchDemandes();
      } else {
        const errorData = await res.json();
        alert('Erreur: ' + (errorData.message || 'Une erreur est survenue'));
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour de la demande');
    }
    setLoading(false);
  };

  // Réaffecter une réclamation à un autre technicien via une demande
  const reassignComplaint = async (e) => {
    e.preventDefault();
    if (!selectedDemande || !reassignTechnicien) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Mettre à jour la demande avec le nouveau technicien assigné
      // Cela permettra de garder la réclamation visible pour les deux techniciens
      const res = await fetch(`http://localhost:3001/api/demandes/${selectedDemande.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'approuvee',
          technicien_assigne_id: reassignTechnicien,
          reponse: 'Réaffectation à un autre technicien tout en gardant la visibilité pour le technicien original.'
        })
      });

      if (res.ok) {
        // Fermer le modal et rafraîchir les données
        setShowReassignModal(false);
        setReassignTechnicien('');
        fetchDemandes();
        alert('Demande réaffectée avec succès. La réclamation reste visible pour les deux techniciens.');
      } else {
        const errorData = await res.json();
        alert('Erreur: ' + (errorData.message || 'Une erreur est survenue'));
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la réaffectation de la demande');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDemandes();
    fetchTechniciens();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return 'var(--warning)';
      case 'approuvee': return 'var(--primary)';
      case 'rejetee': return 'var(--danger)';
      case 'terminee': return 'var(--success)';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'en_attente': 'En attente',
      'approuvee': 'Approuvée',
      'rejetee': 'Rejetée',
      'terminee': 'Terminée'
    };
    return statusMap[status] || status;
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      'assistance_technicien': 'Assistance technicien',
      'materiel': 'Matériel'
    };
    return typeMap[type] || type;
  };

  const filteredDemandes = filter === 'all' 
    ? demandes 
    : demandes.filter(demande => demande.status === filter);

  return (
    <div className="modal-container" style={{
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
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Gestion des Demandes</h2>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Filtrer par statut:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px' }}
          >
            <option value="all">Toutes les demandes</option>
            <option value="en_attente">En attente</option>
            <option value="approuvee">Approuvées</option>
            <option value="rejetee">Rejetées</option>
            <option value="terminee">Terminées</option>
          </select>
        </div>

        {selectedDemande && (
          <div className="form-container" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Mettre à jour la demande #{selectedDemande.id}</h3>
            <div style={{ marginBottom: '15px' }}>
              <strong>Type:</strong> {getTypeLabel(selectedDemande.type_demande)}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Description:</strong> {selectedDemande.description}
            </div>
            {selectedDemande.materiel_demande && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Matériel demandé:</strong> {selectedDemande.materiel_demande}
              </div>
            )}
            {selectedDemande.type_demande === 'assistance_technicien' && selectedDemande.reclamation_id && (
              <div style={{ marginBottom: '15px' }}>
                <button 
                  type="button"
                  onClick={() => setShowReassignModal(true)}
                  style={{
                    backgroundColor: '#2980b9',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Ajouter un technicien à la réclamation
                </button>
              </div>
            )}
            <form onSubmit={updateDemandeStatus}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nouveau statut:</label>
                <select 
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="approuvee">Approuver</option>
                  <option value="rejetee">Rejeter</option>
                  <option value="terminee">Marquer comme terminée</option>
                </select>
              </div>

              {selectedDemande.type_demande === 'assistance_technicien' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Affecter à un technicien:</label>
                  <select 
                    value={selectedTechnicien}
                    onChange={(e) => setSelectedTechnicien(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="">Sélectionner un technicien</option>
                    {techniciens.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.displayName || tech.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Réponse:</label>
                <textarea 
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
                  placeholder="Ajoutez une réponse ou des instructions..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedDemande(null);
                    setStatusUpdate('');
                    setReponse('');
                    setSelectedTechnicien('');
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
                  type="submit"
                  disabled={loading || !statusUpdate}
                  style={{
                    backgroundColor: loading || !statusUpdate ? '#bdc3c7' : '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: loading || !statusUpdate ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="demandes-list">
          <h3>Liste des Demandes</h3>
          {loading && !selectedDemande && <p>Chargement...</p>}
          
          {!loading && filteredDemandes.length === 0 && (
            <p>Aucune demande trouvée.</p>
          )}

          {!loading && filteredDemandes.length > 0 && (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                <thead>
                  <tr style={{background: '#f5f7fa'}}>
                    <th>ID</th>
                    <th>Technicien</th>
                    <th>Réclamation</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemandes.map(demande => (
                    <tr key={demande.id} style={{borderBottom: '1px solid #eee'}}>
                      <td style={{textAlign: 'center'}}>{demande.id}</td>
                      <td style={{textAlign: 'center'}}>{demande.demandeur_nom || `Technicien #${demande.demandeur_id}`}</td>
                      <td style={{textAlign: 'center'}}>{demande.reclamation_objet || `Réclamation #${demande.reclamation_id}`}</td>
                      <td style={{textAlign: 'center'}}>{getTypeLabel(demande.type_demande)}</td>
                      <td style={{textAlign: 'center'}}>
                        <span style={{
                          backgroundColor: getStatusColor(demande.status),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {getStatusLabel(demande.status)}
                        </span>
                      </td>
                      <td style={{textAlign: 'center'}}>{new Date(demande.created_at).toLocaleDateString()}</td>
                      <td style={{textAlign: 'center'}}>
                        <button 
                          onClick={() => setSelectedDemande(demande)}
                          style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Gérer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de réaffectation */}
      {showReassignModal && selectedDemande && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1002
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3>Ajouter un technicien à la réclamation</h3>
            <p>Veuillez sélectionner un technicien supplémentaire pour cette réclamation. La réclamation restera visible pour les deux techniciens.</p>
            
            <form onSubmit={reassignComplaint}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nouveau technicien:</label>
                <select 
                  value={reassignTechnicien}
                  onChange={(e) => setReassignTechnicien(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                >
                  <option value="">Sélectionner un technicien</option>
                  {techniciens.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.displayName || tech.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowReassignModal(false)}
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
                  type="submit"
                  disabled={loading || !reassignTechnicien}
                  style={{
                    backgroundColor: loading || !reassignTechnicien ? '#bdc3c7' : '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: loading || !reassignTechnicien ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Traitement...' : 'Ajouter le technicien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesAgentManagement;