const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Enregistrer le modèle User pour populate
require('./models/User');

app.use('/api/projects', require('./routes/project.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Project Service fonctionne sur le port 5004' });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/projet_m206_db')
  .then(() => console.log('Project Service : MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

app.listen(5004, () => {
  console.log('Project Service démarré sur http://localhost:5004');
});