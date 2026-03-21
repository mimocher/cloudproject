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

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé : admin requis' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };