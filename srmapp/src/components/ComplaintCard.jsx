// /src/components/ComplaintCard.jsx
import '../assets/styles/global.css';

const ComplaintCard = ({ complaint }) => {
  const getTypeLabel = (type) => {
    console.log('ComplaintCard - Received type:', type); // Debug log
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
    console.log('ComplaintCard - Mapped to:', result); // Debug log
    return result;
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
      case 'en attente': return 'En attente';
      case 'en cours': return 'En cours';
      case 'résolue': return 'Résolue';
      case 'rejetée': return 'Rejetée';
      default: return status;
    }
  };

  return (
    <div className="card complaint-card">
      <div className="complaint-header">
        <h3>{complaint.subject}</h3>
        <span 
          className="status-badge"
          style={{
            backgroundColor: getStatusColor(complaint.status),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          {getStatusLabel(complaint.status)}
        </span>
      </div>
      
      <div className="complaint-details">
        <p><strong>Type:</strong> {getTypeLabel(complaint.type)}</p>
        <p><strong>Date:</strong> {new Date(complaint.created_at).toLocaleDateString()}</p>
        {complaint.invoice_number && (
          <p><strong>Facture:</strong> {complaint.invoice_number}</p>
        )}
        {complaint.phone_number && (
          <p><strong>Téléphone:</strong> {complaint.phone_number}</p>
        )}
        <p><strong>Description:</strong></p>
        <p className="complaint-description">{complaint.description}</p>
      </div>

      {/* Show response from technicien if available */}
      {complaint.response && (
        <div className="complaint-response" style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderLeft: '4px solid #3498db',
          borderRadius: '4px'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
            Réponse du service client:
          </h4>
          <p style={{ margin: 0, color: '#34495e' }}>{complaint.response}</p>
          {complaint.updated_at && (
            <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
              Répondu le {new Date(complaint.updated_at).toLocaleDateString()}
            </small>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;