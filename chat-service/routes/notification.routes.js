const router = require('express').Router();
const {
  getAll, markRead, markAllRead, remove, create
} = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/',                  getAll);
router.post('/',                 create);
router.patch('/read-all',        markAllRead);
router.patch('/:id/read',        markRead);
router.delete('/:id',            remove);

module.exports = router;