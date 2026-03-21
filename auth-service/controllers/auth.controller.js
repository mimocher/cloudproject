const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secret_m206_jwt';

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Vérifier si l'email existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Compte bloqué, contactez l\'administrateur' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        role:     user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me  (profil connecté)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};