const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Enregistrer les modèles pour populate
require('./models/User');

app.use('/api/tasks', require('./routes/task.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Task Service fonctionne sur le port 5005' });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/projet_m206_db')
  .then(() => console.log('Task Service : MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

app.listen(5005, () => {
  console.log('Task Service démarré sur http://localhost:5005');
});