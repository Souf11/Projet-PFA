import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../assets/styles/admin-navbar.css';
import srmlogoIcon from '../assets/icons/srmlogo.webp';

const AdminNavbar = ({ view, setView }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  // Fermer les dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleDropdownItemClick = (newView) => {
    setView(newView);
    setActiveDropdown(null);
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className={`admin-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-title">
        <img src={srmlogoIcon} alt="SRM Logo" className="navbar-logo" />
      </div>
      
      <div className="navbar-buttons">
        {/* Bouton Accueil */}
        <button 
          className={`navbar-button ${view === 'home' ? 'active' : ''}`}
          onClick={() => setView('home')}
          data-view="home"
        >
          Accueil
        </button>
        
        {/* Menu Gérer Techniciens */}
        <div className="dropdown-container">
          <button 
            className={`navbar-button dropdown-toggle ${activeDropdown === 'techniciens' ? 'active' : ''}`}
            onClick={() => toggleDropdown('techniciens')}
            data-view="techniciens"
          >
            Gérer Techniciens
          </button>
          {activeDropdown === 'techniciens' && (
            <div className="dropdown-menu">
              <button 
                className={`dropdown-item ${view === 'techniciens' ? 'active' : ''}`}
                onClick={() => handleDropdownItemClick('techniciens')}
              >
                👥 Voir les techniciens
              </button>
              <button 
                className={`dropdown-item ${view === 'create-technicien' ? 'active' : ''}`}
                onClick={() => handleDropdownItemClick('create-technicien')}
              >
                ➕ Créer un technicien
              </button>
            </div>
          )}
        </div>

        {/* Menu Gérer Agents */}
        <div className="dropdown-container">
          <button 
            className={`navbar-button dropdown-toggle ${activeDropdown === 'agents' ? 'active' : ''}`}
            onClick={() => toggleDropdown('agents')}
            data-view="agents"
          >
            Gérer Agents
          </button>
          {activeDropdown === 'agents' && (
            <div className="dropdown-menu">
              <button 
                className={`dropdown-item ${view === 'agents' ? 'active' : ''}`}
                onClick={() => handleDropdownItemClick('agents')}
              >
                👨‍💼 Voir les agents
              </button>
              <button 
                className={`dropdown-item ${view === 'create-agent' ? 'active' : ''}`}
                onClick={() => handleDropdownItemClick('create-agent')}
              >
                ➕ Créer un agent
              </button>
            </div>
          )}
        </div>

        {/* Menu Gérer Utilisateurs */}
        <div className="dropdown-container">
          <button 
            className={`navbar-button dropdown-toggle ${activeDropdown === 'users' ? 'active' : ''}`}
            onClick={() => toggleDropdown('users')}
            data-view="users"
          >
            Gérer Utilisateurs
          </button>
          {activeDropdown === 'users' && (
            <div className="dropdown-menu">
              <button 
                className={`dropdown-item ${view === 'users' ? 'active' : ''}`}
                onClick={() => handleDropdownItemClick('users')}
              >
                👤 Voir les utilisateurs
              </button>
              <button 
                className={`dropdown-item ${view === 'create-user' ? 'active' : ''}`}
                onClick={() => handleDropdownItemClick('create-user')}
              >
                ➕ Créer un utilisateur
              </button>
            </div>
          )}
        </div>
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
};

export default AdminNavbar;