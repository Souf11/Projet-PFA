import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../assets/styles/navbar.css';
import srmlogoIcon from '../assets/icons/srmlogo.webp';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const closeUserMenu = () => {
    setShowUserMenu(false);
  };

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.navbar-user')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <Link to="/home">
          <img src={srmlogoIcon} alt="SRM Logo" className="navbar-logo" />
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/home" className={`nav-link ${isActive('/home')}`}>
          Accueil
        </Link>
        <Link to="/complaints" className={`nav-link ${isActive('/complaints')}`}>
          Réclamations
        </Link>
        <Link to="/complaints/new" className={`nav-link ${isActive('/complaints/new')}`}>
          Nouvelle réclamation
        </Link>
      </div>
      
      {user ? (
        <div className="navbar-user">
          <span className="user-name">{user.name}</span>
          <button 
            onClick={handleSignOut} 
            className="signout-button"
            title="Se déconnecter"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <Link to="/login" className="nav-link login-link">
          <span className="login-icon">🔑</span>
          Connexion
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
