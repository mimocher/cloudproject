const cron = require('node-cron');
const Task = require('../models/Task');

// Vérifier les deadlines toutes les heures
function startReminderService() {
  cron.schedule('0 * * * *', async () => {
    console.log('Vérification des rappels...');

    try {
      const now      = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Trouver les tâches avec rappel activé non envoyé
      const tasks = await Task.find({
        'reminder.enabled': true,
        'reminder.sent':    false,
        status:             { $ne: 'done' },
        deadline:           { $exists: true, $ne: null }
      }).populate('assignedTo', 'username email');

      for (const task of tasks) {
        const deadline    = new Date(task.deadline);
        const daysLeft    = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        const daysBefore  = task.reminder.daysBefore || 1;

        if (daysLeft <= daysBefore && daysLeft >= 0) {
          // Marquer le rappel comme envoyé
          await Task.findByIdAndUpdate(task._id, {
            'reminder.sent': true
          });

          console.log(`⏰ RAPPEL : Tâche "${task.title}" deadline dans ${daysLeft} jour(s) !`);
          console.log(`   Assigné à : ${task.assignedTo?.username || 'Non assigné'}`);
          console.log(`   Deadline  : ${deadline.toLocaleDateString('fr-FR')}`);
        }
      }
    } catch (err) {
      console.error('Erreur rappels :', err.message);
    }
  });

  console.log('Service de rappels démarré');
}

// Vérifier immédiatement au démarrage
async function checkRemindersNow() {
  try {
    const now   = new Date();
    const tasks = await Task.find({
      'reminder.enabled': true,
      'reminder.sent':    false,
      status:             { $ne: 'done' },
      deadline:           { $exists: true, $ne: null }
    }).populate('assignedTo', 'username email');

    const reminders = [];

    for (const task of tasks) {
      const deadline = new Date(task.deadline);
      const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      reminders.push({
        taskId:    task._id,
        title:     task.title,
        deadline:  deadline.toLocaleDateString('fr-FR'),
        daysLeft,
        assignedTo: task.assignedTo?.username || 'Non assigné',
        priority:   task.priority
      });
    }

    return reminders;
  } catch (err) {
    console.error('Erreur checkReminders :', err.message);
    return [];
  }
}

module.exports = { startReminderService, checkRemindersNow };