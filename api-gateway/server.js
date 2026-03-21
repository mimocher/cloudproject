const express  = require('express');
const cors     = require('cors');
const axios    = require('axios');
const multer   = require('multer');
const FormData = require('form-data');
require('dotenv').config();

const app    = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const AUTH_URL    = process.env.AUTH_SERVICE_URL    || 'http://auth-service:5001';
const USER_URL    = process.env.USER_SERVICE_URL    || 'http://user-service:5002';
const ADMIN_URL   = process.env.ADMIN_SERVICE_URL   || 'http://admin-service:5003';
const PROJECT_URL = process.env.PROJECT_SERVICE_URL || 'http://project-service:5004';
const TASK_URL    = process.env.TASK_SERVICE_URL    || 'http://task-service:5005';

// ── Auth ─────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const r = await axios.post(`${AUTH_URL}/api/auth/register`, req.body);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const r = await axios.post(`${AUTH_URL}/api/auth/login`, req.body);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const r = await axios.get(`${AUTH_URL}/api/auth/me`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ── Users ────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const r = await axios.get(`${USER_URL}/api/users`, { params: req.query });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const r = await axios.get(`${USER_URL}/api/users/${req.params.id}`);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const r = await axios.put(`${USER_URL}/api/users/${req.params.id}`, req.body);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${USER_URL}/api/users/${req.params.id}`);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ── Admin ────────────────────────────────────────────────────
app.get('/api/admin/users', async (req, res) => {
  try {
    const r = await axios.get(`${ADMIN_URL}/api/admin/users`, { params: req.query });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.put('/api/admin/block/:id', async (req, res) => {
  try {
    const r = await axios.put(`${ADMIN_URL}/api/admin/block/${req.params.id}`);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.put('/api/admin/unblock/:id', async (req, res) => {
  try {
    const r = await axios.put(`${ADMIN_URL}/api/admin/unblock/${req.params.id}`);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${ADMIN_URL}/api/admin/users/${req.params.id}`);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ── Projects ─────────────────────────────────────────────────
app.get('/api/projects/categories', async (req, res) => {
  try {
    const r = await axios.get(`${PROJECT_URL}/api/projects/categories`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const r = await axios.get(`${PROJECT_URL}/api/projects`, {
      params:  req.query,
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const r = await axios.get(`${PROJECT_URL}/api/projects/${req.params.id}`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const r = await axios.post(`${PROJECT_URL}/api/projects`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const r = await axios.put(`${PROJECT_URL}/api/projects/${req.params.id}`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${PROJECT_URL}/api/projects/${req.params.id}`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.post('/api/projects/:id/members', async (req, res) => {
  try {
    const r = await axios.post(`${PROJECT_URL}/api/projects/${req.params.id}/members`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ── Tasks — ordre important : routes spécifiques AVANT /:id ──

// Rappels
app.get('/api/tasks/reminders', async (req, res) => {
  try {
    const r = await axios.get(`${TASK_URL}/api/tasks/reminders`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Liste tâches
app.get('/api/tasks', async (req, res) => {
  try {
    const r = await axios.get(`${TASK_URL}/api/tasks`, {
      params:  req.query,
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Une tâche
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const r = await axios.get(`${TASK_URL}/api/tasks/${req.params.id}`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Créer tâche
app.post('/api/tasks', async (req, res) => {
  try {
    const r = await axios.post(`${TASK_URL}/api/tasks`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Modifier tâche
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const r = await axios.put(`${TASK_URL}/api/tasks/${req.params.id}`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Changer statut
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const r = await axios.patch(`${TASK_URL}/api/tasks/${req.params.id}/status`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Rappel
app.patch('/api/tasks/:id/reminder', async (req, res) => {
  try {
    const r = await axios.patch(`${TASK_URL}/api/tasks/${req.params.id}/reminder`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Supprimer tâche
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${TASK_URL}/api/tasks/${req.params.id}`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Commentaires
app.post('/api/tasks/:id/comments', async (req, res) => {
  try {
    const r = await axios.post(`${TASK_URL}/api/tasks/${req.params.id}/comments`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.delete('/api/tasks/:id/comments/:commentId', async (req, res) => {
  try {
    const r = await axios.delete(
      `${TASK_URL}/api/tasks/${req.params.id}/comments/${req.params.commentId}`,
      { headers: { authorization: req.headers.authorization } }
    );
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Upload fichier
app.post('/api/tasks/:id/files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype
    });

    const r = await axios.post(
      `${TASK_URL}/api/tasks/${req.params.id}/files`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          authorization: req.headers.authorization
        }
      }
    );
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Télécharger fichier
app.get('/api/tasks/:id/files/:filename', async (req, res) => {
  try {
    const r = await axios.get(
      `${TASK_URL}/api/tasks/${req.params.id}/files/${req.params.filename}`,
      {
        headers:      { authorization: req.headers.authorization },
        responseType: 'stream'
      }
    );
    res.setHeader('Content-Disposition', r.headers['content-disposition'] || `attachment; filename="${req.params.filename}"`);
    res.setHeader('Content-Type', r.headers['content-type'] || 'application/octet-stream');
    r.data.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer fichier
app.delete('/api/tasks/:id/files/:filename', async (req, res) => {
  try {
    const r = await axios.delete(
      `${TASK_URL}/api/tasks/${req.params.id}/files/${req.params.filename}`,
      { headers: { authorization: req.headers.authorization } }
    );
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

const CHAT_URL = process.env.CHAT_SERVICE_URL || 'http://chat-service:5006';

// ── Chat ─────────────────────────────────────────────────────
app.get('/api/chat/:projectId', async (req, res) => {
  try {
    const r = await axios.get(`${CHAT_URL}/api/chat/${req.params.projectId}`, {
      params:  req.query,
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.post('/api/chat/:projectId', async (req, res) => {
  try {
    const r = await axios.post(`${CHAT_URL}/api/chat/${req.params.projectId}`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.delete('/api/chat/messages/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${CHAT_URL}/api/chat/messages/${req.params.id}`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ── Notifications ────────────────────────────────────────────
app.get('/api/notifications', async (req, res) => {
  try {
    const r = await axios.get(`${CHAT_URL}/api/notifications`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const r = await axios.post(`${CHAT_URL}/api/notifications`, req.body, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const r = await axios.patch(`${CHAT_URL}/api/notifications/read-all`, {}, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const r = await axios.patch(`${CHAT_URL}/api/notifications/${req.params.id}/read`, {}, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${CHAT_URL}/api/notifications/${req.params.id}`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});
const REPORT_URL = process.env.REPORT_SERVICE_URL || 'http://report-service:5007';

// ── Reports ──────────────────────────────────────────────────
app.get('/api/reports/overview', async (req, res) => {
  try {
    const r = await axios.get(`${REPORT_URL}/api/reports/overview`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/reports/tasks-by-status', async (req, res) => {
  try {
    const r = await axios.get(`${REPORT_URL}/api/reports/tasks-by-status`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/reports/tasks-by-priority', async (req, res) => {
  try {
    const r = await axios.get(`${REPORT_URL}/api/reports/tasks-by-priority`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/reports/tasks-by-user', async (req, res) => {
  try {
    const r = await axios.get(`${REPORT_URL}/api/reports/tasks-by-user`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/reports/projects-by-category', async (req, res) => {
  try {
    const r = await axios.get(`${REPORT_URL}/api/reports/projects-by-category`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/reports/activity', async (req, res) => {
  try {
    const r = await axios.get(`${REPORT_URL}/api/reports/activity`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get('/api/reports/project/:id', async (req, res) => {
  try {
    const r = await axios.get(`${REPORT_URL}/api/reports/project/${req.params.id}`, {
      headers: { authorization: req.headers.authorization }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});
// ── Test ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'API Gateway fonctionne sur le port 5000' });
});

app.listen(5000, () => {
  console.log('API Gateway démarré sur http://localhost:5000');
});