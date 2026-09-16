import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { OrdersController } from '../../../src/modules/orders/controllers/orders-controller';
import { OrdersService } from '../../../src/modules/orders/services/orders-service';
import { JwtAuthGuard } from '../../../src/core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../src/core/guards/roles-guard';
import { OrderType, OrderStatus } from '@prisma/client';
import { InsufficientStockException } from '../../../src/shared/exceptions/insufficient-stock-exception';

describe('OrdersController (e2e)', () => {
  let app: INestApplication<App>;
  let ordersService: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    cancel: jest.Mock;
  };

  const mockOrderId = '11111111-1111-4111-8111-111111111111';
  const mockWarehouseId = '22222222-2222-4222-8222-222222222222';
  const mockSupplierId = '33333333-3333-4333-8333-333333333333';
  const mockProductId = '44444444-4444-4444-8444-444444444444';
  const mockSaleOrderId = '55555555-5555-4555-8555-555555555555';

  const mockPurchaseOrder = {
    id: mockOrderId,
    orderNumber: 'CMD-ACH-2026-0001',
    type: OrderType.PURCHASE,
    status: OrderStatus.DRAFT,
    supplierId: mockSupplierId,
    warehouseId: mockWarehouseId,
    subtotal: 50000,
    taxAmount: 9000,
    totalAmount: 59000,
    items: [
      {
        id: '66666666-6666-4666-8666-666666666666',
        productId: mockProductId,
        quantity: 10,
        unitPrice: 5000,
        subtotal: 50000,
        taxAmount: 9000,
        totalAmount: 59000,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSaleOrder = {
    id: mockSaleOrderId,
    orderNumber: 'CMD-VTE-2026-0001',
    type: OrderType.SALE,
    status: OrderStatus.DRAFT,
    customerName: 'Client Comptoir',
    warehouseId: mockWarehouseId,
    subtotal: 25000,
    taxAmount: 4500,
    totalAmount: 29500,
    items: [
      {
        id: '77777777-7777-4777-8777-777777777777',
        productId: mockProductId,
        quantity: 5,
        unitPrice: 5000,
        subtotal: 25000,
        taxAmount: 4500,
        totalAmount: 29500,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    ordersService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersService,
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
            sub: '88888888-8888-4888-8888-888888888888',
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

  describe('GET /orders', () => {
    it('doit retourner 200 avec la liste paginée des commandes', async () => {
      const paginatedResult = {
        items: [mockPurchaseOrder],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      ordersService.findAll.mockResolvedValue(paginatedResult);

      const response = await request(app.getHttpServer())
        .get('/orders')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: paginatedResult,
      });
    });
  });

  describe('GET /orders/:id', () => {
    it('doit retourner 200 avec la commande trouvée', async () => {
      ordersService.findById.mockResolvedValue(mockPurchaseOrder);

      const response = await request(app.getHttpServer())
        .get(`/orders/${mockOrderId}`)
        .expect(200);

      expect(response.body).toEqual(mockPurchaseOrder);
    });

    it('doit retourner 404 si la commande n’existe pas', async () => {
      ordersService.findById.mockRejectedValue(
        new NotFoundException('Commande introuvable'),
      );

      await request(app.getHttpServer())
        .get(`/orders/${mockOrderId}`)
        .expect(404);
    });
  });

  describe('POST /orders', () => {
    it('doit créer une commande d’achat valide (PURCHASE)', async () => {
      ordersService.create.mockResolvedValue(mockPurchaseOrder);

      const payload = {
        type: OrderType.PURCHASE,
        supplierId: mockSupplierId,
        warehouseId: mockWarehouseId,
        items: [
          {
            productId: mockProductId,
            quantity: 10,
            unitPrice: 5000,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockPurchaseOrder);
      expect(ordersService.create).toHaveBeenCalled();
    });

    it('doit rejeter la création sans supplierId pour un achat', async () => {
      const invalidPayload = {
        type: OrderType.PURCHASE,
        warehouseId: mockWarehouseId,
        items: [
          {
            productId: mockProductId,
            quantity: 10,
            unitPrice: 5000,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(invalidPayload)
        .expect(400);
    });
  });

  describe('Cycle de vie d’un achat : DRAFT -> CONFIRMED -> RECEIVED', () => {
    it('doit passer la commande d’achat de DRAFT à CONFIRMED', async () => {
      const confirmedOrder = {
        ...mockPurchaseOrder,
        status: OrderStatus.CONFIRMED,
      };
      ordersService.update.mockResolvedValue(confirmedOrder);

      const response = await request(app.getHttpServer())
        .patch(`/orders/${mockOrderId}`)
        .send({ status: OrderStatus.CONFIRMED })
        .expect(200);

      expect((response.body as { status: OrderStatus }).status).toBe(
        OrderStatus.CONFIRMED,
      );
    });

    it('doit passer la commande d’achat de CONFIRMED à RECEIVED', async () => {
      const receivedOrder = {
        ...mockPurchaseOrder,
        status: OrderStatus.RECEIVED,
      };
      ordersService.update.mockResolvedValue(receivedOrder);

      const response = await request(app.getHttpServer())
        .patch(`/orders/${mockOrderId}`)
        .send({ status: OrderStatus.RECEIVED })
        .expect(200);

      expect((response.body as { status: OrderStatus }).status).toBe(
        OrderStatus.RECEIVED,
      );
    });
  });

  describe('Cycle de vie d’une vente : DRAFT -> CONFIRMED -> SHIPPED', () => {
    it('doit passer la commande de vente de DRAFT à CONFIRMED', async () => {
      const confirmedSale = {
        ...mockSaleOrder,
        status: OrderStatus.CONFIRMED,
      };
      ordersService.update.mockResolvedValue(confirmedSale);

      const response = await request(app.getHttpServer())
        .patch(`/orders/${mockSaleOrder.id}`)
        .send({ status: OrderStatus.CONFIRMED })
        .expect(200);

      expect((response.body as { status: OrderStatus }).status).toBe(
        OrderStatus.CONFIRMED,
      );
    });

    it('doit passer la commande de vente de CONFIRMED à SHIPPED', async () => {
      const shippedSale = {
        ...mockSaleOrder,
        status: OrderStatus.SHIPPED,
      };
      ordersService.update.mockResolvedValue(shippedSale);

      const response = await request(app.getHttpServer())
        .patch(`/orders/${mockSaleOrder.id}`)
        .send({ status: OrderStatus.SHIPPED })
        .expect(200);

      expect((response.body as { status: OrderStatus }).status).toBe(
        OrderStatus.SHIPPED,
      );
    });
  });

  describe('Rupture de stock lors d’une vente', () => {
    it('doit bloquer l’expédition et retourner une erreur de stock insuffisant', async () => {
      ordersService.update.mockRejectedValue(
        new InsufficientStockException(mockProductId, mockWarehouseId, 2, 5),
      );

      await request(app.getHttpServer())
        .patch(`/orders/${mockSaleOrder.id}`)
        .send({ status: OrderStatus.SHIPPED })
        .expect(400);
    });
  });

  describe('DELETE /orders/:id (Annulation)', () => {
    it('doit annuler la commande et retourner le statut CANCELLED', async () => {
      const cancelledOrder = {
        ...mockPurchaseOrder,
        status: OrderStatus.CANCELLED,
      };
      ordersService.cancel.mockResolvedValue(cancelledOrder);

      const response = await request(app.getHttpServer())
        .delete(`/orders/${mockOrderId}`)
        .expect(200);

      expect((response.body as { status: OrderStatus }).status).toBe(
        OrderStatus.CANCELLED,
      );
      expect(ordersService.cancel).toHaveBeenCalled();
    });

    it('doit échouer si la commande ne peut être annulée', async () => {
      ordersService.cancel.mockRejectedValue(
        new BadRequestException('Une commande livrée ne peut être annulée'),
      );

      await request(app.getHttpServer())
        .delete(`/orders/${mockOrderId}`)
        .expect(400);
    });
  });
});
