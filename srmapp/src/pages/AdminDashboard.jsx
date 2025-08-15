import { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../assets/styles/global.css';
import '../assets/styles/admin-dashboard.css';
import { FaUsers, FaUserTie, FaUserCog, FaTicketAlt } from 'react-icons/fa';

function UsersList({ users, onEdit, onDelete }) {
  return (
    <div className="card">
      <h2>Liste des utilisateurs</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'utilisateur').map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>{user.address || <span style={{color:'#aaa'}}>N/A</span>}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => onEdit(user)} 
                      className="btn-action btn-edit"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => onDelete(user.id)} 
                      className="btn-action btn-delete"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TechniciensList({ users, onEdit, onDelete }) {
  return (
    <div className="card">
      <h2>Liste des Techniciens</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'technicien').map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => onEdit(user)} 
                      className="btn-action btn-edit"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => onDelete(user.id)} 
                      className="btn-action btn-delete"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgentsList({ users, onEdit, onDelete }) {
  return (
    <div className="card">
      <h2>Liste des Agents</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'agent').map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => onEdit(user)} 
                      className="btn-action btn-edit"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => onDelete(user.id)} 
                      className="btn-action btn-delete"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminHome({ stats }) {
  return (
    <div className="admin-home">
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3 className="stat-number">{stats.users || 0}</h3>
          <p className="stat-label">Utilisateurs</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <h3 className="stat-number">{stats.agents || 0}</h3>
          <p className="stat-label">Agents</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍🔧</div>
          <h3 className="stat-number">{stats.techniciens || 0}</h3>
          <p className="stat-label">Techniciens</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <h3 className="stat-number">{stats.complaints || 0}</h3>
          <p className="stat-label">Réclamations</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3 className="stat-number">{stats.clients || 0}</h3>
          <p className="stat-label">Clients</p>
        </div>
      </div>
    </div>
  );
}

function CreateTechnicienForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/create-technicien', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setSuccess('Technicien créé !');
      setForm({ name: '', email: '', password: '', phone: '' });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Créer un technicien</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required type="password" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        <button className="btn btn-primary" type="submit">Créer</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: '1rem' }}>{success}</div>}
    </div>
  );
}

function CreateUserForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setSuccess('Utilisateur créé !');
      setForm({ name: '', email: '', password: '', address: '', phone: '' });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="card">
      <h2>Créer un utilisateur</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required type="password" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Adresse" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        <button className="btn btn-primary" type="submit">Créer</button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
}

function CreateAgentForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/create-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setSuccess('Agent créé !');
      setForm({ name: '', email: '', password: '', phone: '' });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Créer un agent</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required type="password" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        <button className="btn btn-primary" type="submit">Créer</button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
}



// Composant pour éditer un utilisateur
function EditUserForm({ user, onSave, onCancel }) {
  const [form, setForm] = useState({ 
    name: user.name || '', 
    email: user.email || '', 
    address: user.address || '',
    phone: user.phone || ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      onSave(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Modifier {user.role === 'utilisateur' ? 'l\'utilisateur' : 'le technicien'}</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        {user.role === 'utilisateur' && (
          <input name="address" value={form.address} onChange={handleChange} placeholder="Adresse" required />
        )}
        <div className="form-actions">
          <button className="btn btn-secondary" type="button" onClick={onCancel}>Annuler</button>
          <button className="btn btn-primary" type="submit">Enregistrer</button>
        </div>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

// Fonction principale du dashboard admin
export default function AdminDashboard() {
  const [view, setView] = useState('home');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    agents: 0,
    techniciens: 0,
    complaints: 0,
    clients: 0
  });
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setUsers([]);
      setError('Erreur lors du chargement des utilisateurs');
    }
    setLoading(false);
  };

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/users/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      setAgents([]);
      setError('Erreur lors du chargement des agents');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer le nombre d'utilisateurs
      const usersRes = await fetch('http://localhost:3001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      
      // Récupérer le nombre d'agents
      const agentsRes = await fetch('http://localhost:3001/api/admin/users/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const agentsData = await agentsRes.json();
      
      // Récupérer le nombre de réclamations
      const complaintsRes = await fetch('http://localhost:3001/api/admin/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const complaintsData = await complaintsRes.json();
      
      // Récupérer le nombre de clients
      const clientsRes = await fetch('http://localhost:3001/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const clientsData = await clientsRes.json();
      
      // Calculer les statistiques
      const userCount = usersData.filter(u => u.role === 'utilisateur').length;
      const techCount = usersData.filter(u => u.role === 'technicien').length;
      const agentCount = agentsData.length;
      const complaintCount = Array.isArray(complaintsData) ? complaintsData.length : 0;
      const clientCount = Array.isArray(clientsData) ? clientsData.length : 0;
      
      setStats({
        users: userCount,
        agents: agentCount,
        techniciens: techCount,
        complaints: complaintCount,
        clients: clientCount
      });
      
      // Mettre à jour les listes pour les autres vues
      setUsers(usersData);
      setAgents(agentsData);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      setTimeout(() => setError(''), 3000);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'home') {
      fetchStats();
    } else if (view === 'users') {
      fetchUsers();
    } else if (view === 'agents') {
      fetchAgents();
    }
  }, [view]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setView('edit');
  };

  const handleSaveEdit = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingUser(null);
    setView(updatedUser.role === 'utilisateur' ? 'users' : 'techniciens');
    setSuccess('Utilisateur mis à jour avec succès');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setView('users');
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setSuccess('Utilisateur supprimé avec succès');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.message || 'Erreur lors de la suppression');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="dashboard-container">
      <AdminNavbar view={view} setView={setView} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Tableau de bord Administrateur</h1>
          <div className="current-date">{currentDate}</div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {loading && <div className="loading-spinner"><div className="spinner"></div></div>}
        
        <div className="dashboard-view">
          {!loading && view === 'home' && <AdminHome stats={stats} />}
          {!loading && view === 'users' && <UsersList users={users} onEdit={handleEdit} onDelete={handleDelete} />}
          {!loading && view === 'techniciens' && <TechniciensList users={users} onEdit={handleEdit} onDelete={handleDelete} />}
          {!loading && view === 'agents' && <AgentsList users={users} onEdit={handleEdit} onDelete={handleDelete} />}
          {view === 'create-technicien' && <CreateTechnicienForm onCreated={fetchUsers} />}
          {view === 'create-user' && <CreateUserForm onCreated={fetchUsers} />}
          {view === 'create-agent' && <CreateAgentForm onCreated={fetchAgents} />}
          {view === 'edit' && editingUser && <EditUserForm user={editingUser} onSave={handleSaveEdit} onCancel={handleCancelEdit} />}
        </div>
      </div>
    </div>
  );
}