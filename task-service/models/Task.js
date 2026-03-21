const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  date:    { type: Date, default: Date.now }
});

const fileSchema = new mongoose.Schema({
  filename:     { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype:     { type: String },
  size:         { type: Number },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt:   { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: true,
    trim:     true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type:    String,
    enum:    ['low', 'medium', 'high'],
    default: 'medium'
  },
  deadline: {
    type: Date
  },
  status: {
    type:    String,
    enum:    ['todo', 'inprogress', 'done'],
    default: 'todo'
  },
  project: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  },
  comments: [commentSchema],
  files:    [fileSchema],

  // Rappels
  reminder: {
    enabled: { type: Boolean, default: false },
    daysBefore: { type: Number, default: 1 },
    sent:    { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);