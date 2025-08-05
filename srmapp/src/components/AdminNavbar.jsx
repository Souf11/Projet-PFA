import { useNavigate } from 'react-router-dom';
import '../assets/styles/global.css';

const AdminNavbar = ({ view, setView }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        SRM - Administration
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => setView('users')}
          style={{
            backgroundColor: view === 'users' ? '#3498db' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Voir les utilisateurs
        </button>
        <button 
          onClick={() => setView('collaborators')}
          style={{
            backgroundColor: view === 'collaborators' ? '#3498db' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Voir les collaborateurs
        </button>
        <button 
          onClick={() => setView('create')}
          style={{
            backgroundColor: view === 'create' ? '#3498db' : 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Créer un collaborateur
        </button>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            marginLeft: '10px'
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar; 