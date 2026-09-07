import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, WeightUnit, DimensionUnit } from '@prisma/client/index';

/**
 * DTO imbriqué représentant une catégorie dans la réponse produit.
 */
export class ProductCategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Alimentation' })
  name!: string;

  @ApiProperty({ example: 'alimentation' })
  slug!: string;
}

/**
 * DTO imbriqué représentant un fournisseur dans la réponse produit.
 */
export class ProductSupplierResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891' })
  id!: string;

  @ApiProperty({ example: 'Fournisseur Global SARL' })
  name!: string;

  @ApiPropertyOptional({ example: 'contact@fournisseur.com' })
  email?: string | null;

  @ApiPropertyOptional({ example: '+225 01020304' })
  phone?: string | null;
}

/**
 * DTO de réponse HTTP complet pour un produit.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class ProductResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'SKU-CAFE-001' })
  sku!: string;

  @ApiPropertyOptional({ example: '3760123456789' })
  barcode?: string | null;

  @ApiProperty({ example: 'Café Arabica Pur 500g' })
  name!: string;

  @ApiProperty({ example: 'cafe-arabica-pur-500g' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Café moulu haut de gamme' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'Café moulu pur arabica' })
  shortDescription?: string | null;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  categoryId!: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891' })
  brandId?: string | null;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567892' })
  supplierId?: string | null;

  @ApiProperty({ example: 4500.0 })
  unitPrice!: number;

  @ApiProperty({ example: 3000.0 })
  costPrice!: number;

  @ApiProperty({ example: 'XOF' })
  currency!: string;

  @ApiProperty({ example: 18.0 })
  taxRate!: number;

  @ApiProperty({ example: 0.0 })
  discountRate!: number;

  @ApiProperty({ example: 'pièce' })
  unit!: string;

  @ApiPropertyOptional({ example: 0.5 })
  weight?: number | null;

  @ApiPropertyOptional({ enum: WeightUnit, example: WeightUnit.KG })
  weightUnit?: WeightUnit | null;

  @ApiPropertyOptional({ example: 10 })
  length?: number | null;

  @ApiPropertyOptional({ example: 5 })
  width?: number | null;

  @ApiPropertyOptional({ example: 15 })
  height?: number | null;

  @ApiPropertyOptional({ enum: DimensionUnit, example: DimensionUnit.CM })
  dimensionUnit?: DimensionUnit | null;

  @ApiPropertyOptional({ example: 'Noir' })
  color?: string | null;

  @ApiPropertyOptional({ example: 'Aluminium' })
  material?: string | null;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status!: ProductStatus;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: false })
  isPerishable!: boolean;

  @ApiProperty({ example: false })
  isSerialized!: boolean;

  @ApiProperty({ example: false })
  requiresBatch!: boolean;

  @ApiPropertyOptional({ example: 24 })
  warrantyMonths?: number | null;

  @ApiProperty({ example: 10 })
  alertThreshold!: number;

  @ApiProperty({ example: 5 })
  minStockLevel!: number;

  @ApiPropertyOptional({ example: 500 })
  maxStockLevel?: number | null;

  @ApiPropertyOptional({ example: 15 })
  reorderPoint?: number | null;

  @ApiPropertyOptional({ example: 50 })
  reorderQty?: number | null;

  @ApiPropertyOptional({ example: 'Acheter Café Arabica' })
  metaTitle?: string | null;

  @ApiPropertyOptional({ example: 'Description SEO' })
  metaDescription?: string | null;

  @ApiPropertyOptional({ example: 'Notes internes' })
  notes?: string | null;

  @ApiProperty({ example: '2026-08-25T08:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-25T08:00:00Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: () => ProductCategoryResponseDto })
  category?: ProductCategoryResponseDto | null;

  @ApiPropertyOptional({ type: () => ProductSupplierResponseDto })
  supplier?: ProductSupplierResponseDto | null;

  @ApiPropertyOptional({
    example: 45,
    description: 'Quantité totale disponible en stock',
  })
  currentStock?: number;
}

/**
 * DTO enveloppant les résultats paginés de produits avec métadonnées conformes à la spécification Phase 4.
 */
export class PaginatedProductsDataDto {
  @ApiProperty({ type: [ProductResponseDto] })
  items!: ProductResponseDto[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: PaginatedProductsDataDto })
  data!: PaginatedProductsDataDto;
}
