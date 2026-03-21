const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { verifyToken }            = require('../middleware/auth.middleware');

// Routes publiques
router.post('/register', register);
router.post('/login',    login);

// Route protégée
router.get('/me', verifyToken, getMe);

module.exports = router;