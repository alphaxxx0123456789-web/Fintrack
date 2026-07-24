"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const transactions_module_1 = require("./transactions/transactions.module");
const categories_module_1 = require("./categories/categories.module");
const exchange_rate_module_1 = require("./exchange-rate/exchange-rate.module");
const goals_module_1 = require("./goals/goals.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const user_entity_1 = require("./users/user.entity");
const transaction_entity_1 = require("./transactions/transaction.entity");
const category_entity_1 = require("./categories/category.entity");
const goal_entity_1 = require("./goals/goal.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'sqlite',
                    database: config.get('DB_PATH') || 'fintrack.sqlite',
                    entities: [user_entity_1.User, transaction_entity_1.Transaction, category_entity_1.Category, goal_entity_1.Goal],
                    synchronize: true,
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            transactions_module_1.TransactionsModule,
            categories_module_1.CategoriesModule,
            exchange_rate_module_1.ExchangeRateModule,
            goals_module_1.GoalsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map