import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/admin-navbar.css';
import srmlogoIcon from '../assets/icons/srmlogo.webp';

export default function AgentNavbar({ view, setView }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Gestion du scroll pour l'effet de transparence
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className={`admin-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-title">
        <img src={srmlogoIcon} alt="SRM Logo" className="navbar-logo" />
      </div>
      
      <div className="navbar-buttons">
        <button 
          className={`navbar-button ${view === 'complaints' ? 'active' : ''}`}
          onClick={() => setView('complaints')}
          data-view="complaints"
        >
          Voir les réclamations
        </button>
        
        <button 
          className={`navbar-button ${view === 'demandes' ? 'active' : ''}`}
          onClick={() => setView('demandes')}
          data-view="demandes"
        >
          Gérer les demandes
        </button>
      </div>
      
      <div className="navbar-user">
        {user && (
          <span className="user-name">{user.name}</span>
        )}
        <button 
          onClick={handleLogout} 
          className="logout-button"
          title="Se déconnecter"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}