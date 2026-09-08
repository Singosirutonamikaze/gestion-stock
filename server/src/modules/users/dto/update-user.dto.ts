import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums/user-role-enum';

/**
 * DTO de mise à jour d'un compte utilisateur.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'kodjo.koffie@entreprise.com',
    description: 'Nouvelle adresse email',
  })
  @IsOptional()
  @IsEmail({}, { message: "L'adresse email doit être valide" })
  email?: string;

  @ApiPropertyOptional({
    example: 'NouveauMotDePasse123!',
    description: 'Nouveau mot de passe',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password?: string;

  @ApiPropertyOptional({ example: 'Kodjo', description: 'Nouveau prénom' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Koffie', description: 'Nouveau nom' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Nouveau rôle' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Le rôle spécifié est invalide' })
  role?: UserRole;

  @ApiPropertyOptional({ example: true, description: 'Statut actif du compte' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
