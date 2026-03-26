const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
require('dotenv').config();
const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
const USER_URL = process.env.USER_SERVICE_URL || 'http://user-service:5002';
const ADMIN_URL = process.env.ADMIN_SERVICE_URL || 'http://admin-service:5003';
const PROJECT_URL = process.env.PROJECT_SERVICE_URL || 'http://project-service:5004';
const TASK_URL = process.env.TASK_SERVICE_URL || 'http://task-service:5005';
const CHAT_URL = process.env.CHAT_SERVICE_URL || 'http://chat-service:5006';
const REPORT_URL = process.env.REPORT_SERVICE_URL || 'http://report-service:5007';

function authHeaders(req) {
  return {
    authorization: req.headers.authorization
  };
}

function handleError(res, err) {
  res
    .status(err.response?.status || 500)
    .json(err.response?.data || { error: err.message });
}

async function proxy(res, config) {
  try {
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (err) {
    handleError(res, err);
  }
}

// AUTH
app.post('/api/auth/register', async (req, res) => {
  await proxy(res, {
    method: 'post',
    url: `${AUTH_URL}/api/auth/register`,
    data: req.body
  });
});

app.post('/api/auth/login', async (req, res) => {
  await proxy(res, {
    method: 'post',
    url: `${AUTH_URL}/api/auth/login`,
    data: req.body
  });
});

app.get('/api/auth/me', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${AUTH_URL}/api/auth/me`,
    headers: authHeaders(req)
  });
});

// USERS
app.get('/api/users', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${USER_URL}/api/users`,
    params: req.query
  });
});

app.get('/api/users/:id', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${USER_URL}/api/users/${req.params.id}`
  });
});

app.put('/api/users/:id', async (req, res) => {
  await proxy(res, {
    method: 'put',
    url: `${USER_URL}/api/users/${req.params.id}`,
    data: req.body
  });
});

app.delete('/api/users/:id', async (req, res) => {
  await proxy(res, {
    method: 'delete',
    url: `${USER_URL}/api/users/${req.params.id}`
  });
});

// ADMIN
app.get('/api/admin/users', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${ADMIN_URL}/api/admin/users`,
    params: req.query
  });
});

app.put('/api/admin/block/:id', async (req, res) => {
  await proxy(res, {
    method: 'put',
    url: `${ADMIN_URL}/api/admin/block/${req.params.id}`
  });
});

app.put('/api/admin/unblock/:id', async (req, res) => {
  await proxy(res, {
    method: 'put',
    url: `${ADMIN_URL}/api/admin/unblock/${req.params.id}`
  });
});

app.delete('/api/admin/users/:id', async (req, res) => {
  await proxy(res, {
    method: 'delete',
    url: `${ADMIN_URL}/api/admin/users/${req.params.id}`
  });
});

// PROJECTS
app.get('/api/projects/categories', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${PROJECT_URL}/api/projects/categories`,
    headers: authHeaders(req)
  });
});

app.get('/api/projects', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${PROJECT_URL}/api/projects`,
    params: req.query,
    headers: authHeaders(req)
  });
});

app.get('/api/projects/:id', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${PROJECT_URL}/api/projects/${req.params.id}`,
    headers: authHeaders(req)
  });
});

app.post('/api/projects', async (req, res) => {
  await proxy(res, {
    method: 'post',
    url: `${PROJECT_URL}/api/projects`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.put('/api/projects/:id', async (req, res) => {
  await proxy(res, {
    method: 'put',
    url: `${PROJECT_URL}/api/projects/${req.params.id}`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.delete('/api/projects/:id', async (req, res) => {
  await proxy(res, {
    method: 'delete',
    url: `${PROJECT_URL}/api/projects/${req.params.id}`,
    headers: authHeaders(req)
  });
});

app.post('/api/projects/:id/members', async (req, res) => {
  await proxy(res, {
    method: 'post',
    url: `${PROJECT_URL}/api/projects/${req.params.id}/members`,
    data: req.body,
    headers: authHeaders(req)
  });
});

// TASKS
app.get('/api/tasks/reminders', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${TASK_URL}/api/tasks/reminders`,
    headers: authHeaders(req)
  });
});

app.get('/api/tasks', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${TASK_URL}/api/tasks`,
    params: req.query,
    headers: authHeaders(req)
  });
});

app.get('/api/tasks/:id', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${TASK_URL}/api/tasks/${req.params.id}`,
    headers: authHeaders(req)
  });
});

app.post('/api/tasks', async (req, res) => {
  await proxy(res, {
    method: 'post',
    url: `${TASK_URL}/api/tasks`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.put('/api/tasks/:id', async (req, res) => {
  await proxy(res, {
    method: 'put',
    url: `${TASK_URL}/api/tasks/${req.params.id}`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  await proxy(res, {
    method: 'patch',
    url: `${TASK_URL}/api/tasks/${req.params.id}/status`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.patch('/api/tasks/:id/reminder', async (req, res) => {
  await proxy(res, {
    method: 'patch',
    url: `${TASK_URL}/api/tasks/${req.params.id}/reminder`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.delete('/api/tasks/:id', async (req, res) => {
  await proxy(res, {
    method: 'delete',
    url: `${TASK_URL}/api/tasks/${req.params.id}`,
    headers: authHeaders(req)
  });
});

app.post('/api/tasks/:id/comments', async (req, res) => {
  await proxy(res, {
    method: 'post',
    url: `${TASK_URL}/api/tasks/${req.params.id}/comments`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.delete('/api/tasks/:id/comments/:commentId', async (req, res) => {
  await proxy(res, {
    method: 'delete',
    url: `${TASK_URL}/api/tasks/${req.params.id}/comments/${req.params.commentId}`,
    headers: authHeaders(req)
  });
});

// TASK FILES
app.post('/api/tasks/:id/files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(
      `${TASK_URL}/api/tasks/${req.params.id}/files`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          ...authHeaders(req)
        }
      }
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/tasks/:id/files/:filename', async (req, res) => {
  try {
    const response = await axios.get(
      `${TASK_URL}/api/tasks/${req.params.id}/files/${req.params.filename}`,
      {
        headers: authHeaders(req),
        responseType: 'stream'
      }
    );

    res.setHeader(
      'Content-Disposition',
      response.headers['content-disposition'] ||
        `attachment; filename="${req.params.filename}"`
    );

    res.setHeader(
      'Content-Type',
      response.headers['content-type'] || 'application/octet-stream'
    );

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id/files/:filename', async (req, res) => {
  await proxy(res, {
    method: 'delete',
    url: `${TASK_URL}/api/tasks/${req.params.id}/files/${req.params.filename}`,
    headers: authHeaders(req)
  });
});

// CHAT
app.get('/api/chat/:projectId', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${CHAT_URL}/api/chat/${req.params.projectId}`,
    params: req.query,
    headers: authHeaders(req)
  });
});

app.post('/api/chat/:projectId', async (req, res) => {
  await proxy(res, {
    method: 'post',
    url: `${CHAT_URL}/api/chat/${req.params.projectId}`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.delete('/api/chat/messages/:id', async (req, res) => {
  await proxy(res, {
    method: 'delete',
    url: `${CHAT_URL}/api/chat/messages/${req.params.id}`,
    headers: authHeaders(req)
  });
});

// NOTIFICATIONS
app.get('/api/notifications', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${CHAT_URL}/api/notifications`,
    headers: authHeaders(req)
  });
});

app.post('/api/notifications', async (req, res) => {
  await proxy(res, {
    method: 'post',
    url: `${CHAT_URL}/api/notifications`,
    data: req.body,
    headers: authHeaders(req)
  });
});

app.patch('/api/notifications/read-all', async (req, res) => {
  await proxy(res, {
    method: 'patch',
    url: `${CHAT_URL}/api/notifications/read-all`,
    data: {},
    headers: authHeaders(req)
  });
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  await proxy(res, {
    method: 'patch',
    url: `${CHAT_URL}/api/notifications/${req.params.id}/read`,
    data: {},
    headers: authHeaders(req)
  });
});

app.delete('/api/notifications/:id', async (req, res) => {
  await proxy(res, {
    method: 'delete',
    url: `${CHAT_URL}/api/notifications/${req.params.id}`,
    headers: authHeaders(req)
  });
});

// REPORTS
app.get('/api/reports/overview', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${REPORT_URL}/api/reports/overview`,
    headers: authHeaders(req)
  });
});

app.get('/api/reports/tasks-by-status', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${REPORT_URL}/api/reports/tasks-by-status`,
    headers: authHeaders(req)
  });
});

app.get('/api/reports/tasks-by-priority', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${REPORT_URL}/api/reports/tasks-by-priority`,
    headers: authHeaders(req)
  });
});

app.get('/api/reports/tasks-by-user', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${REPORT_URL}/api/reports/tasks-by-user`,
    headers: authHeaders(req)
  });
});

app.get('/api/reports/projects-by-category', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${REPORT_URL}/api/reports/projects-by-category`,
    headers: authHeaders(req)
  });
});

app.get('/api/reports/activity', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${REPORT_URL}/api/reports/activity`,
    headers: authHeaders(req)
  });
});

app.get('/api/reports/project/:id', async (req, res) => {
  await proxy(res, {
    method: 'get',
    url: `${REPORT_URL}/api/reports/project/${req.params.id}`,
    headers: authHeaders(req)
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'API Gateway fonctionne sur le port 5000' });
});

app.listen(5000, () => {
  console.log('API Gateway démarré sur http://localhost:5000');
});
