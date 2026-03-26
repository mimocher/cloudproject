const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secret_m206_jwt';
//Verificqtion du token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Token manquant, accès refusé' });
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};
//Verification si il est admin ou pas
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé : rôle admin requis' });
  }

  next();
};
//Verfication si il est admin ou membre
const isMember = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'member') {
    return res.status(403).json({ error: 'Accès refusé : rôle member requis' });
  }

  next();
};

module.exports = { verifyToken, isAdmin, isMember };
