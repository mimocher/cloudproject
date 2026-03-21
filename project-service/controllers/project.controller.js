const Project = require('../models/Project');

// ── GET /api/projects — liste avec filtres ──────────────────
exports.getAll = async (req, res) => {
  try {
    const { name, status, category, startDate, endDate } = req.query;
    const filter = {};

    if (name)      filter.name     = new RegExp(name, 'i');
    if (status)    filter.status   = status;
    if (category)  filter.category = new RegExp(category, 'i');

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate)   filter.startDate.$lte = new Date(endDate);
    }

    const projects = await Project.find(filter)
      .populate('owner',   'username email')
      .populate('members', 'username email')
      .sort({ createdAt: -1 });

    res.json({ total: projects.length, projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/projects/:id — un projet ──────────────────────
exports.getOne = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner',   'username email')
      .populate('members', 'username email');

    if (!project) return res.status(404).json({ error: 'Projet non trouvé' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/projects — créer ──────────────────────────────
exports.create = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, category, members } = req.body;

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      status,
      category,
      members: members || [],
      owner:   req.user.id
    });

    await project.save();
    await project.populate('owner',   'username email');
    await project.populate('members', 'username email');

    res.status(201).json({ message: 'Projet créé avec succès', project });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── PUT /api/projects/:id — modifier ───────────────────────
exports.update = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projet non trouvé' });

    // Seul le owner ou admin peut modifier
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('owner',   'username email')
      .populate('members', 'username email');

    res.json({ message: 'Projet mis à jour', project: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE /api/projects/:id — supprimer ───────────────────
exports.remove = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projet non trouvé' });

    // Seul le owner ou admin peut supprimer
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/projects/categories — toutes les catégories ───
exports.getCategories = async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    res.json({ categories: categories.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/projects/:id/members — ajouter un membre ─────
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    )
      .populate('owner',   'username email')
      .populate('members', 'username email');

    if (!project) return res.status(404).json({ error: 'Projet non trouvé' });
    res.json({ message: 'Membre ajouté', project });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE /api/projects/:id/members/:userId — retirer ─────
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    )
      .populate('owner',   'username email')
      .populate('members', 'username email');

    if (!project) return res.status(404).json({ error: 'Projet non trouvé' });
    res.json({ message: 'Membre retiré', project });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};