import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import API                     from '../services/api';

const COLUMNS = [
  { key: 'todo',       label: 'À faire',  color: '#e2e8f0', accent: '#64748b' },
  { key: 'inprogress', label: 'En cours', color: '#fef3c7', accent: '#d97706' },
  { key: 'done',       label: 'Terminé',  color: '#dcfce7', accent: '#16a34a' }
];

const PRIORITY_COLOR = { low: '#16a34a', medium: '#d97706', high: '#dc2626' };
const PRIORITY_LABEL = { low: 'Basse',   medium: 'Moyenne', high: 'Haute'   };

export default function Tasks() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  const [tasks,      setTasks]      = useState([]);
  const [projects,   setProjects]   = useState([]);
  const [users,      setUsers]      = useState([]);
  const [selProject, setSelProject] = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [selTask,    setSelTask]     = useState(null);
  const [comment,    setComment]    = useState('');
  const [dragTask,   setDragTask]   = useState(null);
  const [reminders,  setReminders]  = useState([]);
  const [showReminders, setShowReminders] = useState(false);
  const [form, setForm] = useState({
    title:              '',
    description:        '',
    priority:           'medium',
    deadline:           '',
    assignedTo:         '',
    reminderEnabled:    false,
    reminderDaysBefore: 1
  });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchReminders();
  }, []);

  useEffect(() => {
    if (selProject) fetchTasks();
  }, [selProject]);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchProjects = async () => {
    try {
      const res = await API.get('/api/projects');
      setProjects(res.data.projects || []);
      if (res.data.projects?.length > 0) {
        setSelProject(res.data.projects[0]._id);
      }
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/api/users');
      setUsers(res.data.users || []);
    } catch (err) { console.error(err); }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get('/api/tasks', { params: { project: selProject } });
      setTasks(res.data.tasks || []);
    } catch (err) { console.error(err); }
  };

  const fetchReminders = async () => {
    try {
      const res = await API.get('/api/tasks/reminders');
      setReminders(res.data.reminders || []);
    } catch (err) { console.error(err); }
  };

  // ── CRUD Tâches ────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      if (editTask) {
        await API.put(`/api/tasks/${editTask._id}`, form);
      } else {
        await API.post('/api/tasks', { ...form, project: selProject });
      }
      setShowForm(false);
      setEditTask(null);
      resetForm();
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setForm({
      title:              task.title,
      description:        task.description || '',
      priority:           task.priority,
      deadline:           task.deadline?.split('T')[0] || '',
      assignedTo:         task.assignedTo?._id || '',
      reminderEnabled:    task.reminder?.enabled || false,
      reminderDaysBefore: task.reminder?.daysBefore || 1
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await API.delete(`/api/tasks/${id}`);
      if (selTask?._id === id) setSelTask(null);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  const resetForm = () => setForm({
    title:'', description:'', priority:'medium',
    deadline:'', assignedTo:'',
    reminderEnabled: false, reminderDaysBefore: 1
  });

  // ── Drag & Drop ────────────────────────────────────────────
  const handleDragStart = (task) => setDragTask(task);

  const handleDrop = async (status) => {
    if (!dragTask || dragTask.status === status) return;
    try {
      await API.patch(`/api/tasks/${dragTask._id}/status`, { status });
      fetchTasks();
    } catch (err) { console.error(err); }
    setDragTask(null);
  };

  // ── Commentaires ───────────────────────────────────────────
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await API.post(`/api/tasks/${selTask._id}/comments`, { content: comment });
      setSelTask(res.data.task);
      setComment('');
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await API.delete(`/api/tasks/${selTask._id}/comments/${commentId}`);
      setSelTask(res.data.task);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  // ── Fichiers joints ────────────────────────────────────────
  const handleUploadFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post(
        `/api/tasks/${selTask._id}/files`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setSelTask(res.data.task);
      fetchTasks();
      alert('Fichier uploadé avec succès !');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur upload');
    }
  };

  const handleDeleteFile = async (filename) => {
    if (!window.confirm('Supprimer ce fichier ?')) return;
    try {
      const res = await API.delete(`/api/tasks/${selTask._id}/files/${filename}`);
      setSelTask(res.data.task);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur suppression');
    }
  };

  const handleDownloadFile = (taskId, filename) => {
    window.open(`http://localhost:5000/api/tasks/${taskId}/files/${filename}`, '_blank');
  };

  // ── Rappels ────────────────────────────────────────────────
  const handleSetReminder = async (taskId, enabled, daysBefore) => {
    try {
      const res = await API.patch(`/api/tasks/${taskId}/reminder`, {
        enabled,
        daysBefore: Number(daysBefore)
      });
      setSelTask(res.data.task);
      fetchTasks();
      fetchReminders();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur rappel');
    }
  };

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  // ── Rendu ──────────────────────────────────────────────────
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
          <button style={{ ...styles.navBtn, background: 'rgba(255,255,255,0.3)' }}>
            Tâches
          </button>

          {/* Cloche rappels */}
          <button style={styles.bellBtn} onClick={() => setShowReminders(!showReminders)}>
            ⏰
            {reminders.length > 0 && (
              <span style={styles.bellBadge}>{reminders.length}</span>
            )}
          </button>

          <button style={styles.logoutBtn}
            onClick={() => { localStorage.clear(); navigate('/login'); }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ── Panel Rappels ── */}
      {showReminders && (
        <div style={styles.reminderPanel}>
          <h3 style={{ margin:'0 0 12px' }}>⏰ Rappels de deadlines</h3>
          {reminders.length === 0 ? (
            <p style={{ color:'#888' }}>Aucun rappel actif</p>
          ) : (
            reminders.map((r, i) => (
              <div key={i} style={styles.reminderItem}>
                <div style={styles.reminderLeft}>
                  <strong>{r.title}</strong>
                  <span style={{ fontSize:'12px', color:'#888', marginLeft:'8px' }}>
                    Deadline : {r.deadline}
                  </span>
                </div>
                <div style={styles.reminderRight}>
                  <span style={{
                    ...styles.badge,
                    background: r.daysLeft <= 0 ? '#dc2626' :
                                r.daysLeft === 1 ? '#d97706' : '#4f46e5'
                  }}>
                    {r.daysLeft <= 0 ? 'En retard !' :
                     r.daysLeft === 1 ? 'Demain !' :
                     `${r.daysLeft} jours`}
                  </span>
                  <span style={{ ...styles.priorityBadge,
                    background: PRIORITY_COLOR[r.priority] }}>
                    {PRIORITY_LABEL[r.priority]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={styles.content}>

        {/* ── Barre du haut ── */}
        <div style={styles.topBar}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <h2 style={{ margin:0 }}>Tableau Kanban</h2>
            <select style={styles.select}
              value={selProject}
              onChange={e => setSelProject(e.target.value)}>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button style={styles.btnAdd}
            onClick={() => { setShowForm(true); setEditTask(null); resetForm(); }}>
            + Nouvelle tâche
          </button>
        </div>

        {/* ── Formulaire ── */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={{ marginTop:0 }}>
              {editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h3>
            <div style={styles.formGrid}>

              <div style={styles.formGroup}>
                <label style={styles.label}>Titre *</label>
                <input style={styles.input} value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Titre de la tâche" />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Priorité</label>
                <select style={styles.input} value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Deadline</label>
                <input style={styles.input} type="date" value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Assigné à</label>
                <select style={styles.input} value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Non assigné</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div style={{ ...styles.formGroup, gridColumn:'span 2' }}>
                <label style={styles.label}>Description</label>
                <textarea style={{ ...styles.input, height:'70px', resize:'vertical' }}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description..." />
              </div>

              {/* Rappel dans le formulaire */}
              <div style={{ ...styles.formGroup, gridColumn:'span 2' }}>
                <label style={styles.label}>⏰ Rappel deadline</label>
                <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}>
                    <input type="checkbox"
                      checked={form.reminderEnabled}
                      onChange={e => setForm({ ...form, reminderEnabled: e.target.checked })}
                    />
                    Activer le rappel
                  </label>
                  {form.reminderEnabled && (
                    <select style={{ ...styles.input, width:'auto' }}
                      value={form.reminderDaysBefore}
                      onChange={e => setForm({ ...form, reminderDaysBefore: e.target.value })}>
                      <option value={1}>1 jour avant</option>
                      <option value={2}>2 jours avant</option>
                      <option value={3}>3 jours avant</option>
                      <option value={7}>1 semaine avant</option>
                    </select>
                  )}
                </div>
              </div>

            </div>

            <div style={{ display:'flex', gap:'10px', marginTop:'16px' }}>
              <button style={styles.btnSave} onClick={handleSubmit}>
                {editTask ? 'Enregistrer' : 'Créer'}
              </button>
              <button style={styles.btnCancel}
                onClick={() => { setShowForm(false); setEditTask(null); resetForm(); }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── Kanban Board ── */}
        <div style={styles.kanban}>
          {COLUMNS.map(col => (
            <div key={col.key} style={styles.column}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}>

              <div style={{ ...styles.colHeader, background: col.color }}>
                <span style={{ ...styles.colTitle, color: col.accent }}>
                  {col.label}
                </span>
                <span style={{ ...styles.colCount, background: col.accent }}>
                  {tasksByStatus(col.key).length}
                </span>
              </div>

              <div style={styles.colBody}>
                {tasksByStatus(col.key).map(task => (
                  <div key={task._id} style={{
                    ...styles.taskCard,
                    borderLeft: `4px solid ${PRIORITY_COLOR[task.priority]}`
                  }}
                    draggable
                    onDragStart={() => handleDragStart(task)}>

                    <div style={styles.taskTop}>
                      <span style={{ ...styles.priorityBadge,
                        background: PRIORITY_COLOR[task.priority] }}>
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
                        {task.reminder?.enabled && (
                          <span title="Rappel activé" style={{ fontSize:'14px' }}>⏰</span>
                        )}
                        {task.files?.length > 0 && (
                          <span title={`${task.files.length} fichier(s)`}
                            style={{ fontSize:'14px' }}>📎</span>
                        )}
                      </div>
                    </div>

                    <p style={styles.taskTitle}>{task.title}</p>

                    {task.deadline && (
                      <p style={{
                        ...styles.deadline,
                        color: new Date(task.deadline) < new Date() &&
                               task.status !== 'done' ? '#dc2626' : '#888'
                      }}>
                        📅 {new Date(task.deadline).toLocaleDateString('fr-FR')}
                        {new Date(task.deadline) < new Date() &&
                         task.status !== 'done' && ' — En retard !'}
                      </p>
                    )}

                    {task.assignedTo && (
                      <p style={styles.assigned}>👤 {task.assignedTo.username}</p>
                    )}

                    <div style={styles.taskMeta}>
                      {task.comments?.length > 0 && (
                        <span style={styles.metaTag}>
                          💬 {task.comments.length}
                        </span>
                      )}
                      {task.files?.length > 0 && (
                        <span style={styles.metaTag}>
                          📎 {task.files.length}
                        </span>
                      )}
                    </div>

                    <div style={styles.taskActions}>
                      <button style={styles.btnView}
                        onClick={() => setSelTask(task)}>Voir</button>
                      <button style={styles.btnEdit}
                        onClick={() => handleEdit(task)}>Modifier</button>
                      <button style={styles.btnDel}
                        onClick={() => handleDelete(task._id)}>Suppr.</button>
                    </div>
                  </div>
                ))}

                {tasksByStatus(col.key).length === 0 && (
                  <p style={styles.empty}>Aucune tâche</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal détail tâche ── */}
      {selTask && (
        <div style={styles.overlay} onClick={() => setSelTask(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div style={styles.modalHeader}>
              <h3 style={{ margin:0 }}>{selTask.title}</h3>
              <button style={styles.closeBtn} onClick={() => setSelTask(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>

              {/* Infos tâche */}
              <div style={styles.taskInfo}>
                <p><strong>Description :</strong> {selTask.description || 'Aucune'}</p>
                <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                  <p><strong>Priorité :</strong>
                    <span style={{ ...styles.priorityBadge,
                      background: PRIORITY_COLOR[selTask.priority], marginLeft:'8px' }}>
                      {PRIORITY_LABEL[selTask.priority]}
                    </span>
                  </p>
                  <p><strong>Statut :</strong> {selTask.status}</p>
                  <p><strong>Assigné à :</strong> {selTask.assignedTo?.username || 'Non assigné'}</p>
                  {selTask.deadline && (
                    <p><strong>Deadline :</strong> {new Date(selTask.deadline).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              </div>

              {/* ── Section Rappel ── */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>⏰ Rappel deadline</h4>
                <div style={styles.reminderRow}>
                  <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                    <input type="checkbox"
                      checked={selTask.reminder?.enabled || false}
                      onChange={e => handleSetReminder(
                        selTask._id, e.target.checked,
                        selTask.reminder?.daysBefore || 1
                      )}
                    />
                    <span>Activer le rappel</span>
                  </label>

                  {selTask.reminder?.enabled && (
                    <select style={{ ...styles.input, width:'auto', padding:'6px 10px' }}
                      value={selTask.reminder?.daysBefore || 1}
                      onChange={e => handleSetReminder(selTask._id, true, e.target.value)}>
                      <option value={1}>1 jour avant</option>
                      <option value={2}>2 jours avant</option>
                      <option value={3}>3 jours avant</option>
                      <option value={7}>1 semaine avant</option>
                    </select>
                  )}

                  {selTask.reminder?.enabled && selTask.reminder?.sent && (
                    <span style={{ color:'#16a34a', fontSize:'13px' }}>
                      ✅ Rappel déjà envoyé
                    </span>
                  )}

                  {selTask.reminder?.enabled && !selTask.reminder?.sent && (
                    <span style={{ color:'#d97706', fontSize:'13px' }}>
                      🔔 Rappel en attente
                    </span>
                  )}
                </div>
              </div>

              {/* ── Section Fichiers joints ── */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  📎 Fichiers joints ({selTask.files?.length || 0})
                </h4>

                {selTask.files?.length === 0 && (
                  <p style={{ color:'#888', fontSize:'14px' }}>Aucun fichier joint</p>
                )}

                {selTask.files?.map((f, i) => (
                  <div key={i} style={styles.fileItem}>
                    <span style={styles.fileIcon}>
                      {f.mimetype?.includes('image') ? '🖼️' :
                       f.mimetype?.includes('pdf')   ? '📕' :
                       f.mimetype?.includes('word')  ? '📝' :
                       f.mimetype?.includes('excel') ? '📊' : '📄'}
                    </span>
                    <span style={styles.fileName}>{f.originalname}</span>
                    <span style={styles.fileSize}>
                      {(f.size / 1024).toFixed(1)} KB
                    </span>
                    <span style={styles.fileUploader}>
                      par {f.uploadedBy?.username || 'inconnu'}
                    </span>
                    <button style={styles.btnDownload}
                      onClick={() => handleDownloadFile(selTask._id, f.filename)}>
                      ⬇ Télécharger
                    </button>
                    <button style={styles.btnDelFile}
                      onClick={() => handleDeleteFile(f.filename)}>
                      🗑
                    </button>
                  </div>
                ))}

                {/* Upload */}
                <div style={styles.uploadArea}>
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display:'none' }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    onChange={e => {
                      if (e.target.files[0]) handleUploadFile(e.target.files[0]);
                      e.target.value = '';
                    }}
                  />
                  <button style={styles.btnUpload}
                    onClick={() => document.getElementById('fileInput').click()}>
                    + Joindre un fichier
                  </button>
                  <span style={{ fontSize:'12px', color:'#888' }}>
                    Max 5MB — PDF, Word, Excel, Images, TXT
                  </span>
                </div>
              </div>

              {/* ── Section Commentaires ── */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  💬 Commentaires ({selTask.comments?.length || 0})
                </h4>

                <div style={styles.commentsList}>
                  {selTask.comments?.length === 0 && (
                    <p style={{ color:'#888', fontSize:'14px' }}>Aucun commentaire</p>
                  )}
                  {selTask.comments?.map((c, i) => (
                    <div key={i} style={styles.commentItem}>
                      <div style={styles.commentHeader}>
                        <strong style={{ color:'#4f46e5' }}>
                          {c.author?.username || 'Utilisateur'}
                        </strong>
                        <span style={{ color:'#aaa', fontSize:'12px' }}>
                          {new Date(c.date).toLocaleDateString('fr-FR')}
                        </span>
                        {(user.role === 'admin' || c.author?._id === user.id) && (
                          <button style={styles.btnDelComment}
                            onClick={() => handleDeleteComment(c._id)}>
                            ✕
                          </button>
                        )}
                      </div>
                      <p style={{ margin:'4px 0 0', color:'#333', fontSize:'14px' }}>
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={styles.addComment}>
                  <input style={styles.commentInput}
                    placeholder="Ajouter un commentaire..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  />
                  <button style={styles.btnComment} onClick={handleAddComment}>
                    Envoyer
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = {
  page:           { minHeight:'100vh', background:'#f0f2f5', fontFamily:'sans-serif' },
  header:         { background:'#4f46e5', color:'#fff', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  logo:           { margin:0, fontSize:'20px' },
  nav:            { display:'flex', gap:'10px', alignItems:'center' },
  navBtn:         { padding:'6px 14px', background:'rgba(255,255,255,0.15)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer' },
  logoutBtn:      { padding:'6px 14px', background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer' },
  bellBtn:        { position:'relative', padding:'6px 12px', background:'rgba(255,255,255,0.15)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'16px' },
  bellBadge:      { position:'absolute', top:'-4px', right:'-4px', background:'#dc2626', color:'#fff', borderRadius:'50%', width:'16px', height:'16px', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center' },
  reminderPanel:  { background:'#fff', borderBottom:'1px solid #eee', padding:'16px 32px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  reminderItem:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px', background:'#fef3c7', borderRadius:'8px', marginBottom:'8px' },
  reminderLeft:   { display:'flex', alignItems:'center', gap:'8px' },
  reminderRight:  { display:'flex', gap:'8px', alignItems:'center' },
  badge:          { padding:'3px 10px', borderRadius:'20px', color:'#fff', fontSize:'12px', fontWeight:'600' },
  content:        { padding:'24px 32px', maxWidth:'1400px', margin:'0 auto' },
  topBar:         { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  select:         { padding:'8px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', minWidth:'200px' },
  btnAdd:         { padding:'10px 20px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600' },
  formCard:       { background:'#fff', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'24px' },
  formGrid:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  formGroup:      { display:'flex', flexDirection:'column' },
  label:          { marginBottom:'6px', fontWeight:'500', color:'#555', fontSize:'14px' },
  input:          { padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px' },
  btnSave:        { padding:'10px 24px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600' },
  btnCancel:      { padding:'10px 24px', background:'#888', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' },
  kanban:         { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px' },
  column:         { background:'#fff', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', minHeight:'500px' },
  colHeader:      { padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  colTitle:       { fontWeight:'700', fontSize:'15px' },
  colCount:       { color:'#fff', borderRadius:'20px', padding:'2px 10px', fontSize:'13px', fontWeight:'600' },
  colBody:        { padding:'12px' },
  taskCard:       { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'12px', marginBottom:'10px', cursor:'grab' },
  taskTop:        { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' },
  priorityBadge:  { color:'#fff', borderRadius:'20px', padding:'2px 8px', fontSize:'11px', fontWeight:'600' },
  taskTitle:      { margin:'0 0 6px', fontWeight:'600', color:'#333', fontSize:'14px' },
  deadline:       { margin:'0 0 4px', fontSize:'12px' },
  assigned:       { margin:'0 0 4px', fontSize:'12px', color:'#666' },
  taskMeta:       { display:'flex', gap:'6px', marginBottom:'8px' },
  metaTag:        { fontSize:'11px', color:'#888', background:'#f0f0f0', padding:'2px 6px', borderRadius:'10px' },
  taskActions:    { display:'flex', gap:'6px', marginTop:'8px' },
  btnView:        { padding:'4px 10px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'11px' },
  btnEdit:        { padding:'4px 10px', background:'#d97706', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'11px' },
  btnDel:         { padding:'4px 10px', background:'#dc2626', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'11px' },
  empty:          { textAlign:'center', color:'#aaa', fontSize:'13px', padding:'20px' },
  overlay:        { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal:          { background:'#fff', borderRadius:'16px', width:'90%', maxWidth:'650px', maxHeight:'85vh', overflow:'auto' },
  modalHeader:    { padding:'20px 24px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff' },
  modalBody:      { padding:'24px' },
  closeBtn:       { background:'none', border:'none', fontSize:'18px', cursor:'pointer', color:'#888' },
  taskInfo:       { marginBottom:'8px' },
  section:        { marginTop:'20px', borderTop:'1px solid #eee', paddingTop:'16px' },
  sectionTitle:   { margin:'0 0 12px', fontSize:'15px', fontWeight:'600', color:'#333' },
  reminderRow:    { display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' },
  fileItem:       { display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'#f8fafc', borderRadius:'8px', marginBottom:'6px' },
  fileIcon:       { fontSize:'18px' },
  fileName:       { flex:1, fontSize:'13px', color:'#333', fontWeight:'500' },
  fileSize:       { fontSize:'12px', color:'#888', minWidth:'60px' },
  fileUploader:   { fontSize:'12px', color:'#aaa', minWidth:'80px' },
  btnDownload:    { padding:'4px 10px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  btnDelFile:     { padding:'4px 8px', background:'#dc2626', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  uploadArea:     { display:'flex', alignItems:'center', gap:'12px', marginTop:'12px', padding:'10px', background:'#f0f9ff', borderRadius:'8px', border:'2px dashed #bfdbfe' },
  btnUpload:      { padding:'8px 16px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600' },
  commentsList:   { maxHeight:'200px', overflowY:'auto', marginBottom:'12px' },
  commentItem:    { background:'#f8fafc', borderRadius:'8px', padding:'10px', marginBottom:'8px' },
  commentHeader:  { display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' },
  btnDelComment:  { marginLeft:'auto', background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'14px' },
  addComment:     { display:'flex', gap:'8px' },
  commentInput:   { flex:1, padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px' },
  btnComment:     { padding:'10px 16px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' },
};