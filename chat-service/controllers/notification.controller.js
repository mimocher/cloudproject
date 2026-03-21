const Notification = require('../models/Notification');

// GET /api/notifications — mes notifications
exports.getAll = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    const unread = notifications.filter(n => !n.read).length;
    res.json({ total: notifications.length, unread, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/notifications/:id/read — marquer comme lu
exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marquée comme lue' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/notifications/read-all — tout marquer comme lu
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/notifications/:id — supprimer
exports.remove = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notifications — créer (appelé par autres services)
exports.create = async (req, res) => {
  try {
    const { recipient, sender, type, title, content, link } = req.body;
    const notification = await Notification.create({
      recipient, sender, type, title, content, link
    });
    res.status(201).json({ notification });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};