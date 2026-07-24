import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../common/enums/role.enum';
import { Transaction } from '../transactions/transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // ne jamais renvoyer le hash dans les réponses JSON
  password: string;

  @Column({ type: 'varchar', default: Role.USER })
  role: Role;

  @Column({ default: 'FCFA' })
  currency: string;

  @Column({ type: 'float', default: 0 })
  monthlyBudget: number;

  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
