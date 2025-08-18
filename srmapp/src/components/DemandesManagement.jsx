import { useState, useEffect } from 'react';
import '../assets/styles/global.css';

const DemandesManagement = ({ reclamationId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type_demande: 'assistance_technicien',
    description: '',
    materiel_demande: ''
  });

  // Fetch demandes for the specific reclamation
  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/demandes/reclamation/${reclamationId}`, {
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

  // Create a new demande
  const createDemande = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        reclamation_id: reclamationId
      };

      const res = await fetch('http://localhost:3001/api/demandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormData({
          type_demande: 'assistance_technicien',
          description: '',
          materiel_demande: ''
        });
        setShowForm(false);
        fetchDemandes();
      } else {
        const errorData = await res.json();
        alert('Erreur: ' + (errorData.message || 'Une erreur est survenue'));
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la création de la demande');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (reclamationId) {
      fetchDemandes();
    }
  }, [reclamationId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return 'var(--warning)';
      case 'approuvee': return 'var(--purple)';
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
        maxWidth: '600px',
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

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Nouvelle Demande
          </button>
        )}

        {showForm && (
          <div className="form-container" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Nouvelle Demande</h3>
            <form onSubmit={createDemande}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Type de demande:</label>
                <select 
                  name="type_demande" 
                  value={formData.type_demande}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                >
                  <option value="assistance_technicien">Assistance d'un autre technicien</option>
                  <option value="materiel">Demande de matériel</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
                  required
                  placeholder="Décrivez votre demande..."
                ></textarea>
              </div>

              {formData.type_demande === 'materiel' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Matériel demandé:</label>
                  <input 
                    type="text" 
                    name="materiel_demande" 
                    value={formData.materiel_demande}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    required={formData.type_demande === 'materiel'}
                    placeholder="Listez le matériel nécessaire"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
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
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#bdc3c7' : '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="demandes-list">
          <h3>Mes Demandes</h3>
          {loading && <p>Chargement...</p>}
          
          {!loading && demandes.length === 0 && (
            <p>Aucune demande trouvée.</p>
          )}

          {!loading && demandes.length > 0 && (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                <thead>
                  <tr style={{background: '#f5f7fa'}}>
                    <th>ID</th>
                    <th>Réclamation</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map(demande => (
                    <tr key={demande.id} style={{borderBottom: '1px solid #eee'}}>
                      <td style={{textAlign: 'center'}}>{demande.id}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemandesManagement;