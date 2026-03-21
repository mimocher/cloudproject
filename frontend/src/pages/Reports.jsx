import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import API from '../services/api';

export default function Reports() {
  const navigate = useNavigate();

  const [overview,    setOverview]    = useState(null);
  const [byStatus,    setByStatus]    = useState([]);
  const [byPriority,  setByPriority]  = useState([]);
  const [byUser,      setByUser]      = useState([]);
  const [byCategory,  setByCategory]  = useState([]);
  const [activity,    setActivity]    = useState([]);
  const [projects,    setProjects]    = useState([]);
  const [selProject,  setSelProject]  = useState('');
  const [projReport,  setProjReport]  = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    fetchAll();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selProject) fetchProjectReport(selProject);
  }, [selProject]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [ov, st, pr, us, ca, ac] = await Promise.all([
        API.get('/api/reports/overview'),
        API.get('/api/reports/tasks-by-status'),
        API.get('/api/reports/tasks-by-priority'),
        API.get('/api/reports/tasks-by-user'),
        API.get('/api/reports/projects-by-category'),
        API.get('/api/reports/activity')
      ]);
      setOverview(ov.data);
      setByStatus(st.data.data   || []);
      setByPriority(pr.data.data || []);
      setByUser(us.data.data     || []);
      setByCategory(ca.data.data || []);
      setActivity(ac.data.data   || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await API.get('/api/projects');
      setProjects(res.data.projects || []);
    } catch (err) { console.error(err); }
  };

  const fetchProjectReport = async (id) => {
    try {
      const res = await API.get(`/api/reports/project/${id}`);
      setProjReport(res.data);
    } catch (err) { console.error(err); }
  };

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statInfo}>
        <p style={styles.statTitle}>{title}</p>
        <p style={{ ...styles.statValue, color }}>{value}</p>
        {subtitle && <p style={styles.statSub}>{subtitle}</p>}
      </div>
    </div>
  );

  if (loading) return (
    <div style={styles.loading}>Chargement des rapports...</div>
  );

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <h1 style={styles.logo}>Projet M206</h1>
        <div style={styles.nav}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>
            Utilisateurs
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/projects')}>
            Projets
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/tasks')}>
            Tâches
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/chat')}>
            Chat
          </button>
          <button style={{ ...styles.navBtn, background:'rgba(255,255,255,0.3)' }}>
            Rapports
          </button>
          <button style={styles.logoutBtn}
            onClick={() => { localStorage.clear(); navigate('/login'); }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <h2 style={{ margin:0 }}>📊 Rapports et Statistiques</h2>
          <button style={styles.refreshBtn} onClick={fetchAll}>
            🔄 Actualiser
          </button>
        </div>

        {/* ── Cartes statistiques ── */}
        {overview && (
          <div style={styles.statsGrid}>
            <StatCard
              title="Total Projets"
              value={overview.projects.total}
              subtitle={`${overview.projects.active} actifs`}
              color="#4f46e5"
              icon="📁"
            />
            <StatCard
              title="Total Tâches"
              value={overview.tasks.total}
              subtitle={`${overview.tasks.done} terminées`}
              color="#16a34a"
              icon="✅"
            />
            <StatCard
              title="En cours"
              value={overview.tasks.inprogress}
              subtitle="tâches actives"
              color="#d97706"
              icon="⚡"
            />
            <StatCard
              title="En retard"
              value={overview.tasks.overdue}
              subtitle="deadline dépassée"
              color="#dc2626"
              icon="⚠️"
            />
            <StatCard
              title="Utilisateurs"
              value={overview.users.total}
              subtitle="membres"
              color="#0891b2"
              icon="👥"
            />
            <StatCard
              title="Terminés"
              value={overview.projects.completed}
              subtitle="projets"
              color="#7c3aed"
              icon="🏆"
            />
          </div>
        )}

        {/* ── Graphiques ligne 1 ── */}
        <div style={styles.chartsRow}>

          {/* Tâches par statut — Barres */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Tâches par statut</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Tâches" radius={[4,4,0,0]}>
                  {byStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tâches par priorité — Camembert */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Tâches par priorité</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byPriority}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ label, count }) => `${label}: ${count}`}
                >
                  {byPriority.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Projets par catégorie — Camembert */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Projets par catégorie</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Graphique activité ── */}
        {activity.length > 0 && (
          <div style={{ ...styles.chartCard, marginBottom:'24px' }}>
            <h3 style={styles.chartTitle}>Activité sur 6 mois</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Tâches créées"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r:4 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Tâches terminées"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r:4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Charge de travail par utilisateur ── */}
        {byUser.length > 0 && (
          <div style={{ ...styles.chartCard, marginBottom:'24px' }}>
            <h3 style={styles.chartTitle}>Charge de travail par utilisateur</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byUser} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="username" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="todo"       name="À faire"  fill="#64748b" stackId="a" />
                <Bar dataKey="inprogress" name="En cours" fill="#d97706" stackId="a" />
                <Bar dataKey="done"       name="Terminé"  fill="#16a34a" stackId="a" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Tableau completion */}
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Utilisateur</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Terminées</th>
                  <th style={styles.th}>En cours</th>
                  <th style={styles.th}>À faire</th>
                  <th style={styles.th}>Complétion</th>
                </tr>
              </thead>
              <tbody>
                {byUser.map((u, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>👤 {u.username}</td>
                    <td style={styles.td}>{u.total}</td>
                    <td style={{ ...styles.td, color:'#16a34a', fontWeight:600 }}>{u.done}</td>
                    <td style={{ ...styles.td, color:'#d97706' }}>{u.inprogress}</td>
                    <td style={{ ...styles.td, color:'#64748b' }}>{u.todo}</td>
                    <td style={styles.td}>
                      <div style={styles.progressBar}>
                        <div style={{
                          ...styles.progressFill,
                          width:      `${u.completion}%`,
                          background: u.completion >= 75 ? '#16a34a' :
                                      u.completion >= 50 ? '#d97706' : '#dc2626'
                        }} />
                      </div>
                      <span style={{ fontSize:'12px', color:'#555' }}>
                        {u.completion}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Rapport par projet ── */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Rapport détaillé par projet</h3>

          <select style={styles.select}
            value={selProject}
            onChange={e => setSelProject(e.target.value)}>
            <option value="">Sélectionner un projet</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          {projReport && (
            <div style={{ marginTop:'24px' }}>
              <div style={styles.projHeader}>
                <div>
                  <h4 style={{ margin:'0 0 4px' }}>{projReport.project.name}</h4>
                  <p style={{ margin:0, color:'#888', fontSize:'14px' }}>
                    {projReport.project.description}
                  </p>
                </div>
                <div style={styles.projMeta}>
                  <span style={{
                    ...styles.statusBadge,
                    background: projReport.project.status === 'active'    ? '#dcfce7' :
                                projReport.project.status === 'completed' ? '#ede9fe' : '#fef3c7',
                    color:      projReport.project.status === 'active'    ? '#16a34a' :
                                projReport.project.status === 'completed' ? '#7c3aed' : '#d97706'
                  }}>
                    {projReport.project.status === 'active'    ? 'Actif' :
                     projReport.project.status === 'completed' ? 'Terminé' : 'En pause'}
                  </span>
                </div>
              </div>

              {/* Stats du projet */}
              <div style={styles.projStats}>
                {[
                  { label:'Total',    value: projReport.stats.total,      color:'#4f46e5' },
                  { label:'À faire',  value: projReport.stats.todo,       color:'#64748b' },
                  { label:'En cours', value: projReport.stats.inprogress, color:'#d97706' },
                  { label:'Terminé',  value: projReport.stats.done,       color:'#16a34a' },
                  { label:'En retard',value: projReport.stats.overdue,    color:'#dc2626' },
                ].map((s, i) => (
                  <div key={i} style={styles.projStat}>
                    <p style={{ ...styles.projStatVal, color: s.color }}>{s.value}</p>
                    <p style={styles.projStatLabel}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Barre de progression */}
              <div style={{ marginBottom:'20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontSize:'14px', color:'#555', fontWeight:600 }}>
                    Progression globale
                  </span>
                  <span style={{ fontSize:'14px', color:'#4f46e5', fontWeight:700 }}>
                    {projReport.stats.completion}%
                  </span>
                </div>
                <div style={styles.bigProgressBar}>
                  <div style={{
                    ...styles.bigProgressFill,
                    width: `${projReport.stats.completion}%`,
                    background: projReport.stats.completion >= 75 ? '#16a34a' :
                                projReport.stats.completion >= 50 ? '#d97706' : '#4f46e5'
                  }} />
                </div>
              </div>

              {/* Membres */}
              <div style={{ marginBottom:'20px' }}>
                <h5 style={{ margin:'0 0 10px', color:'#555' }}>👥 Membres</h5>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <span style={styles.memberTag}>
                    👑 {projReport.project.owner?.username} (propriétaire)
                  </span>
                  {projReport.project.members?.map((m, i) => (
                    <span key={i} style={styles.memberTag}>
                      {m.username}
                    </span>
                  ))}
                </div>
              </div>

              {/* Liste des tâches */}
              <div>
                <h5 style={{ margin:'0 0 10px', color:'#555' }}>
                  📋 Tâches ({projReport.tasks.length})
                </h5>
                <div style={styles.taskList}>
                  {projReport.tasks.map((t, i) => (
                    <div key={i} style={styles.taskItem}>
                      <span style={{
                        ...styles.taskStatus,
                        background: t.status === 'done'       ? '#dcfce7' :
                                    t.status === 'inprogress' ? '#fef3c7' : '#f1f5f9',
                        color:      t.status === 'done'       ? '#16a34a' :
                                    t.status === 'inprogress' ? '#d97706' : '#64748b'
                      }}>
                        {t.status === 'done'       ? '✅' :
                         t.status === 'inprogress' ? '⚡' : '⭕'}
                      </span>
                      <span style={styles.taskTitle}>{t.title}</span>
                      <span style={{
                        ...styles.taskPriority,
                        color: t.priority === 'high'   ? '#dc2626' :
                               t.priority === 'medium' ? '#d97706' : '#16a34a'
                      }}>
                        {t.priority === 'high'   ? '🔴 Haute' :
                         t.priority === 'medium' ? '🟡 Moyenne' : '🟢 Basse'}
                      </span>
                      <span style={styles.taskAssigned}>
                        {t.assignedTo ? `👤 ${t.assignedTo.username}` : 'Non assigné'}
                      </span>
                      {t.deadline && (
                        <span style={{
                          ...styles.taskDeadline,
                          color: new Date(t.deadline) < new Date() &&
                                 t.status !== 'done' ? '#dc2626' : '#888'
                        }}>
                          📅 {new Date(t.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:           { minHeight:'100vh', background:'#f0f2f5', fontFamily:'sans-serif' },
  loading:        { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:'18px', color:'#888' },
  header:         { background:'#4f46e5', color:'#fff', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  logo:           { margin:0, fontSize:'18px' },
  nav:            { display:'flex', gap:'8px', alignItems:'center' },
  navBtn:         { padding:'5px 12px', background:'rgba(255,255,255,0.15)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  logoutBtn:      { padding:'5px 12px', background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  content:        { padding:'24px 32px', maxWidth:'1400px', margin:'0 auto' },
  pageHeader:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  refreshBtn:     { padding:'8px 16px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' },
  statsGrid:      { display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'16px', marginBottom:'24px' },
  statCard:       { background:'#fff', borderRadius:'12px', padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:'12px' },
  statIcon:       { fontSize:'28px' },
  statInfo:       { flex:1 },
  statTitle:      { margin:'0 0 4px', fontSize:'12px', color:'#888', fontWeight:'600', textTransform:'uppercase' },
  statValue:      { margin:'0 0 2px', fontSize:'28px', fontWeight:'700' },
  statSub:        { margin:0, fontSize:'12px', color:'#aaa' },
  chartsRow:      { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px', marginBottom:'24px' },
  chartCard:      { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  chartTitle:     { margin:'0 0 16px', fontSize:'16px', fontWeight:'600', color:'#333' },
  table:          { width:'100%', borderCollapse:'collapse', marginTop:'20px' },
  thead:          { background:'#f8f9fa' },
  th:             { padding:'10px 12px', textAlign:'left', fontSize:'13px', fontWeight:'600', color:'#555', borderBottom:'2px solid #eee' },
  tr:             { borderBottom:'1px solid #f0f0f0' },
  td:             { padding:'10px 12px', fontSize:'13px', color:'#333' },
  progressBar:    { height:'8px', background:'#f0f0f0', borderRadius:'4px', overflow:'hidden', marginBottom:'2px', width:'120px' },
  progressFill:   { height:'100%', borderRadius:'4px', transition:'width 0.3s' },
  select:         { padding:'10px 14px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', width:'300px' },
  projHeader:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  projMeta:       { display:'flex', gap:'8px' },
  statusBadge:    { padding:'4px 12px', borderRadius:'20px', fontSize:'13px', fontWeight:'600' },
  projStats:      { display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'12px', marginBottom:'20px' },
  projStat:       { background:'#f8fafc', borderRadius:'8px', padding:'12px', textAlign:'center' },
  projStatVal:    { margin:'0 0 4px', fontSize:'24px', fontWeight:'700' },
  projStatLabel:  { margin:0, fontSize:'12px', color:'#888' },
  bigProgressBar: { height:'12px', background:'#f0f0f0', borderRadius:'6px', overflow:'hidden' },
  bigProgressFill:{ height:'100%', borderRadius:'6px', transition:'width 0.5s' },
  memberTag:      { padding:'4px 12px', background:'#eef2ff', color:'#4f46e5', borderRadius:'20px', fontSize:'13px' },
  taskList:       { maxHeight:'300px', overflowY:'auto' },
  taskItem:       { display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'#f8fafc', borderRadius:'8px', marginBottom:'6px' },
  taskStatus:     { padding:'4px 8px', borderRadius:'6px', fontSize:'14px' },
  taskTitle:      { flex:1, fontSize:'13px', color:'#333', fontWeight:'500' },
  taskPriority:   { fontSize:'12px', minWidth:'80px' },
  taskAssigned:   { fontSize:'12px', color:'#888', minWidth:'100px' },
  taskDeadline:   { fontSize:'12px' },
};