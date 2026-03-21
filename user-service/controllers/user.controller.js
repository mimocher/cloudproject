const User = require('../models/User');

// GET /api/users  — liste avec recherche
exports.getAll = async (req, res) => {
  try {
    const { name, email, role } = req.query;
    const filter = {};

    if (name)  filter.username = new RegExp(name, 'i');
    if (email) filter.email    = new RegExp(email, 'i');
    if (role)  filter.role     = role;

    const users = await User.find(filter).select('-password');
    res.json({ total: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id  — un utilisateur
exports.getOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/:id  — modifier
exports.update = async (req, res) => {
  try {
    // Empêcher de modifier le mot de passe ici
    delete req.body.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur mis à jour', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/users/:id  — supprimer
exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};