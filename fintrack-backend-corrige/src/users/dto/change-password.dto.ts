import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'ancienMotDePasse' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'nouveauMotDePasse123' })
  @IsString()
  @MinLength(6, { message: 'Le nouveau mot de passe doit faire au moins 6 caractères.' })
  newPassword: string;
}
