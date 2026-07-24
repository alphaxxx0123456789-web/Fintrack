import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { GoalsModule } from './goals/goals.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { User } from './users/user.entity';
import { Transaction } from './transactions/transaction.entity';
import { Category } from './categories/category.entity';
import { Goal } from './goals/goal.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get<string>('DB_PATH') || 'fintrack.sqlite',
        entities: [User, Transaction, Category, Goal],
        synchronize: true, // OK pour un projet académique — à remplacer par des migrations en prod
      }),
    }),
    AuthModule,
    UsersModule,
    TransactionsModule,
    CategoriesModule,
    ExchangeRateModule,
    GoalsModule,
  ],
  providers: [
    // JwtAuthGuard appliqué globalement : toute route est protégée
    // sauf celles marquées @Public() (voir auth.controller.ts)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
