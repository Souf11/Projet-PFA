// /src/pages/Complaints.jsx
import { useState, useEffect } from 'react';
import ComplaintCard from '../components/ComplaintCard';
import '../assets/styles/global.css';
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
      <div className="container mt-3">
        <div className="card">
          <h1 className="mb-2">Mes Réclamations</h1>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <div className="card">
        <h1 className="mb-2">Mes Réclamations</h1>
        <Link to="/complaints/new" className="btn btn-primary">
          Déposer une réclamation
        </Link>
        {complaints.length === 0 ? (
          <div className="text-center">
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
  );
}