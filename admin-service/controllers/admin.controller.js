const axios = require('axios');

// URL du user-service (Docker ou local)
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:5002';

// PUT /api/admin/block/:id  — bloquer un utilisateur
exports.blockUser = async (req, res) => {
  try {
    const response = await axios.put(
      `${USER_SERVICE}/api/users/${req.params.id}`,
      { isBlocked: true }
    );
    res.json({
      message: `Utilisateur ${req.params.id} bloqué avec succès`,
      user: response.data.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/unblock/:id  — débloquer
exports.unblockUser = async (req, res) => {
  try {
    const response = await axios.put(
      `${USER_SERVICE}/api/users/${req.params.id}`,
      { isBlocked: false }
    );
    res.json({
      message: `Utilisateur ${req.params.id} débloqué avec succès`,
      user: response.data.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/users  — tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE}/api/users`, {
      params: req.query
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/users/:id  — supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const response = await axios.delete(
      `${USER_SERVICE}/api/users/${req.params.id}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};