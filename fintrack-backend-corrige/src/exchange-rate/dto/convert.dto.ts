import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class ConvertDto {
  @ApiProperty({ example: 100000 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'XOF', description: 'Code devise source (ISO 4217)' })
  @IsString()
  @Length(3, 3)
  from: string;

  @ApiProperty({ example: 'EUR', description: 'Code devise cible (ISO 4217)' })
  @IsString()
  @Length(3, 3)
  to: string;
}
