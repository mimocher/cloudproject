
const express = require('express');
const router = express.Router();

const projectController = require('../controllers/project.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/categories', projectController.getCategories);
router.get('/', projectController.getAll);
router.get('/:id', projectController.getOne);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);

module.exports = router;
