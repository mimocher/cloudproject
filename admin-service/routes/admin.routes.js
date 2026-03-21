const router = require('express').Router();
const {
  blockUser, unblockUser, getAllUsers, deleteUser
} = require('../controllers/admin.controller');

// GET    /api/admin/users         → liste tous les users
// PUT    /api/admin/block/:id     → bloquer
// PUT    /api/admin/unblock/:id   → débloquer
// DELETE /api/admin/users/:id     → supprimer

router.get('/users',          getAllUsers);
router.put('/block/:id',      blockUser);
router.put('/unblock/:id',    unblockUser);
router.delete('/users/:id',   deleteUser);

module.exports = router;