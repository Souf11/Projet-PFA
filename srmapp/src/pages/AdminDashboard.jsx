import { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../assets/styles/global.css';

function UsersList({ users }) {
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
              <th>Adresse</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'user').map(user => (
              <tr key={user.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{textAlign: 'center'}}>{user.id}</td>
                <td style={{textAlign: 'center'}}>{user.name}</td>
                <td style={{textAlign: 'center'}}>{user.email}</td>
                <td style={{textAlign: 'center'}}>{user.address || <span style={{color:'#aaa'}}>N/A</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CollaboratorsList({ users }) {
  return (
    <div className="card mt-2" style={{ textAlign: 'center' }}>
      <h2 className="mb-2">Liste des collaborateurs</h2>
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'collaborator').map(user => (
              <tr key={user.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{textAlign: 'center'}}>{user.id}</td>
                <td style={{textAlign: 'center'}}>{user.name}</td>
                <td style={{textAlign: 'center'}}>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateCollaboratorForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const res = await fetch('http://localhost:3001/api/admin/create-collaborator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setSuccess('Collaborateur créé !');
      setForm({ name: '', email: '', password: '' });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card mt-2">
      <h2 className="mb-2">Créer un collaborateur</h2>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required type="password" />
        <button className="btn btn-primary mt-1" type="submit">Créer</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [view, setView] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <AdminNavbar view={view} setView={setView} />
      <div className="container mt-3" style={{ textAlign: 'center', marginTop: '80px' }}>
        {loading && <div className="card">Chargement...</div>}
        {!loading && view === 'users' && <UsersList users={users} />}
        {!loading && view === 'collaborators' && <CollaboratorsList users={users} />}
        {view === 'create' && <CreateCollaboratorForm onCreated={fetchUsers} />}
      </div>
    </div>
  );
}