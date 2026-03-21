const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  },
  type: {
    type: String,
    enum: [
      'new_task',
      'task_updated',
      'task_completed',
      'new_message',
      'new_comment',
      'project_added'
    ],
    required: true
  },
  title:   { type: String, required: true },
  content: { type: String, required: true },
  link:    { type: String },
  read:    { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);