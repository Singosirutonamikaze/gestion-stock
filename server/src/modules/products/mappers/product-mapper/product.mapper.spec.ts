import { ProductMapper } from './product.mapper';
import {
  ProductStatus,
  WeightUnit,
  DimensionUnit,
  Prisma,
} from '@prisma/client';
import { PrismaProductWithRelations } from './product.mapper';

describe('ProductMapper', () => {
  const mockPrismaProduct: PrismaProductWithRelations = {
    id: 'prd-123',
    sku: 'SKU-001',
    barcode: '1234567890123',
    name: 'Produit Test',
    slug: 'produit-test',
    description: 'Description du produit',
    shortDescription: 'Court résumé',
    categoryId: 'cat-123',
    brandId: 'brd-123',
    supplierId: 'sup-123',
    unitPrice: new Prisma.Decimal(1500),
    costPrice: new Prisma.Decimal(1000),
    currency: 'XOF',
    taxRate: new Prisma.Decimal(18),
    discountRate: new Prisma.Decimal(0),
    unit: 'pièce',
    weight: new Prisma.Decimal(1.5),
    weightUnit: WeightUnit.KG,
    length: new Prisma.Decimal(10),
    width: new Prisma.Decimal(20),
    height: new Prisma.Decimal(30),
    dimensionUnit: DimensionUnit.CM,
    color: 'Rouge',
    material: 'Plastique',
    status: ProductStatus.ACTIVE,
    isActive: true,
    isPerishable: false,
    isSerialized: false,
    requiresBatch: false,
    warrantyMonths: 12,
    alertThreshold: 5,
    minStockLevel: 2,
    maxStockLevel: 100,
    reorderPoint: 10,
    reorderQty: 50,
    metaTitle: 'Produit Test',
    metaDescription: 'Meta description',
    notes: 'Note interne',
    createdAt: new Date('2026-08-25T08:00:00Z'),
    updatedAt: new Date('2026-08-25T08:00:00Z'),
    category: {
      id: 'cat-123',
      name: 'Informatique',
      slug: 'informatique',
      description: null,
      imageUrl: null,
      icon: null,
      parentId: null,
      displayOrder: 0,
      isActive: true,
      createdAt: new Date('2026-08-25T08:00:00Z'),
      updatedAt: new Date('2026-08-25T08:00:00Z'),
    },
    supplier: {
      id: 'sup-123',
      name: 'Fournisseur Test',
      logoUrl: null,
      email: 'contact@fournisseur.com',
      phone: '+225 01020304',
      website: null,
      taxId: null,
      contactPerson: null,
      contactEmail: null,
      contactPhone: null,
      paymentTerms: null,
      currency: 'XOF',
      rating: null,
      notes: null,
      addressId: null,
      isActive: true,
      createdAt: new Date('2026-08-25T08:00:00Z'),
      updatedAt: new Date('2026-08-25T08:00:00Z'),
    },
    stocks: [
      {
        id: 'stk-1',
        productId: 'prd-123',
        warehouseId: 'wh-1',
        locationId: null,
        quantity: 20,
        reservedQuantity: 0,
        availableQuantity: 20,
        updatedAt: new Date(),
      },
      {
        id: 'stk-2',
        productId: 'prd-123',
        warehouseId: 'wh-2',
        locationId: null,
        quantity: 15,
        reservedQuantity: 0,
        availableQuantity: 15,
        updatedAt: new Date(),
      },
    ],
  };

  it('doit convertir un produit Prisma en ProductResponseDto', () => {
    const dto = ProductMapper.toResponseDto(mockPrismaProduct);

    expect(dto.id).toBe('prd-123');
    expect(dto.sku).toBe('SKU-001');
    expect(dto.unitPrice).toBe(1500);
    expect(dto.costPrice).toBe(1000);
    expect(dto.taxRate).toBe(18);
    expect(dto.currentStock).toBe(35);
    expect(dto.category?.name).toBe('Informatique');
    expect(dto.supplier?.name).toBe('Fournisseur Test');
  });
});
