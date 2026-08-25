import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums/user-role-enum';

/**
 * DTO d'enregistrement d'un utilisateur / administrateur.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class RegisterDto {
  @ApiProperty({ example: 'admin@entreprise.com', description: 'Adresse email' })
  @IsEmail({}, { message: 'L\'adresse email doit être valide' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123!', description: 'Mot de passe (minimum 8 caractères)' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.ADMINISTRATOR })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Le rôle spécifié est invalide' })
  role?: UserRole;
}
