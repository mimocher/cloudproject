const router = require('express').Router();
const {
  getMessages, sendMessage, deleteMessage
} = require('../controllers/message.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/:projectId',        getMessages);
router.post('/:projectId',       sendMessage);
router.delete('/messages/:id',   deleteMessage);

module.exports = router;