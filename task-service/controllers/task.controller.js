const Task = require('../models/Task');
const fs   = require('fs');
const { checkRemindersNow } = require('../services/reminder.service');

const populate = q => q
  .populate('assignedTo', 'username email')
  .populate('comments.author', 'username')
  .populate('files.uploadedBy', 'username');

const notFound = res => res.status(404).json({ error: 'Tâche non trouvée' });
const err400   = (res, e) => res.status(400).json({ error: e.message });
const err500   = (res, e) => res.status(500).json({ error: e.message });

// GET /api/tasks
exports.getAll = async (req, res) => {
  try {
    const filter = Object.fromEntries(
      ['project', 'status', 'priority', 'assignedTo']
        .filter(k => req.query[k])
        .map(k => [k, req.query[k]])
    );
    const tasks = await populate(Task.find(filter)).sort({ createdAt: -1 });
    res.json({ total: tasks.length, tasks });
  } catch (e) { err500(res, e); }
};

// GET /api/tasks/:id
exports.getOne = async (req, res) => {
  try {
    const task = await populate(Task.findById(req.params.id));
    task ? res.json(task) : notFound(res);
  } catch (e) { err500(res, e); }
};

// POST /api/tasks
exports.create = async (req, res) => {
  try {
    const { title, description, priority, deadline, project, assignedTo, reminderEnabled, reminderDaysBefore } = req.body;
    const task = await new Task({
      title, description, priority, deadline, project,
      assignedTo: assignedTo || null,
      status: 'todo',
      reminder: { enabled: reminderEnabled == 'true', daysBefore: reminderDaysBefore || 1, sent: false }
    }).save();
    await task.populate('assignedTo', 'username email');
    res.status(201).json({ message: 'Tâche créée', task });
  } catch (e) { err400(res, e); }
};

// PUT /api/tasks/:id
exports.update = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.comments; delete body.files;
    if (body.reminderEnabled !== undefined) {
      Object.assign(body, {
        'reminder.enabled': body.reminderEnabled,
        'reminder.daysBefore': body.reminderDaysBefore || 1,
        'reminder.sent': false
      });
      delete body.reminderEnabled; delete body.reminderDaysBefore;
    }
    const task = await populate(Task.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }));
    task ? res.json({ message: 'Tâche mise à jour', task }) : notFound(res);
  } catch (e) { err400(res, e); }
};

// PATCH /api/tasks/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
      .populate('assignedTo', 'username email');
    task ? res.json({ message: 'Statut mis à jour', task }) : notFound(res);
  } catch (e) { err400(res, e); }
};

// DELETE /api/tasks/:id
exports.remove = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return notFound(res);
    task.files.forEach(f => {
      const p = `/app/uploads/${f.filename}`;
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tâche supprimée' });
  } catch (e) { err500(res, e); }
};

// POST /api/tasks/:id/comments
exports.addComment = async (req, res) => {
  try {
    if (!req.body.content) return res.status(400).json({ error: 'Contenu requis' });
    const task = await populate(Task.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { author: req.user.id, content: req.body.content, date: new Date() } } },
      { new: true }
    ));
    task ? res.status(201).json({ message: 'Commentaire ajouté', task }) : notFound(res);
  } catch (e) { err400(res, e); }
};

// DELETE /api/tasks/:id/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, { $pull: { comments: { _id: req.params.commentId } } }, { new: true }
    );
    task ? res.json({ message: 'Commentaire supprimé', task }) : notFound(res);
  } catch (e) { err400(res, e); }
};

// POST /api/tasks/:id/files
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    const { filename, originalname, mimetype, size } = req.file;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { files: { filename, originalname, mimetype, size, uploadedBy: req.user.id, uploadedAt: new Date() } } },
      { new: true }
    ).populate('files.uploadedBy', 'username');
    task ? res.status(201).json({ message: 'Fichier uploadé', task }) : notFound(res);
  } catch (e) { err400(res, e); }
};

// GET /api/tasks/:id/files/:filename
exports.downloadFile = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return notFound(res);
    const file = task.files.find(f => f.filename === req.params.filename);
    if (!file) return res.status(404).json({ error: 'Fichier non trouvé' });
    const p = `/app/uploads/${file.filename}`;
    fs.existsSync(p) ? res.download(p, file.originalname) : res.status(404).json({ error: 'Fichier introuvable sur le serveur' });
  } catch (e) { err500(res, e); }
};

// DELETE /api/tasks/:id/files/:filename
exports.deleteFile = async (req, res) => {
  try {
    const p = `/app/uploads/${req.params.filename}`;
    if (fs.existsSync(p)) fs.unlinkSync(p);
    const task = await Task.findByIdAndUpdate(
      req.params.id, { $pull: { files: { filename: req.params.filename } } }, { new: true }
    );
    task ? res.json({ message: 'Fichier supprimé', task }) : notFound(res);
  } catch (e) { err500(res, e); }
};

// GET /api/tasks/reminders
exports.getReminders = async (req, res) => {
  try {
    const reminders = await checkRemindersNow();
    res.json({ total: reminders.length, reminders });
  } catch (e) { err500(res, e); }
};

// PATCH /api/tasks/:id/reminder
exports.setReminder = async (req, res) => {
  try {
    const { enabled, daysBefore } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { 'reminder.enabled': enabled, 'reminder.daysBefore': daysBefore || 1, 'reminder.sent': false },
      { new: true }
    );
    task ? res.json({ message: enabled ? 'Rappel activé' : 'Rappel désactivé', task }) : notFound(res);
  } catch (e) { err400(res, e); }
};
