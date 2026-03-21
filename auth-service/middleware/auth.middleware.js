const jwt    = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secret_m206_jwt';

// Vérifier le token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token manquant, accès refusé' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// Vérifier si admin
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé : rôle admin requis' });
  }
  next();
};

// Vérifier si member ou admin
const isMember = (req, res, next) => {
  if (!['admin', 'member'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Accès refusé : rôle member requis' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isMember };