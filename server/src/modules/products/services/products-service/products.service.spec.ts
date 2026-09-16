import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../../repositories/products-repository';
import { Decimal } from '@prisma/client-runtime-utils';
import { PrismaProductWithRelations } from '../../mappers/product-mapper';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: {
    findMany: jest.MockedFunction<ProductsRepository['findMany']>;
    count: jest.MockedFunction<ProductsRepository['count']>;
    findById: jest.MockedFunction<ProductsRepository['findById']>;
    findBySku: jest.MockedFunction<ProductsRepository['findBySku']>;
    create: jest.MockedFunction<ProductsRepository['create']>;
    update: jest.MockedFunction<ProductsRepository['update']>;
    softDelete: jest.MockedFunction<ProductsRepository['softDelete']>;
  };

  const mockPrismaProduct: PrismaProductWithRelations = {
    id: 'prd-123',
    sku: 'SKU-001',
    barcode: '1234567890123',
    name: 'Produit Test',
    slug: 'produit-test',
    description: 'Description du produit',
    shortDescription: 'Court résumé',
    categoryId: 'cat-123',
    brandId: null,
    supplierId: null,
    unitPrice: new Decimal(1500),
    costPrice: new Decimal(1000),
    currency: 'XOF',
    taxRate: new Decimal(18),
    discountRate: new Decimal(0),
    unit: 'pièce',
    weight: new Decimal(1.5),
    weightUnit: 'KG',
    length: null,
    width: null,
    height: null,
    dimensionUnit: 'CM',
    color: 'Rouge',
    material: 'Plastique',
    status: 'ACTIVE',
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
    supplier: null,
    stocks: [
      {
        id: 'stk-1',
        productId: 'prd-123',
        warehouseId: 'wh-1',
        locationId: null,
        quantity: 10,
        reservedQuantity: 0,
        availableQuantity: 10,
        updatedAt: new Date(),
      },
    ],
  };

  beforeEach(async () => {
    repository = {
      findMany: jest.fn() as jest.MockedFunction<
        ProductsRepository['findMany']
      >,
      count: jest.fn() as jest.MockedFunction<ProductsRepository['count']>,
      findById: jest.fn() as jest.MockedFunction<
        ProductsRepository['findById']
      >,
      findBySku: jest.fn() as jest.MockedFunction<
        ProductsRepository['findBySku']
      >,
      create: jest.fn() as jest.MockedFunction<ProductsRepository['create']>,
      update: jest.fn() as jest.MockedFunction<ProductsRepository['update']>,
      softDelete: jest.fn() as jest.MockedFunction<
        ProductsRepository['softDelete']
      >,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner une structure paginée', async () => {
      repository.findMany.mockResolvedValue([mockPrismaProduct]);
      repository.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('prd-123');
      expect(result.totalPages).toBe(1);
      expect(repository.findMany).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('findById', () => {
    it('doit retourner un produit existant', async () => {
      repository.findById.mockResolvedValue(mockPrismaProduct);

      const result = await service.findById('prd-123');

      expect(result.id).toBe('prd-123');
      expect(result.sku).toBe('SKU-001');
      expect(repository.findById).toHaveBeenCalledWith('prd-123');
    });

    it('doit lever NotFoundException si le produit n’existe pas', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('doit créer un produit', async () => {
      repository.findBySku.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockPrismaProduct);

      const dto = {
        sku: 'SKU-001',
        name: 'Produit Test',
        categoryId: 'cat-123',
        unitPrice: 1500,
        costPrice: 1000,
      };

      const result = await service.create(dto);

      expect(result.id).toBe('prd-123');
      expect(repository.findBySku).toHaveBeenCalledWith('SKU-001');
      expect(repository.create).toHaveBeenCalled();
    });

    it('doit lever ConflictException si le SKU existe déjà (409)', async () => {
      repository.findBySku.mockResolvedValue(mockPrismaProduct);

      const dto = {
        sku: 'SKU-001',
        name: 'Produit Test',
        categoryId: 'cat-123',
        unitPrice: 1500,
        costPrice: 1000,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('doit mettre à jour un produit', async () => {
      repository.findById.mockResolvedValue(mockPrismaProduct);
      repository.findBySku.mockResolvedValue(null);
      const updated: PrismaProductWithRelations = {
        ...mockPrismaProduct,
        name: 'Produit Modifié',
      };
      repository.update.mockResolvedValue(updated);

      const result = await service.update('prd-123', {
        name: 'Produit Modifié',
      });

      expect(result.name).toBe('Produit Modifié');
      expect(repository.update).toHaveBeenCalled();
    });

    it('doit lever ConflictException si le nouveau SKU est déjà pris', async () => {
      repository.findById.mockResolvedValue(mockPrismaProduct);
      repository.findBySku.mockResolvedValue({
        ...mockPrismaProduct,
        id: 'other-id',
      });

      await expect(
        service.update('prd-123', { sku: 'SKU-DUPLICATE' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('doit désactiver logiquement le produit', async () => {
      repository.findById.mockResolvedValue(mockPrismaProduct);
      const deactivated: PrismaProductWithRelations = {
        ...mockPrismaProduct,
        isActive: false,
      };
      repository.softDelete.mockResolvedValue(deactivated);

      const result = await service.delete('prd-123');

      expect(result.isActive).toBe(false);
      expect(repository.softDelete).toHaveBeenCalledWith('prd-123');
    });
  });
});
