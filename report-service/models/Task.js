const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:      String,
  status:     String,
  priority:   String,
  deadline:   Date,
  project:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments:   Array
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);