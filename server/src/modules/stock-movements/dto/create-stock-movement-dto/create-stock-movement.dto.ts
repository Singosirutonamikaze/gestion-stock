import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { MovementType } from '@prisma/client';

/**
 * DTO de création d'un mouvement de stock immuable.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CreateStockMovementDto {
  @ApiProperty({
    description: 'Identifiant UUID du produit concerné',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4', { message: 'Le productId doit être un UUID valide' })
  @IsNotEmpty({ message: 'Le productId est obligatoire' })
  productId!: string;

  @ApiProperty({
    description: 'Identifiant UUID de l’entrepôt source',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @IsUUID('4', { message: 'Le warehouseId doit être un UUID valide' })
  @IsNotEmpty({ message: 'Le warehouseId est obligatoire' })
  warehouseId!: string;

  @ApiProperty({
    description: 'Type de mouvement de stock',
    enum: MovementType,
    example: MovementType.IN,
  })
  @IsEnum(MovementType, { message: 'Le type de mouvement est invalide' })
  @IsNotEmpty({ message: 'Le type de mouvement est obligatoire' })
  type!: MovementType;

  @ApiProperty({
    description: 'Quantité positive du mouvement',
    example: 10,
    minimum: 1,
  })
  @IsInt({ message: 'La quantité doit être un nombre entier' })
  @Min(1, { message: 'La quantité doit être strictement positive (>= 1)' })
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Motif ou description libre du mouvement',
    example: 'Réception commande fournisseur #PO-2026-001',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le motif doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'Le motif ne peut pas dépasser 255 caractères' })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Référence externe liée (bon de livraison, facture, etc.)',
    example: 'BL-987654',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La référence doit être une chaîne de caractères' })
  @MaxLength(100, {
    message: 'La référence ne peut pas dépasser 100 caractères',
  })
  reference?: string;

  @ApiPropertyOptional({
    description:
      'Identifiant UUID de l’entrepôt destination (obligatoire si type = TRANSFER)',
    example: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  })
  @ValidateIf((o: CreateStockMovementDto) => o.type === MovementType.TRANSFER)
  @IsNotEmpty({
    message:
      'L’entrepôt destination (relatedWarehouseId) est obligatoire pour un transfert',
  })
  @IsUUID('4', {
    message: 'Le relatedWarehouseId doit être un UUID valide',
  })
  relatedWarehouseId?: string;
}
