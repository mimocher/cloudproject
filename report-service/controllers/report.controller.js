const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const handleError = (res, err) => res.status(500).json({ error: err.message });

const count = (Model, filter = {}) => Model.countDocuments(filter);

const groupCount = (Model, field, sort = null) =>
  Model.aggregate([
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    ...(sort ? [{ $sort: sort }] : [])
  ]);

const fillCounts = (data, key, items) =>
  items.map(item => ({
    ...item,
    count: data.find(d => d._id === item[key])?.count || 0
  }));

const calcTaskStats = tasks => {
  const done = tasks.filter(t => t.status === 'done').length;

  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inprogress: tasks.filter(t => t.status === 'inprogress').length,
    done,
    overdue: tasks.filter(
      t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'
    ).length,
    completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    mediumPriority: tasks.filter(t => t.priority === 'medium').length,
    lowPriority: tasks.filter(t => t.priority === 'low').length
  };
};

exports.getOverview = async (req, res) => {
  try {
    const [
      totalProjects,
      totalTasks,
      totalUsers,
      active,
      completed,
      paused,
      todo,
      inprogress,
      done,
      high,
      medium,
      low,
      overdue
    ] = await Promise.all([
      count(Project),
      count(Task),
      count(User),
      count(Project, { status: 'active' }),
      count(Project, { status: 'completed' }),
      count(Project, { status: 'paused' }),
      count(Task, { status: 'todo' }),
      count(Task, { status: 'inprogress' }),
      count(Task, { status: 'done' }),
      count(Task, { priority: 'high' }),
      count(Task, { priority: 'medium' }),
      count(Task, { priority: 'low' }),
      count(Task, { deadline: { $lt: new Date() }, status: { $ne: 'done' } })
    ]);

    res.json({
      projects: { total: totalProjects, active, completed, paused },
      tasks: { total: totalTasks, todo, inprogress, done, overdue },
      priorities: { high, medium, low },
      users: { total: totalUsers }
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getTasksByStatus = async (req, res) => {
  try {
    const data = await groupCount(Task, 'status');

    res.json({
      data: fillCounts(data, 'status', [
        { status: 'todo', label: 'À faire', color: '#64748b' },
        { status: 'inprogress', label: 'En cours', color: '#d97706' },
        { status: 'done', label: 'Terminé', color: '#16a34a' }
      ])
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getTasksByPriority = async (req, res) => {
  try {
    const data = await groupCount(Task, 'priority');

    res.json({
      data: fillCounts(data, 'priority', [
        { priority: 'high', label: 'Haute', color: '#dc2626' },
        { priority: 'medium', label: 'Moyenne', color: '#d97706' },
        { priority: 'low', label: 'Basse', color: '#16a34a' }
      ])
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getTasksByUser = async (req, res) => {
  try {
    const data = await Task.aggregate([
      { $match: { assignedTo: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inprogress: { $sum: { $cond: [{ $eq: ['$status', 'inprogress'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          total: 1,
          done: 1,
          inprogress: 1,
          todo: 1,
          completion: {
            $round: [{ $multiply: [{ $divide: ['$done', '$total'] }, 100] }, 0]
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ data });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getProjectsByCategory = async (req, res) => {
  try {
    const colors = ['#4f46e5', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#7c3aed'];
    const data = await groupCount(Project, 'category', { count: -1 });

    res.json({
      data: data.map((item, i) => ({
        category: item._id || 'Sans catégorie',
        count: item.count,
        color: colors[i % colors.length]
      }))
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getActivity = async (req, res) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const data = await Task.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          created: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      data: data.map(item => ({
        month: MONTHS[item._id.month - 1],
        created: item.created,
        completed: item.completed
      }))
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getProjectReport = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('owner', 'username email')
      .populate('members', 'username email');

    if (!project) return res.status(404).json({ error: 'Projet non trouvé' });

    const tasks = await Task.find({ project: id }).populate('assignedTo', 'username');

    res.json({
      project,
      tasks,
      stats: calcTaskStats(tasks)
    });
  } catch (err) {
    handleError(res, err);
  }
};
