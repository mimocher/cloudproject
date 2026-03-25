const router = require('express').Router();
const {
  blockUser, unblockUser, getAllUsers, deleteUser
} = require('../controllers/admin.controller');

// GET    /api/admin/users         pour lister les utilisateurs
// PUT    /api/admin/block/:id     pour les bloquer 
// PUT    /api/admin/unblock/:id   pour debloquer
// DELETE /api/admin/users/:id     hadi pour supprimer

router.get('/users',          getAllUsers);
router.put('/block/:id',      blockUser);
router.put('/unblock/:id',    unblockUser);
router.delete('/users/:id',   deleteUser);

module.exports = router;