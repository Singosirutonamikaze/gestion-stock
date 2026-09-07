import { ProductsController } from './products.controller';
import { ProductsService } from '../../services/products-service';
import { ProductResponseDto } from '../../dto/product-response-dto';
import { ProductStatus } from '@prisma/client/index';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: {
    findAll: jest.MockedFunction<ProductsService['findAll']>;
    findById: jest.MockedFunction<ProductsService['findById']>;
    create: jest.MockedFunction<ProductsService['create']>;
    update: jest.MockedFunction<ProductsService['update']>;
    delete: jest.MockedFunction<ProductsService['delete']>;
  };

  const mockProductResponse: ProductResponseDto = {
    id: 'prd-123',
    sku: 'SKU-001',
    barcode: '1234567890123',
    name: 'Produit Test',
    slug: 'produit-test',
    description: null,
    shortDescription: null,
    categoryId: 'cat-123',
    brandId: null,
    supplierId: null,
    unitPrice: 1500,
    costPrice: 1000,
    currency: 'XOF',
    taxRate: 18,
    discountRate: 0,
    unit: 'pièce',
    weight: null,
    weightUnit: null,
    length: null,
    width: null,
    height: null,
    dimensionUnit: null,
    color: null,
    material: null,
    status: ProductStatus.ACTIVE,
    isActive: true,
    isPerishable: false,
    isSerialized: false,
    requiresBatch: false,
    warrantyMonths: null,
    alertThreshold: 5,
    minStockLevel: 0,
    maxStockLevel: null,
    reorderPoint: null,
    reorderQty: null,
    metaTitle: null,
    metaDescription: null,
    notes: null,
    createdAt: new Date('2026-08-25T08:00:00Z'),
    updatedAt: new Date('2026-08-25T08:00:00Z'),
    category: null,
    supplier: null,
    currentStock: 10,
  };

  beforeEach(() => {
    service = {
      findAll: jest.fn() as jest.MockedFunction<ProductsService['findAll']>,
      findById: jest.fn() as jest.MockedFunction<ProductsService['findById']>,
      create: jest.fn() as jest.MockedFunction<ProductsService['create']>,
      update: jest.fn() as jest.MockedFunction<ProductsService['update']>,
      delete: jest.fn() as jest.MockedFunction<ProductsService['delete']>,
    };

    controller = new ProductsController(service as unknown as ProductsService);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner une liste paginée enveloppée dans success et data', async () => {
      const mockData = {
        items: [mockProductResponse],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      service.findAll.mockResolvedValue(mockData);

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        success: true,
        data: mockData,
      });
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('findById', () => {
    it('doit retourner un produit par son id', async () => {
      service.findById.mockResolvedValue(mockProductResponse);

      const result = await controller.findById('prd-123');

      expect(result).toEqual(mockProductResponse);
      expect(service.findById).toHaveBeenCalledWith('prd-123');
    });
  });

  describe('create', () => {
    it('doit créer un produit et le retourner', async () => {
      service.create.mockResolvedValue(mockProductResponse);

      const dto = {
        sku: 'SKU-001',
        name: 'Produit Test',
        categoryId: 'cat-123',
        unitPrice: 1500,
        costPrice: 1000,
      };
      const result = await controller.create(dto);

      expect(result).toEqual(mockProductResponse);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('doit modifier un produit', async () => {
      const updated = { ...mockProductResponse, name: 'Produit Modifié' };
      service.update.mockResolvedValue(updated);

      const dto = { name: 'Produit Modifié' };
      const result = await controller.update('prd-123', dto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('prd-123', dto);
    });
  });

  describe('delete', () => {
    it('doit désactiver logiquement un produit', async () => {
      const deactivated = { ...mockProductResponse, isActive: false };
      service.delete.mockResolvedValue(deactivated);

      const result = await controller.delete('prd-123');

      expect(result).toEqual(deactivated);
      expect(service.delete).toHaveBeenCalledWith('prd-123');
    });
  });
});
