import { useState, useEffect } from 'react';
import TechnicienNavbar from '../components/TechnicienNavbar';
import StatusHistory from '../components/StatusHistory';
import DemandesManagement from '../components/DemandesManagement';
import '../assets/styles/global.css';
import '../assets/styles/statusHistory.css';

function ComplaintsManagement({ complaints, onUpdateComplaint, fetchData }) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemandes, setShowDemandes] = useState(false);
  const [selectedReclamationId, setSelectedReclamationId] = useState(null);

  const handleStatusChange = async (complaintId) => {
    if (!status) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Updating complaint:', complaintId, 'with status:', status, 'response:', response);
      
      const res = await fetch(`http://localhost:3001/api/admin/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, response })
      });

      if (res.ok) {
        const updatedComplaint = await res.json();
        console.log('Updated complaint received:', updatedComplaint);
        onUpdateComplaint(updatedComplaint);
        setSelectedComplaint(null);
        setStatus('');
        setResponse('');
        
        // Force refresh the complaints list
        setTimeout(() => {
          fetchData();
        }, 500);
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        alert('Erreur lors de la mise à jour: ' + (errorData.message || 'Erreur inconnue'));
      }
    } catch (err) {
      console.error('Error updating complaint:', err);
      alert('Erreur lors de la mise à jour');
    }
    setLoading(false);
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

  const getStatusLabel = (status) => {
    // Status values are already in French in the database
    return status;
  };

  const getTypeLabel = (type) => {
    console.log('TechnicienDashboard - Received type:', type); // Debug log
    const types = {
      'eau': 'Eau',
      'electricite': 'Électricité'
    };
    const result = types[type] || type;
    console.log('TechnicienDashboard - Mapped to:', result); // Debug log
    return result;
  };

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
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Objet</th>
              <th>Type</th>
              <th>Nom Client</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(complaint => (
              <tr key={complaint.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{textAlign: 'center'}}>{complaint.id}</td>
                <td style={{textAlign: 'center'}}>{complaint.created_by_name}</td>
                <td style={{textAlign: 'center'}}>{complaint.objet}</td>
                <td style={{textAlign: 'center'}}>{getTypeLabel(complaint.type)}</td>
                <td style={{textAlign: 'center'}}>{complaint.client_nom || 'N/A'}</td>
                <td style={{textAlign: 'center'}}>{complaint.client_telephone || 'N/A'}</td>
                <td style={{textAlign: 'center'}}>{complaint.client_adresse || 'N/A'}</td>
                <td style={{textAlign: 'center'}}>
                  <span style={{
                    backgroundColor: getStatusColor(complaint.status),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {getStatusLabel(complaint.status)}
                  </span>
                </td>
                <td style={{textAlign: 'center'}}>{new Date(complaint.created_at).toLocaleDateString()}</td>
                <td style={{textAlign: 'center'}}>
                  <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                    <button 
                      onClick={() => setSelectedComplaint(complaint)}
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
                      Modifier
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedComplaint({...complaint, viewHistoryOnly: true});
                      }}
                      style={{
                        backgroundColor: '#f39c12',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Historique
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedReclamationId(complaint.id);
                        setShowDemandes(true);
                      }}
                      style={{
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Demander
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for updating complaint */}
      {showDemandes && selectedReclamationId && (
        <DemandesManagement 
          reclamationId={selectedReclamationId} 
          onClose={() => {
            setShowDemandes(false);
            setSelectedReclamationId(null);
          }} 
        />
      )}
      
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
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3>{selectedComplaint.viewHistoryOnly ? 'Historique des statuts' : `Modifier la réclamation #${selectedComplaint.id}`}</h3>
            
            {!selectedComplaint.viewHistoryOnly && (
              <>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Client:</strong>
                  <div style={{marginTop: '4px', marginLeft: '8px', textAlign: 'left'}}>
                    <div><strong>Nom:</strong> {selectedComplaint.client_nom || 'N/A'}</div>
                    <div><strong>Téléphone:</strong> {selectedComplaint.client_telephone || 'N/A'}</div>
                    <div><strong>Adresse:</strong> {selectedComplaint.client_adresse || 'N/A'}</div>
                  </div>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Objet:</strong> {selectedComplaint.objet}
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Utilisateur:</strong> {selectedComplaint.created_by_name}
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Type:</strong> {getTypeLabel(selectedComplaint.type)}
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Description:</strong> {selectedComplaint.description}
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <label>Nouveau statut:</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    style={{marginLeft: '10px', padding: '4px'}}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="en attente">En attente</option>
                    <option value="en cours">En cours</option>
                    <option value="résolue">Résolue</option>
                    <option value="rejetée">Rejetée</option>
                  </select>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <label>Réponse:</label>
                  <textarea 
                    value={response} 
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Tapez votre réponse ici..."
                    style={{
                      width: '100%',
                      height: '100px',
                      marginTop: '5px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </>
            )}
            
            {selectedComplaint.viewHistoryOnly && (
              <div style={{marginTop: '20px'}}>
                <StatusHistory reclamationId={selectedComplaint.id} />
              </div>
            )}
            
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
              <button 
                onClick={() => {
                  setSelectedComplaint(null);
                  setStatus('');
                  setResponse('');
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
                {selectedComplaint.viewHistoryOnly ? 'Fermer' : 'Annuler'}
              </button>
              {!selectedComplaint.viewHistoryOnly && (
                <button 
                  onClick={() => handleStatusChange(selectedComplaint.id)}
                  disabled={loading || !status}
                  style={{
                    backgroundColor: loading || !status ? '#bdc3c7' : '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: loading || !status ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







export default function TechnicienDashboard() {
  const [view, setView] = useState('complaints');
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch complaints assigned to the technician
      try {
        const complaintsRes = await fetch('http://localhost:3001/api/complaints/technicien/assigned', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          console.log('Réclamations assignées récupérées:', complaintsData);
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

  const updateComplaint = (updatedComplaint) => {
    console.log('Updating complaint in state:', updatedComplaint);
    setComplaints(prev => {
      const newComplaints = prev.map(complaint => 
        complaint.id === updatedComplaint.id ? updatedComplaint : complaint
      );
      console.log('New complaints state:', newComplaints);
      return newComplaints;
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <TechnicienNavbar view={view} setView={setView} />
      <div className="container mt-3" style={{ textAlign: 'center', marginTop: '80px' }}>
        {loading && <div className="card">Chargement...</div>}
        {!loading && view === 'complaints' && <ComplaintsManagement complaints={complaints} onUpdateComplaint={updateComplaint} fetchData={fetchData} />}
      </div>
    </div>
  );
}