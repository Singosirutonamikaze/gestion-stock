import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsRepository } from '../../repositories/stock-movements-repository';
import { PrismaService } from '../../../../core/database/prisma-service';
import { MovementType } from '@prisma/client';
import { InsufficientStockException } from '../../../../shared/exceptions/insufficient-stock-exception';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let prisma: {
    product: { findUnique: jest.Mock };
    warehouse: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };
  let repository: {
    findMany: jest.Mock;
    count: jest.Mock;
    findById: jest.Mock;
  };
  let txMock: {
    stockMovement: { create: jest.Mock };
    stock: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  const mockProduct = {
    id: 'prod-1',
    sku: 'SKU-01',
    name: 'Produit Test',
  };

  const mockWarehouseSource = {
    id: 'wh-1',
    code: 'WH-01',
    name: 'Entrepôt Source',
  };

  const mockWarehouseDest = {
    id: 'wh-2',
    code: 'WH-02',
    name: 'Entrepôt Dest',
  };

  const mockMovement = {
    id: 'mov-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    type: MovementType.IN,
    quantity: 50,
    reason: 'Arrivage',
    reference: 'BL-123',
    relatedWarehouseId: null,
    userId: 'user-1',
    createdAt: new Date('2026-09-16T10:00:00Z'),
  };

  beforeEach(async () => {
    txMock = {
      stockMovement: {
        create: jest.fn().mockResolvedValue(mockMovement),
      },
      stock: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue(mockProduct),
      },
      warehouse: {
        findUnique: jest
          .fn()
          .mockImplementation(({ where }: { where: { id: string } }) => {
            if (where.id === 'wh-1')
              return Promise.resolve(mockWarehouseSource);
            if (where.id === 'wh-2') return Promise.resolve(mockWarehouseDest);
            return Promise.resolve(null);
          }),
      },
      $transaction: jest
        .fn()
        .mockImplementation(
          (callback: (tx: typeof txMock) => Promise<unknown>) =>
            callback(txMock),
        ),
    };

    repository = {
      findMany: jest.fn().mockResolvedValue([mockMovement]),
      count: jest.fn().mockResolvedValue(1),
      findById: jest.fn().mockResolvedValue(mockMovement),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StockMovementsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<StockMovementsService>(StockMovementsService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner les mouvements paginés', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.items).toEqual([mockMovement]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findById', () => {
    it('doit retourner le mouvement existant', async () => {
      const result = await service.findById('mov-1');
      expect(result).toEqual(mockMovement);
    });

    it('doit lever NotFoundException si le mouvement est introuvable', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create - IN', () => {
    it('doit créer un mouvement IN et incrémenter le stock existant', async () => {
      txMock.stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity: 20,
        reservedQuantity: 5,
        availableQuantity: 15,
      });

      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.IN,
        quantity: 30,
      };

      const result = await service.create(dto, 'user-1');

      expect(result).toEqual(mockMovement);
      expect(txMock.stockMovement.create).toHaveBeenCalled();
      expect(txMock.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: {
          quantity: 50,
          reservedQuantity: 5,
          availableQuantity: 45,
        },
      });
    });

    it('doit créer un mouvement IN et créer un nouveau stock si inexistant', async () => {
      txMock.stock.findFirst.mockResolvedValue(null);

      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.IN,
        quantity: 100,
      };

      await service.create(dto, 'user-1');

      expect(txMock.stock.create).toHaveBeenCalledWith({
        data: {
          productId: 'prod-1',
          warehouseId: 'wh-1',
          locationId: null,
          quantity: 100,
          reservedQuantity: 0,
          availableQuantity: 100,
        },
      });
    });
  });

  describe('create - OUT', () => {
    it('doit créer un mouvement OUT si le stock disponible est suffisant', async () => {
      txMock.stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity: 50,
        reservedQuantity: 0,
        availableQuantity: 50,
      });

      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.OUT,
        quantity: 20,
      };

      await service.create(dto, 'user-1');

      expect(txMock.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: {
          quantity: 30,
          reservedQuantity: 0,
          availableQuantity: 30,
        },
      });
    });

    it('doit lever InsufficientStockException si le stock disponible est inférieur à la quantité demandée', async () => {
      txMock.stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity: 10,
        reservedQuantity: 5,
        availableQuantity: 5,
      });

      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.OUT,
        quantity: 10,
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        InsufficientStockException,
      );
    });

    it('doit lever InsufficientStockException si aucun stock n’existe (disponible = 0)', async () => {
      txMock.stock.findFirst.mockResolvedValue(null);

      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.OUT,
        quantity: 5,
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        InsufficientStockException,
      );
    });
  });

  describe('create - ADJUSTMENT', () => {
    it('doit ajuster directement la quantité en stock', async () => {
      txMock.stock.findFirst.mockResolvedValue({
        id: 'stock-1',
        quantity: 20,
        reservedQuantity: 2,
        availableQuantity: 18,
      });

      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.ADJUSTMENT,
        quantity: 15,
      };

      await service.create(dto, 'user-1');

      expect(txMock.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: {
          quantity: 15,
          reservedQuantity: 2,
          availableQuantity: 13,
        },
      });
    });
  });

  describe('create - TRANSFER', () => {
    it('doit décrémenter l’entrepôt source et incrémenter l’entrepôt destination', async () => {
      // Source stock
      txMock.stock.findFirst
        .mockResolvedValueOnce({
          id: 'stock-src',
          quantity: 40,
          reservedQuantity: 0,
          availableQuantity: 40,
        })
        // Dest stock
        .mockResolvedValueOnce({
          id: 'stock-dest',
          quantity: 10,
          reservedQuantity: 0,
          availableQuantity: 10,
        });

      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        relatedWarehouseId: 'wh-2',
        type: MovementType.TRANSFER,
        quantity: 15,
      };

      await service.create(dto, 'user-1');

      // Update source
      expect(txMock.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-src' },
        data: {
          quantity: 25,
          reservedQuantity: 0,
          availableQuantity: 25,
        },
      });

      // Update destination
      expect(txMock.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-dest' },
        data: {
          quantity: 25,
          reservedQuantity: 0,
          availableQuantity: 25,
        },
      });
    });

    it('doit lever BadRequestException si l’entrepôt destination est manquant', async () => {
      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.TRANSFER,
        quantity: 10,
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('doit lever BadRequestException si l’entrepôt destination est identique à la source', async () => {
      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        relatedWarehouseId: 'wh-1',
        type: MovementType.TRANSFER,
        quantity: 10,
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validations produit et entrepôt', () => {
    it('doit lever NotFoundException si le produit n’existe pas', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const dto = {
        productId: 'prod-unknown',
        warehouseId: 'wh-1',
        type: MovementType.IN,
        quantity: 10,
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('doit lever NotFoundException si l’entrepôt source n’existe pas', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(null);

      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-unknown',
        type: MovementType.IN,
        quantity: 10,
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
