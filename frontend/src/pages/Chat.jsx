import { useEffect, useState, useRef } from 'react';
import { useNavigate }                  from 'react-router-dom';
import API                              from '../services/api';
import { connectSocket, getSocket }     from '../services/socket';

export default function Chat() {
  const navigate    = useNavigate();
  const user        = JSON.parse(localStorage.getItem('user') || '{}');
  const token       = localStorage.getItem('token');
  const messagesEnd = useRef(null);

  const [projects,       setProjects]       = useState([]);
  const [selProject,     setSelProject]     = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [content,        setContent]        = useState('');
  const [typing,         setTyping]         = useState('');
  const [onlineUsers,    setOnlineUsers]    = useState([]);
  const [notifications,  setNotifications]  = useState([]);
  const [unread,         setUnread]         = useState(0);
  const [showNotif,      setShowNotif]      = useState(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const socket = connectSocket(token);
    fetchProjects();
    fetchNotifications();

    // Écouter les événements
    socket.on('message:new', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    socket.on('typing:start', ({ username }) => {
      setTyping(`${username} est en train d'écrire...`);
    });

    socket.on('typing:stop', () => {
      setTyping('');
    });

    socket.on('notification:new', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnread(prev => prev + 1);
    });

    return () => {
      socket.off('message:new');
      socket.off('users:online');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('notification:new');
    };
  }, []);

  useEffect(() => {
    if (selProject) {
      const socket = getSocket();
      socket?.emit('join:project', selProject._id);
      fetchMessages(selProject._id);
    }
  }, [selProject]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/api/projects');
      setProjects(res.data.projects || []);
      if (res.data.projects?.length > 0) {
        setSelProject(res.data.projects[0]);
      }
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (projectId) => {
    try {
      const res = await API.get(`/api/chat/${projectId}`);
      setMessages(res.data.messages || []);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch (err) { console.error(err); }
  };

  const handleSend = () => {
    if (!content.trim() || !selProject) return;
    const socket = getSocket();
    socket?.emit('message:send', {
      projectId: selProject._id,
      content:   content.trim()
    });
    setContent('');
    socket?.emit('typing:stop', { projectId: selProject._id });
  };

  const handleTyping = (val) => {
    setContent(val);
    const socket = getSocket();
    socket?.emit('typing:start', { projectId: selProject._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('typing:stop', { projectId: selProject._id });
    }, 1500);
  };

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/api/notifications/read-all');
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleMarkRead = async (id) => {
    try {
      await API.patch(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await API.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleDeleteMsg = async (msgId) => {
    try {
      await API.delete(`/api/chat/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (err) { console.error(err); }
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  const notifIcon = (type) => {
    if (type === 'new_task')       return '📋';
    if (type === 'task_updated')   return '✏️';
    if (type === 'task_completed') return '✅';
    if (type === 'new_message')    return '💬';
    if (type === 'new_comment')    return '🗨️';
    if (type === 'project_added')  return '📁';
    return '🔔';
  };

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
          <button style={{ ...styles.navBtn, background:'rgba(255,255,255,0.3)' }}>
            Chat
          </button>

          {/* Notifications */}
          <div style={{ position:'relative' }}>
            <button style={styles.notifBtn}
              onClick={() => setShowNotif(!showNotif)}>
              🔔
              {unread > 0 && (
                <span style={styles.notifBadge}>{unread}</span>
              )}
            </button>

            {showNotif && (
              <div style={styles.notifPanel}>
                <div style={styles.notifHeader}>
                  <span style={{ fontWeight:600 }}>
                    Notifications ({unread} non lues)
                  </span>
                  <button style={styles.readAllBtn} onClick={handleMarkAllRead}>
                    Tout lire
                  </button>
                </div>

                <div style={styles.notifList}>
                  {notifications.length === 0 && (
                    <p style={styles.emptyNotif}>Aucune notification</p>
                  )}
                  {notifications.map(n => (
                    <div key={n._id}
                      style={{ ...styles.notifItem,
                        background: n.read ? '#fff' : '#eef2ff' }}
                      onClick={() => handleMarkRead(n._id)}>
                      <span style={styles.notifIcon}>{notifIcon(n.type)}</span>
                      <div style={styles.notifContent}>
                        <p style={styles.notifTitle}>{n.title}</p>
                        <p style={styles.notifText}>{n.content}</p>
                        <p style={styles.notifTime}>
                          {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <button style={styles.notifDel}
                        onClick={e => { e.stopPropagation(); handleDeleteNotif(n._id); }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button style={styles.logoutBtn}
            onClick={() => { localStorage.clear(); navigate('/login'); }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ── Corps principal ── */}
      <div style={styles.body}>

        {/* ── Sidebar projets ── */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>💬 Projets</h3>
          {projects.map(p => (
            <div key={p._id}
              style={{ ...styles.projectItem,
                background: selProject?._id === p._id ? '#eef2ff' : 'transparent',
                borderLeft: selProject?._id === p._id ? '3px solid #4f46e5' : '3px solid transparent'
              }}
              onClick={() => setSelProject(p)}>
              <span style={styles.projectName}>{p.name}</span>
              <span style={{ ...styles.statusDot,
                background: p.status === 'active' ? '#16a34a' : '#888' }} />
            </div>
          ))}

          {/* Utilisateurs en ligne */}
          <div style={styles.onlineSection}>
            <h4 style={styles.onlineTitle}>
              🟢 En ligne ({onlineUsers.length})
            </h4>
          </div>
        </div>

        {/* ── Zone de chat ── */}
        <div style={styles.chatArea}>
          {!selProject ? (
            <div style={styles.noProject}>
              <p>Sélectionnez un projet pour démarrer le chat</p>
            </div>
          ) : (
            <>
              {/* Header chat */}
              <div style={styles.chatHeader}>
                <div>
                  <h3 style={{ margin:0 }}># {selProject.name}</h3>
                  <p style={styles.chatSubtitle}>
                    {selProject.members?.length || 0} membre(s)
                  </p>
                </div>
                <span style={{ ...styles.statusPill,
                  background: selProject.status === 'active' ? '#dcfce7' : '#f0f0f0',
                  color:      selProject.status === 'active' ? '#16a34a' : '#888'
                }}>
                  {selProject.status === 'active' ? 'Actif' :
                   selProject.status === 'completed' ? 'Terminé' : 'En pause'}
                </span>
              </div>

              {/* Messages */}
              <div style={styles.messages}>
                {messages.length === 0 && (
                  <div style={styles.noMessages}>
                    <p>Aucun message — soyez le premier à écrire ! 👋</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user.id ||
                               msg.sender === user.id;
                  const showDate = i === 0 ||
                    new Date(msg.createdAt).toDateString() !==
                    new Date(messages[i-1]?.createdAt).toDateString();

                  return (
                    <div key={msg._id}>
                      {showDate && (
                        <div style={styles.dateSep}>
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                            weekday:'long', day:'numeric', month:'long'
                          })}
                        </div>
                      )}
                      <div style={{ ...styles.msgRow,
                        justifyContent: isMe ? 'flex-end' : 'flex-start' }}>

                        {!isMe && (
                          <div style={styles.avatar}>
                            {msg.sender?.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}

                        <div style={{ maxWidth:'65%' }}>
                          {!isMe && (
                            <p style={styles.senderName}>
                              {msg.sender?.username}
                            </p>
                          )}
                          <div style={{ ...styles.bubble,
                            background:   isMe ? '#4f46e5' : '#fff',
                            color:        isMe ? '#fff'    : '#333',
                            borderRadius: isMe
                              ? '18px 18px 4px 18px'
                              : '18px 18px 18px 4px'
                          }}>
                            {msg.content}
                          </div>
                          <p style={{ ...styles.msgTime,
                            textAlign: isMe ? 'right' : 'left' }}>
                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                              hour:'2-digit', minute:'2-digit'
                            })}
                            {isMe && (
                              <button style={styles.delMsgBtn}
                                onClick={() => handleDeleteMsg(msg._id)}>
                                🗑
                              </button>
                            )}
                          </p>
                        </div>

                        {isMe && (
                          <div style={{ ...styles.avatar, background:'#4f46e5' }}>
                            {user.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Indicateur typing */}
                {typing && (
                  <div style={styles.typing}>{typing}</div>
                )}

                <div ref={messagesEnd} />
              </div>

              {/* Input message */}
              <div style={styles.inputArea}>
                <input
                  style={styles.msgInput}
                  placeholder={`Message dans #${selProject.name}...`}
                  value={content}
                  onChange={e => handleTyping(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <button style={styles.sendBtn} onClick={handleSend}
                  disabled={!content.trim()}>
                  Envoyer ➤
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { height:'100vh', display:'flex', flexDirection:'column', fontFamily:'sans-serif', overflow:'hidden' },
  header:        { background:'#4f46e5', color:'#fff', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 },
  logo:          { margin:0, fontSize:'18px' },
  nav:           { display:'flex', gap:'8px', alignItems:'center' },
  navBtn:        { padding:'5px 12px', background:'rgba(255,255,255,0.15)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  logoutBtn:     { padding:'5px 12px', background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  notifBtn:      { position:'relative', padding:'5px 12px', background:'rgba(255,255,255,0.15)', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'16px' },
  notifBadge:    { position:'absolute', top:'-4px', right:'-4px', background:'#dc2626', color:'#fff', borderRadius:'50%', width:'16px', height:'16px', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center' },
  notifPanel:    { position:'absolute', top:'40px', right:0, width:'340px', background:'#fff', borderRadius:'12px', boxShadow:'0 8px 30px rgba(0,0,0,0.15)', zIndex:1000, overflow:'hidden' },
  notifHeader:   { padding:'12px 16px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' },
  readAllBtn:    { padding:'4px 10px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  notifList:     { maxHeight:'400px', overflowY:'auto' },
  notifItem:     { display:'flex', alignItems:'flex-start', gap:'10px', padding:'12px 16px', borderBottom:'1px solid #f0f0f0', cursor:'pointer' },
  notifIcon:     { fontSize:'20px', flexShrink:0 },
  notifContent:  { flex:1 },
  notifTitle:    { margin:'0 0 2px', fontWeight:'600', fontSize:'13px', color:'#333' },
  notifText:     { margin:'0 0 4px', fontSize:'12px', color:'#666' },
  notifTime:     { margin:0, fontSize:'11px', color:'#aaa' },
  notifDel:      { background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'14px', flexShrink:0 },
  emptyNotif:    { padding:'20px', textAlign:'center', color:'#888', fontSize:'14px' },
  body:          { display:'flex', flex:1, overflow:'hidden' },
  sidebar:       { width:'240px', background:'#1e1b4b', color:'#fff', padding:'16px', overflowY:'auto', flexShrink:0 },
  sidebarTitle:  { margin:'0 0 16px', fontSize:'14px', fontWeight:'700', color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'1px' },
  projectItem:   { padding:'10px 12px', borderRadius:'8px', cursor:'pointer', marginBottom:'4px', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.2s' },
  projectName:   { fontSize:'14px', color:'#e0e7ff' },
  statusDot:     { width:'8px', height:'8px', borderRadius:'50%', flexShrink:0 },
  onlineSection: { marginTop:'24px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'16px' },
  onlineTitle:   { margin:'0 0 8px', fontSize:'12px', color:'#a5b4fc', fontWeight:'600' },
  chatArea:      { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  chatHeader:    { padding:'16px 24px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', flexShrink:0 },
  chatSubtitle:  { margin:'2px 0 0', fontSize:'13px', color:'#888' },
  statusPill:    { padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'600' },
  messages:      { flex:1, overflowY:'auto', padding:'20px 24px', background:'#f8fafc' },
  noMessages:    { textAlign:'center', color:'#888', marginTop:'80px', fontSize:'15px' },
  noProject:     { flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#888', fontSize:'16px' },
  dateSep:       { textAlign:'center', color:'#aaa', fontSize:'12px', margin:'16px 0', position:'relative' },
  msgRow:        { display:'flex', alignItems:'flex-end', gap:'8px', marginBottom:'12px' },
  avatar:        { width:'32px', height:'32px', borderRadius:'50%', background:'#c7d2fe', color:'#4f46e5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'13px', flexShrink:0 },
  senderName:    { margin:'0 0 2px 4px', fontSize:'12px', color:'#888', fontWeight:'600' },
  bubble:        { padding:'10px 16px', fontSize:'14px', lineHeight:'1.5', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  msgTime:       { margin:'2px 4px 0', fontSize:'11px', color:'#aaa', display:'flex', alignItems:'center', gap:'6px' },
  delMsgBtn:     { background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#aaa', padding:0 },
  typing:        { color:'#888', fontSize:'13px', fontStyle:'italic', padding:'4px 0' },
  inputArea:     { padding:'16px 24px', borderTop:'1px solid #eee', display:'flex', gap:'12px', background:'#fff', flexShrink:0 },
  msgInput:      { flex:1, padding:'12px 16px', border:'1px solid #ddd', borderRadius:'24px', fontSize:'14px', outline:'none' },
  sendBtn:       { padding:'12px 24px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'24px', cursor:'pointer', fontWeight:'600', fontSize:'14px' },
};