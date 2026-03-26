const Message = require('../models/Message');
// GET /api/chat/:projectId
exports.getMessages = async (req, res) => {
  try {
    const filter = { project: req.params.projectId };

    if (req.query.before) {
      filter.createdAt = { $lt: new Date(req.query.before) };
    }

    const messages = await Message.find(filter)
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit || 50));

    await Message.updateMany(
      {
        project: req.params.projectId,
        readBy: { $ne: req.user.id }
      },
      {
        $addToSet: { readBy: req.user.id }
      }
    );

    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/chat/:projectId
exports.sendMessage = async (req, res) => {
  try {
    if (!req.body.content?.trim()) {
      return res.status(400).json({ error: 'Contenu requis' });
    }

    const message = await Message.create({
      content: req.body.content.trim(),
      sender: req.user.id,
      project: req.params.projectId,
      type: 'text',
      readBy: [req.user.id]
    });

    await message.populate('sender', 'username');

    res.status(201).json({ message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/chat/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    if (
      message.sender.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: 'Message supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
