import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { UserRole } from '../../../../shared/enums/user-role-enum';

/**
 * DTO de requête pour la liste paginée et filtrée des utilisateurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UserQueryDto {
  @ApiPropertyOptional({
    example: 'kodjo',
    description: 'Recherche par nom ou email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Filtrer par rôle' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    example: true,
    description: 'Filtrer par statut actif',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Numéro de la page demandée',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un nombre entier' })
  @Min(1, { message: 'La page minimale est 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: "Nombre d'enregistrements par page (max: 100)",
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un nombre entier' })
  @Min(1, { message: 'La limite minimale est 1' })
  @Max(100, { message: 'La limite maximale est 100' })
  limit?: number = 20;
}
