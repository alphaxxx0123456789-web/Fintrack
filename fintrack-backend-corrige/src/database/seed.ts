import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Transaction, TransactionType } from '../transactions/transaction.entity';
import { Category, CategoryType } from '../categories/category.entity';
import { Role } from '../common/enums/role.enum';

const dataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_PATH || 'fintrack.sqlite',
  entities: [User, Transaction, Category],
  synchronize: true,
});

const defaultCategories: Partial<Category>[] = [
  { key: 'salary', label: 'Salaire', icon: '💼', color: '#22c55e', type: CategoryType.INCOME },
  { key: 'freelance', label: 'Freelance', icon: '💻', color: '#3b82f6', type: CategoryType.INCOME },
  { key: 'investment', label: 'Investissement', icon: '📈', color: '#a855f7', type: CategoryType.INCOME },
  { key: 'food', label: 'Alimentation', icon: '🍽️', color: '#ef4444', type: CategoryType.EXPENSE },
  { key: 'transport', label: 'Transport', icon: '🚗', color: '#06b6d4', type: CategoryType.EXPENSE },
  { key: 'housing', label: 'Logement', icon: '🏠', color: '#f59e0b', type: CategoryType.EXPENSE },
  { key: 'entertainment', label: 'Loisirs', icon: '🎬', color: '#ec4899', type: CategoryType.EXPENSE },
  { key: 'health', label: 'Santé', icon: '⚕️', color: '#14b8a6', type: CategoryType.EXPENSE },
  { key: 'education', label: 'Éducation', icon: '📚', color: '#6366f1', type: CategoryType.EXPENSE },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#8b5cf6', type: CategoryType.EXPENSE },
  { key: 'utilities', label: 'Factures', icon: '⚡', color: '#f97316', type: CategoryType.EXPENSE },
  { key: 'other', label: 'Autre', icon: '📦', color: '#64748b', type: CategoryType.BOTH },
];

async function seed() {
  await dataSource.initialize();
  console.log('Connexion à la base établie. Démarrage du seed...');

  const categoryRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);
  const transactionRepo = dataSource.getRepository(Transaction);

  // Catégories
  for (const cat of defaultCategories) {
    const existing = await categoryRepo.findOne({ where: { key: cat.key } });
    if (!existing) await categoryRepo.save(categoryRepo.create(cat));
  }
  console.log(`✔ ${defaultCategories.length} catégories vérifiées/créées.`);

  // Compte admin
  let admin = await userRepo.findOne({ where: { email: 'admin@fintrack.sn' } });
  if (!admin) {
    admin = await userRepo.save(
      userRepo.create({
        name: 'Administrateur FinTrack',
        email: 'admin@fintrack.sn',
        password: await bcrypt.hash('admin123', 10),
        role: Role.ADMIN,
        currency: 'FCFA',
        monthlyBudget: 0,
      }),
    );
    console.log('✔ Compte admin créé : admin@fintrack.sn / admin123');
  }

  // Utilisateur démo (reprend les données mock du frontend)
  let demoUser = await userRepo.findOne({ where: { email: 'amadou@fintrack.sn' } });
  if (!demoUser) {
    demoUser = await userRepo.save(
      userRepo.create({
        name: 'Amadou Diallo',
        email: 'amadou@fintrack.sn',
        password: await bcrypt.hash('demo1234', 10),
        role: Role.USER,
        currency: 'FCFA',
        monthlyBudget: 800000,
      }),
    );
    console.log('✔ Utilisateur démo créé : amadou@fintrack.sn / demo1234');

    const demoTransactions: Partial<Transaction>[] = [
      { type: TransactionType.INCOME, amount: 650000, category: 'salary', description: 'Salaire Septembre', date: '2024-09-01' },
      { type: TransactionType.INCOME, amount: 120000, category: 'freelance', description: 'Projet web Dakar Tech', date: '2024-09-05' },
      { type: TransactionType.EXPENSE, amount: 85000, category: 'housing', description: 'Loyer appartement', date: '2024-09-03' },
      { type: TransactionType.EXPENSE, amount: 22000, category: 'food', description: 'Marché Sandaga', date: '2024-09-08' },
      { type: TransactionType.EXPENSE, amount: 15000, category: 'transport', description: 'Taxi & DDD', date: '2024-09-10' },
      { type: TransactionType.INCOME, amount: 45000, category: 'investment', description: 'Dividendes BOAD', date: '2024-09-12' },
      { type: TransactionType.EXPENSE, amount: 38000, category: 'shopping', description: 'Centre commercial', date: '2024-09-14' },
      { type: TransactionType.EXPENSE, amount: 12500, category: 'entertainment', description: 'Cinéma & sortie', date: '2024-09-15' },
      { type: TransactionType.EXPENSE, amount: 18000, category: 'health', description: 'Consultation médicale', date: '2024-09-18' },
      { type: TransactionType.EXPENSE, amount: 25000, category: 'utilities', description: 'SENELEC & eau', date: '2024-09-20' },
      { type: TransactionType.INCOME, amount: 80000, category: 'freelance', description: 'Design logo entreprise', date: '2024-09-22' },
      { type: TransactionType.EXPENSE, amount: 9500, category: 'food', description: 'Restaurant Plateau', date: '2024-09-25' },
    ];

    for (const t of demoTransactions) {
      await transactionRepo.save(transactionRepo.create({ ...t, userId: demoUser.id }));
    }
    console.log(`✔ ${demoTransactions.length} transactions de démonstration créées.`);
  }

  console.log('Seed terminé avec succès.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Erreur pendant le seed :', err);
  process.exit(1);
});
