const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: true,
    trim:     true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type:    String,
    enum:    ['active', 'completed', 'paused'],
    default: 'active'
  },
  category: {
    type: String,
    trim: true
  },
  owner: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);