import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: "Fonds d'urgence" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  @IsPositive({ message: "L'objectif doit être supérieur à 0." })
  target: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  current?: number;

  @ApiPropertyOptional({ example: '#22c55e' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: '🛡️' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '2026-12-01' })
  @IsOptional()
  @IsDateString({}, { message: 'La date doit être au format ISO (YYYY-MM-DD).' })
  deadline?: string;
}
