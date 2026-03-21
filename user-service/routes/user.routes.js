const router = require('express').Router();
const {
  getAll, getOne, update, remove
} = require('../controllers/user.controller');

// GET    /api/users          → liste + recherche par ?name=&email=&role=
// GET    /api/users/:id      → un utilisateur
// PUT    /api/users/:id      → modifier
// DELETE /api/users/:id      → supprimer

router.get('/',     getAll);
router.get('/:id',  getOne);
router.put('/:id',  update);
router.delete('/:id', remove);

module.exports = router;