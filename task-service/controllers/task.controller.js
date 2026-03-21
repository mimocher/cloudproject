const Task   = require('../models/Task');
const path   = require('path');
const fs     = require('fs');
const { checkRemindersNow } = require('../services/reminder.service');

// ── GET /api/tasks — liste ──────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { project, status, priority, assignedTo } = req.query;
    const filter = {};
    if (project)    filter.project    = project;
    if (status)     filter.status     = status;
    if (priority)   filter.priority   = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'username email')
      .populate('comments.author', 'username')
      .populate('files.uploadedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ total: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/tasks/:id ──────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username email')
      .populate('comments.author', 'username')
      .populate('files.uploadedBy', 'username');

    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/tasks — créer ─────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      title, description, priority,
      deadline, project, assignedTo,
      reminderEnabled, reminderDaysBefore
    } = req.body;

    const task = new Task({
      title, description, priority,
      deadline, project,
      assignedTo: assignedTo || null,
      status: 'todo',
      reminder: {
        enabled:    reminderEnabled === 'true' || reminderEnabled === true,
        daysBefore: reminderDaysBefore || 1,
        sent:       false
      }
    });

    await task.save();
    await task.populate('assignedTo', 'username email');
    res.status(201).json({ message: 'Tâche créée', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── PUT /api/tasks/:id — modifier ──────────────────────────
exports.update = async (req, res) => {
  try {
    delete req.body.comments;
    delete req.body.files;

    // Gérer le rappel
    if (req.body.reminderEnabled !== undefined) {
      req.body['reminder.enabled']    = req.body.reminderEnabled;
      req.body['reminder.daysBefore'] = req.body.reminderDaysBefore || 1;
      req.body['reminder.sent']       = false;
      delete req.body.reminderEnabled;
      delete req.body.reminderDaysBefore;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
      .populate('assignedTo', 'username email')
      .populate('comments.author', 'username')
      .populate('files.uploadedBy', 'username');

    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json({ message: 'Tâche mise à jour', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── PATCH /api/tasks/:id/status ─────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate('assignedTo', 'username email');

    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json({ message: 'Statut mis à jour', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE /api/tasks/:id ───────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });

    // Supprimer les fichiers joints
    for (const file of task.files) {
      const filePath = `/app/uploads/${file.filename}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/tasks/:id/comments ───────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Contenu requis' });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { author: req.user.id, content, date: new Date() } } },
      { new: true }
    )
      .populate('assignedTo', 'username email')
      .populate('comments.author', 'username');

    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.status(201).json({ message: 'Commentaire ajouté', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE /api/tasks/:id/comments/:commentId ──────────────
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json({ message: 'Commentaire supprimé', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── POST /api/tasks/:id/files — upload fichier ─────────────
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          files: {
            filename:     req.file.filename,
            originalname: req.file.originalname,
            mimetype:     req.file.mimetype,
            size:         req.file.size,
            uploadedBy:   req.user.id,
            uploadedAt:   new Date()
          }
        }
      },
      { new: true }
    ).populate('files.uploadedBy', 'username');

    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.status(201).json({ message: 'Fichier uploadé', task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── GET /api/tasks/:id/files/:filename — télécharger ───────
exports.downloadFile = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });

    const file = task.files.find(f => f.filename === req.params.filename);
    if (!file) return res.status(404).json({ error: 'Fichier non trouvé' });

    const filePath = `/app/uploads/${file.filename}`;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable sur le serveur' });
    }

    res.download(filePath, file.originalname);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/tasks/:id/files/:filename — supprimer ──────
exports.deleteFile = async (req, res) => {
  try {
    const filePath = `/app/uploads/${req.params.filename}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $pull: { files: { filename: req.params.filename } } },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json({ message: 'Fichier supprimé', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/tasks/reminders — voir rappels actifs ─────────
exports.getReminders = async (req, res) => {
  try {
    const reminders = await checkRemindersNow();
    res.json({ total: reminders.length, reminders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/tasks/:id/reminder — activer rappel ─────────
exports.setReminder = async (req, res) => {
  try {
    const { enabled, daysBefore } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        'reminder.enabled':    enabled,
        'reminder.daysBefore': daysBefore || 1,
        'reminder.sent':       false
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json({
      message: enabled ? 'Rappel activé' : 'Rappel désactivé',
      task
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};