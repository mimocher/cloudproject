import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import API                     from '../services/api';

export default function Projects() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  const [projects,    setProjects]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [filters,     setFilters]     = useState({ name:'', status:'', category:'' });
  const [form,        setForm]        = useState({
    name:'', description:'', startDate:'', endDate:'', status:'active', category:''
  });

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.name)     params.name     = filters.name;
      if (filters.status)   params.status   = filters.status;
      if (filters.category) params.category = filters.category;
      const res = await API.get('/api/projects', { params });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/api/projects/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editProject) {
        await API.put(`/api/projects/${editProject._id}`, form);
      } else {
        await API.post('/api/projects', form);
      }
      setShowForm(false);
      setEditProject(null);
      setForm({ name:'', description:'', startDate:'', endDate:'', status:'active', category:'' });
      fetchProjects();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setForm({
      name:        project.name,
      description: project.description || '',
      startDate:   project.startDate?.split('T')[0] || '',
      endDate:     project.endDate?.split('T')[0]   || '',
      status:      project.status,
      category:    project.category || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    try {
      await API.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  const statusColor = (s) => {
    if (s === 'active')    return '#16a34a';
    if (s === 'completed') return '#4f46e5';
    return '#d97706';
  };

  const statusLabel = (s) => {
    if (s === 'active')    return 'Actif';
    if (s === 'completed') return 'Terminé';
    return 'En pause';
  };

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>Projet M206</h1>
        <div style={styles.nav}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Utilisateurs</button>
          <button style={{ ...styles.navBtn, background: 'rgba(255,255,255,0.3)' }}>Projets</button>
          <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/login'); }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={styles.content}>

        {/* Barre du haut */}
        <div style={styles.topBar}>
          <h2 style={{ margin: 0 }}>Gestion des projets</h2>
          <button style={styles.btnAdd} onClick={() => { setShowForm(true); setEditProject(null); }}>
            + Nouveau projet
          </button>
        </div>

        {/* Filtres */}
        <div style={styles.filterBar}>
          <input
            style={styles.filterInput}
            placeholder="Rechercher par nom..."
            value={filters.name}
            onChange={e => setFilters({ ...filters, name: e.target.value })}
          />
          <select
            style={styles.filterInput}
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="completed">Terminé</option>
            <option value="paused">En pause</option>
          </select>
          <select
            style={styles.filterInput}
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button style={styles.btnFilter} onClick={fetchProjects}>Filtrer</button>
          <button style={styles.btnReset} onClick={() => {
            setFilters({ name:'', status:'', category:'' });
            setTimeout(fetchProjects, 100);
          }}>Reset</button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={{ marginTop: 0 }}>{editProject ? 'Modifier le projet' : 'Nouveau projet'}</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom *</label>
                <input style={styles.input} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nom du projet" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Catégorie</label>
                <input style={styles.input} value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="Mobile, Web, Backend..." />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date début *</label>
                <input style={styles.input} type="date" value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date fin *</label>
                <input style={styles.input} type="date" value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Statut</label>
                <select style={styles.input} value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Actif</option>
                  <option value="completed">Terminé</option>
                  <option value="paused">En pause</option>
                </select>
              </div>
              <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Description</label>
                <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description du projet..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button style={styles.btnSave}   onClick={handleSubmit}>
                {editProject ? 'Enregistrer' : 'Créer'}
              </button>
              <button style={styles.btnCancel} onClick={() => { setShowForm(false); setEditProject(null); }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des projets */}
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Chargement...</p>
        ) : projects.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>Aucun projet trouvé</p>
        ) : (
          <div style={styles.grid}>
            {projects.map(p => (
              <div key={p._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardCategory}>{p.category || 'Sans catégorie'}</span>
                  <span style={{ ...styles.badge, background: statusColor(p.status) }}>
                    {statusLabel(p.status)}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.cardDesc}>{p.description || 'Aucune description'}</p>
                <div style={styles.cardDates}>
                  <span>📅 {new Date(p.startDate).toLocaleDateString('fr-FR')}</span>
                  <span>→ {new Date(p.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div style={styles.cardMembers}>
                  👤 <strong>{p.owner?.username}</strong>
                  {p.members?.length > 0 && (
                    <span style={{ color: '#888', fontSize: '12px' }}>
                      &nbsp;+ {p.members.length} membre(s)
                    </span>
                  )}
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.btnEdit}   onClick={() => handleEdit(p)}>Modifier</button>
                  <button style={styles.btnDelete} onClick={() => handleDelete(p._id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:          { minHeight:'100vh', background:'#f0f2f5', fontFamily:'sans-serif' },
  header:        { background:'#4f46e5', color:'#fff', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  logo:          { margin:0, fontSize:'20px' },
  nav:           { display:'flex', gap:'10px', alignItems:'center' },
  navBtn:        { padding:'6px 14px', background:'rgba(255,255,255,0.15)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer' },
  logoutBtn:     { padding:'6px 14px', background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer' },
  content:       { padding:'32px', maxWidth:'1200px', margin:'0 auto' },
  topBar:        { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  filterBar:     { display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' },
  filterInput:   { padding:'8px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', minWidth:'160px' },
  btnAdd:        { padding:'10px 20px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600' },
  btnFilter:     { padding:'8px 16px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' },
  btnReset:      { padding:'8px 16px', background:'#888', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' },
  formCard:      { background:'#fff', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'24px' },
  formGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  formGroup:     { display:'flex', flexDirection:'column' },
  label:         { marginBottom:'6px', fontWeight:'500', color:'#555', fontSize:'14px' },
  input:         { padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px' },
  btnSave:       { padding:'10px 24px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600' },
  btnCancel:     { padding:'10px 24px', background:'#888', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' },
  grid:          { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'20px' },
  card:          { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' },
  cardHeader:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' },
  cardCategory:  { fontSize:'12px', color:'#4f46e5', fontWeight:'600', background:'#eef2ff', padding:'3px 10px', borderRadius:'20px' },
  badge:         { padding:'3px 10px', borderRadius:'20px', color:'#fff', fontSize:'12px', fontWeight:'600' },
  cardTitle:     { margin:'0 0 8px', fontSize:'18px', color:'#333' },
  cardDesc:      { color:'#666', fontSize:'14px', margin:'0 0 12px', lineHeight:'1.5' },
  cardDates:     { display:'flex', gap:'8px', fontSize:'13px', color:'#888', marginBottom:'8px' },
  cardMembers:   { fontSize:'13px', color:'#555', marginBottom:'12px' },
  cardActions:   { display:'flex', gap:'8px' },
  btnEdit:       { padding:'6px 14px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  btnDelete:     { padding:'6px 14px', background:'#dc2626', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
};