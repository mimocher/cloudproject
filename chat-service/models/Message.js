const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type:     String,
    required: true,
    trim:     true
  },
  sender: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },
  project: {
    type:     mongoose.Schema.Types.ObjectId,
    required: true
  },
  type: {
    type:    String,
    enum:    ['text', 'notification'],
    default: 'text'
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);