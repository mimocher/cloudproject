const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['admin', 'member', 'guest'], default: 'member' },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

// Hash mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparer mot de passe
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);