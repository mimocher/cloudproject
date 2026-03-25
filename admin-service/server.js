const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', require('./routes/admin.routes'));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Le service admin fonctionne surr le port 5003' });
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Le service admine est demarre sur le port http://localhost:${PORT}`);
});