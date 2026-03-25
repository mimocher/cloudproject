const axios = require('axios');

// Adresse du service utilisateurs
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:5002';

// Bloquer un utilisateur
exports.blockUser = async (req, res) => {
  try {
    const rep = await axios.put(`${USER_SERVICE}/api/users/${req.params.id}`, { isBlocked: true });
    res.json({ message: `Utilisateur bloqué`, user: rep.data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Débloquer un utilisateur
exports.unblockUser = async (req, res) => {
  try {
    const rep = await axios.put(`${USER_SERVICE}/api/users/${req.params.id}`, { isBlocked: false });
    res.json({ message: `Utilisateur débloqué`, user: rep.data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Voir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const rep = await axios.get(`${USER_SERVICE}/api/users`, { params: req.query });
    res.json(rep.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const rep = await axios.delete(`${USER_SERVICE}/api/users/${req.params.id}`);
    res.json(rep.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};