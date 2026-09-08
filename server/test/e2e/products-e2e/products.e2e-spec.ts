import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ProductsController } from '../../../src/modules/products/controllers/products-controller';
import { ProductsService } from '../../../src/modules/products/services/products-service';
import { JwtAuthGuard } from '../../../src/core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../src/core/guards/roles-guard';
import { ProductStatus } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProductsController (e2e)', () => {
  let app: INestApplication<App>;
  let productsService: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockProduct = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    sku: 'SKU-001',
    barcode: '1234567890123',
    name: 'Café Arabica',
    slug: 'cafe-arabica',
    description: 'Café en grains 1kg',
    shortDescription: 'Café 1kg',
    categoryId: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
    brandId: null,
    supplierId: 's1b2c3d4-e5f6-7890-abcd-ef1234567890',
    unitPrice: 5000,
    costPrice: 3500,
    currency: 'XOF',
    taxRate: 18,
    discountRate: 0,
    unit: 'kg',
    weight: 1,
    weightUnit: 'KG',
    length: null,
    width: null,
    height: null,
    dimensionUnit: null,
    color: null,
    material: null,
    status: ProductStatus.ACTIVE,
    isActive: true,
    isPerishable: true,
    isSerialized: false,
    requiresBatch: true,
    warrantyMonths: null,
    alertThreshold: 10,
    minStockLevel: 5,
    maxStockLevel: 100,
    reorderPoint: 15,
    reorderQty: 50,
    metaTitle: 'Café Arabica',
    metaDescription: 'Acheter Café Arabica',
    notes: null,
    createdAt: new Date('2026-08-25T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-25T08:00:00Z').toISOString(),
    category: {
      id: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Boissons',
      slug: 'boissons',
    },
    supplier: {
      id: 's1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Fournisseur Café',
      email: 'fournisseur@cafe.ci',
      phone: '+2250700000000',
    },
    currentStock: 8,
  };

  beforeEach(async () => {
    productsService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('doit retourner 200 avec la liste paginée', async () => {
      const paginatedData = {
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      productsService.findAll.mockResolvedValue(paginatedData);

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: paginatedData,
      });
    });

    it('doit filtrer par recherche textuelle (search)', async () => {
      productsService.findAll.mockResolvedValue({
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      await request(app.getHttpServer())
        .get('/products?search=cafe')
        .expect(200);

      expect(productsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'cafe' }),
      );
    });

    it('doit filtrer les produits sous seuil d’alerte (belowAlert=true)', async () => {
      productsService.findAll.mockResolvedValue({
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      await request(app.getHttpServer())
        .get('/products?belowAlert=true')
        .expect(200);

      expect(productsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ belowAlert: true }),
      );
    });
  });

  describe('GET /products/:id', () => {
    it('doit retourner 200 avec la fiche produit si trouvé', async () => {
      productsService.findById.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .get(`/products/${mockProduct.id}`)
        .expect(200);

      expect(response.body).toEqual(mockProduct);
      expect(productsService.findById).toHaveBeenCalledWith(mockProduct.id);
    });

    it('doit retourner 404 si le produit n’existe pas', async () => {
      productsService.findById.mockRejectedValue(
        new NotFoundException('Produit introuvable'),
      );

      await request(app.getHttpServer())
        .get('/products/99999999-9999-9999-9999-999999999999')
        .expect(404);
    });
  });

  describe('POST /products', () => {
    const validDto = {
      sku: 'SKU-001',
      name: 'Café Arabica',
      categoryId: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890',
      unitPrice: 5000,
      costPrice: 3500,
    };

    it('doit retourner 201 lors de la création d’un produit', async () => {
      productsService.create.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(validDto)
        .expect(201);

      expect(response.body).toEqual(mockProduct);
      expect(productsService.create).toHaveBeenCalledWith(validDto);
    });

    it('doit retourner 409 si le code SKU existe déjà', async () => {
      productsService.create.mockRejectedValue(
        new ConflictException(
          'Un produit avec le code SKU "SKU-001" existe déjà',
        ),
      );

      await request(app.getHttpServer())
        .post('/products')
        .send(validDto)
        .expect(409);
    });

    it('doit retourner 400 si le body est invalide', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Sans SKU ni Prix' })
        .expect(400);
    });
  });

  describe('PATCH /products/:id', () => {
    it('doit modifier un produit et retourner 200', async () => {
      const updated = { ...mockProduct, name: 'Café Robusta' };
      productsService.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(`/products/${mockProduct.id}`)
        .send({ name: 'Café Robusta' })
        .expect(200);

      expect(response.body).toEqual(updated);
      expect(productsService.update).toHaveBeenCalledWith(mockProduct.id, {
        name: 'Café Robusta',
      });
    });
  });

  describe('DELETE /products/:id', () => {
    it('doit désactiver logiquement le produit et retourner 200', async () => {
      const deactivated = { ...mockProduct, isActive: false };
      productsService.delete.mockResolvedValue(deactivated);

      const response = await request(app.getHttpServer())
        .delete(`/products/${mockProduct.id}`)
        .expect(200);

      expect(response.body).toEqual(deactivated);
      expect(productsService.delete).toHaveBeenCalledWith(mockProduct.id);
    });
  });
});
