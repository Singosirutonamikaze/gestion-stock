import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepository } from '../../repositories/orders-repository';
import { PrismaService } from '../../../../core/database/prisma-service';
import { OrderStatus, OrderType, MovementType, Prisma } from '@prisma/client';
import { InsufficientStockException } from '../../../../shared/exceptions/insufficient-stock-exception';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: {
    product: { findUnique: jest.Mock; findMany: jest.Mock };
    warehouse: { findUnique: jest.Mock };
    supplier: { findUnique: jest.Mock };
    customer: { findUnique: jest.Mock };
    order: { update: jest.Mock };
    $transaction: jest.Mock;
  };
  let repository: {
    findMany: jest.Mock;
    count: jest.Mock;
    findById: jest.Mock;
    findByOrderNumber: jest.Mock;
  };
  let txMock: {
    order: { create: jest.Mock; update: jest.Mock };
    orderItem: { deleteMany: jest.Mock };
    stockMovement: { create: jest.Mock };
    stock: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  const mockProduct1 = {
    id: 'prod-1',
    sku: 'SKU-01',
    name: 'Produit 1',
    unit: 'pièce',
  };

  const mockProduct2 = {
    id: 'prod-2',
    sku: 'SKU-02',
    name: 'Produit 2',
    unit: 'pièce',
  };

  const mockWarehouse = {
    id: 'wh-1',
    code: 'WH-01',
    name: 'Entrepôt Central',
  };

  const mockSupplier = {
    id: 'sup-1',
    name: 'Fournisseur Alpha',
    email: 'alpha@supplier.com',
  };

  const mockCustomer = {
    id: 'cust-1',
    firstName: 'Jean',
    lastName: 'Dupont',
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'PO-20260916-ABCDE',
    type: OrderType.PURCHASE,
    status: OrderStatus.DRAFT,
    supplierId: 'sup-1',
    customerId: null,
    customerName: null,
    warehouseId: 'wh-1',
    shippingAddressId: null,
    subtotal: new Prisma.Decimal(5000),
    taxAmount: new Prisma.Decimal(900),
    discountAmount: new Prisma.Decimal(0),
    shippingCost: new Prisma.Decimal(0),
    totalAmount: new Prisma.Decimal(5900),
    paymentStatus: 'UNPAID',
    paymentMethod: null,
    expectedDeliveryDate: null,
    shippedAt: null,
    receivedAt: null,
    notes: 'Note test',
    createdById: 'user-1',
    createdAt: new Date('2026-09-16T10:00:00Z'),
    updatedAt: new Date('2026-09-16T10:00:00Z'),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'prod-1',
        variantId: null,
        quantity: 5,
        unitPrice: new Prisma.Decimal(1000),
        discountRate: new Prisma.Decimal(0),
        taxRate: new Prisma.Decimal(18),
        subtotal: new Prisma.Decimal(5000),
        product: mockProduct1,
      },
    ],
    supplier: mockSupplier,
    customer: null,
    warehouse: mockWarehouse,
    createdBy: { id: 'user-1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' },
  };

  beforeEach(async () => {
    txMock = {
      order: {
        create: jest.fn().mockResolvedValue(mockOrder),
        update: jest.fn().mockImplementation(({ data }) => ({
          ...mockOrder,
          ...data,
        })),
      },
      orderItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      stockMovement: {
        create: jest.fn().mockResolvedValue({ id: 'mov-1' }),
      },
      stock: {
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'stock-1' }),
        update: jest.fn().mockResolvedValue({ id: 'stock-1' }),
      },
    };

    prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue(mockProduct1),
        findMany: jest.fn().mockResolvedValue([mockProduct1, mockProduct2]),
      },
      warehouse: {
        findUnique: jest.fn().mockResolvedValue(mockWarehouse),
      },
      supplier: {
        findUnique: jest.fn().mockResolvedValue(mockSupplier),
      },
      customer: {
        findUnique: jest.fn().mockResolvedValue(mockCustomer),
      },
      order: {
        update: jest.fn().mockResolvedValue(mockOrder),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(txMock)),
    };

    repository = {
      findMany: jest.fn().mockResolvedValue([mockOrder]),
      count: jest.fn().mockResolvedValue(1),
      findById: jest.fn().mockResolvedValue(mockOrder),
      findByOrderNumber: jest.fn().mockResolvedValue(mockOrder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrdersRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner les commandes paginées', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.items).toEqual([mockOrder]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findById', () => {
    it('doit retourner la commande existante', async () => {
      const result = await service.findById('order-1');
      expect(result).toEqual(mockOrder);
    });

    it('doit lever NotFoundException si la commande n’existe pas', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('doit créer une commande d’achat valide et calculer le total', async () => {
      const dto = {
        type: OrderType.PURCHASE,
        supplierId: 'sup-1',
        warehouseId: 'wh-1',
        items: [
          {
            productId: 'prod-1',
            quantity: 5,
            unitPrice: 1000,
            discountRate: 0,
            taxRate: 18,
          },
        ],
      };

      const result = await service.create(dto, 'user-1');
      expect(result).toBeDefined();
      expect(txMock.order.create).toHaveBeenCalled();
      const createCallData = txMock.order.create.mock.calls[0][0].data;
      expect(createCallData.status).toBe(OrderStatus.DRAFT);
      expect(createCallData.orderNumber).toContain('PO-');
      expect(Number(createCallData.subtotal)).toBe(5000);
      expect(Number(createCallData.totalAmount)).toBe(5900);
    });

    it('doit lever BadRequestException si commande d’achat sans supplierId', async () => {
      const dto = {
        type: OrderType.PURCHASE,
        warehouseId: 'wh-1',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 100 }],
      };

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('doit lever NotFoundException si le fournisseur n’existe pas', async () => {
      prisma.supplier.findUnique.mockResolvedValue(null);

      const dto = {
        type: OrderType.PURCHASE,
        supplierId: 'unknown-sup',
        warehouseId: 'wh-1',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 100 }],
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('doit lever NotFoundException si l’entrepôt n’existe pas', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);

      const dto = {
        type: OrderType.PURCHASE,
        supplierId: 'sup-1',
        warehouseId: 'unknown-wh',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 100 }],
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('doit lever NotFoundException si un des produits commandés n’existe pas', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct1]); // prod-2 manquant

      const dto = {
        type: OrderType.SALE,
        warehouseId: 'wh-1',
        items: [
          { productId: 'prod-1', quantity: 1, unitPrice: 100 },
          { productId: 'prod-2', quantity: 2, unitPrice: 200 },
        ],
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update & transitions de statut', () => {
    it('doit autoriser DRAFT -> CONFIRMED', async () => {
      const result = await service.update('order-1', { status: OrderStatus.CONFIRMED }, 'user-1');
      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    it('doit autoriser DRAFT -> CANCELLED', async () => {
      const result = await service.update('order-1', { status: OrderStatus.CANCELLED }, 'user-1');
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('doit rejeter une transition illégale (ex: DRAFT -> RECEIVED)', async () => {
      await expect(
        service.update('order-1', { status: OrderStatus.RECEIVED }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('doit générer un mouvement IN lors du passage de PURCHASE au statut RECEIVED', async () => {
      // Order currently SHIPPED
      repository.findById.mockResolvedValue({
        ...mockOrder,
        type: OrderType.PURCHASE,
        status: OrderStatus.SHIPPED,
      });

      txMock.stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity: 10,
        reservedQuantity: 0,
        availableQuantity: 10,
      });

      await service.update('order-1', { status: OrderStatus.RECEIVED }, 'user-1');

      expect(txMock.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'prod-1',
          warehouseId: 'wh-1',
          type: MovementType.IN,
          quantity: 5,
        }),
      });

      expect(txMock.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: {
          quantity: 15,
          availableQuantity: 15,
        },
      });
    });

    it('doit générer un mouvement OUT lors du passage de SALE au statut SHIPPED', async () => {
      // Order currently CONFIRMED
      repository.findById.mockResolvedValue({
        ...mockOrder,
        type: OrderType.SALE,
        status: OrderStatus.CONFIRMED,
      });

      txMock.stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity: 20,
        reservedQuantity: 0,
        availableQuantity: 20,
      });

      await service.update('order-1', { status: OrderStatus.SHIPPED }, 'user-1');

      expect(txMock.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'prod-1',
          warehouseId: 'wh-1',
          type: MovementType.OUT,
          quantity: 5,
        }),
      });

      expect(txMock.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: {
          quantity: 15,
          availableQuantity: 15,
        },
      });
    });

    it('doit lever InsufficientStockException lors de SALE -> SHIPPED si le stock est insuffisant', async () => {
      repository.findById.mockResolvedValue({
        ...mockOrder,
        type: OrderType.SALE,
        status: OrderStatus.CONFIRMED,
      });

      // Disponible = 2 alors que commande = 5
      txMock.stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity: 2,
        reservedQuantity: 0,
        availableQuantity: 2,
      });

      await expect(
        service.update('order-1', { status: OrderStatus.SHIPPED }, 'user-1'),
      ).rejects.toThrow(InsufficientStockException);
    });
  });

  describe('cancel', () => {
    it('doit passer le statut de la commande à CANCELLED', async () => {
      const result = await service.cancel('order-1', 'user-1');
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });
});
