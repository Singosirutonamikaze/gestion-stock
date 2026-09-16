import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderType, PaymentStatus } from '@prisma/client';

/**
 * DTO de filtrage et pagination pour la recherche des commandes.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class OrderQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer par type de commande (PURCHASE ou SALE)',
    enum: OrderType,
  })
  @IsOptional()
  @IsEnum(OrderType, { message: 'Le type de commande doit être valide' })
  type?: OrderType;

  @ApiPropertyOptional({
    description: 'Filtrer par statut de commande',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Le statut de commande doit être valide' })
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par statut de paiement',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Le statut de paiement doit être valide' })
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant d’entrepôt',
    example: 'e5f6a7b8-c9d0-1234-efab-345678901234',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le warehouseId doit être un UUID valide' })
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant de fournisseur',
    example: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le supplierId doit être un UUID valide' })
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant de client',
    example: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le customerId doit être un UUID valide' })
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Recherche textuelle par numéro de commande ou nom de client',
    example: 'ORD-2026',
  })
  @IsOptional()
  @IsString({ message: 'Le terme de recherche doit être une chaîne' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Date de début de création (format ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La date de début doit être au format ISO 8601' },
  )
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin de création (format ISO 8601)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit être au format ISO 8601' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Numéro de page pour la pagination (défaut : 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un entier' })
  @Min(1, { message: 'La page doit être supérieure ou égale à 1' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d’éléments par page (défaut : 20)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un entier' })
  @Min(1, { message: 'La limite doit être supérieure ou égale à 1' })
  limit: number = 20;
}
