// /src/pages/Complaints.jsx
import { useState, useEffect } from 'react';
import ComplaintCard from '../components/ComplaintCard';
import '../assets/styles/user-dashboard.css';
import { Link } from 'react-router-dom';
export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching complaints for user...');
      
      const response = await fetch('http://localhost:3001/api/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Complaints received:', data);
        setComplaints(data);
      } else {
        console.error('Failed to fetch complaints:', response.status);
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    
    // Refresh complaints every 30 seconds to catch updates
    const interval = setInterval(fetchComplaints, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">
            <div className="loading-spinner"></div>
            Chargement de vos réclamations...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="section-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 className="section-title" style={{ margin: 0 }}>Mes Réclamations</h1>
            <Link 
              to="/complaints/new" 
              className="view-all-btn"
              style={{ textDecoration: 'none', display: 'inline-block', padding: '0.75rem 1.5rem' }}
            >
              Déposer une réclamation
            </Link>
          </div>
          {complaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
              <p>Aucune réclamation trouvée.</p>
            </div>
          ) : (
            <div className="complaints-grid">
              {complaints.map(complaint => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}