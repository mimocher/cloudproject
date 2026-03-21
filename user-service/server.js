const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/user.routes'));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'User Service fonctionne sur le port 5002' });
});

// Connexion MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/projet_m206_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('User Service : MongoDB connecté à projet_m206_db'))
  .catch(err => console.error('Erreur MongoDB :', err));

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`User Service démarré sur http://localhost:${PORT}`);
});