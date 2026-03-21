const router = require('express').Router();
const {
  getAll, getOne, create, update,
  remove, getCategories, addMember, removeMember
} = require('../controllers/project.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Toutes les routes sont protégées
router.use(verifyToken);

router.get('/categories',              getCategories);
router.get('/',                        getAll);
router.get('/:id',                     getOne);
router.post('/',                       create);
router.put('/:id',                     update);
router.delete('/:id',                  remove);
router.post('/:id/members',            addMember);
router.delete('/:id/members/:userId',  removeMember);

module.exports = router;