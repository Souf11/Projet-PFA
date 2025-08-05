import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../assets/styles/navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
    navigate('/login');  // Redirect to login page after sign out
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">test</Link>
      </div>
      <div className="navbar-links">
        <Link to="/home" className={`nav-link ${isActive('/home')}`}>
          Accueil
        </Link>
        <Link to="/complaints" className={`nav-link ${isActive('/complaints')}`}>
          Réclamations
        </Link>
      </div>
      {user ? (
        <div className="navbar-user">
          <span>{user.name}</span>
          <div className="user-avatar">{getInitials(user.name)}</div>
          <button onClick={handleSignOut} className="signout-button">
            Se déconnecter
          </button>
        </div>
      ) : (
        <Link to="/login" className="nav-link">
          Connexion
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
