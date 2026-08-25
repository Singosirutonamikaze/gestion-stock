import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de connexion (login) - email + mot de passe.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class LoginDto {
  @ApiProperty({ example: 'jean.dupont@entreprise.com', description: 'Adresse email' })
  @IsEmail({}, { message: 'L\'adresse email doit être valide' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123!', description: 'Mot de passe' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;
}
