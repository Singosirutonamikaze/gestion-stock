import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO de filtrage pour les requêtes de consultation du stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer par identifiant UUID du produit',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le productId doit être un UUID valide' })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant UUID de l’entrepôt',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le warehouseId doit être un UUID valide' })
  warehouseId?: string;

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
