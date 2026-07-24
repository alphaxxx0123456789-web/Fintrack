import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import { TransactionType } from '../transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType, { message: 'Le type doit être "income" ou "expense".' })
  type: TransactionType;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @IsPositive({ message: 'Le montant doit être supérieur à 0.' })
  amount: number;

  @ApiProperty({ example: 'food' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Marché Sandaga' })
  @IsString()
  @MinLength(2)
  description: string;

  @ApiProperty({ example: '2026-07-24' })
  @IsDateString({}, { message: 'La date doit être au format ISO (YYYY-MM-DD).' })
  date: string;
}
