import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/api/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id) => {
    try {
      await API.put(`/api/admin/block/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUnblock = async (id) => {
    try {
      await API.put(`/api/admin/unblock/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await API.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role) => {
    if (role === 'admin')  return '#4f46e5';
    if (role === 'member') return '#16a34a';
    return '#d97706';
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>Projet M206</h1>
        <div style={styles.userInfo}>
          <span>Bonjour, <strong>{user.username}</strong></span>
          <span style={{ ...styles.badge, background: roleColor(user.role) }}>{user.role}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
        </div>
      </div>

      {/* Contenu */}
      <div style={styles.content}>
        <div style={styles.topBar}>
          <h2 style={{ margin: 0 }}>Gestion des utilisateurs</h2>
          <input
            style={styles.search}
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Chargement...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Statut</th>
                {user.role === 'admin' && <th style={styles.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} style={styles.tr}>
                  <td style={styles.td}>{u.username}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: roleColor(u.role) }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: u.isBlocked ? '#dc2626' : '#16a34a' }}>
                      {u.isBlocked ? 'Bloqué' : 'Actif'}
                    </span>
                  </td>
                  {user.role === 'admin' && (
                    <td style={styles.td}>
                      {u.isBlocked ? (
                        <button style={styles.btnGreen}  onClick={() => handleUnblock(u._id)}>Débloquer</button>
                      ) : (
                        <button style={styles.btnOrange} onClick={() => handleBlock(u._id)}>Bloquer</button>
                      )}
                      <button style={styles.btnRed} onClick={() => handleDelete(u._id)}>Supprimer</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:       { minHeight:'100vh', background:'#f0f2f5', fontFamily:'sans-serif' },
  header:     { background:'#4f46e5', color:'#fff', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  logo:       { margin:0, fontSize:'20px' },
  userInfo:   { display:'flex', alignItems:'center', gap:'12px' },
  badge:      { padding:'3px 10px', borderRadius:'20px', color:'#fff', fontSize:'12px', fontWeight:'600' },
  logoutBtn:  { padding:'6px 14px', background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer' },
  content:    { padding:'32px', maxWidth:'1100px', margin:'0 auto' },
  topBar:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  search:     { padding:'10px 16px', border:'1px solid #ddd', borderRadius:'8px', width:'300px', fontSize:'14px' },
  table:      { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' },
  thead:      { background:'#f8f9fa' },
  th:         { padding:'14px 16px', textAlign:'left', fontWeight:'600', color:'#555', borderBottom:'1px solid #eee' },
  tr:         { borderBottom:'1px solid #f0f0f0' },
  td:         { padding:'12px 16px', color:'#333' },
  btnOrange:  { padding:'5px 12px', background:'#f97316', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', marginRight:'6px', fontSize:'12px' },
  btnGreen:   { padding:'5px 12px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', marginRight:'6px', fontSize:'12px' },
  btnRed:     { padding:'5px 12px', background:'#dc2626', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
};