const router = require('express').Router();
const {
  getAll, getOne, create, update, updateStatus,
  remove, addComment, deleteComment,
  uploadFile, downloadFile, deleteFile,
  getReminders, setReminder
} = require('../controllers/task.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const upload          = require('../middleware/upload.middleware');

router.use(verifyToken);

// Rappels
router.get('/reminders',                         getReminders);

// CRUD tâches
router.get('/',                                  getAll);
router.get('/:id',                               getOne);
router.post('/',                                 create);
router.put('/:id',                               update);
router.patch('/:id/status',                      updateStatus);
router.patch('/:id/reminder',                    setReminder);
router.delete('/:id',                            remove);

// Commentaires
router.post('/:id/comments',                     addComment);
router.delete('/:id/comments/:commentId',        deleteComment);

// Fichiers joints
router.post('/:id/files', upload.single('file'), uploadFile);
router.get('/:id/files/:filename',               downloadFile);
router.delete('/:id/files/:filename',            deleteFile);

module.exports = router;