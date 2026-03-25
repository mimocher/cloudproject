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

// Adresses des services
const AUTH    = process.env.AUTH_SERVICE_URL    || 'http://auth-service:5001';
const USER    = process.env.USER_SERVICE_URL    || 'http://user-service:5002';
const ADMIN   = process.env.ADMIN_SERVICE_URL   || 'http://admin-service:5003';
const PROJECT = process.env.PROJECT_SERVICE_URL || 'http://project-service:5004';
const TASK    = process.env.TASK_SERVICE_URL    || 'http://task-service:5005';
const CHAT    = process.env.CHAT_SERVICE_URL    || 'http://chat-service:5006';
const REPORT  = process.env.REPORT_SERVICE_URL  || 'http://report-service:5007';

// pour la reponse ou en cas d err
async function send(req, res, fn) {
  try {
    const r = await fn();
    res.status(r.status).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
}

// le token d auth
const H = (req) => ({ authorization: req.headers.authorization });

// ── AUTH ──────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => send(req, res, () => axios.post(`${AUTH}/api/auth/register`, req.body)));
app.post('/api/auth/login',    (req, res) => send(req, res, () => axios.post(`${AUTH}/api/auth/login`,    req.body)));
app.get ('/api/auth/me',       (req, res) => send(req, res, () => axios.get (`${AUTH}/api/auth/me`,       { headers: H(req) })));

// ── USERS ─────────────────────────────────────────────────────
app.get   ('/api/users',     (req, res) => send(req, res, () => axios.get   (`${USER}/api/users`,            { params: req.query })));
app.get   ('/api/users/:id', (req, res) => send(req, res, () => axios.get   (`${USER}/api/users/${req.params.id}`)));
app.put   ('/api/users/:id', (req, res) => send(req, res, () => axios.put   (`${USER}/api/users/${req.params.id}`, req.body)));
app.delete('/api/users/:id', (req, res) => send(req, res, () => axios.delete(`${USER}/api/users/${req.params.id}`)));

// ── ADMIN ─────────────────────────────────────────────────────
app.get   ('/api/admin/users',       (req, res) => send(req, res, () => axios.get   (`${ADMIN}/api/admin/users`,              { params: req.query })));
app.put   ('/api/admin/block/:id',   (req, res) => send(req, res, () => axios.put   (`${ADMIN}/api/admin/block/${req.params.id}`)));
app.put   ('/api/admin/unblock/:id', (req, res) => send(req, res, () => axios.put   (`${ADMIN}/api/admin/unblock/${req.params.id}`)));
app.delete('/api/admin/users/:id',   (req, res) => send(req, res, () => axios.delete(`${ADMIN}/api/admin/users/${req.params.id}`)));

// ── PROJECTS ──────────────────────────────────────────────────
app.get   ('/api/projects/categories',  (req, res) => send(req, res, () => axios.get   (`${PROJECT}/api/projects/categories`,                    { headers: H(req) })));
app.get   ('/api/projects',             (req, res) => send(req, res, () => axios.get   (`${PROJECT}/api/projects`,                               { params: req.query, headers: H(req) })));
app.get   ('/api/projects/:id',         (req, res) => send(req, res, () => axios.get   (`${PROJECT}/api/projects/${req.params.id}`,               { headers: H(req) })));
app.post  ('/api/projects',             (req, res) => send(req, res, () => axios.post  (`${PROJECT}/api/projects`,             req.body,          { headers: H(req) })));
app.put   ('/api/projects/:id',         (req, res) => send(req, res, () => axios.put   (`${PROJECT}/api/projects/${req.params.id}`, req.body,     { headers: H(req) })));
app.delete('/api/projects/:id',         (req, res) => send(req, res, () => axios.delete(`${PROJECT}/api/projects/${req.params.id}`,               { headers: H(req) })));
app.post  ('/api/projects/:id/members', (req, res) => send(req, res, () => axios.post  (`${PROJECT}/api/projects/${req.params.id}/members`, req.body, { headers: H(req) })));

// ── TASKS ─────────────────────────────────────────────────────
app.get   ('/api/tasks/reminders',         (req, res) => send(req, res, () => axios.get   (`${TASK}/api/tasks/reminders`,                           { headers: H(req) })));
app.get   ('/api/tasks',                   (req, res) => send(req, res, () => axios.get   (`${TASK}/api/tasks`,                                     { params: req.query, headers: H(req) })));
app.get   ('/api/tasks/:id',               (req, res) => send(req, res, () => axios.get   (`${TASK}/api/tasks/${req.params.id}`,                     { headers: H(req) })));
app.post  ('/api/tasks',                   (req, res) => send(req, res, () => axios.post  (`${TASK}/api/tasks`,                   req.body,          { headers: H(req) })));
app.put   ('/api/tasks/:id',               (req, res) => send(req, res, () => axios.put   (`${TASK}/api/tasks/${req.params.id}`,   req.body,         { headers: H(req) })));
app.patch ('/api/tasks/:id/status',        (req, res) => send(req, res, () => axios.patch (`${TASK}/api/tasks/${req.params.id}/status`,   req.body,  { headers: H(req) })));
app.patch ('/api/tasks/:id/reminder',      (req, res) => send(req, res, () => axios.patch (`${TASK}/api/tasks/${req.params.id}/reminder`,  req.body, { headers: H(req) })));
app.delete('/api/tasks/:id',               (req, res) => send(req, res, () => axios.delete(`${TASK}/api/tasks/${req.params.id}`,                     { headers: H(req) })));
app.post  ('/api/tasks/:id/comments',      (req, res) => send(req, res, () => axios.post  (`${TASK}/api/tasks/${req.params.id}/comments`, req.body,  { headers: H(req) })));
app.delete('/api/tasks/:id/comments/:cId', (req, res) => send(req, res, () => axios.delete(`${TASK}/api/tasks/${req.params.id}/comments/${req.params.cId}`, { headers: H(req) })));

// Upload fichier (cas spécial)
app.post('/api/tasks/:id/files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    const form = new FormData();
    form.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
    const r = await axios.post(`${TASK}/api/tasks/${req.params.id}/files`, form, {
      headers: { ...form.getHeaders(), ...H(req) }
    });
    res.status(r.status).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// Télécharger fichier (cas spécial : stream)
app.get('/api/tasks/:id/files/:filename', async (req, res) => {
  try {
    const r = await axios.get(`${TASK}/api/tasks/${req.params.id}/files/${req.params.filename}`, {
      headers: H(req), responseType: 'stream'
    });
    res.setHeader('Content-Disposition', r.headers['content-disposition'] || `attachment; filename="${req.params.filename}"`);
    res.setHeader('Content-Type', r.headers['content-type'] || 'application/octet-stream');
    r.data.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/tasks/:id/files/:filename', (req, res) => send(req, res, () => axios.delete(`${TASK}/api/tasks/${req.params.id}/files/${req.params.filename}`, { headers: H(req) })));

// ── CHAT ──────────────────────────────────────────────────────
app.get   ('/api/chat/:projectId',   (req, res) => send(req, res, () => axios.get   (`${CHAT}/api/chat/${req.params.projectId}`, { params: req.query, headers: H(req) })));
app.post  ('/api/chat/:projectId',   (req, res) => send(req, res, () => axios.post  (`${CHAT}/api/chat/${req.params.projectId}`, req.body, { headers: H(req) })));
app.delete('/api/chat/messages/:id', (req, res) => send(req, res, () => axios.delete(`${CHAT}/api/chat/messages/${req.params.id}`,        { headers: H(req) })));

// ── NOTIFICATIONS ─────────────────────────────────────────────
app.get   ('/api/notifications',          (req, res) => send(req, res, () => axios.get   (`${CHAT}/api/notifications`,                          { headers: H(req) })));
app.post  ('/api/notifications',          (req, res) => send(req, res, () => axios.post  (`${CHAT}/api/notifications`,          req.body,       { headers: H(req) })));
app.patch ('/api/notifications/read-all', (req, res) => send(req, res, () => axios.patch (`${CHAT}/api/notifications/read-all`, {},             { headers: H(req) })));
app.patch ('/api/notifications/:id/read', (req, res) => send(req, res, () => axios.patch (`${CHAT}/api/notifications/${req.params.id}/read`, {}, { headers: H(req) })));
app.delete('/api/notifications/:id',      (req, res) => send(req, res, () => axios.delete(`${CHAT}/api/notifications/${req.params.id}`,         { headers: H(req) })));

// ── REPORTS ───────────────────────────────────────────────────
app.get('/api/reports/overview',             (req, res) => send(req, res, () => axios.get(`${REPORT}/api/reports/overview`,             { headers: H(req) })));
app.get('/api/reports/tasks-by-status',      (req, res) => send(req, res, () => axios.get(`${REPORT}/api/reports/tasks-by-status`,      { headers: H(req) })));
app.get('/api/reports/tasks-by-priority',    (req, res) => send(req, res, () => axios.get(`${REPORT}/api/reports/tasks-by-priority`,    { headers: H(req) })));
app.get('/api/reports/tasks-by-user',        (req, res) => send(req, res, () => axios.get(`${REPORT}/api/reports/tasks-by-user`,        { headers: H(req) })));
app.get('/api/reports/projects-by-category', (req, res) => send(req, res, () => axios.get(`${REPORT}/api/reports/projects-by-category`, { headers: H(req) })));
app.get('/api/reports/activity',             (req, res) => send(req, res, () => axios.get(`${REPORT}/api/reports/activity`,             { headers: H(req) })));
app.get('/api/reports/project/:id',          (req, res) => send(req, res, () => axios.get(`${REPORT}/api/reports/project/${req.params.id}`, { headers: H(req) })));

// ── TEST ──────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'API Gateway fonctionne sur le port 5000' }));

app.listen(5000, () => console.log('API Gateway démarré sur http://localhost:5000'));