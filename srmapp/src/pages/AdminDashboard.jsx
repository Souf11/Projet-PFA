import { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../assets/styles/global.css';

function UsersList({ users, onEdit, onDelete }) {
  return (
    <div className="card mt-2" style={{ textAlign: 'center' }}>
      <h2 className="mb-2">Liste des utilisateurs</h2>
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
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
              <tr key={user.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{textAlign: 'center'}}>{user.id}</td>
                <td style={{textAlign: 'center'}}>{user.name}</td>
                <td style={{textAlign: 'center'}}>{user.email}</td>
                <td style={{textAlign: 'center'}}>{user.phone || '-'}</td>
                <td style={{textAlign: 'center'}}>{user.address || <span style={{color:'#aaa'}}>N/A</span>}</td>
                <td style={{textAlign: 'center'}}>
                  <button 
                    onClick={() => onEdit(user)} 
                    style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      marginRight: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => onDelete(user.id)} 
                    style={{
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Supprimer
                  </button>
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
    <div className="card mt-2" style={{ textAlign: 'center' }}>
      <h2 className="mb-2">Liste des Techniciens</h2>
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'technicien').map(user => (
              <tr key={user.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{textAlign: 'center'}}>{user.id}</td>
                <td style={{textAlign: 'center'}}>{user.name}</td>
                <td style={{textAlign: 'center'}}>{user.email}</td>
                <td style={{textAlign: 'center'}}>{user.phone || '-'}</td>
                <td style={{textAlign: 'center'}}>
                  <button 
                    onClick={() => onEdit(user)} 
                    style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      marginRight: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => onDelete(user.id)} 
                    style={{
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Supprimer
                  </button>
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
    <div className="card mt-2" style={{ textAlign: 'center' }}>
      <h2 className="mb-2">Liste des Agents</h2>
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'agent').map(user => (
              <tr key={user.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{textAlign: 'center'}}>{user.id}</td>
                <td style={{textAlign: 'center'}}>{user.name}</td>
                <td style={{textAlign: 'center'}}>{user.email}</td>
                <td style={{textAlign: 'center'}}>{user.phone || '-'}</td>
                <td style={{textAlign: 'center'}}>
                  <button 
                    onClick={() => onEdit(user)} 
                    style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      marginRight: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => onDelete(user.id)} 
                    style={{
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="card mt-2">
      <h2 className="mb-2">Créer un technicien</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required type="password" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        <button className="btn btn-primary mt-1" type="submit">Créer</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
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
    <div className="card mt-2">
      <h2 className="mb-2">Créer un utilisateur</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required type="password" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Adresse" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        <button className="btn btn-primary mt-1" type="submit">Créer</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
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
    <div className="card mt-2">
      <h2 className="mb-2">Créer un agent</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required type="password" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        <button className="btn btn-primary mt-1" type="submit">Créer</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
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
    <div className="card mt-2">
      <h2 className="mb-2">Modifier {user.role === 'utilisateur' ? 'l\'utilisateur' : 'le technicien'}</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        {user.role === 'utilisateur' && (
          <input name="address" value={form.address} onChange={handleChange} placeholder="Adresse" required />
        )}
        <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
          <button className="btn btn-secondary" type="button" onClick={onCancel}>Annuler</button>
          <button className="btn btn-primary" type="submit">Enregistrer</button>
        </div>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}

// Fonction principale du dashboard admin
export default function AdminDashboard() {
  const [view, setView] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agents, setAgents] = useState([]);

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

  useEffect(() => {
    if (view === 'users') {
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
    <div>
      <AdminNavbar view={view} setView={setView} />
      <div className="container mt-3" style={{ textAlign: 'center', marginTop: '80px' }}>
        {error && <div className="card" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {success && <div className="card" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
        {loading && <div className="card">Chargement...</div>}
        {!loading && view === 'users' && <UsersList users={users} onEdit={handleEdit} onDelete={handleDelete} />}
        {!loading && view === 'techniciens' && <TechniciensList users={users} onEdit={handleEdit} onDelete={handleDelete} />}
        {!loading && view === 'agents' && <AgentsList users={users} onEdit={handleEdit} onDelete={handleDelete} />}
        {view === 'create-technicien' && <CreateTechnicienForm onCreated={fetchUsers} />}
        {view === 'create-user' && <CreateUserForm onCreated={fetchUsers} />}
        {view === 'create-agent' && <CreateAgentForm onCreated={fetchAgents} />}
        {view === 'edit' && editingUser && <EditUserForm user={editingUser} onSave={handleSaveEdit} onCancel={handleCancelEdit} />}
      </div>
    </div>
  );
}