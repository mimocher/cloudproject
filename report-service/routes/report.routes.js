const router = require('express').Router();
const {
  getOverview,
  getTasksByStatus,
  getTasksByPriority,
  getTasksByUser,
  getProjectsByCategory,
  getActivity,
  getProjectReport
} = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/overview',              getOverview);
router.get('/tasks-by-status',       getTasksByStatus);
router.get('/tasks-by-priority',     getTasksByPriority);
router.get('/tasks-by-user',         getTasksByUser);
router.get('/projects-by-category',  getProjectsByCategory);
router.get('/activity',              getActivity);
router.get('/project/:id',           getProjectReport);

module.exports = router;