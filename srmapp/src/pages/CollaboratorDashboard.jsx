import { useState, useEffect } from 'react';
import CollaboratorNavbar from '../components/CollaboratorNavbar';
import '../assets/styles/global.css';

function ComplaintsManagement({ complaints, onUpdateComplaint, fetchData }) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

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
      case 'pending': return '#f39c12';
      case 'in_progress': return '#3498db';
      case 'resolved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    console.log('CollaboratorDashboard - Received type:', type); // Debug log
    const types = {
      'billing': 'Facturation',
      'technical': 'Technique',
      'service': 'Service client',
      'other': 'Autre',
      'invoice': 'Facturation',
      'meter': 'Compteur',
      'facture': 'Problème avec une facture',
      'compteur': 'Problème avec le compteur',
      'autre': 'Autre'
    };
    const result = types[type] || type;
    console.log('CollaboratorDashboard - Mapped to:', result); // Debug log
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
              <th>Sujet</th>
              <th>Type</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(complaint => (
              <tr key={complaint.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{textAlign: 'center'}}>{complaint.id}</td>
                <td style={{textAlign: 'center'}}>{complaint.user_name}</td>
                <td style={{textAlign: 'center'}}>{complaint.subject}</td>
                <td style={{textAlign: 'center'}}>{getTypeLabel(complaint.type)}</td>
                <td style={{textAlign: 'center'}}>{complaint.phone_number || 'N/A'}</td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for updating complaint */}
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
            <h3>Modifier la réclamation #{selectedComplaint.id}</h3>
            <div style={{marginBottom: '1rem'}}>
              <strong>Sujet:</strong> {selectedComplaint.subject}
            </div>
            <div style={{marginBottom: '1rem'}}>
              <strong>Utilisateur:</strong> {selectedComplaint.user_name}
            </div>
            <div style={{marginBottom: '1rem'}}>
              <strong>Type:</strong> {getTypeLabel(selectedComplaint.type)}
            </div>
            <div style={{marginBottom: '1rem'}}>
              <strong>Téléphone:</strong> {selectedComplaint.phone_number || 'Non fourni'}
            </div>
            <div style={{marginBottom: '1rem'}}>
              <label>Nouveau statut:</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                style={{marginLeft: '10px', padding: '4px'}}
              >
                <option value="">Sélectionner...</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="rejected">Rejeté</option>
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
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
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
                Annuler
              </button>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







export default function CollaboratorDashboard() {
  const [view, setView] = useState('complaints');
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch complaints
      try {
        const complaintsRes = await fetch('http://localhost:3001/api/admin/complaints', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
        } else {
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
      <CollaboratorNavbar view={view} setView={setView} />
      <div className="container mt-3" style={{ textAlign: 'center', marginTop: '80px' }}>
        {loading && <div className="card">Chargement...</div>}
        {!loading && view === 'complaints' && <ComplaintsManagement complaints={complaints} onUpdateComplaint={updateComplaint} fetchData={fetchData} />}
      </div>
    </div>
  );
}