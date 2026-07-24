"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/user.entity");
const transaction_entity_1 = require("../transactions/transaction.entity");
const category_entity_1 = require("../categories/category.entity");
const role_enum_1 = require("../common/enums/role.enum");
const dataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: process.env.DB_PATH || 'fintrack.sqlite',
    entities: [user_entity_1.User, transaction_entity_1.Transaction, category_entity_1.Category],
    synchronize: true,
});
const defaultCategories = [
    { key: 'salary', label: 'Salaire', icon: '💼', color: '#22c55e', type: category_entity_1.CategoryType.INCOME },
    { key: 'freelance', label: 'Freelance', icon: '💻', color: '#3b82f6', type: category_entity_1.CategoryType.INCOME },
    { key: 'investment', label: 'Investissement', icon: '📈', color: '#a855f7', type: category_entity_1.CategoryType.INCOME },
    { key: 'food', label: 'Alimentation', icon: '🍽️', color: '#ef4444', type: category_entity_1.CategoryType.EXPENSE },
    { key: 'transport', label: 'Transport', icon: '🚗', color: '#06b6d4', type: category_entity_1.CategoryType.EXPENSE },
    { key: 'housing', label: 'Logement', icon: '🏠', color: '#f59e0b', type: category_entity_1.CategoryType.EXPENSE },
    { key: 'entertainment', label: 'Loisirs', icon: '🎬', color: '#ec4899', type: category_entity_1.CategoryType.EXPENSE },
    { key: 'health', label: 'Santé', icon: '⚕️', color: '#14b8a6', type: category_entity_1.CategoryType.EXPENSE },
    { key: 'education', label: 'Éducation', icon: '📚', color: '#6366f1', type: category_entity_1.CategoryType.EXPENSE },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#8b5cf6', type: category_entity_1.CategoryType.EXPENSE },
    { key: 'utilities', label: 'Factures', icon: '⚡', color: '#f97316', type: category_entity_1.CategoryType.EXPENSE },
    { key: 'other', label: 'Autre', icon: '📦', color: '#64748b', type: category_entity_1.CategoryType.BOTH },
];
async function seed() {
    await dataSource.initialize();
    console.log('Connexion à la base établie. Démarrage du seed...');
    const categoryRepo = dataSource.getRepository(category_entity_1.Category);
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const transactionRepo = dataSource.getRepository(transaction_entity_1.Transaction);
    for (const cat of defaultCategories) {
        const existing = await categoryRepo.findOne({ where: { key: cat.key } });
        if (!existing)
            await categoryRepo.save(categoryRepo.create(cat));
    }
    console.log(`✔ ${defaultCategories.length} catégories vérifiées/créées.`);
    let admin = await userRepo.findOne({ where: { email: 'admin@fintrack.sn' } });
    if (!admin) {
        admin = await userRepo.save(userRepo.create({
            name: 'Administrateur FinTrack',
            email: 'admin@fintrack.sn',
            password: await bcrypt.hash('admin123', 10),
            role: role_enum_1.Role.ADMIN,
            currency: 'FCFA',
            monthlyBudget: 0,
        }));
        console.log('✔ Compte admin créé : admin@fintrack.sn / admin123');
    }
    let demoUser = await userRepo.findOne({ where: { email: 'amadou@fintrack.sn' } });
    if (!demoUser) {
        demoUser = await userRepo.save(userRepo.create({
            name: 'Amadou Diallo',
            email: 'amadou@fintrack.sn',
            password: await bcrypt.hash('demo1234', 10),
            role: role_enum_1.Role.USER,
            currency: 'FCFA',
            monthlyBudget: 800000,
        }));
        console.log('✔ Utilisateur démo créé : amadou@fintrack.sn / demo1234');
        const demoTransactions = [
            { type: transaction_entity_1.TransactionType.INCOME, amount: 650000, category: 'salary', description: 'Salaire Septembre', date: '2024-09-01' },
            { type: transaction_entity_1.TransactionType.INCOME, amount: 120000, category: 'freelance', description: 'Projet web Dakar Tech', date: '2024-09-05' },
            { type: transaction_entity_1.TransactionType.EXPENSE, amount: 85000, category: 'housing', description: 'Loyer appartement', date: '2024-09-03' },
            { type: transaction_entity_1.TransactionType.EXPENSE, amount: 22000, category: 'food', description: 'Marché Sandaga', date: '2024-09-08' },
            { type: transaction_entity_1.TransactionType.EXPENSE, amount: 15000, category: 'transport', description: 'Taxi & DDD', date: '2024-09-10' },
            { type: transaction_entity_1.TransactionType.INCOME, amount: 45000, category: 'investment', description: 'Dividendes BOAD', date: '2024-09-12' },
            { type: transaction_entity_1.TransactionType.EXPENSE, amount: 38000, category: 'shopping', description: 'Centre commercial', date: '2024-09-14' },
            { type: transaction_entity_1.TransactionType.EXPENSE, amount: 12500, category: 'entertainment', description: 'Cinéma & sortie', date: '2024-09-15' },
            { type: transaction_entity_1.TransactionType.EXPENSE, amount: 18000, category: 'health', description: 'Consultation médicale', date: '2024-09-18' },
            { type: transaction_entity_1.TransactionType.EXPENSE, amount: 25000, category: 'utilities', description: 'SENELEC & eau', date: '2024-09-20' },
            { type: transaction_entity_1.TransactionType.INCOME, amount: 80000, category: 'freelance', description: 'Design logo entreprise', date: '2024-09-22' },
            { type: transaction_entity_1.TransactionType.EXPENSE, amount: 9500, category: 'food', description: 'Restaurant Plateau', date: '2024-09-25' },
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
//# sourceMappingURL=seed.js.map