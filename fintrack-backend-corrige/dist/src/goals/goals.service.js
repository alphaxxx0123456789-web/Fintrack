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
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const goal_entity_1 = require("./goal.entity");
const role_enum_1 = require("../common/enums/role.enum");
let GoalsService = class GoalsService {
    constructor(goalsRepository) {
        this.goalsRepository = goalsRepository;
    }
    create(userId, dto) {
        const goal = this.goalsRepository.create({ ...dto, userId });
        return this.goalsRepository.save(goal);
    }
    findAll(requester) {
        const where = requester.role === role_enum_1.Role.ADMIN ? {} : { userId: requester.id };
        return this.goalsRepository.find({ where, order: { createdAt: 'ASC' } });
    }
    async findOne(requester, id) {
        const goal = await this.goalsRepository.findOne({ where: { id } });
        if (!goal) {
            throw new common_1.NotFoundException(`Objectif ${id} introuvable.`);
        }
        this.assertOwnershipOrAdmin(requester, goal);
        return goal;
    }
    async update(requester, id, dto) {
        const goal = await this.findOne(requester, id);
        Object.assign(goal, dto);
        return this.goalsRepository.save(goal);
    }
    async remove(requester, id) {
        const goal = await this.findOne(requester, id);
        await this.goalsRepository.remove(goal);
    }
    async removeAll(requester) {
        const result = await this.goalsRepository.delete({ userId: requester.id });
        return { deleted: result.affected ?? 0 };
    }
    assertOwnershipOrAdmin(requester, goal) {
        if (requester.role !== role_enum_1.Role.ADMIN && goal.userId !== requester.id) {
            throw new common_1.ForbiddenException("Vous n'avez pas accès à cet objectif.");
        }
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(goal_entity_1.Goal)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], GoalsService);
//# sourceMappingURL=goals.service.js.map