
const router = require('express').Router();
const c = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);
router.get('/overview', c.getOverview);
router.get('/tasks-by-status', c.getTasksByStatus);
router.get('/tasks-by-priority', c.getTasksByPriority);
router.get('/tasks-by-user', c.getTasksByUser);
router.get('/projects-by-category', c.getProjectsByCategory);
router.get('/activity', c.getActivity);
router.get('/project/:id', c.getProjectReport);

module.exports = router;
