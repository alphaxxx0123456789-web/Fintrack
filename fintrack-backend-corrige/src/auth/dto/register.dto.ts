import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Amadou Diallo' })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
  name: string;

  @ApiProperty({ example: 'amadou@fintrack.sn' })
  @IsEmail({}, { message: 'Adresse email invalide.' })
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères.' })
  password: string;
}
