import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums/user-role-enum';

/**
 * DTO de création d'un compte utilisateur (réservé aux Administrateurs).
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CreateUserDto {
  @ApiProperty({ example: 'jean.dupont@entreprise.com', description: 'Adresse email unique de l\'utilisateur' })
  @IsEmail({}, { message: 'L\'adresse email doit être valide' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123!', description: 'Mot de passe (minimum 8 caractères)' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom de l\'utilisateur' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom de l\'utilisateur' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.SALES, description: 'Rôle attribué à l\'utilisateur' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Le rôle spécifié est invalide' })
  role?: UserRole;
}
