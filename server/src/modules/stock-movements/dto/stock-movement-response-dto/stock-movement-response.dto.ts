import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';

export class StockMovementProductDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'SKU-001' })
  sku!: string;

  @ApiProperty({ example: 'Produit Exemple' })
  name!: string;
}

export class StockMovementWarehouseDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id!: string;

  @ApiProperty({ example: 'WH-01' })
  code!: string;

  @ApiProperty({ example: 'Entrepôt Principal' })
  name!: string;
}

export class StockMovementUserDto {
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  id!: string;

  @ApiProperty({ example: 'jean.dupont@entreprise.com' })
  email!: string;

  @ApiProperty({ example: 'Jean' })
  firstName!: string;

  @ApiProperty({ example: 'Dupont' })
  lastName!: string;
}

/**
 * DTO de réponse pour un mouvement de stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockMovementResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  productId!: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  warehouseId!: string;

  @ApiProperty({ enum: MovementType, example: MovementType.IN })
  type!: MovementType;

  @ApiProperty({ example: 10 })
  quantity!: number;

  @ApiPropertyOptional({ example: 'Réception commande fournisseur' })
  reason?: string | null;

  @ApiPropertyOptional({ example: 'PO-2026-001' })
  reference?: string | null;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  relatedWarehouseId?: string | null;

  @ApiProperty({ example: 'd4e5f6a7-b8c9-0123-defa-234567890123' })
  userId!: string;

  @ApiProperty({ example: '2026-09-16T12:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: () => StockMovementProductDto })
  product?: StockMovementProductDto;

  @ApiPropertyOptional({ type: () => StockMovementWarehouseDto })
  warehouse?: StockMovementWarehouseDto;

  @ApiPropertyOptional({ type: () => StockMovementWarehouseDto })
  relatedWarehouse?: StockMovementWarehouseDto | null;

  @ApiPropertyOptional({ type: () => StockMovementUserDto })
  user?: StockMovementUserDto;
}
