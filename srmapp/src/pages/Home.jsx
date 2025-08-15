import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/user-dashboard.css';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    
    // Mettre à jour l'heure toutes les secondes
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3001/api/complaints', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setComplaints(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réclamations:', error);
      }
    };

    if (userData) {
      fetchComplaints();
    }
  }, [userData]);

  const getComplaintsStats = () => {
    const stats = {
      total: complaints.length,
      enAttente: complaints.filter(c => c.status === 'en attente').length,
      enCours: complaints.filter(c => c.status === 'en cours').length,
      resolues: complaints.filter(c => c.status === 'résolue').length,
      rejetees: complaints.filter(c => c.status === 'rejetée').length
    };
    return stats;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  if (!userData) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Chargement de votre espace personnel...
      </div>
    );
  }

  const stats = getComplaintsStats();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="welcome-section">
            <div className="time-display">
              <div className="current-date">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <h3 className="stat-number">{stats.total}</h3>
            <p className="stat-label">Total réclamations</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <h3 className="stat-number">{stats.enAttente}</h3>
            <p className="stat-label">En attente</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <h3 className="stat-number">{stats.enCours}</h3>
            <p className="stat-label">En cours</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <h3 className="stat-number">{stats.resolues}</h3>
            <p className="stat-label">Résolues</p>
          </div>
        </div>

        <div className="section-container">
          <h2 className="section-title">Vos informations personnelles</h2>
          <div className="info-grid">
          <div className="info-item">
            <span className="info-label">ID Client</span>
            <span className="info-value">SRM-{userData.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Nom complet</span>
            <span className="info-value">{userData.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{userData.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Téléphone</span>
            <span className="info-value">{userData.phone || 'Non renseigné'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Adresse</span>
            <span className="info-value">{userData.address || 'Non renseignée'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Rôle</span>
            <span className="info-value">{userData.role || 'Client'}</span>
          </div>
          </div>
        </div>

        {complaints.length > 0 && (
          <div className="section-container">
            <h2 className="section-title">Vos réclamations récentes</h2>
          <div className="complaints-grid">
            {complaints.slice(0, 3).map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <span className="complaint-id">#{complaint.id}</span>
                  <span className={`complaint-status status-${complaint.status.replace(' ', '-')}`}>
                    {complaint.status}
                  </span>
                </div>
                <h4 className="complaint-title">{complaint.objet}</h4>
                <p className="complaint-description">
                  {complaint.description?.length > 100 
                    ? `${complaint.description.substring(0, 100)}...` 
                    : complaint.description}
                </p>
                <div className="complaint-footer">
                  <span className="complaint-date">
                    {new Date(complaint.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <button 
                    className="view-details-btn"
                    onClick={() => navigate('/complaints')}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
          {complaints.length > 3 && (
            <div className="view-all-complaints">
              <button 
                className="view-all-btn"
                onClick={() => navigate('/complaints')}
              >
                Voir toutes vos réclamations ({complaints.length})
              </button>
            </div>
          )}
          </div>
        )}

        <div className="section-container">
          <h2 className="section-title">Actions rapides</h2>
          <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => navigate('/complaints/new')}
          >
            <div className="action-icon">📝</div>
            <h3>Nouvelle réclamation</h3>
            <p>Créer une nouvelle réclamation</p>
          </button>
          
          <button 
            className="action-card"
            onClick={() => navigate('/complaints')}
          >
            <div className="action-icon">📋</div>
            <h3>Mes réclamations</h3>
            <p>Consulter toutes vos réclamations</p>
          </button>
          
          <button 
            className="action-card"
            onClick={() => window.location.reload()}
          >
            <div className="action-icon">🔄</div>
            <h3>Actualiser</h3>
            <p>Mettre à jour les données</p>
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
