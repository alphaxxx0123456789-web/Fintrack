import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CategoryType } from '../category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'food' })
  @IsString()
  @MinLength(2)
  key: string;

  @ApiProperty({ example: 'Alimentation' })
  @IsString()
  @MinLength(2)
  label: string;

  @ApiPropertyOptional({ example: '🍽️' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#ef4444' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
