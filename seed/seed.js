require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('./models/User');
require('./models/Project');
require('./models/Task');

const User = mongoose.model('User');
const Project = mongoose.model('Project');
const Task = mongoose.model('Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/projet_m206_db';
const d = v => new Date(v);
const hash = v => bcrypt.hash(v, 10);
const comment = (author, content, date) => ({
  author: author._id,
  content,
  date: d(date)
});

async function seed() {
  await mongoose.connect(MONGO_URI);

  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  const users = [
    {
      username: 'admin_sara',
      email: 'sara@m206.ma',
      password: await hash('Admin@1234'),
      role: 'admin',
      isBlocked: false
    },
    {
      username: 'youssef_dev',
      email: 'youssef@m206.ma',
      password: await hash('Member@1234'),
      role: 'member',
      isBlocked: false
    },
    {
      username: 'fatima_design',
      email: 'fatima@m206.ma',
      password: await hash('Member@1234'),
      role: 'member',
      isBlocked: false
    },
    {
      username: 'karim_backend',
      email: 'karim@m206.ma',
      password: await hash('Member@1234'),
      role: 'member',
      isBlocked: false
    },
    {
      username: 'invite_ali',
      email: 'ali@m206.ma',
      password: await hash('Guest@1234'),
      role: 'guest',
      isBlocked: false
    },
    {
      username: 'user_bloque',
      email: 'bloque@m206.ma',
      password: await hash('Test@1234'),
      role: 'member',
      isBlocked: true
    }
  ];
  const insertedUsers = await User.insertMany(users);
  const [sara, youssef, fatima, karim, ali] = insertedUsers;
  const projects = [
    {
      name: 'Application Mobile E-commerce',
      description: 'Développement d\'une app mobile de vente en ligne avec paiement intégré',
      startDate: d('2025-01-10'),
      endDate: d('2025-06-30'),
      status: 'active',
      category: 'Mobile',
      owner: sara._id,
      members: [youssef._id, fatima._id, karim._id]
    },
    {
      name: 'Refonte Site Web Institutionnel',
      description: 'Modernisation du site web avec React et un design responsive',
      startDate: d('2025-02-01'),
      endDate: d('2025-04-30'),
      status: 'active',
      category: 'Web',
      owner: youssef._id,
      members: [fatima._id, ali._id]
    },
    {
      name: 'API REST Gestion RH',
      description: 'Création d\'une API complète pour la gestion des ressources humaines',
      startDate: d('2024-09-01'),
      endDate: d('2025-01-01'),
      status: 'completed',
      category: 'Backend',
      owner: karim._id,
      members: [youssef._id, sara._id]
    },
    {
      name: 'Dashboard Analytics',
      description: 'Tableau de bord pour visualiser les KPIs de l\'entreprise en temps réel',
      startDate: d('2025-03-01'),
      endDate: d('2025-08-01'),
      status: 'paused',
      category: 'Data',
      owner: sara._id,
      members: [karim._id, fatima._id]
    }
  ];

  const insertedProjects = await Project.insertMany(projects);
  const [projMobile, projWeb, projRH, projDash] = insertedProjects;

  const tasks = [
    {
      title: 'Maquettes UI/UX',
      description: 'Créer les maquettes Figma de toutes les pages de l\'application',
      priority: 'high',
      deadline: d('2025-02-15'),
      status: 'done',
      project: projMobile._id,
      assignedTo: fatima._id,
      comments: [
        comment(sara, 'Super travail Fatima, les maquettes sont validées !', '2025-02-16'),
        comment(fatima, 'Merci ! J\'ai appliqué le design system demandé.', '2025-02-16')
      ]
    },
    {
      title: 'Authentification JWT mobile',
      description: 'Implémenter le login/register avec JWT et refresh token',
      priority: 'high',
      deadline: d('2025-02-28'),
      status: 'done',
      project: projMobile._id,
      assignedTo: karim._id,
      comments: [
        comment(youssef, 'N\'oublie pas d\'ajouter le refresh token !', '2025-02-20')
      ]
    },
    {
      title: 'Intégration API paiement',
      description: 'Intégrer Stripe pour les paiements en ligne',
      priority: 'high',
      deadline: d('2025-04-10'),
      status: 'inprogress',
      project: projMobile._id,
      assignedTo: youssef._id,
      comments: [
        comment(karim, 'Utilise le SDK Stripe React Native v8', '2025-03-05')
      ]
    },
    {
      title: 'Tests unitaires',
      description: 'Écrire les tests Jest pour tous les composants principaux',
      priority: 'medium',
      deadline: d('2025-05-01'),
      status: 'todo',
      project: projMobile._id,
      assignedTo: youssef._id,
      comments: []
    },
    {
      title: 'Déploiement sur Play Store',
      description: 'Préparer le bundle et soumettre l\'app sur Google Play',
      priority: 'low',
      deadline: d('2025-06-20'),
      status: 'todo',
      project: projMobile._id,
      assignedTo: karim._id,
      comments: []
    },
    {
      title: 'Audit du site existant',
      description: 'Analyser les performances et problèmes SEO du site actuel',
      priority: 'medium',
      deadline: d('2025-02-10'),
      status: 'done',
      project: projWeb._id,
      assignedTo: youssef._id,
      comments: [
        comment(fatima, 'Score Lighthouse très bas, surtout sur mobile.', '2025-02-11')
      ]
    },
    {
      title: 'Développement composants React',
      description: 'Créer la bibliothèque de composants réutilisables',
      priority: 'high',
      deadline: d('2025-03-15'),
      status: 'inprogress',
      project: projWeb._id,
      assignedTo: fatima._id,
      comments: [
        comment(youssef, 'Penser à rendre les composants accessibles ARIA', '2025-03-01')
      ]
    },
    {
      title: 'Optimisation SEO',
      description: 'Ajouter les meta tags, sitemap et améliorer le score Lighthouse',
      priority: 'medium',
      deadline: d('2025-04-20'),
      status: 'todo',
      project: projWeb._id,
      assignedTo: ali._id,
      comments: []
    },
    {
      title: 'Modélisation base de données',
      description: 'Créer les schémas Mongoose pour employés, contrats et congés',
      priority: 'high',
      deadline: d('2024-09-15'),
      status: 'done',
      project: projRH._id,
      assignedTo: karim._id,
      comments: [
        comment(sara, 'Bien pensé, ajouter le champ departement svp', '2024-09-16'),
        comment(karim, 'Fait ! Mis à jour dans le commit 42', '2024-09-17')
      ]
    },
    {
      title: 'Endpoints CRUD employés',
      description: 'Créer toutes les routes GET/POST/PUT/DELETE pour les employés',
      priority: 'high',
      deadline: d('2024-10-30'),
      status: 'done',
      project: projRH._id,
      assignedTo: youssef._id,
      comments: [
        comment(karim, 'Penser à la pagination sur le GET all !', '2024-10-15')
      ]
    },
    {
      title: 'Documentation Swagger',
      description: 'Documenter tous les endpoints avec Swagger UI',
      priority: 'low',
      deadline: d('2024-12-15'),
      status: 'done',
      project: projRH._id,
      assignedTo: karim._id,
      comments: [
        comment(sara, 'Excellente doc, très claire pour les développeurs front !', '2024-12-18')
      ]
    },
    {
      title: 'Choix de la stack de visualisation',
      description: 'Comparer Chart.js, Recharts et D3.js pour le dashboard',
      priority: 'medium',
      deadline: d('2025-03-10'),
      status: 'done',
      project: projDash._id,
      assignedTo: fatima._id,
      comments: [
        comment(sara, 'Recharts semble plus simple à intégrer avec React', '2025-03-08'),
        comment(karim, 'D3.js est plus flexible mais plus complexe', '2025-03-09'),
        comment(fatima, 'Je pars sur Recharts, décision validée en réunion.', '2025-03-10')
      ]
    },
    {
      title: 'Connexion API temps réel',
      description: 'Implémenter WebSocket pour les données en live sur le dashboard',
      priority: 'high',
      deadline: d('2025-05-15'),
      status: 'todo',
      project: projDash._id,
      assignedTo: karim._id,
      comments: []
    }
  ];

  await Task.insertMany(tasks);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Erreur seed :', err.message);
  process.exit(1);
});
