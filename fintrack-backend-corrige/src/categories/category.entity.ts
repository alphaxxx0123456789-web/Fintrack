import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
  BOTH = 'both',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // ex: "food", "salary" — utilisé par le frontend

  @Column()
  label: string; // ex: "Alimentation"

  @Column({ default: '📦' })
  icon: string;

  @Column({ default: '#64748b' })
  color: string;

  @Column({ type: 'varchar', default: CategoryType.BOTH })
  type: CategoryType;

  @CreateDateColumn()
  createdAt: Date;
}
