const Project = require('../models/Project');
const Task    = require('../models/Task');
const User    = require('../models/User');

// ── GET /api/reports/overview ───────────────────────────────
exports.getOverview = async (req, res) => {
  try {
    const [
      totalProjects,
      totalTasks,
      totalUsers,
      activeProjects,
      completedProjects,
      pausedProjects,
      todoTasks,
      inprogressTasks,
      doneTasks,
      highPriority,
      mediumPriority,
      lowPriority
    ] = await Promise.all([
      Project.countDocuments(),
      Task.countDocuments(),
      User.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'completed' }),
      Project.countDocuments({ status: 'paused' }),
      Task.countDocuments({ status: 'todo' }),
      Task.countDocuments({ status: 'inprogress' }),
      Task.countDocuments({ status: 'done' }),
      Task.countDocuments({ priority: 'high' }),
      Task.countDocuments({ priority: 'medium' }),
      Task.countDocuments({ priority: 'low' })
    ]);

    // Tâches en retard
    const overdueTasks = await Task.countDocuments({
      deadline: { $lt: new Date() },
      status:   { $ne: 'done' }
    });

    res.json({
      projects: {
        total:     totalProjects,
        active:    activeProjects,
        completed: completedProjects,
        paused:    pausedProjects
      },
      tasks: {
        total:      totalTasks,
        todo:       todoTasks,
        inprogress: inprogressTasks,
        done:       doneTasks,
        overdue:    overdueTasks
      },
      priorities: {
        high:   highPriority,
        medium: mediumPriority,
        low:    lowPriority
      },
      users: { total: totalUsers }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/reports/tasks-by-status ───────────────────────
exports.getTasksByStatus = async (req, res) => {
  try {
    const data = await Task.aggregate([
      {
        $group: {
          _id:   '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = [
      { status: 'todo',       label: 'À faire',  count: 0, color: '#64748b' },
      { status: 'inprogress', label: 'En cours', count: 0, color: '#d97706' },
      { status: 'done',       label: 'Terminé',  count: 0, color: '#16a34a' }
    ];

    data.forEach(d => {
      const item = result.find(r => r.status === d._id);
      if (item) item.count = d.count;
    });

    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/reports/tasks-by-priority ─────────────────────
exports.getTasksByPriority = async (req, res) => {
  try {
    const data = await Task.aggregate([
      {
        $group: {
          _id:   '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = [
      { priority: 'high',   label: 'Haute',   count: 0, color: '#dc2626' },
      { priority: 'medium', label: 'Moyenne', count: 0, color: '#d97706' },
      { priority: 'low',    label: 'Basse',   count: 0, color: '#16a34a' }
    ];

    data.forEach(d => {
      const item = result.find(r => r.priority === d._id);
      if (item) item.count = d.count;
    });

    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/reports/tasks-by-user ─────────────────────────
exports.getTasksByUser = async (req, res) => {
  try {
    const data = await Task.aggregate([
      { $match: { assignedTo: { $exists: true, $ne: null } } },
      {
        $group: {
          _id:        '$assignedTo',
          total:      { $sum: 1 },
          done:       { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inprogress: { $sum: { $cond: [{ $eq: ['$status', 'inprogress'] }, 1, 0] } },
          todo:       { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from:         'users',
          localField:   '_id',
          foreignField: '_id',
          as:           'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username:   '$user.username',
          total:      1,
          done:       1,
          inprogress: 1,
          todo:       1,
          completion: {
            $round: [
              { $multiply: [{ $divide: ['$done', '$total'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/reports/projects-by-category ──────────────────
exports.getProjectsByCategory = async (req, res) => {
  try {
    const data = await Project.aggregate([
      {
        $group: {
          _id:   '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const colors = ['#4f46e5', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#7c3aed'];
    const result = data.map((d, i) => ({
      category: d._id || 'Sans catégorie',
      count:    d.count,
      color:    colors[i % colors.length]
    }));

    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/reports/activity ──────────────────────────────
exports.getActivity = async (req, res) => {
  try {
    // Tâches créées par mois sur les 6 derniers mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const taskActivity = await Task.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          created:   { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                    'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    const result = taskActivity.map(d => ({
      month:     months[d._id.month - 1],
      created:   d.created,
      completed: d.completed
    }));

    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/reports/project/:id ───────────────────────────
exports.getProjectReport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner',   'username email')
      .populate('members', 'username email');

    if (!project) return res.status(404).json({ error: 'Projet non trouvé' });

    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'username');

    const stats = {
      total:      tasks.length,
      todo:       tasks.filter(t => t.status === 'todo').length,
      inprogress: tasks.filter(t => t.status === 'inprogress').length,
      done:       tasks.filter(t => t.status === 'done').length,
      overdue:    tasks.filter(t =>
        t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'
      ).length,
      completion: tasks.length > 0
        ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
        : 0,
      highPriority:   tasks.filter(t => t.priority === 'high').length,
      mediumPriority: tasks.filter(t => t.priority === 'medium').length,
      lowPriority:    tasks.filter(t => t.priority === 'low').length
    };

    res.json({ project, tasks, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};