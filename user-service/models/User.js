// Même modèle que auth-service — partagent la même DB
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'member', 'guest'], default: 'member' },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);