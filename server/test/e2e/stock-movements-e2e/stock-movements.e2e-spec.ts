import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { StockMovementsController } from '../../../src/modules/stock-movements/controllers/stock-movements-controller';
import { StockMovementsService } from '../../../src/modules/stock-movements/services/stock-movements-service';
import { JwtAuthGuard } from '../../../src/core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../src/core/guards/roles-guard';
import { MovementType } from '@prisma/client';
import { InsufficientStockException } from '../../../src/shared/exceptions/insufficient-stock-exception';

describe('StockMovementsController (e2e)', () => {
  let app: INestApplication<App>;
  let stockMovementsService: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };

  const mockMovementId = '11111111-1111-4111-8111-111111111111';
  const mockProductId = '22222222-2222-4222-8222-222222222222';
  const mockWarehouseId = '33333333-3333-4333-8333-333333333333';
  const mockDestWarehouseId = '44444444-4444-4444-8444-444444444444';
  const mockUserId = '55555555-5555-4555-8555-555555555555';

  const mockMovement = {
    id: mockMovementId,
    productId: mockProductId,
    warehouseId: mockWarehouseId,
    type: MovementType.IN,
    quantity: 50,
    reason: 'Réception initiale fournisseur',
    reference: 'BL-2026-001',
    relatedWarehouseId: null,
    userId: mockUserId,
    createdAt: new Date().toISOString(),
    product: {
      id: mockProductId,
      sku: 'SKU-001',
      name: 'Café Arabica',
    },
    warehouse: {
      id: mockWarehouseId,
      code: 'WH-CENTRAL',
      name: 'Entrepôt Central',
    },
    relatedWarehouse: null,
    user: {
      id: mockUserId,
      email: 'admin@gestion-stock.ci',
      firstName: 'Admin',
      lastName: 'System',
    },
  };

  const mockTransferMovement = {
    ...mockMovement,
    id: '66666666-6666-4666-8666-666666666666',
    type: MovementType.TRANSFER,
    quantity: 15,
    relatedWarehouseId: mockDestWarehouseId,
    relatedWarehouse: {
      id: mockDestWarehouseId,
      code: 'WH-ANNEXE',
      name: 'Entrepôt Annexe',
    },
  };

  beforeEach(async () => {
    stockMovementsService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StockMovementsController],
      providers: [
        {
          provide: StockMovementsService,
          useValue: stockMovementsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => {
            getRequest: () => {
              user?: { sub: string; email: string; role: string };
            };
          };
        }) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            sub: mockUserId,
            email: 'admin@gestion-stock.ci',
            role: 'ADMINISTRATOR',
          };
          return true;
        },
      })
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

  describe('GET /stock-movements', () => {
    it('doit retourner 200 avec la liste paginée des mouvements', async () => {
      const paginatedData = {
        items: [mockMovement],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      stockMovementsService.findAll.mockResolvedValue(paginatedData);

      const response = await request(app.getHttpServer())
        .get('/stock-movements')
        .expect(200);

      expect(response.body).toEqual(paginatedData);
    });

    it('doit filtrer par produit, entrepôt et type', async () => {
      stockMovementsService.findAll.mockResolvedValue({
        items: [mockMovement],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      await request(app.getHttpServer())
        .get(
          `/stock-movements?productId=${mockProductId}&warehouseId=${mockWarehouseId}&type=${MovementType.IN}`,
        )
        .expect(200);

      expect(stockMovementsService.findAll).toHaveBeenCalledWith({
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        type: MovementType.IN,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('GET /stock-movements/:id', () => {
    it('doit retourner 200 et le détail du mouvement trouvé', async () => {
      stockMovementsService.findById.mockResolvedValue(mockMovement);

      const response = await request(app.getHttpServer())
        .get(`/stock-movements/${mockMovementId}`)
        .expect(200);

      expect(response.body).toEqual(mockMovement);
    });

    it('doit retourner 404 si le mouvement n’existe pas', async () => {
      stockMovementsService.findById.mockRejectedValue(
        new NotFoundException('Mouvement de stock introuvable'),
      );

      await request(app.getHttpServer())
        .get(`/stock-movements/${mockMovementId}`)
        .expect(404);
    });
  });

  describe('POST /stock-movements (Création de mouvement)', () => {
    it('doit créer un mouvement d’entrée en stock (IN)', async () => {
      stockMovementsService.create.mockResolvedValue(mockMovement);

      const payload = {
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        type: MovementType.IN,
        quantity: 50,
        reason: 'Réception initiale fournisseur',
      };

      const response = await request(app.getHttpServer())
        .post('/stock-movements')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockMovement);
      expect(stockMovementsService.create).toHaveBeenCalled();
    });

    it('doit créer un mouvement de transfert (TRANSFER) avec entrepôt cible', async () => {
      stockMovementsService.create.mockResolvedValue(mockTransferMovement);

      const transferPayload = {
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        relatedWarehouseId: mockDestWarehouseId,
        type: MovementType.TRANSFER,
        quantity: 15,
        reason: 'Rééquilibrage de stock entrepôts',
      };

      const response = await request(app.getHttpServer())
        .post('/stock-movements')
        .send(transferPayload)
        .expect(201);

      expect(response.body).toEqual(mockTransferMovement);
      expect(stockMovementsService.create).toHaveBeenCalled();
    });

    it('doit rejeter un transfert sans relatedWarehouseId', async () => {
      const invalidTransferPayload = {
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        type: MovementType.TRANSFER,
        quantity: 15,
      };

      await request(app.getHttpServer())
        .post('/stock-movements')
        .send(invalidTransferPayload)
        .expect(400);
    });

    it('doit retourner 400 si le stock est insuffisant pour un mouvement de sortie', async () => {
      stockMovementsService.create.mockRejectedValue(
        new InsufficientStockException(mockProductId, mockWarehouseId, 20, 100),
      );

      const outPayload = {
        productId: mockProductId,
        warehouseId: mockWarehouseId,
        type: MovementType.OUT,
        quantity: 100,
        reason: 'Sortie inventaire',
      };

      await request(app.getHttpServer())
        .post('/stock-movements')
        .send(outPayload)
        .expect(400);
    });
  });
});
