import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO de filtrage et pagination pour la recherche de produits.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class ProductQueryDto {
  @ApiPropertyOptional({
    description:
      'Recherche textuelle insensible à la casse sur le nom ou le SKU',
    example: 'cafe',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant unique de catégorie',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'categoryId doit être un UUID valide' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant unique de fournisseur',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
  })
  @IsOptional()
  @IsUUID('4', { message: 'supplierId doit être un UUID valide' })
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif ou inactif',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Si true, renvoie uniquement les produits dont le stock total est inférieur ou égal au seuil d’alerte',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  belowAlert?: boolean;

  @ApiPropertyOptional({
    description: 'Numéro de page pour la pagination (commence à 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un entier' })
  @Min(1, { message: 'La page doit être supérieure ou égale à 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d’éléments par page (max 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un entier' })
  @Min(1, { message: 'La limite doit être supérieure ou égale à 1' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100 éléments' })
  limit?: number = 20;
}
