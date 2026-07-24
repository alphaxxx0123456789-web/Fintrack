import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Amadou Diallo' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'amadou@fintrack.sn' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'FCFA' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 800000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyBudget?: number;

  @ApiPropertyOptional({ example: 'https://.../avatar.png' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
