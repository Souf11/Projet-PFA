import { useState, useEffect } from 'react';
import TechnicienNavbar from '../components/TechnicienNavbar';
import StatusHistory from '../components/StatusHistory';
import DemandesManagement from '../components/DemandesManagement';
import '../assets/styles/technicien-dashboard.css';
function ComplaintsManagement({ complaints, onUpdateComplaint, fetchData }) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemandes, setShowDemandes] = useState(false);
  const [selectedReclamationId, setSelectedReclamationId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('tous');

  const statusColors = {
    'en attente': 'var(--warning)',
    'en cours': 'var(--purple)',
    'résolue': 'var(--success)',
    'rejetée': 'var(--danger)'
  };

  const typeLabels = {
    'eau': 'Eau',
    'electricite': 'Électricité'
  };

  const handleStatusChange = async (complaintId) => {
    if (!status) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
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
        onUpdateComplaint(updatedComplaint);
        setSelectedComplaint(null);
        setStatus('');
        setResponse('');
        setTimeout(() => fetchData(), 500);
      }
    } catch (err) {
      console.error('Error updating complaint:', err);
    }
    setLoading(false);
  };

  // Filtrer les réclamations selon le statut
  const filteredComplaints = statusFilter === 'tous' 
    ? complaints 
    : complaints.filter(complaint => complaint.status === statusFilter);

  if (!Array.isArray(complaints)) {
    return (
      <div className="section-container">
        <h2 className="section-title">Gestions des réclamations</h2>
        <div className="no-data">Aucune réclamation trouvée</div>
      </div>
    );
  }

  return (
    <div className="section-container">
      <h2 className="section-title">Gestion des réclamations</h2>
      
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
              <th>Objet</th>
              <th>Type</th>
              <th>Client</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(complaint => (
              <tr key={complaint.id}>
                <td>{complaint.objet}</td>
                <td>{typeLabels[complaint.type] || complaint.type}</td>
                <td>{complaint.client_nom || 'N/A'}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: statusColors[complaint.status] }}>
                    {complaint.status}
                  </span>
                </td>
                <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => setSelectedComplaint(complaint)} className="btn-action btn-edit">
                      Modifier
                    </button>
                    <button onClick={() => setSelectedComplaint({...complaint, viewHistoryOnly: true})} className="btn-action btn-history">
                      Historique
                    </button>
                    <button onClick={() => {
                      setSelectedReclamationId(complaint.id);
                      setShowDemandes(true);
                    }} className="btn-action btn-request">
                      Demander
                    </button>
                    <button onClick={() => setSelectedComplaint({...complaint, viewInfoOnly: true})} className="btn-action btn-info">
                      Infos
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDemandes && selectedReclamationId && (
        <DemandesManagement 
          reclamationId={selectedReclamationId} 
          onClose={() => {
            setShowDemandes(false);
            setSelectedReclamationId(null);
          }} 
        />
      )}
      
      {selectedComplaint && !selectedComplaint.viewHistoryOnly && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Modifier la réclamation #{selectedComplaint.id}</h3>
            
            <div className="modal-section">
              <h4>Informations client</h4>
              <p><strong>Nom:</strong> {selectedComplaint.client_nom || 'N/A'}</p>
              <p><strong>Téléphone:</strong> {selectedComplaint.client_telephone || 'N/A'}</p>
            </div>
            
            <div className="modal-section">
              <h4>Détails</h4>
              <p><strong>Objet:</strong> {selectedComplaint.objet}</p>
              <p><strong>Description:</strong> {selectedComplaint.description}</p>
            </div>
            
            <div className="form-group">
              <label>Statut</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
              >
                <option value="">Sélectionner...</option>
                <option value="en attente">En attente</option>
                <option value="en cours">En cours</option>
                <option value="résolue">Résolue</option>
                <option value="rejetée">Rejetée</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Réponse</label>
              <textarea 
                value={response} 
                onChange={(e) => setResponse(e.target.value)}
                className="form-textarea"
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setSelectedComplaint(null)} className="btn-cancel">
                Annuler
              </button>
              <button 
                onClick={() => handleStatusChange(selectedComplaint.id)}
                disabled={loading || !status}
                className={`btn-save ${loading || !status ? 'disabled' : ''}`}
              >
                {loading ? 'En cours...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedComplaint?.viewHistoryOnly && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Historique des statuts - Réclamation #{selectedComplaint.id}</h3>
            <div className="status-history-container">
              <StatusHistory reclamationId={selectedComplaint.id} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedComplaint(null)} className="btn-cancel">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {selectedComplaint?.viewInfoOnly && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Informations client - Réclamation #{selectedComplaint.id}</h3>
            <div className="client-info-container">
              <div className="info-group">
                <label>Téléphone:</label>
                <p>{selectedComplaint.client_telephone || 'Non disponible'}</p>
              </div>
              <div className="info-group">
                <label>Adresse:</label>
                <p>{selectedComplaint.client_adresse || 'Non disponible'}</p>
              </div>
              <div className="info-group">
                <label>Numéro de contrat:</label>
                <p>{selectedComplaint.numero_contrat || 'Non disponible'}</p>
              </div>
              <div className="info-group">
                <label>Type de contrat:</label>
                <p>{selectedComplaint.type_service || 'Non disponible'}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedComplaint(null)} className="btn-cancel">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TechnicienDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentTime] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/complaints/technicien/assigned', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
      setComplaints([]);
    }
    setLoading(false);
  };

  const updateComplaint = (updatedComplaint) => {
    setComplaints(prev => prev.map(c => c.id === updatedComplaint.id ? updatedComplaint : c));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const stats = {
    total: complaints.length,
    enAttente: complaints.filter(c => c.status === 'en attente').length,
    enCours: complaints.filter(c => c.status === 'en cours').length,
    resolues: complaints.filter(c => c.status === 'résolue').length
  };

  return (
    <div className="dashboard-container">
      <TechnicienNavbar />
      
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Bonjour, {user?.name || 'Technicien'}</h1>
          <p className="current-date">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

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

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <ComplaintsManagement 
            complaints={complaints} 
            onUpdateComplaint={updateComplaint} 
            fetchData={fetchData} 
          />
        )}
      </div>
    </div>
  );
}