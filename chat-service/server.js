const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const http     = require('http');
const { Server } = require('socket.io');
const jwt      = require('jsonwebtoken');
require('dotenv').config();

const Message      = require('./models/Message');
const Notification = require('./models/Notification');
require('./models/User');

const SECRET = process.env.JWT_SECRET || 'secret_m206_jwt';

const app    = express();
const server = http.createServer(app);

// Socket.IO avec CORS
const io = new Server(server, {
  cors: {
    origin:  '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/chat',          require('./routes/chat.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Chat Service fonctionne sur le port 5006' });
});

// ── Utilisateurs connectés en ligne ────────────────────────
const onlineUsers = new Map(); // userId -> socketId

// ── Socket.IO ───────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token ||
                socket.handshake.query?.token;
  if (!token) return next(new Error('Token manquant'));
  try {
    socket.user = jwt.verify(token, SECRET);
    next();
  } catch {
    next(new Error('Token invalide'));
  }
});

io.on('connection', (socket) => {
  const userId   = socket.user.id;
  const username = socket.user.username;

  // Enregistrer utilisateur en ligne
  onlineUsers.set(userId, socket.id);
  io.emit('users:online', Array.from(onlineUsers.keys()));
  console.log(`✅ ${username} connecté (${socket.id})`);

  // ── Rejoindre un projet (room) ──────────────────────────
  socket.on('join:project', (projectId) => {
    socket.join(`project:${projectId}`);
    socket.emit('joined', { projectId });
    console.log(`${username} a rejoint project:${projectId}`);
  });

  // ── Quitter un projet ───────────────────────────────────
  socket.on('leave:project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`${username} a quitté project:${projectId}`);
  });

  // ── Envoyer un message ──────────────────────────────────
  socket.on('message:send', async (data) => {
    try {
      const { projectId, content } = data;
      if (!content?.trim()) return;

      const message = await Message.create({
        content:  content.trim(),
        sender:   userId,
        project:  projectId,
        type:     'text',
        readBy:   [userId]
      });

      await message.populate('sender', 'username');

      // Envoyer à tous dans la room du projet
      io.to(`project:${projectId}`).emit('message:new', message);

    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // ── Notification en temps réel ──────────────────────────
  socket.on('notification:send', async (data) => {
    try {
      const { recipientId, type, title, content, link } = data;

      const notification = await Notification.create({
        recipient: recipientId,
        sender:    userId,
        type,
        title,
        content,
        link
      });

      // Envoyer en temps réel si le destinataire est connecté
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('notification:new', notification);
      }

    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // ── Utilisateur en train d'écrire ───────────────────────
  socket.on('typing:start', ({ projectId }) => {
    socket.to(`project:${projectId}`).emit('typing:start', { username });
  });

  socket.on('typing:stop', ({ projectId }) => {
    socket.to(`project:${projectId}`).emit('typing:stop', { username });
  });

  // ── Déconnexion ─────────────────────────────────────────
  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log(`❌ ${username} déconnecté`);
  });
});

// ── MongoDB ─────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/projet_m206_db')
  .then(() => console.log('Chat Service : MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

const PORT = 5006;
server.listen(PORT, () => {
  console.log(`Chat Service démarré sur http://localhost:${PORT}`);
});