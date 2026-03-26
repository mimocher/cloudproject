
const cron = require('node-cron');
const Task = require('../models/Task');

const QUERY = {
  'reminder.enabled': true,
  'reminder.sent':    false,
  status:             { $ne: 'done' },
  deadline:           { $exists: true, $ne: null }
};

const daysLeft = deadline =>
  Math.ceil((new Date(deadline) - new Date()) / 86_400_000);

async function getTasks() {
  return Task.find(QUERY).populate('assignedTo', 'username email');
}

function startReminderService() {
  cron.schedule('0 * * * *', async () => {
    try {
      for (const task of await getTasks()) {
        const left = daysLeft(task.deadline);
        if (left <= (task.reminder.daysBefore || 1) && left >= 0) {
          await Task.findByIdAndUpdate(task._id, { 'reminder.sent': true });
          console.log(`⏰ "${task.title}" — ${left}j restant(s) — ${task.assignedTo?.username || 'Non assigné'}`);
        }
      }
    } catch (e) { console.error('Erreur rappels :', e.message); }
  });
  console.log('Service de rappels démarré');
}

async function checkRemindersNow() {
  try {
    return (await getTasks()).map(task => ({
      taskId:     task._id,
      title:      task.title,
      deadline:   new Date(task.deadline).toLocaleDateString('fr-FR'),
      daysLeft:   daysLeft(task.deadline),
      assignedTo: task.assignedTo?.username || 'Non assigné',
      priority:   task.priority
    }));
  } catch (e) {
    console.error('Erreur checkReminders :', e.message);
    return [];
  }
}

module.exports = { startReminderService, checkRemindersNow };
