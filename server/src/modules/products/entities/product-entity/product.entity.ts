import {
  Product as PrismaProduct,
  ProductStatus,
  WeightUnit,
  DimensionUnit,
  Prisma,
} from '@prisma/client/index';
import { CategoryEntity } from '../../../categories/entities/categorie-entity/categorie.entity';
import { SupplierEntity } from '../../../suppliers/entities/supplier-entity/supplier.entity';

/**
 * Entité métier représentant un produit du catalogue (sans couplage direct aux internals Prisma).
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class ProductEntity implements PrismaProduct {
  id!: string;
  sku!: string;
  barcode!: string | null;
  name!: string;
  slug!: string;
  description!: string | null;
  shortDescription!: string | null;
  categoryId!: string;
  brandId!: string | null;
  supplierId!: string | null;
  unitPrice!: Prisma.Decimal;
  costPrice!: Prisma.Decimal;
  currency!: string;
  taxRate!: Prisma.Decimal;
  discountRate!: Prisma.Decimal;
  unit!: string;
  weight!: Prisma.Decimal | null;
  weightUnit!: WeightUnit | null;
  length!: Prisma.Decimal | null;
  width!: Prisma.Decimal | null;
  height!: Prisma.Decimal | null;
  dimensionUnit!: DimensionUnit | null;
  color!: string | null;
  material!: string | null;
  status!: ProductStatus;
  isActive!: boolean;
  isPerishable!: boolean;
  isSerialized!: boolean;
  requiresBatch!: boolean;
  warrantyMonths!: number | null;
  alertThreshold!: number;
  minStockLevel!: number;
  maxStockLevel!: number | null;
  reorderPoint!: number | null;
  reorderQty!: number | null;
  metaTitle!: string | null;
  metaDescription!: string | null;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  category?: CategoryEntity;
  supplier?: SupplierEntity | null;
  currentStock?: number;
}
