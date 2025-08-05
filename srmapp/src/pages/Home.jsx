import { useEffect, useState } from 'react';
import '../assets/styles/home.css';

const Home = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  if (!userData) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>Bienvenue, {userData.name}</h1>
        <p>Portail client de la Société Régionale Multiservices</p>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <h3>Réclamations en cours</h3>
          <p className="stat-amount">2</p>
          <p className="stat-info">1 en attente, 1 en cours</p>
        </div>
      </div>



      <div className="user-info-section">
        <h2>Vos informations</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">ID Client</span>
            <span className="info-value">SRM-{userData.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Adresse</span>
            <span className="info-value">{userData.address}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
