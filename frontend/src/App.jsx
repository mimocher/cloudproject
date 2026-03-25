import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects  from './pages/Projects';
import Tasks     from './pages/Tasks';
import Chat      from './pages/Chat';
import Reports   from './pages/Reports';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/projects',  label: 'Projets'   },
  { path: '/tasks',     label: 'Tâches'    },
  { path: '/chat',      label: 'Chat'      },
  { path: '/reports',   label: 'Rapports'  },
];

function Navbar() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>Tasks Manager</span>
      <div style={styles.links}>
        {navItems.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>
      <button onClick={handleLogout} style={styles.logout}>
        Déconnexion
      </button>
    </nav>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Navigate to="/login" />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/projects"  element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/tasks"     element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/chat"      element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/reports"   element={<PrivateRoute><Reports /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 28px',
    height: '58px',
    background: '#ffffff',
    borderBottom: '1px solid #e8eaed',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    gap: 0,
  },
  brand: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: '.06em',
    marginRight: '36px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  brandDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#4f6ef7',
    display: 'inline-block',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flex: 1,
    height: '100%',
  },
  link: {
    padding: '6px 14px',
    fontSize: '13.5px',
    fontWeight: '500',
    color: '#6b7280',
    textDecoration: 'none',
    borderRadius: '8px',
    letterSpacing: '.01em',
    transition: 'all .18s ease',
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
  },
  linkActive: {
    background: '#eff2ff',
    color: '#4f6ef7',
    borderColor: '#dde3ff',
    fontWeight: '600',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: 'auto',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    flexShrink: 0,
  },
  logout: {
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '6px 14px',
    transition: 'all .18s ease',
  },
};