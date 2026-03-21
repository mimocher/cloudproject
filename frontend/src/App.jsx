import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects  from './pages/Projects';
import Tasks     from './pages/Tasks';
import Chat      from './pages/Chat';
import Reports   from './pages/Reports';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
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