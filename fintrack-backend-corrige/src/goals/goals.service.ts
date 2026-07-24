import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Role } from '../common/enums/role.enum';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,
  ) {}

  create(userId: string, dto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalsRepository.create({ ...dto, userId });
    return this.goalsRepository.save(goal);
  }

  /** Un utilisateur normal ne voit que ses propres objectifs ; un admin voit tout. */
  findAll(requester: RequestUser): Promise<Goal[]> {
    const where = requester.role === Role.ADMIN ? {} : { userId: requester.id };
    return this.goalsRepository.find({ where, order: { createdAt: 'ASC' } });
  }

  async findOne(requester: RequestUser, id: string): Promise<Goal> {
    const goal = await this.goalsRepository.findOne({ where: { id } });
    if (!goal) {
      throw new NotFoundException(`Objectif ${id} introuvable.`);
    }
    this.assertOwnershipOrAdmin(requester, goal);
    return goal;
  }

  async update(requester: RequestUser, id: string, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.findOne(requester, id);
    Object.assign(goal, dto);
    return this.goalsRepository.save(goal);
  }

  async remove(requester: RequestUser, id: string): Promise<void> {
    const goal = await this.findOne(requester, id);
    await this.goalsRepository.remove(goal);
  }

  /**
   * Supprime tous les objectifs de l'utilisateur courant.
   * Utilisé par la section "Gestion des données" des Paramètres.
   */
  async removeAll(requester: RequestUser): Promise<{ deleted: number }> {
    const result = await this.goalsRepository.delete({ userId: requester.id });
    return { deleted: result.affected ?? 0 };
  }

  private assertOwnershipOrAdmin(requester: RequestUser, goal: Goal) {
    if (requester.role !== Role.ADMIN && goal.userId !== requester.id) {
      throw new ForbiddenException("Vous n'avez pas accès à cet objectif.");
    }
  }
}
