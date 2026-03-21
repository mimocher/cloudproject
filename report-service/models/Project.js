const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:      String,
  status:    String,
  category:  String,
  startDate: Date,
  endDate:   Date,
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);