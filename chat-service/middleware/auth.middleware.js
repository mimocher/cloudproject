const jwt    = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secret_m206_jwt';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// Vérifier token depuis query string (pour Socket.IO)
const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth?.token ||
                socket.handshake.query?.token;
  if (!token) return next(new Error('Token manquant'));
  try {
    socket.user = jwt.verify(token, SECRET);
    next();
  } catch {
    next(new Error('Token invalide'));
  }
};

module.exports = { verifyToken, verifySocketToken };