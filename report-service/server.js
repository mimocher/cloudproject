const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

require('./models/User');
require('./models/Project');
require('./models/Task');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/reports', require('./routes/report.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Report Service fonctionne sur le port 5007' });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/projet_m206_db')
  .then(() => console.log('Report Service : MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB :', err));

app.listen(5007, () => {
  console.log('Report Service démarré sur http://localhost:5007');
});