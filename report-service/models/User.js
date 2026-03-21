const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:  String,
  email:     String,
  role:      String,
  isBlocked: Boolean
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);