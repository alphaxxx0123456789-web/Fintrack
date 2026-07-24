import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'amadou@fintrack.sn' })
  @IsEmail({}, { message: 'Adresse email invalide.' })
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères.' })
  password: string;
}
