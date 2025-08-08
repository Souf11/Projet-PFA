import { useState, useEffect } from 'react';
import '../assets/styles/global.css';

const StatusHistory = ({ reclamationId }) => {
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatusHistory = async () => {
      if (!reclamationId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/admin/complaints/${reclamationId}/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'historique');
        }

        const data = await response.json();
        setStatusHistory(data);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger l\'historique des statuts');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusHistory();
  }, [reclamationId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return <div className="status-history-loading">Chargement de l'historique...</div>;
  }

  if (error) {
    return <div className="status-history-error">{error}</div>;
  }

  if (statusHistory.length === 0) {
    return <div className="status-history-empty">Aucun historique de statut disponible</div>;
  }

  return (
    <div className="status-history-container">
      <h4>Historique des statuts</h4>
      <div className="status-history-timeline">
        {statusHistory.map((entry, index) => (
          <div key={index} className="status-history-item">
            <div className="status-history-dot"></div>
            <div className="status-history-content">
              <div className="status-change">
                <span className="old-status">{entry.old_status}</span>
                <span className="arrow">→</span>
                <span className="new-status">{entry.new_status}</span>
              </div>
              <div className="status-meta">
                <span className="changed-by">Par: {entry.changed_by_name}</span>
                <span className="changed-at">{formatDate(entry.changed_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusHistory;