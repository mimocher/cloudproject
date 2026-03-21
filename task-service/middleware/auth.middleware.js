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

module.exports = { verifyToken };