import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockProductDetailDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'SKU-001' })
  sku!: string;

  @ApiProperty({ example: 'Produit Exemple' })
  name!: string;

  @ApiProperty({ example: 10 })
  alertThreshold!: number;
}

export class StockWarehouseDetailDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id!: string;

  @ApiProperty({ example: 'WH-01' })
  code!: string;

  @ApiProperty({ example: 'Entrepôt Abidjan' })
  name!: string;
}

/**
 * DTO de réponse pour un niveau de stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockLevelResponseDto {
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  productId!: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  warehouseId!: string;

  @ApiPropertyOptional({ example: null })
  locationId!: string | null;

  @ApiProperty({ example: 100 })
  quantity!: number;

  @ApiProperty({ example: 10 })
  reservedQuantity!: number;

  @ApiProperty({ example: 90 })
  availableQuantity!: number;

  @ApiProperty({ example: '2026-09-16T12:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: () => StockProductDetailDto })
  product?: StockProductDetailDto;

  @ApiPropertyOptional({ type: () => StockWarehouseDetailDto })
  warehouse?: StockWarehouseDetailDto;
}

/**
 * DTO détaillant le stock d'un produit par entrepôt pour les alertes de stock bas.
 */
export class LowStockWarehouseDetailDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  warehouseId!: string;

  @ApiProperty({ example: 'WH-01' })
  warehouseCode!: string;

  @ApiProperty({ example: 'Entrepôt Abidjan' })
  warehouseName!: string;

  @ApiProperty({ example: 3 })
  quantity!: number;

  @ApiProperty({ example: 3 })
  availableQuantity!: number;
}

/**
 * DTO de réponse pour un produit sous le seuil d'alerte.
 */
export class LowStockResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'SKU-001' })
  sku!: string;

  @ApiProperty({ example: 'Produit Exemple' })
  name!: string;

  @ApiProperty({ example: 3 })
  totalQuantity!: number;

  @ApiProperty({ example: 3 })
  totalAvailableQuantity!: number;

  @ApiProperty({ example: 10 })
  alertThreshold!: number;

  @ApiProperty({ type: [LowStockWarehouseDetailDto] })
  warehouses!: LowStockWarehouseDetailDto[];
}
