import { Product, Category, Supplier, Stock } from '@prisma/client/index';
import { ProductResponseDto } from '../../dto/product-response-dto';

/**
 * Type Prisma étendu incluant les relations category, supplier et stocks pour le mapping.
 */
export type PrismaProductWithRelations = Product & {
  category?: Category | null;
  supplier?: Supplier | null;
  stocks?: Stock[];
};

/**
 * Mapper responsable de la transformation des modèles Prisma Product vers les DTOs d'exposition.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class ProductMapper {
  /**
   * Convertit un produit Prisma vers le DTO ProductResponseDto.
   *
   * @param {PrismaProductWithRelations} product - Le produit issu de Prisma
   * @returns {ProductResponseDto} Le DTO d'exposition sécurisé
   */
  static toResponseDto(
    product: PrismaProductWithRelations,
  ): ProductResponseDto {
    const currentStock = product.stocks
      ? product.stocks.reduce((acc, stock) => acc + stock.quantity, 0)
      : undefined;

    return {
      id: product.id,
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      categoryId: product.categoryId,
      brandId: product.brandId,
      supplierId: product.supplierId,
      unitPrice: Number(product.unitPrice),
      costPrice: Number(product.costPrice),
      currency: product.currency,
      taxRate: Number(product.taxRate),
      discountRate: Number(product.discountRate),
      unit: product.unit,
      weight: product.weight !== null ? Number(product.weight) : null,
      weightUnit: product.weightUnit,
      length: product.length !== null ? Number(product.length) : null,
      width: product.width !== null ? Number(product.width) : null,
      height: product.height !== null ? Number(product.height) : null,
      dimensionUnit: product.dimensionUnit,
      color: product.color,
      material: product.material,
      status: product.status,
      isActive: product.isActive,
      isPerishable: product.isPerishable,
      isSerialized: product.isSerialized,
      requiresBatch: product.requiresBatch,
      warrantyMonths: product.warrantyMonths,
      alertThreshold: product.alertThreshold,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      reorderPoint: product.reorderPoint,
      reorderQty: product.reorderQty,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      notes: product.notes,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      supplier: product.supplier
        ? {
            id: product.supplier.id,
            name: product.supplier.name,
            email: product.supplier.email,
            phone: product.supplier.phone,
          }
        : null,
      currentStock,
    };
  }
}
