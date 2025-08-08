import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/global.css';

export default function AgentNavbar({ onViewChange }) {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('complaints');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleButtonClick = (view) => {
    setActiveButton(view);
    onViewChange(view);
  };

  return (
    <div className="admin-navbar">
      <div className="navbar-title">Tableau de bord Agent</div>
      <div className="navbar-buttons">
        <button
          className={activeButton === 'complaints' ? 'active' : ''}
          onClick={() => handleButtonClick('complaints')}
        >
          Voir les réclamations
        </button>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Déconnexion
      </button>
    </div>
  );
}