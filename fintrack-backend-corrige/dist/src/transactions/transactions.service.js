"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("./transaction.entity");
const role_enum_1 = require("../common/enums/role.enum");
let TransactionsService = class TransactionsService {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }
    create(userId, dto) {
        const transaction = this.transactionsRepository.create({ ...dto, userId });
        return this.transactionsRepository.save(transaction);
    }
    async findAll(requester, filters) {
        const where = {};
        if (requester.role === role_enum_1.Role.ADMIN) {
            if (filters.userId)
                where.userId = filters.userId;
        }
        else {
            where.userId = requester.id;
        }
        if (filters.type)
            where.type = filters.type;
        if (filters.category)
            where.category = filters.category;
        if (filters.from && filters.to)
            where.date = (0, typeorm_2.Between)(filters.from, filters.to);
        return this.transactionsRepository.find({ where, order: { date: 'DESC' } });
    }
    async findOne(requester, id) {
        const transaction = await this.transactionsRepository.findOne({ where: { id } });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction ${id} introuvable.`);
        }
        this.assertOwnershipOrAdmin(requester, transaction);
        return transaction;
    }
    async update(requester, id, dto) {
        const transaction = await this.findOne(requester, id);
        Object.assign(transaction, dto);
        return this.transactionsRepository.save(transaction);
    }
    async remove(requester, id) {
        const transaction = await this.findOne(requester, id);
        await this.transactionsRepository.remove(transaction);
    }
    async removeAllByType(requester, type) {
        const result = await this.transactionsRepository.delete({
            userId: requester.id,
            type,
        });
        return { deleted: result.affected ?? 0 };
    }
    async getSummary(requester, filters) {
        const transactions = await this.findAll(requester, filters);
        const totalIncome = transactions
            .filter((t) => t.type === transaction_entity_1.TransactionType.INCOME)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = transactions
            .filter((t) => t.type === transaction_entity_1.TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const byCategory = new Map();
        for (const t of transactions.filter((t) => t.type === transaction_entity_1.TransactionType.EXPENSE)) {
            byCategory.set(t.category, (byCategory.get(t.category) || 0) + Number(t.amount));
        }
        const categoryBreakdown = Array.from(byCategory.entries()).map(([category, amount]) => ({
            category,
            amount,
            percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        }));
        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            transactionCount: transactions.length,
            categoryBreakdown,
        };
    }
    assertOwnershipOrAdmin(requester, transaction) {
        if (requester.role !== role_enum_1.Role.ADMIN && transaction.userId !== requester.id) {
            throw new common_1.ForbiddenException("Vous n'avez pas accès à cette transaction.");
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map