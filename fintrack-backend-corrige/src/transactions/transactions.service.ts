import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { Role } from '../common/enums/role.enum';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({ ...dto, userId });
    return this.transactionsRepository.save(transaction);
  }

  /**
   * Un utilisateur normal ne voit que ses propres transactions.
   * Un admin peut filtrer par userId pour consulter celles d'un autre utilisateur,
   * ou ne rien préciser pour tout voir.
   */
  async findAll(requester: RequestUser, filters: FilterTransactionDto): Promise<Transaction[]> {
    const where: Record<string, any> = {};

    if (requester.role === Role.ADMIN) {
      if (filters.userId) where.userId = filters.userId;
    } else {
      where.userId = requester.id;
    }

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.from && filters.to) where.date = Between(filters.from, filters.to);

    return this.transactionsRepository.find({ where, order: { date: 'DESC' } });
  }

  async findOne(requester: RequestUser, id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} introuvable.`);
    }
    this.assertOwnershipOrAdmin(requester, transaction);
    return transaction;
  }

  async update(
    requester: RequestUser,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(requester, id);
    Object.assign(transaction, dto);
    return this.transactionsRepository.save(transaction);
  }

  async remove(requester: RequestUser, id: string): Promise<void> {
    const transaction = await this.findOne(requester, id);
    await this.transactionsRepository.remove(transaction);
  }

  /**
   * Supprime en une fois toutes les transactions d'un type (revenu ou dépense)
   * appartenant à l'utilisateur courant. Utilisé par la section
   * "Gestion des données" des Paramètres.
   */
  async removeAllByType(
    requester: RequestUser,
    type: TransactionType,
  ): Promise<{ deleted: number }> {
    const result = await this.transactionsRepository.delete({
      userId: requester.id,
      type,
    });
    return { deleted: result.affected ?? 0 };
  }

  /**
   * Statistiques agrégées pour le tableau de bord :
   * totaux revenus/dépenses/solde + répartition par catégorie.
   */
  async getSummary(requester: RequestUser, filters: FilterTransactionDto) {
    const transactions = await this.findAll(requester, filters);

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const byCategory = new Map<string, number>();
    for (const t of transactions.filter((t) => t.type === TransactionType.EXPENSE)) {
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

  private assertOwnershipOrAdmin(requester: RequestUser, transaction: Transaction) {
    if (requester.role !== Role.ADMIN && transaction.userId !== requester.id) {
      throw new ForbiddenException("Vous n'avez pas accès à cette transaction.");
    }
  }
}
